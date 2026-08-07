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
  { id: 'placed', label: 'Order Placed', desc: 'Order & Manual UPI payment proof submitted' },
  { id: 'payment_confirmed', label: 'Payment Verified', desc: 'UPI UTR transaction verified in bank ledger' },
  { id: 'printing_started', label: 'Printing Started', desc: '2400 DPI High-Density DTF roll printing in progress' },
  { id: 'printing_completed', label: 'Printing Completed', desc: 'Gang roll print finished & dried' },
  { id: 'qc', label: 'Quality Check', desc: 'TPU powder curing & color depth optical test passed' },
  { id: 'packed', label: 'Packed', desc: 'Safely packed in moisture-proof roll cylinder box' },
  { id: 'shipped', label: 'Shipped', desc: 'Handed over to courier partner for transit' },
  { id: 'out_for_delivery', label: 'Out For Delivery', desc: 'Courier delivery agent assigned for doorstep delivery' },
  { id: 'delivered', label: 'Delivered', desc: 'Handed over to customer upon OTP verification' }
];

// IMMUTABLE DEFAULT SYSTEM CATEGORIES (Always System Data)
export const DEFAULT_CATEGORIES = [
  { id: 'cat-independence', name: 'Independence', slug: 'independence', description: 'Patriotic 15th August & Freedom Print Transfers', enabled: true },
  { id: 'cat-festival', name: 'Festival', slug: 'festival', description: 'Diwali, Dussehra & Festive Metallic Transfers', enabled: true },
  { id: 'cat-blouse', name: 'Blouse Designs', slug: 'blouse-designs', description: '3D Gold Zari & Maggam Work Neckline Transfers', enabled: true },
  { id: 'cat-saree', name: 'Saree Borders', slug: 'saree-borders', description: 'Ethnic Zari Border Rolls & Print Strips', enabled: true },
  { id: 'cat-neck', name: 'Neck Designs', slug: 'neck-designs', description: 'Designer Necklines & Embroidered Look Transfers', enabled: true },
  { id: 'cat-stickers', name: 'DTF Stickers', slug: 'dtf-stickers', description: 'Waterproof & High-Density Garment Stickers', enabled: true },
  { id: 'cat-patches', name: 'DTF Patches', slug: 'dtf-patches', description: 'Chest, Sleeve & Back Ready-to-Press Patches', enabled: true },
  { id: 'cat-new', name: 'New Arrivals', slug: 'new-arrivals', description: 'Latest Factory Release Designs & Sheets', enabled: true },
  { id: 'cat-premium', name: 'Premium Collection', slug: 'premium-collection', description: '2400 DPI Ultra-HD Gold & Metallic Prints', enabled: true },
  { id: 'cat-trending', name: 'Trending', slug: 'trending', description: 'Highest Demand Garment Transfer Prints', enabled: true }
];

export const INITIAL_CATEGORIES = DEFAULT_CATEGORIES;

export const INITIAL_PRODUCTS = [];

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

export const INITIAL_SETTINGS = {
  storeName: 'HC DTF STORE',
  logoUrl: '',
  gstNumber: '36ABCDE1234F1Z5',
  shippingCharges: 70,
  freeShippingAbove: 999,
  whatsappNumber: '+919876543210',
  phone: '+91 98765 43210',
  email: 'support@hcdtfstore.com',
  address: 'HC DTF STORE HQ, Plot #45, Textile Hub Road, Hyderabad, Telangana, India - 500081',
  upiAccountName: 'HC DTF STORE (Hima Bindu)',
  upiId: 'hcdtfstore@upi',
  upiMobile: '+91 98765 43210',
  upiQrCodeUrl: 'https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=upi%3A%2F%2Fpay%3Fpa%3Dhcdtfstore%40upi%26pn%3DHC%2520DTF%2520STORE%26cu%3DINR',
  socialLinks: {
    instagram: '',
    facebook: '',
    youtube: ''
  },
  flashSaleEnabled: false,
  flashSaleEndTime: '',
  bannerEnabled: false,
  seoTitle: 'HC DTF STORE - Premium DTF Sheets, Patches & Ethnic Blouse Transfers',
  seoDescription: 'Order 1 Meter 22x39 & 12x39 DTF sheets, maggam blouse prints, gold zari saree borders & kids patches.',
  googleAnalyticsId: ''
};

export const INITIAL_CUSTOMERS = [];

export const INITIAL_ORDERS = [];

export const DEFAULT_ADMIN = {
  email: 'admin@hcdtfstore.com',
  passwordHash: '$2a$10$wS9X9pQ1.9lE5.q9q.G.O.yH.cK49e9uW7tS9.W9.q9.W9.q9',
  mustChangePassword: true
};
