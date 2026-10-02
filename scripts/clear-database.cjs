const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

// Read .env
const envPath = path.join(__dirname, '../.env');
const envContent = fs.readFileSync(envPath, 'utf8');

let url = '';
let key = '';

envContent.split('\n').forEach(line => {
  const matchUrl = line.match(/^VITE_SUPABASE_URL=(.*)$/);
  if (matchUrl) url = matchUrl[1].trim();
  const matchKey = line.match(/^VITE_SUPABASE_ANON_KEY=(.*)$/);
  if (matchKey) key = matchKey[1].trim();
});

console.log('Connecting to Supabase at:', url);
if (!url || !key) {
  console.error('Missing Supabase URL or Key in .env');
  process.exit(1);
}

const supabase = createClient(url, key);

const tables = ['orders', 'products', 'reviews', 'coupons', 'gallery', 'customers', 'site_settings'];

async function clearDatabase() {
  console.log('\n🧹 Clearing Supabase database tables...');

  for (const table of tables) {
    try {
      const { data, error } = await supabase.from(table).delete().neq('id', '___non_existent_key___');
      if (error) {
        console.log(`⚠️ Table "${table}":`, error.message);
      } else {
        console.log(`✅ Table "${table}" cleared successfully!`);
      }
    } catch (e) {
      console.log(`⚠️ Table "${table}" error:`, e.message);
    }
  }

  console.log('\n✨ Supabase database tables cleared!');
}

clearDatabase();
