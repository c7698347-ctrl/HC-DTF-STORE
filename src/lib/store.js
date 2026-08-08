import bcrypt from 'bcryptjs';

export const COURIER_PARTNERS = [
  'Delhivery',
  'Blue Dart',
  'DTDC',
  'Xpressbees',
  'Ecom Express',
  'India Post',
  'Professional Couriers',
  'Shadowfax',
  'Local Delivery',
  'Self Delivery',
  'Other (Custom)'
];

export const TRACKING_STAGES = [
  { id: 'placed', label: 'Payment Pending', desc: 'Prepaid payment order submitted' },
  { id: 'payment_confirmed', label: 'Payment Verified', desc: 'Bank credit confirmed' },
  { id: 'printing_started', label: 'Printing', desc: '2400 DPI High-Density DTF roll printing in progress' },
  { id: 'packed', label: 'Packing', desc: 'Safely packed in moisture-proof roll cylinder box' },
  { id: 'shipped', label: 'Shipped', desc: 'Handed over to courier partner for transit' },
  { id: 'delivered', label: 'Delivered', desc: 'Handed over to customer' }
];

// IMMUTABLE DEFAULT SYSTEM CATEGORIES FOR SIDE MENU
export const DEFAULT_CATEGORIES = [
  { id: 'cat-heatpress', name: 'HEAT PRESS MACHINES', slug: 'heat-press-machines', description: 'Professional JUKE Commercial Heat Press Machines', enabled: true },
  { id: 'cat-womens', name: "Women's Collection", slug: 'womens-collection', description: 'Designer Maggam & Ethnic Blouse Transfers', enabled: true },
  { id: 'cat-mens', name: "Men's Collection", slug: 'mens-collection', description: 'Chest & Back Graphic Transfers', enabled: true },
  { id: 'cat-kids', name: "Kids Collection", slug: 'kids-collection', description: 'Cute Patches & Cartoon Transfers', enabled: true },
  { id: 'cat-festival', name: 'Festival Collection', slug: 'festival-collection', description: 'Diwali, Dussehra & Metallic Transfers', enabled: true },
  { id: 'cat-custom', name: 'Custom Printing', slug: 'custom-printing', description: 'Upload Custom Gang Sheet & Meter Rolls', enabled: true },
  { id: 'cat-saree', name: 'Saree Borders', slug: 'saree-borders', description: 'Zari Border Rolls & Print Strips', enabled: true },
  { id: 'cat-blouse', name: 'Blouse Designs', slug: 'blouse-designs', description: '3D Gold Zari & Maggam Work Transfers', enabled: true },
  { id: 'cat-neck', name: 'Neck Designs', slug: 'neck-designs', description: 'Embroidered Look Designer Necklines', enabled: true },
  { id: 'cat-floral', name: 'Floral Designs', slug: 'floral-designs', description: 'Botanical & Lotus Rose Flower Sheet Prints', enabled: true },
  { id: 'cat-metallic', name: 'Metallic Prints', slug: 'metallic-prints', description: 'Ultra-HD Gold & Foil Metallic Transfers', enabled: true },
  { id: 'cat-bestsellers', name: 'Best Sellers', slug: 'best-sellers', description: 'Highest Demand DTF Prints', enabled: true },
  { id: 'cat-new', name: 'New Arrivals', slug: 'new-arrivals', description: 'Latest Factory Release Gang Sheets', enabled: true }
];

export const INITIAL_CATEGORIES = DEFAULT_CATEGORIES;

// CENTRALIZED MACHINE CONFIGURATION & INITIAL DATA MODEL
export const INITIAL_MACHINE_CONFIG = {
  enabled: true,
  sectionTitle: '🔥 JUKE HEAT PRESS MACHINES',
  sectionSubtitle: 'Professional Heavy Duty Heat Press Machines for Commercial DTF Printing'
};

export const INITIAL_MACHINES_LIST = [
  {
    id: 'mach_1624',
    name: 'JUKE Heat Press Machine 16×24',
    slug: 'juke-heat-press-machine-16x24',
    size: '16×24 Inches',
    price: 25000,
    stock: 50,
    image: '/images/juke_heat_press_16x24.png',
    description: 'Professional JUKE Heavy Duty 16x24 Commercial Heat Press Machine for DTF Printing. Features digital temperature & timer control, teflon-coated aluminium heating plate, uniform pressure distribution, and heavy-duty steel body.',
    features: '220V 50Hz, Aluminium Teflon Coated Platen, 0-399°C Temp Range, 0-999 Sec Timer, 1 Year Tech Warranty',
    voltage: '220V 50Hz',
    warranty: '1 Year Manufacturer Technical Support Warranty',
    buttonText: 'Buy Now',
    visible: true,
    displayOrder: 1
  },
  {
    id: 'mach_1632',
    name: 'JUKE Heat Press Machine 16×32',
    slug: 'juke-heat-press-machine-16x32',
    size: '16×32 Inches',
    price: 30000,
    stock: 50,
    image: '/images/juke_heat_press_16x32.png',
    description: 'Professional JUKE Extra Large 16x32 Heavy Duty Commercial Heat Press Machine. Designed for full meter gang sheet printing with digital timer, even heat retention, and industrial grade dual gas springs.',
    features: '220V 50Hz, Aluminium Teflon Coated Platen, 0-399°C Temp Range, Dual Gas Springs, 1 Year Tech Warranty',
    voltage: '220V 50Hz',
    warranty: '1 Year Manufacturer Technical Support Warranty',
    buttonText: 'Buy Now',
    visible: true,
    displayOrder: 2
  }
];

// PRODUCTION READY DTF PRODUCTS
export const INITIAL_PRODUCTS = [
  {
    id: 'prod-101',
    name: '3D Gold Zari Maggam Blouse Transfer Sheet (12x39)',
    slug: '3d-gold-zari-maggam-blouse-transfer',
    categoryId: 'cat-blouse',
    category: 'Blouse Designs',
    price: 399,
    offerPrice: 299,
    rating: 4.9,
    stock: 150,
    tags: ['maggam', 'zari', 'gold', 'blouse', 'neck'],
    status: 'Published',
    enabled: true,
    isTrending: true,
    isBestSeller: false,
    isPremium: true,
    images: ['https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&q=80&w=800'],
    description: 'High-density 2400 DPI gold zari embroidered look DTF transfer sheet for blouse necklines.'
  },
  {
    id: 'prod-102',
    name: 'Royal Peacock Neckline DTF Print',
    slug: 'royal-peacock-neckline-dtf-print',
    categoryId: 'cat-neck',
    category: 'Neck Designs',
    price: 249,
    offerPrice: 199,
    rating: 4.8,
    stock: 85,
    tags: ['peacock', 'neck', 'royal', 'blue'],
    status: 'Published',
    enabled: true,
    isTrending: true,
    isBestSeller: true,
    isPremium: false,
    images: ['https://images.unsplash.com/photo-1579783902614-a3fb3927b675?auto=format&fit=crop&q=80&w=800'],
    description: 'Vibrant peacock feather motif DTF transfer sheet designed for front & back necklines.'
  },
  {
    id: 'prod-103',
    name: 'Diwali Gold Foil Lotus Border (1 Meter Roll)',
    slug: 'diwali-gold-foil-lotus-border-1m',
    categoryId: 'cat-saree',
    category: 'Saree Borders',
    price: 599,
    offerPrice: 449,
    rating: 5.0,
    stock: 200,
    tags: ['diwali', 'gold', 'lotus', 'saree', 'border'],
    status: 'Published',
    enabled: true,
    isTrending: true,
    isBestSeller: true,
    isPremium: true,
    images: ['https://images.unsplash.com/photo-1541701494587-cb58502866ab?auto=format&fit=crop&q=80&w=800'],
    description: 'Continuous 1 meter gang roll for saree zari border enhancement.'
  },
  {
    id: 'prod-104',
    name: 'Cute Superhero Kids T-Shirt Patches Pack',
    slug: 'cute-superhero-kids-patches-pack',
    categoryId: 'cat-kids',
    category: 'Kids Collection',
    price: 199,
    offerPrice: 149,
    rating: 4.7,
    stock: 120,
    tags: ['kids', 'superhero', 'cartoon', 'patches'],
    status: 'Published',
    enabled: true,
    isTrending: false,
    isBestSeller: false,
    isPremium: false,
    images: ['https://images.unsplash.com/photo-1560506840-ec148e82a604?auto=format&fit=crop&q=80&w=800'],
    description: 'A pack of 6 ready-to-press cartoon superhero patches for children apparel.'
  }
];

export const INITIAL_BANNERS = [
  {
    id: 'b-1',
    title: 'Ultra HD 2400 DPI DTF Gang Sheets',
    subtitle: 'Factory Direct Ready-To-Press Transfer Rolls',
    ctaText: 'Explore Ready Sheets',
    ctaLink: '/shop',
    imageUrl: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&q=80&w=1200',
    enabled: true
  }
];

export const INITIAL_FLASH_SALE = {
  enabled: true,
  endTime: new Date(Date.now() + 48 * 3600 * 1000).toISOString(),
  productIds: ['prod-101', 'prod-103']
};

// ADMIN-MANAGED DYNAMIC SHIPPING RULES MODEL
export const INITIAL_SHIPPING_RULES = [
  { id: 'ship_tg', state: 'Telangana', charge: 150, enabled: true },
  { id: 'ship_ap', state: 'Andhra Pradesh', charge: 150, enabled: true },
  { id: 'ship_tn', state: 'Tamil Nadu', charge: 180, enabled: true },
  { id: 'ship_ka', state: 'Karnataka', charge: 180, enabled: true },
  { id: 'ship_kl', state: 'Kerala', charge: 200, enabled: true },
  { id: 'ship_mh', state: 'Maharashtra', charge: 200, enabled: true },
  { id: 'ship_gj', state: 'Gujarat', charge: 200, enabled: true },
  { id: 'ship_dl', state: 'Delhi', charge: 200, enabled: true },
  { id: 'ship_oth', state: 'Other States', charge: 200, enabled: true }
];

export const STATE_SHIPPING_RATES = {
  'Telangana': 150,
  'Andhra Pradesh': 150,
  'Tamil Nadu': 180,
  'Karnataka': 180,
  'Kerala': 200,
  'Other States': 200
};

export const getShippingChargeForState = (stateName, rulesList = INITIAL_SHIPPING_RULES) => {
  if (!stateName) return null;
  const clean = stateName.trim().toLowerCase();
  
  const match = (rulesList || []).find((r) => {
    const s = r.state.trim().toLowerCase();
    return s === clean || clean.includes(s) || s.includes(clean);
  });

  if (match && match.enabled) {
    return Number(match.charge);
  }
  
  return null; // Return null if no enabled shipping rule exists
};

export const INITIAL_SETTINGS = {
  storeName: 'HC DTF STORE',
  logoUrl: '',
  shippingCharges: 150,
  freeShippingAbove: 999,
  stateShippingRates: STATE_SHIPPING_RATES,
  whatsappNumber: '+918121635407',
  phone: '+91 8121635407',
  email: 'support@hcdtfstore.com',
  address: 'HC DTF STORE HQ, Plot #45, Textile Hub Road, Hyderabad, Telangana, India - 500081',
  upiAccountName: 'Sunil Kumar',
  upiId: 'sunillankapalli77@okhdfcbank',
  upiMobile: '+91 8121635407',
  upiQrCodeUrl: '/gpay-qr.png',
  socialLinks: {
    instagram: '',
    facebook: '',
    youtube: ''
  },
  flashSaleEnabled: false,
  flashSaleEndTime: '',
  bannerEnabled: false,
  seoTitle: 'HC DTF STORE - Premium DTF Sheets & JUKE Heat Press Machines',
  seoDescription: 'Order 1 Meter 22x39 & 12x39 DTF sheets, maggam blouse prints, gold zari saree borders & JUKE Heat Press Machines.',
  googleAnalyticsId: ''
};

export const INITIAL_CUSTOMERS = [];

export const INITIAL_ORDERS = [];

export const DEFAULT_ADMIN = {
  email: 'admin@hcdtfstore.com',
  passwordHash: '$2a$10$wS9X9pQ1.9lE5.q9q.G.O.yH.cK49e9uW7tS9.W9.q9.W9.q9',
  mustChangePassword: false
};
