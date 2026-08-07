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

// PRODUCTION READY DTF PRODUCTS + JUKE HEAT PRESS MACHINES
export const INITIAL_PRODUCTS = [
  {
    id: 'prod-juke-1624',
    name: 'JUKE Heat Press Machine 16×24',
    slug: 'juke-heat-press-machine-16x24',
    categoryId: 'cat-heatpress',
    category: 'HEAT PRESS MACHINES',
    price: 25000,
    offerPrice: 25000,
    rating: 5.0,
    stock: 50,
    tags: ['juke', 'heatpress', 'machine', '16x24'],
    status: 'Published',
    enabled: true,
    isTrending: true,
    isBestSeller: true,
    isPremium: true,
    images: ['/images/juke_heat_press_16x24.png'],
    description: 'Professional JUKE Heavy Duty 16x24 Commercial Heat Press Machine for DTF Printing. Features digital temperature & timer control, teflon-coated aluminium heating plate, uniform pressure distribution, and heavy-duty steel body.',
    specifications: {
      size: '16×24 Inches',
      voltage: '220V 50Hz',
      power: '2500W',
      usage: 'Commercial DTF & Sublimation Heat Pressing',
      tempRange: '0 - 399°C',
      timerRange: '0 - 999 Seconds',
      warranty: '1 Year Manufacturer Technical Support Warranty'
    }
  },
  {
    id: 'prod-juke-1632',
    name: 'JUKE Heat Press Machine 16×32',
    slug: 'juke-heat-press-machine-16x32',
    categoryId: 'cat-heatpress',
    category: 'HEAT PRESS MACHINES',
    price: 30000,
    offerPrice: 30000,
    rating: 5.0,
    stock: 50,
    tags: ['juke', 'heatpress', 'machine', '16x32'],
    status: 'Published',
    enabled: true,
    isTrending: true,
    isBestSeller: true,
    isPremium: true,
    images: ['/images/juke_heat_press_16x32.png'],
    description: 'Professional JUKE Extra Large 16x32 Heavy Duty Commercial Heat Press Machine. Designed for full meter gang sheet printing with digital timer, even heat retention, and industrial grade dual gas springs.',
    specifications: {
      size: '16×32 Inches',
      voltage: '220V 50Hz',
      power: '3200W',
      usage: 'Heavy Duty Commercial DTF & Gang Sheet Pressing',
      tempRange: '0 - 399°C',
      timerRange: '0 - 999 Seconds',
      warranty: '1 Year Manufacturer Technical Support Warranty'
    }
  },
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
    name: 'Ethnic Metallic Saree Border Gang Roll (1 Meter)',
    slug: 'ethnic-metallic-saree-border-roll',
    categoryId: 'cat-saree',
    category: 'Saree Borders',
    price: 649,
    offerPrice: 499,
    rating: 5.0,
    stock: 200,
    tags: ['saree', 'border', 'metallic', 'gold'],
    status: 'Published',
    enabled: true,
    isTrending: false,
    isBestSeller: true,
    isPremium: true,
    images: ['https://images.unsplash.com/photo-1541701494587-cb58502866ab?auto=format&fit=crop&q=80&w=800'],
    description: '1 Meter continuous saree border DTF roll with metallic gold foil finish.'
  },
  {
    id: 'prod-104',
    name: 'Diwali & Dussehra Special Golden Festival Transfer',
    slug: 'diwali-dussehra-golden-festival-transfer',
    categoryId: 'cat-festival',
    category: 'Festival Collection',
    price: 450,
    offerPrice: 349,
    rating: 4.9,
    stock: 120,
    tags: ['festival', 'diwali', 'golden', 'festive'],
    status: 'Published',
    enabled: true,
    isTrending: true,
    isBestSeller: false,
    isPremium: true,
    images: ['https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?auto=format&fit=crop&q=80&w=800'],
    description: 'Special festive gold leaf transfer sheet for silk sarees & traditional dupattas.'
  },
  {
    id: 'prod-105',
    name: 'Floral Embroidery Style Back Neck DTF Sheet',
    slug: 'floral-embroidery-back-neck-dtf',
    categoryId: 'cat-floral',
    category: 'Floral Designs',
    price: 320,
    offerPrice: 249,
    rating: 4.7,
    stock: 95,
    tags: ['floral', 'embroidery', 'backneck', 'rose'],
    status: 'Published',
    enabled: true,
    isTrending: false,
    isBestSeller: false,
    isPremium: false,
    images: ['https://images.unsplash.com/photo-1513519245088-0e12902e5a38?auto=format&fit=crop&q=80&w=800'],
    description: 'Multicolor floral vine design for blouse back neck & sleeves.'
  },
  {
    id: 'prod-106',
    name: 'Kids Cartoon & Superheroes Patch Set (Sheet of 12)',
    slug: 'kids-cartoon-superheroes-patch-set',
    categoryId: 'cat-kids',
    category: "Kids Collection",
    price: 220,
    offerPrice: 179,
    rating: 4.9,
    stock: 300,
    tags: ['kids', 'cartoon', 'patch', 'superhero'],
    status: 'Published',
    enabled: true,
    isTrending: false,
    isBestSeller: false,
    isPremium: false,
    images: ['https://images.unsplash.com/photo-1560506840-ec148e82a604?auto=format&fit=crop&q=80&w=800'],
    description: 'Set of 12 high-density washable DTF patches for kids t-shirts & frock sleeves.'
  },
  {
    id: 'prod-107',
    name: 'Lord Shiva Ultra-HD Metallic Chest Print',
    slug: 'lord-shiva-ultra-hd-metallic-chest-print',
    categoryId: 'cat-mens',
    category: "Men's Collection",
    price: 299,
    offerPrice: 229,
    rating: 5.0,
    stock: 140,
    tags: ['shiva', 'mahadev', 'chest', 'mens'],
    status: 'Published',
    enabled: true,
    isTrending: true,
    isBestSeller: true,
    isPremium: true,
    images: ['https://images.unsplash.com/photo-1563245372-f21724e3856d?auto=format&fit=crop&q=80&w=800'],
    description: '2400 DPI Shiva portrait DTF transfer for men t-shirts & hoodies.'
  },
  {
    id: 'prod-108',
    name: 'Independence Tiranga Flag Patriotic Transfer',
    slug: 'independence-tiranga-flag-patriotic-transfer',
    categoryId: 'cat-festival',
    category: 'Festival Collection',
    price: 199,
    offerPrice: 149,
    rating: 4.8,
    stock: 500,
    tags: ['independence', 'tiranga', 'flag', 'august15'],
    status: 'Published',
    enabled: true,
    isTrending: false,
    isBestSeller: false,
    isPremium: false,
    images: ['https://images.unsplash.com/photo-1532375810709-75b1da00537c?auto=format&fit=crop&q=80&w=800'],
    description: 'Patriotic Indian tricolor flag DTF transfer for Independence Day events.'
  },
  {
    id: 'prod-109',
    name: "Women's Designer Sleeve & Front Neck Combo",
    slug: 'womens-designer-sleeve-front-neck-combo',
    categoryId: 'cat-womens',
    category: "Women's Collection",
    price: 499,
    offerPrice: 399,
    rating: 4.9,
    stock: 110,
    tags: ['womens', 'combo', 'sleeve', 'neck'],
    status: 'Published',
    enabled: true,
    isTrending: true,
    isBestSeller: false,
    isPremium: true,
    images: ['https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?auto=format&fit=crop&q=80&w=800'],
    description: 'Complete combo sheet including front neck, back neck & matching sleeve borders.'
  },
  {
    id: 'prod-110',
    name: 'Rose & Lotus Botanical Floral Gang Sheet',
    slug: 'rose-lotus-botanical-floral-gang-sheet',
    categoryId: 'cat-floral',
    category: 'Floral Designs',
    price: 360,
    offerPrice: 289,
    rating: 4.7,
    stock: 90,
    tags: ['rose', 'lotus', 'botanical', 'floral'],
    status: 'Published',
    enabled: true,
    isTrending: false,
    isBestSeller: false,
    isPremium: false,
    images: ['https://images.unsplash.com/photo-1490750967868-88aa4486c946?auto=format&fit=crop&q=80&w=800'],
    description: 'Assorted rose & lotus floral motifs for ethnic wear & kurti necklines.'
  },
  {
    id: 'prod-111',
    name: "Men's Graphic Vintage Biker DTF Transfer",
    slug: 'mens-graphic-vintage-biker-dtf-transfer',
    categoryId: 'cat-mens',
    category: "Men's Collection",
    price: 279,
    offerPrice: 199,
    rating: 4.8,
    stock: 75,
    tags: ['biker', 'vintage', 'mens', 'graphic'],
    status: 'Published',
    enabled: true,
    isTrending: false,
    isBestSeller: false,
    isPremium: false,
    images: ['https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&q=80&w=800'],
    description: 'Vintage motorcycle graphic transfer sheet for oversized t-shirts.'
  },
  {
    id: 'prod-112',
    name: 'Ultra Metallic Gold Zardozi Border Roll',
    slug: 'ultra-metallic-gold-zardozi-border-roll',
    categoryId: 'cat-metallic',
    category: 'Metallic Prints',
    price: 699,
    offerPrice: 549,
    rating: 5.0,
    stock: 160,
    tags: ['zardozi', 'gold', 'border', 'metallic'],
    status: 'Published',
    enabled: true,
    isTrending: true,
    isBestSeller: true,
    isPremium: true,
    images: ['https://images.unsplash.com/photo-1567401893414-76b7b1e5a7a5?auto=format&fit=crop&q=80&w=800'],
    description: 'Super reflective metallic gold zardozi look transfer roll for sarees & lehengas.'
  },
  {
    id: 'prod-113',
    name: 'Heavy Bridal Work Blouse Neckline Sheet',
    slug: 'heavy-bridal-work-blouse-neckline-sheet',
    categoryId: 'cat-blouse',
    category: 'Blouse Designs',
    price: 599,
    offerPrice: 449,
    rating: 4.9,
    stock: 130,
    tags: ['bridal', 'heavy', 'blouse', 'neck'],
    status: 'Published',
    enabled: true,
    isTrending: false,
    isBestSeller: true,
    isPremium: true,
    images: ['https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&q=80&w=800'],
    description: 'Intricate bridal maggam work DTF sheet for high-end wedding blouses.'
  },
  {
    id: 'prod-114',
    name: 'Traditional Temple Jewellery Neck Print',
    slug: 'traditional-temple-jewellery-neck-print',
    categoryId: 'cat-neck',
    category: 'Neck Designs',
    price: 420,
    offerPrice: 329,
    rating: 4.8,
    stock: 95,
    tags: ['temple', 'jewellery', 'neck', 'traditional'],
    status: 'Published',
    enabled: true,
    isTrending: false,
    isBestSeller: false,
    isPremium: false,
    images: ['https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?auto=format&fit=crop&q=80&w=800'],
    description: 'Temple jewellery antique gold look neck transfer for traditional wear.'
  },
  {
    id: 'prod-115',
    name: 'Glossy Holographic Foil DTF Patch Sheet',
    slug: 'glossy-holographic-foil-dtf-patch-sheet',
    categoryId: 'cat-metallic',
    category: 'Metallic Prints',
    price: 480,
    offerPrice: 379,
    rating: 4.9,
    stock: 140,
    tags: ['holographic', 'foil', 'patch', 'glossy'],
    status: 'Published',
    enabled: true,
    isTrending: false,
    isBestSeller: false,
    isPremium: true,
    images: ['https://images.unsplash.com/photo-1550684848-fac1c5b4e853?auto=format&fit=crop&q=80&w=800'],
    description: '3D holographic rainbow foil patches for streetwear & denim jackets.'
  },
  {
    id: 'prod-116',
    name: 'Custom 22x39 Meter Full Gang Roll Print',
    slug: 'custom-22x39-meter-full-gang-roll-print',
    categoryId: 'cat-custom',
    category: 'Custom Printing',
    price: 899,
    offerPrice: 699,
    rating: 5.0,
    stock: 500,
    tags: ['custom', 'gangsheet', 'meter', 'roll'],
    status: 'Published',
    enabled: true,
    isTrending: true,
    isBestSeller: true,
    isPremium: true,
    images: ['https://images.unsplash.com/photo-1509631179647-0177331693ae?auto=format&fit=crop&q=80&w=800'],
    description: '1 Full Meter (22x39 inches) custom gang sheet DTF print roll. Upload your designs.'
  }
];

export const INITIAL_BANNERS = [];

export const INITIAL_FLASH_SALE = {
  id: '',
  title: 'No Flash Sale Active',
  startDate: '',
  startTime: '',
  endDate: '',
  endTime: '',
  enabled: false,
  repeatMode: 'Run Once',
  discountPercent: 0,
  ordersCount: 0,
  totalRevenue: 0,
  history: []
};

export const STATE_SHIPPING_RATES = {
  'Andhra Pradesh': 150,
  'Telangana': 150,
  'Tamil Nadu': 180,
  'Karnataka': 180,
  'Kerala': 200,
  'Other States': 200
};

export const getShippingChargeForState = (stateName, stateRatesMap = STATE_SHIPPING_RATES) => {
  if (!stateName) return 150;
  const cleanState = stateName.trim().toLowerCase();
  const rates = stateRatesMap || STATE_SHIPPING_RATES;
  if (cleanState.includes('andhra')) return Number(rates['Andhra Pradesh']) || 150;
  if (cleanState.includes('telangana')) return Number(rates['Telangana']) || 150;
  if (cleanState.includes('tamil')) return Number(rates['Tamil Nadu']) || 180;
  if (cleanState.includes('karnataka')) return Number(rates['Karnataka']) || 180;
  if (cleanState.includes('kerala')) return Number(rates['Kerala']) || 200;
  return Number(rates['Other States']) || 200;
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
  heatPressSectionEnabled: true,
  heatPressTitle: '🔥 JUKE HEAT PRESS MACHINES',
  heatPressSubtitle: 'Professional Heavy Duty Heat Press Machines for Commercial DTF Printing',
  seoTitle: 'HC DTF STORE - Premium DTF Sheets, Patches & JUKE Heat Press Machines',
  seoDescription: 'Order 1 Meter 22x39 & 12x39 DTF sheets, maggam blouse prints, gold zari saree borders & JUKE Heat Press Machines 16x24 / 16x32.',
  googleAnalyticsId: ''
};

export const INITIAL_CUSTOMERS = [];

export const INITIAL_ORDERS = [];

export const DEFAULT_ADMIN = {
  email: 'admin@hcdtfstore.com',
  passwordHash: '$2a$10$wS9X9pQ1.9lE5.q9q.G.O.yH.cK49e9uW7tS9.W9.q9.W9.q9',
  mustChangePassword: false
};
