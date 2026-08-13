const fs = require('fs');
const path = require('path');

const dataFilePath = path.join(__dirname, '..', 'src', 'data', 'products.json');

const liveStore = [
  {
    id: 'prod_1786627851305',
    name: 'HCDFT 405',
    slug: 'hcdft-405',
    categoryId: 'cat-new',
    category: 'New Arrivals',
    price: 400,
    offerPrice: 400,
    stock: 100,
    status: 'Published',
    enabled: true,
    isTrending: true,
    isBestSeller: true,
    images: [
      'https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?auto=format&fit=crop&q=80&w=800'
    ],
    description: 'HCDFT 405 Premium Silk Pattern DTF Transfer Sheet',
    updatedAt: new Date().toISOString()
  },
  {
    id: 'prod_1786627851307',
    name: 'HCDFT 407',
    slug: 'hcdft-407',
    categoryId: 'cat-new',
    category: 'New Arrivals',
    price: 300,
    offerPrice: 300,
    stock: 150,
    status: 'Published',
    enabled: true,
    isTrending: true,
    isBestSeller: true,
    images: [
      'https://images.unsplash.com/photo-1579783900882-c0d3dad7b119?auto=format&fit=crop&q=80&w=800'
    ],
    description: 'HCDFT 407 Royal Peacock DTF Print',
    updatedAt: new Date().toISOString()
  },
  {
    id: 'prod_1786627851306',
    name: 'HCDFT 408',
    slug: 'hcdft-408',
    categoryId: 'cat-new',
    category: 'New Arrivals',
    price: 249,
    offerPrice: 249,
    stock: 1000,
    status: 'Published',
    enabled: true,
    isTrending: true,
    isBestSeller: true,
    images: [
      'https://images.unsplash.com/photo-1541701494587-cb58502866ab?auto=format&fit=crop&q=80&w=800'
    ],
    description: 'HCDFT 408 Gold Zari Border Saree DTF Transfer Sheet',
    updatedAt: new Date().toISOString()
  }
];

fs.writeFileSync(dataFilePath, JSON.stringify(liveStore, null, 2), 'utf8');
console.log('✅ Synchronized src/data/products.json with 3 Distinct Production Images (No Smoke Fallbacks)');
console.log('Total Count:', liveStore.length);
console.log('Products:', liveStore.map(p => `${p.id} (${p.name}) -> Image: ${p.images[0]}`).join('\n'));
