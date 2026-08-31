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

export const ALL_PRODUCTS: Product[] = [
  // --- KEYCHAINS ---
  {
    id: 'rose',
    name: 'Handmade Rose Keychain',
    price: '₹50',
    numericPrice: 50,
    category: 'keychain',
    description: 'A timeless symbol of love, meticulously handcrafted with rich crimson pipe cleaner petals and a deep green stem. Perfect as a romantic keepsake or a luxury bag charm.',
    img: '/assets/products/rose.jpg',
    badge: 'Best Seller',
    isBestSeller: true
  },
  {
    id: 'tulip',
    name: 'Pink Tulip Keychain',
    price: '₹50',
    numericPrice: 50,
    category: 'keychain',
    description: 'An elegant pink tulip keychain carrying the gentle warmth of spring. Carefully twisted loops ensure a soft, fluffy texture that stays pristine forever.',
    img: '/assets/products/tulip.png',
    badge: 'Cute Accent'
  },
  {
    id: 'evil_eye',
    name: 'Evil Eye Protection Charm',
    price: '₹60',
    numericPrice: 60,
    category: 'keychain',
    description: 'A protective charm crafted with concentric circles of royal blue, soft blue, and white pipe cleaners. A beautiful blend of folklore and handmade artistry.',
    img: '/assets/products/evil_eye.jpg',
    badge: 'Popular',
    isBestSeller: true
  },
  {
    id: 'duck',
    name: 'Yellow Duck with Blue Bow',
    price: '₹80',
    numericPrice: 80,
    category: 'keychain',
    description: 'An adorable round yellow duck keychain wearing a tiny blue head bow. Guaranteed to bring happy vibes and smiles wherever it goes.',
    img: '/assets/products/duck.png',
    badge: 'Super Cute'
  },
  {
    id: 'moon_cloud',
    name: 'Crescent Moon & Fluffy Cloud',
    price: '₹80',
    numericPrice: 80,
    category: 'keychain',
    description: 'A dreamy crescent blue moon cradling soft, fluffy white clouds with elegant pearl accents. A miniature night sky keepsake designed for dreamers.',
    img: '/assets/products/moon_cloud.jpg',
    badge: 'Dreamy'
  },
  {
    id: 'cloud',
    name: 'Fluffy White Cloud',
    price: '₹60',
    numericPrice: 60,
    category: 'keychain',
    description: 'A soft, fluffy white cloud keychain. A miniature sky keepsake designed to bring a touch of daydreaming to your day.',
    img: '/assets/products/cloud.jpg',
    badge: 'Fluffy'
  },
  {
    id: 'paw_print',
    name: 'Kitty Paw Print Keychain',
    price: '₹80',
    numericPrice: 80,
    category: 'keychain',
    description: 'Adorable cat paw print keychains handcrafted with fluffy pink pads on solid black and white bases. A perfect, cute accessory for animal lovers.',
    img: '/assets/products/paw_print.jpg',
    badge: 'Cute Paw'
  },
  {
    id: 'lily',
    name: 'Light Blue Lily Flower',
    price: '₹60',
    numericPrice: 60,
    category: 'keychain',
    description: 'A gorgeous light blue five-petal lily flower keychain with a green leaf and delicate pearl accents at its core. Handcrafted to represent pure and elegant beauty.',
    img: '/assets/products/lily.jpg',
    badge: 'New Bloom'
  },
  {
    id: 'cherry',
    name: 'Twin Red Cherries',
    price: '₹50',
    numericPrice: 50,
    category: 'keychain',
    description: 'A sweet pair of twin red cherries suspended from green leafy stems. Adds a playful, delicious pop of color to keys and accessories.',
    img: '/assets/products/cherry.jpg',
    badge: 'Playful'
  },
  {
    id: 'rainbow',
    name: 'Pastel Rainbow & Clouds',
    price: '₹60',
    numericPrice: 60,
    category: 'keychain',
    description: 'A vibrant arched pastel rainbow anchored by two fluffy white clouds. Handcrafted with precision wire twisting to maintain a perfect arch shape.',
    img: '/assets/products/rainbow.jpg',
    badge: 'Colorful'
  },
  {
    id: 'daisy_pot',
    name: 'Mini Daisy Pot Charm',
    price: '₹60',
    numericPrice: 60,
    category: 'keychain',
    description: 'Miniature flowerpots featuring blooming white and purple daisies. Ideal as a happy dashboard companion or workspace decoration.',
    img: '/assets/products/daisy_pot.png',
    badge: 'Table Decor'
  },
  {
    id: 'bow',
    name: 'Classic Ribbon Bow Charm',
    price: '₹45',
    numericPrice: 45,
    category: 'keychain',
    description: 'A classic blue pipe cleaner ribbon bow keychain with an elegant pearl accent. Simple, elegant, and perfectly handcrafted.',
    img: '/assets/products/bow.png',
    badge: 'Classic'
  },
  {
    id: 'custom_jersey',
    name: 'Custom Sports Jersey',
    price: '₹80',
    numericPrice: 80,
    category: 'custom',
    description: 'Handcrafted custom sports jersey keychains tailored to your favorite numbers, colors, and teams. Perfect gift for sports enthusiasts.',
    img: '/assets/products/custom_jersey.jpg',
    badge: 'Unique Gift'
  },
  {
    id: 'custom_letter',
    name: 'Custom Initial Letter Charm',
    price: '₹60',
    numericPrice: 60,
    category: 'custom',
    description: 'Custom letter keychains designed in multi-shade colors with an accompanying heart charm. A lovely, personalized companion for your bag or keys.',
    img: '/assets/products/custom_letter.jpg',
    badge: 'Personalized'
  },
  {
    id: 'sunflower',
    name: 'Radiant Sunflower Keychain',
    price: '₹80',
    numericPrice: 80,
    category: 'keychain',
    description: 'A radiant handmade sunflower keychain featuring bright golden petals, a fluffy brown center, and vibrant green leaves. Crafted with precision wire twisting.',
    img: '/assets/products/sunflower.jpg',
    badge: 'Bright Bloom'
  },
  {
    id: 'luffy',
    name: 'Luffy Straw Hat (One Piece)',
    price: '₹90',
    numericPrice: 90,
    category: 'keychain',
    description: 'Iconic One Piece Luffy straw hat keychain handcrafted from golden yellow pipe cleaners with a signature crimson red band accent. A must-have for anime fans!',
    img: '/assets/products/luffy.jpg',
    badge: 'Anime Special'
  },
  {
    id: 'batman',
    name: 'Batman Emblem Keychain',
    price: '₹90',
    numericPrice: 90,
    category: 'keychain',
    description: 'Classic Batman logo keychain handcrafted from rich black pipe cleaners. Perfect for superhero fans and comic enthusiasts.',
    img: '/assets/products/batman.jpg',
    badge: 'Hero'
  },

  // --- TABLE TOPS ---
  {
    id: 'single_tulip_pot',
    name: 'Single Pink Tulip Pot',
    price: '₹169',
    originalPrice: '₹199',
    numericPrice: 169,
    category: 'tabletop',
    description: 'A charming handcrafted single pink tulip flower pot desk companion. Carefully twisted with vibrant pink petals, green leaves, and nestled in a cozy ribbed cream pot. A delicate touch of warmth for your desk or workspace.',
    img: '/assets/products/single_tulip_pot.jpg',
    badge: 'New Arrival'
  },
  {
    id: 'four_tulips_pot',
    name: 'Pink Tulip Garden Pot (4 Flowers)',
    price: '₹199',
    originalPrice: '₹250',
    numericPrice: 199,
    category: 'tabletop',
    description: 'A stunning handcrafted table top arrangement featuring 4 lush blooming pink tulips with green leaves in a dark ribbed pot. Stays fresh and vibrant forever, bringing life to any table.',
    img: '/assets/products/four_tulips_pot.jpg',
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
    description: 'A cheerful handcrafted sunflower pot desk companion. Twisted with vibrant yellow petals, dark brown center, green leaves, and nestled in a cozy orange pot. A perfect touch of warmth for any desk or workspace.',
    img: '/assets/products/sunflower_pot.jpg',
    badge: 'Popular'
  },

  // --- BOUQUETS ---
  {
    id: 'flower_bouquets',
    name: 'Custom Pipe Cleaner Flower Bouquet',
    price: 'Starts from ₹249',
    numericPrice: 249,
    category: 'bouquet',
    description: 'Beautiful, custom-designed pipe cleaner flower bouquets that stay fresh and vibrant forever. Choose your favorite flowers, bouquet wrapping, and custom color themes!',
    img: '/assets/products/flower_bouquets.png',
    badge: 'Custom Bouquet',
    isComingSoon: false
  }
];
