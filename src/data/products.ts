export interface Product {
  id: string;
  name: string;
  price: string;
  originalPrice?: string;
  numericPrice: number;
  category: 'keychain' | 'tabletop' | 'bouquet' | 'custom';
  description: string;
  img: string;
  badge: string;
  isBestSeller?: boolean;
  isComingSoon?: boolean;
}

export const DEFAULT_PRODUCT_DESCRIPTION_TEMPLATE = `Size: 
Material: 
Handmade information: 
Customization availability: 
Approximate preparation time: `;

export const ALL_PRODUCTS: Product[] = [
  // --- KEYCHAINS ---
  {
    id: 'rose',
    name: 'Handmade Rose Keychain',
    price: '₹50',
    numericPrice: 50,
    category: 'keychain',
    description: DEFAULT_PRODUCT_DESCRIPTION_TEMPLATE,
    img: '/assets/products/rose.webp',
    badge: 'Best Seller',
    isBestSeller: true
  },
  {
    id: 'tulip',
    name: 'Pink Tulip Keychain',
    price: '₹50',
    numericPrice: 50,
    category: 'keychain',
    description: DEFAULT_PRODUCT_DESCRIPTION_TEMPLATE,
    img: '/assets/products/tulip.webp',
    badge: ''
  },
  {
    id: 'evil_eye',
    name: 'Evil Eye Protection Charm',
    price: '₹60',
    numericPrice: 60,
    category: 'keychain',
    description: DEFAULT_PRODUCT_DESCRIPTION_TEMPLATE,
    img: '/assets/products/evil_eye.webp',
    badge: ''
  },
  {
    id: 'duck',
    name: 'Yellow Duck with Blue Bow',
    price: '₹80',
    numericPrice: 80,
    category: 'keychain',
    description: DEFAULT_PRODUCT_DESCRIPTION_TEMPLATE,
    img: '/assets/products/duck.webp',
    badge: ''
  },
  {
    id: 'moon_cloud',
    name: 'Crescent Moon & Fluffy Cloud',
    price: '₹80',
    numericPrice: 80,
    category: 'keychain',
    description: DEFAULT_PRODUCT_DESCRIPTION_TEMPLATE,
    img: '/assets/products/moon_cloud.webp',
    badge: ''
  },
  {
    id: 'cloud',
    name: 'Fluffy White Cloud',
    price: '₹60',
    numericPrice: 60,
    category: 'keychain',
    description: DEFAULT_PRODUCT_DESCRIPTION_TEMPLATE,
    img: '/assets/products/cloud.webp',
    badge: ''
  },
  {
    id: 'paw_print',
    name: 'Kitty Paw Print Keychain',
    price: '₹80',
    numericPrice: 80,
    category: 'keychain',
    description: DEFAULT_PRODUCT_DESCRIPTION_TEMPLATE,
    img: '/assets/products/paw_print.webp',
    badge: ''
  },
  {
    id: 'lily',
    name: 'Light Blue Lily Flower',
    price: '₹60',
    numericPrice: 60,
    category: 'keychain',
    description: DEFAULT_PRODUCT_DESCRIPTION_TEMPLATE,
    img: '/assets/products/lily.webp',
    badge: 'New'
  },
  {
    id: 'cherry',
    name: 'Twin Red Cherries',
    price: '₹50',
    numericPrice: 50,
    category: 'keychain',
    description: DEFAULT_PRODUCT_DESCRIPTION_TEMPLATE,
    img: '/assets/products/cherry.webp',
    badge: ''
  },
  {
    id: 'rainbow',
    name: 'Pastel Rainbow & Clouds',
    price: '₹60',
    numericPrice: 60,
    category: 'keychain',
    description: DEFAULT_PRODUCT_DESCRIPTION_TEMPLATE,
    img: '/assets/products/rainbow.webp',
    badge: ''
  },
  {
    id: 'daisy_pot',
    name: 'Mini Daisy Pot Charm',
    price: '₹60',
    numericPrice: 60,
    category: 'keychain',
    description: DEFAULT_PRODUCT_DESCRIPTION_TEMPLATE,
    img: '/assets/products/daisy_pot.webp',
    badge: ''
  },
  {
    id: 'bow',
    name: 'Classic Ribbon Bow Charm',
    price: '₹45',
    numericPrice: 45,
    category: 'keychain',
    description: DEFAULT_PRODUCT_DESCRIPTION_TEMPLATE,
    img: '/assets/products/bow.webp',
    badge: ''
  },
  {
    id: 'custom_jersey',
    name: 'Custom Sports Jersey',
    price: '₹80',
    numericPrice: 80,
    category: 'custom',
    description: DEFAULT_PRODUCT_DESCRIPTION_TEMPLATE,
    img: '/assets/products/custom_jersey.webp',
    badge: 'Limited'
  },
  {
    id: 'custom_letter',
    name: 'Custom Initial Letter Charm',
    price: '₹60',
    numericPrice: 60,
    category: 'custom',
    description: DEFAULT_PRODUCT_DESCRIPTION_TEMPLATE,
    img: '/assets/products/custom_letter.webp',
    badge: ''
  },
  {
    id: 'sunflower',
    name: 'Radiant Sunflower Keychain',
    price: '₹80',
    numericPrice: 80,
    category: 'keychain',
    description: DEFAULT_PRODUCT_DESCRIPTION_TEMPLATE,
    img: '/assets/products/sunflower.webp',
    badge: ''
  },
  {
    id: 'luffy',
    name: 'Luffy Straw Hat (One Piece)',
    price: '₹90',
    numericPrice: 90,
    category: 'keychain',
    description: DEFAULT_PRODUCT_DESCRIPTION_TEMPLATE,
    img: '/assets/products/luffy.webp',
    badge: 'Limited'
  },
  {
    id: 'batman',
    name: 'Batman Emblem Keychain',
    price: '₹90',
    numericPrice: 90,
    category: 'keychain',
    description: DEFAULT_PRODUCT_DESCRIPTION_TEMPLATE,
    img: '/assets/products/batman.webp',
    badge: ''
  },

  // --- TABLE TOPS ---
  {
    id: 'single_tulip_pot',
    name: 'Single Pink Tulip Pot',
    price: '₹169',
    originalPrice: '₹199',
    numericPrice: 169,
    category: 'tabletop',
    description: DEFAULT_PRODUCT_DESCRIPTION_TEMPLATE,
    img: '/assets/products/single_tulip_pot.webp',
    badge: 'New'
  },
  {
    id: 'four_tulips_pot',
    name: 'Pink Tulip Garden Pot (4 Flowers)',
    price: '₹199',
    originalPrice: '₹250',
    numericPrice: 199,
    category: 'tabletop',
    description: DEFAULT_PRODUCT_DESCRIPTION_TEMPLATE,
    img: '/assets/products/four_tulips_pot.webp',
    badge: 'Best Seller',
    isBestSeller: true
  },
  {
    id: 'sunflower_pot',
    name: 'Miniature Sunflower Pot',
    price: '₹199',
    originalPrice: '₹249',
    numericPrice: 199,
    category: 'tabletop',
    description: DEFAULT_PRODUCT_DESCRIPTION_TEMPLATE,
    img: '/assets/products/sunflower_pot.webp',
    badge: ''
  },

  // --- BOUQUETS ---
  {
    id: 'flower_bouquets',
    name: 'Custom Pipe Cleaner Flower Bouquet',
    price: 'Starts from ₹249',
    numericPrice: 249,
    category: 'bouquet',
    description: DEFAULT_PRODUCT_DESCRIPTION_TEMPLATE,
    img: '/assets/products/flower_bouquets.webp',
    badge: 'Best Seller',
    isBestSeller: true,
    isComingSoon: false
  },
  {
    id: 'customised_birthday',
    name: 'Special Celebration Flower Bouquet',
    price: '₹299',
    numericPrice: 299,
    category: 'bouquet',
    description: DEFAULT_PRODUCT_DESCRIPTION_TEMPLATE,
    img: '/assets/products/customised_birthday.webp',
    badge: 'New',
    isComingSoon: false
  },
  {
    id: 'blue_rose_bouquet',
    name: 'Pastel Bloom Elegance Bouquet',
    price: '₹279',
    numericPrice: 279,
    category: 'bouquet',
    description: DEFAULT_PRODUCT_DESCRIPTION_TEMPLATE,
    img: '/assets/products/blue_rose.webp',
    badge: 'Limited',
    isComingSoon: false
  }
];
