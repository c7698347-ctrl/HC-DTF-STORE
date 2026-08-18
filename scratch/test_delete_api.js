const fs = require('fs');
const path = require('path');

const diskDataPath = path.join(__dirname, '..', 'src', 'data', 'products.json');

// 1. Reset live products first
const initial = [
  { id: 'prod_1786627851305', name: 'HCDFT 405', price: 400, stock: 100, images: ['https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b'] },
  { id: 'prod_1786627851307', name: 'HCDFT 407', price: 300, stock: 150, images: ['https://images.unsplash.com/photo-1579783900882-c0d3dad7b119'] },
  { id: 'prod_1786627851306', name: 'HCDFT 408', price: 249, stock: 1000, images: ['https://images.unsplash.com/photo-1541701494587-cb58502866ab'] }
];
fs.writeFileSync(diskDataPath, JSON.stringify(initial, null, 2), 'utf8');

console.log('1. Initial products count:', initial.length, 'IDs:', initial.map(p => p.id));

// 2. Perform deletion of prod_1786627851306 (HCDFT 408)
const targetId = 'prod_1786627851306';
const diskContent = JSON.parse(fs.readFileSync(diskDataPath, 'utf8'));
const remaining = diskContent.filter(p => String(p.id).trim() !== targetId);
fs.writeFileSync(diskDataPath, JSON.stringify(remaining, null, 2), 'utf8');

console.log('2. After deleting prod_1786627851306 count:', remaining.length, 'IDs:', remaining.map(p => p.id));

// 3. Verify deletion persistence
const verifyContent = JSON.parse(fs.readFileSync(diskDataPath, 'utf8'));
const hasDeleted = verifyContent.some(p => p.id === targetId);
console.log('3. Is prod_1786627851306 present in database disk?', hasDeleted ? 'YES (FAIL)' : 'NO (PASSED)');
