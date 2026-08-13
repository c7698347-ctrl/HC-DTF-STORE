const fs = require('fs');
const path = require('path');

const dataFilePath = path.join(__dirname, '..', 'src', 'data', 'products.json');

// Initialize products.json with HCDFT 406 and HCDFT 408
const initialStore = [
  {
    id: 'prod_1786627851308',
    name: 'HCDFT 406',
    slug: 'hcdft-406',
    categoryId: 'cat-new',
    category: 'New Arrivals',
    price: 400,
    offerPrice: 400,
    stock: 100,
    status: 'Published',
    enabled: true,
    isTrending: true,
    isBestSeller: true,
    images: ['https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&q=80&w=800'],
    description: 'HCDFT 406 Premium DTF Transfer'
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
    images: ['https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&q=80&w=800'],
    description: 'HCDFT 408 Premium DTF Sheet'
  }
];

fs.writeFileSync(dataFilePath, JSON.stringify(initialStore, null, 2), 'utf8');
console.log('✅ Initialized src/data/products.json with HCDFT 406 and HCDFT 408');
console.log('Product count:', initialStore.length);
console.log('Products:', initialStore.map(p => `${p.name} (₹${p.price})`).join(', '));
