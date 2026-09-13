import { supabase, isSupabaseConfigured } from './supabase';
import type { DeliveryAddress, CustomerUser } from '../context/AuthContext';

export interface RegisteredCustomer {
  id: string;
  name: string;
  email: string;
  passwordHash: string;
  phone: string;
  createdAt: string;
  address?: DeliveryAddress;
}

const REGISTERED_CUSTOMERS_KEY = 'petalorah_registered_customers';

/**
 * Computes a secure SHA-256 cryptographic hash of the password using Web Crypto API.
 * Passwords are never stored in plain text.
 */
export async function hashPassword(password: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(password.trim());
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map((b) => b.toString(16).padStart(2, '0')).join('');
}

/**
 * Retrieves all registered customers from local storage cache.
 */
export function getStoredCustomers(): RegisteredCustomer[] {
  try {
    const raw = localStorage.getItem(REGISTERED_CUSTOMERS_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) return parsed;
    }
  } catch (e) {
    console.error('Failed to read registered customers from localStorage:', e);
  }
  return [];
}

/**
 * Saves registered customer list to local storage cache.
 */
export function saveStoredCustomers(customers: RegisteredCustomer[]) {
  try {
    localStorage.setItem(REGISTERED_CUSTOMERS_KEY, JSON.stringify(customers));
  } catch (e) {
    console.error('Failed to save registered customers to localStorage:', e);
  }
}

/**
 * Initialize default demo customer if database is empty
 */
export async function ensureDefaultCustomerSeed() {
  const existing = getStoredCustomers();
  if (existing.length === 0) {
    const demoHash = await hashPassword('petalorah123');
    const demoCustomer: RegisteredCustomer = {
      id: 'cust-demo-1',
      name: 'Priya Sharma',
      email: 'priya.crafts@example.com',
      passwordHash: demoHash,
      phone: '9876543210',
      createdAt: new Date().toISOString(),
      address: {
        street: '14 Lotus Blossom Street, Anna Nagar',
        city: 'Chennai',
        state: 'Tamil Nadu',
        pincode: '600040',
        landmark: 'Near Eco Park',
      },
    };
    saveStoredCustomers([demoCustomer]);
  }
}

// Seed demo on module load
ensureDefaultCustomerSeed();

/**
 * Registers a new customer into the database (Supabase Cloud + Local Storage).
 * Rejects duplicate email addresses.
 */
export async function registerCustomerAccount(data: {
  name: string;
  email: string;
  password: string;
  phone: string;
  address?: DeliveryAddress;
}): Promise<{ success: boolean; user?: CustomerUser; error?: string }> {
  const cleanEmail = data.email.trim().toLowerCase();
  const cleanName = data.name.trim();
  const cleanPhone = data.phone.trim();

  if (!cleanEmail || !cleanEmail.includes('@')) {
    return { success: false, error: 'Please provide a valid email address.' };
  }

  if (data.password.length < 6) {
    return { success: false, error: 'Password must be at least 6 characters.' };
  }

  // Check for existing user in local storage
  const localCustomers = getStoredCustomers();
  const existsLocally = localCustomers.some((c) => c.email.toLowerCase() === cleanEmail);
  if (existsLocally) {
    return {
      success: false,
      error: 'An account with this email already exists. Please sign in instead.',
    };
  }

  // Check Supabase if configured
  if (isSupabaseConfigured && supabase) {
    try {
      const { data: existingCloud, error } = await supabase
        .from('customers')
        .select('id, email')
        .eq('email', cleanEmail)
        .maybeSingle();

      if (!error && existingCloud) {
        return {
          success: false,
          error: 'An account with this email already exists. Please sign in instead.',
        };
      }
    } catch (err) {
      console.warn('Supabase customer duplicate check error (fallback to local):', err);
    }
  }

  const hashedPassword = await hashPassword(data.password);
  const newId = `cust-${Date.now()}-${Math.floor(100 + Math.random() * 900)}`;

  const newRecord: RegisteredCustomer = {
    id: newId,
    name: cleanName,
    email: cleanEmail,
    passwordHash: hashedPassword,
    phone: cleanPhone,
    createdAt: new Date().toISOString(),
    address: data.address,
  };

  // Save to local storage
  saveStoredCustomers([...localCustomers, newRecord]);

  // Save to Supabase Cloud Database if configured
  if (isSupabaseConfigured && supabase) {
    try {
      await supabase.from('customers').insert({
        id: newRecord.id,
        name: newRecord.name,
        email: newRecord.email,
        password_hash: newRecord.passwordHash,
        phone: newRecord.phone,
        created_at: newRecord.createdAt,
        address: newRecord.address,
      });
    } catch (err) {
      console.warn('Supabase customer insert notice:', err);
    }
  }

  const customerUser: CustomerUser = {
    name: newRecord.name,
    email: newRecord.email,
    phone: newRecord.phone,
    isLoggedIn: true,
    createdDate: newRecord.createdAt,
    address: newRecord.address,
  };

  return { success: true, user: customerUser };
}

/**
 * Authenticates a customer by email and password against the database.
 * Only logs in if email and password match.
 */
export async function authenticateCustomerAccount(
  email: string,
  password: string
): Promise<{ success: boolean; user?: CustomerUser; error?: string }> {
  const cleanEmail = email.trim().toLowerCase();
  if (!cleanEmail) {
    return { success: false, error: 'Please enter your email address.' };
  }

  if (!password) {
    return { success: false, error: 'Please enter your password.' };
  }

  const computedHash = await hashPassword(password);

  // 1. Check Supabase cloud database first if configured
  if (isSupabaseConfigured && supabase) {
    try {
      const { data, error } = await supabase
        .from('customers')
        .select('*')
        .eq('email', cleanEmail)
        .maybeSingle();

      if (!error && data) {
        if (data.password_hash === computedHash) {
          const user: CustomerUser = {
            name: data.name,
            email: data.email,
            phone: data.phone || '',
            isLoggedIn: true,
            createdDate: data.created_at,
            address: data.address,
          };
          return { success: true, user };
        } else {
          return {
            success: false,
            error: 'Incorrect password. Please verify your password and try again.',
          };
        }
      }
    } catch (err) {
      console.warn('Supabase customer auth query notice:', err);
    }
  }

  // 2. Fallback to Local Storage database
  const localCustomers = getStoredCustomers();
  const matchedCustomer = localCustomers.find((c) => c.email.toLowerCase() === cleanEmail);

  if (!matchedCustomer) {
    return {
      success: false,
      error: 'No account found with this email. Please check your spelling or create a new account.',
    };
  }

  if (matchedCustomer.passwordHash !== computedHash) {
    return {
      success: false,
      error: 'Incorrect password. Please verify your password and try again.',
    };
  }

  const user: CustomerUser = {
    name: matchedCustomer.name,
    email: matchedCustomer.email,
    phone: matchedCustomer.phone,
    isLoggedIn: true,
    createdDate: matchedCustomer.createdAt,
    address: matchedCustomer.address,
  };

  return { success: true, user };
}

const RESET_TOKENS_STORAGE_KEY = 'petalorah_password_reset_tokens';

interface ResetTokenRecord {
  token: string;
  email: string;
  expiresAt: number;
}

function getStoredResetTokens(): ResetTokenRecord[] {
  try {
    const raw = localStorage.getItem(RESET_TOKENS_STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) return parsed;
    }
  } catch (e) {
    console.error('Failed to read reset tokens:', e);
  }
  return [];
}

function saveStoredResetTokens(tokens: ResetTokenRecord[]) {
  try {
    localStorage.setItem(RESET_TOKENS_STORAGE_KEY, JSON.stringify(tokens));
  } catch (e) {
    console.error('Failed to save reset tokens:', e);
  }
}

/**
 * Requests a password reset link for the given email (Gmail/Email).
 * Triggers Supabase password reset email if configured, and sets up
 * local token for instant client-side reset capability.
 */
export async function requestPasswordReset(email: string): Promise<{
  success: boolean;
  error?: string;
  resetUrl?: string;
  token?: string;
}> {
  const cleanEmail = email.trim().toLowerCase();
  if (!cleanEmail || !cleanEmail.includes('@')) {
    return { success: false, error: 'Please provide a valid Gmail or Email address.' };
  }

  // Check if customer exists locally or in Supabase
  const localCustomers = getStoredCustomers();
  const existsLocally = localCustomers.some((c) => c.email.toLowerCase() === cleanEmail);

  let existsInCloud = false;
  if (isSupabaseConfigured && supabase) {
    try {
      const { data } = await supabase
        .from('customers')
        .select('id, email')
        .eq('email', cleanEmail)
        .maybeSingle();
      if (data) existsInCloud = true;
    } catch (e) {
      console.warn('Supabase email check notice:', e);
    }
  }

  if (!existsLocally && !existsInCloud) {
    return {
      success: false,
      error: 'No registered account found with this email. Please check your spelling or create a new account.',
    };
  }

  // Generate secure 32-character random token
  const tokenBytes = new Uint8Array(16);
  crypto.getRandomValues(tokenBytes);
  const token = Array.from(tokenBytes).map((b) => b.toString(16).padStart(2, '0')).join('');
  const expiresAt = Date.now() + 15 * 60 * 1000; // 15 minutes validity

  // Save token
  const activeTokens = getStoredResetTokens().filter((t) => t.expiresAt > Date.now());
  activeTokens.push({ token, email: cleanEmail, expiresAt });
  saveStoredResetTokens(activeTokens);

  const baseUrl = window.location.origin;
  const resetUrl = `${baseUrl}/login?reset=true&email=${encodeURIComponent(cleanEmail)}&token=${token}`;

  // If Supabase is active, trigger official Supabase Auth password reset email
  if (isSupabaseConfigured && supabase) {
    try {
      await supabase.auth.resetPasswordForEmail(cleanEmail, {
        redirectTo: resetUrl,
      });
    } catch (err) {
      console.warn('Supabase reset email notice:', err);
    }
  }

  return {
    success: true,
    resetUrl,
    token,
  };
}

/**
 * Validates whether a given reset token is valid and unexpired for the specified email.
 */
export function verifyPasswordResetToken(token: string, email: string): boolean {
  if (!token || !email) return false;
  const cleanEmail = email.trim().toLowerCase();
  const tokens = getStoredResetTokens();
  const record = tokens.find((t) => t.token === token && t.email.toLowerCase() === cleanEmail);
  if (!record) return false;
  return record.expiresAt > Date.now();
}

/**
 * Updates a customer's password in both LocalStorage and Supabase.
 */
export async function resetCustomerPassword(
  email: string,
  newPassword: string,
  token?: string
): Promise<{ success: boolean; error?: string }> {
  const cleanEmail = email.trim().toLowerCase();
  if (!newPassword || newPassword.length < 6) {
    return { success: false, error: 'New password must be at least 6 characters long.' };
  }

  const computedHash = await hashPassword(newPassword);

  // 1. Update in Local Storage
  const localCustomers = getStoredCustomers();
  const customerIndex = localCustomers.findIndex((c) => c.email.toLowerCase() === cleanEmail);

  if (customerIndex !== -1) {
    localCustomers[customerIndex].passwordHash = computedHash;
    saveStoredCustomers(localCustomers);
  }

  // 2. Update in Supabase Cloud DB if available
  if (isSupabaseConfigured && supabase) {
    try {
      await supabase
        .from('customers')
        .update({ password_hash: computedHash, updated_at: new Date().toISOString() })
        .eq('email', cleanEmail);

      // If user session is active in Supabase Auth, also update their auth record
      await supabase.auth.updateUser({ password: newPassword }).catch(() => {});
    } catch (err) {
      console.warn('Supabase password update notice:', err);
    }
  }

  // Invalidate the used token
  if (token) {
    const activeTokens = getStoredResetTokens().filter((t) => t.token !== token);
    saveStoredResetTokens(activeTokens);
  }

  return { success: true };
}
