export interface Review {
  id: string;
  customerName: string;
  city: string;
  rating: number; // 1 to 5
  date: string;
  productName: string;
  productId?: string;
  category: 'keychain' | 'tabletop' | 'bouquet' | 'custom';
  comment: string;
  photo?: string;
  verifiedBuyer: boolean;
  helpfulCount: number;
}

export const INITIAL_REVIEWS: Review[] = [
  {
    id: 'rev-1',
    customerName: 'Ananya S.',
    city: 'Chennai',
    rating: 5,
    date: '2 days ago',
    productName: 'Handmade Rose Keychain',
    productId: 'rose',
    category: 'keychain',
    comment: 'The rose keychain is shockingly fluffy and sturdy! The petals don’t lose shape at all even inside my heavy college bag. The packaging came with a cute handwritten note too. 10/10 recommend! 🌹✨',
    photo: '/assets/products/rose.jpg',
    verifiedBuyer: true,
    helpfulCount: 24,
  },
  {
    id: 'rev-2',
    customerName: 'Rohit K.',
    city: 'Bangalore',
    rating: 5,
    date: '5 days ago',
    productName: 'Luffy Straw Hat Charm',
    productId: 'luffy',
    category: 'keychain',
    comment: 'Ordered the Luffy Straw Hat keychain for my anime loving girlfriend. She went crazy over how detailed the tiny red band is! Such a unique handmade piece that stands out completely.',
    photo: '/assets/products/luffy.jpg',
    verifiedBuyer: true,
    helpfulCount: 19,
  },
  {
    id: 'rev-3',
    customerName: 'Pooja M.',
    city: 'Mumbai',
    rating: 5,
    date: '1 week ago',
    productName: 'Pink Tulip in Miniature Pot',
    productId: 'single_tulip_pot',
    category: 'tabletop',
    comment: 'Placed this little pink tulip on my work desk and it instantly brings so much peace to my desk setup! No watering needed and stays vibrant forever. Got so many compliments from colleagues!',
    photo: '/assets/products/single_tulip_pot.png',
    verifiedBuyer: true,
    helpfulCount: 31,
  },
  {
    id: 'rev-4',
    customerName: 'Sanjay V.',
    city: 'Hyderabad',
    rating: 5,
    date: '2 weeks ago',
    productName: 'Yellow Duck with Blue Bow',
    productId: 'duck',
    category: 'keychain',
    comment: 'The duck is so round, squishy, and impossibly cute! The blue bow gives it so much personality. Shipped really fast via WhatsApp order and reached in 3 days.',
    photo: '/assets/products/duck.png',
    verifiedBuyer: true,
    helpfulCount: 15,
  },
  {
    id: 'rev-5',
    customerName: 'Meera D.',
    city: 'Coimbatore',
    rating: 5,
    date: '3 weeks ago',
    productName: 'Four Tulips Desk Garden',
    productId: 'four_tulips_pot',
    category: 'tabletop',
    comment: 'The 4 tulips pot looks even more gorgeous in person than in the photos! The pastel shades are so soothing. It came wrapped very securely in bubble wrap with zero damage.',
    photo: '/assets/products/four_tulips_pot.png',
    verifiedBuyer: true,
    helpfulCount: 27,
  },
  {
    id: 'rev-6',
    customerName: 'Divya & Karthik',
    city: 'Kochi',
    rating: 5,
    date: '1 month ago',
    productName: 'Custom Initial Letter Charm',
    productId: 'custom_letter',
    category: 'custom',
    comment: 'Requested matching custom initials with lavender pipe cleaners for our anniversary. The Petalorah artisan was super polite on WhatsApp and customized it exactly to our preference! Will definitely buy again.',
    photo: '/assets/products/custom_letter.jpg',
    verifiedBuyer: true,
    helpfulCount: 22,
  },
];
