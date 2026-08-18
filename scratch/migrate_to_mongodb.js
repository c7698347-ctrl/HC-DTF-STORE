const fs = require('fs');
const path = require('path');
const mongoose = require('mongoose');

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/hc_dtf_store';
const diskDataPath = path.join(__dirname, '..', 'src', 'data', 'products.json');

const ProductSchema = new mongoose.Schema(
  {
    id: { type: String, required: true, unique: true, index: true },
    name: { type: String, required: true, trim: true },
    slug: { type: String, required: true, trim: true },
    sku: { type: String, default: '' },
    description: { type: String, default: '' },
    category: { type: String, default: 'New Arrivals' },
    categoryId: { type: String, default: 'cat-new' },
    subcategory: { type: String, default: 'General' },
    tags: [{ type: String }],
    price: { type: Number, required: true, default: 0 },
    offerPrice: { type: Number, required: true, default: 0 },
    compareAtPrice: { type: Number, default: 0 },
    discountPercent: { type: Number, default: 0 },
    stock: { type: Number, required: true, default: 100 },
    images: [{ type: String }],
    status: { type: String, default: 'Published' },
    enabled: { type: Boolean, default: true },
    isPublished: { type: Boolean, default: true },
    isTrending: { type: Boolean, default: false },
    isNewArrival: { type: Boolean, default: true },
    isBestSeller: { type: Boolean, default: false },
    isPremium: { type: Boolean, default: false },
    rating: { type: Number, default: 5.0 },
    reviewCount: { type: Number, default: 1 }
  },
  { timestamps: true }
);

const Product = mongoose.models.Product || mongoose.model('Product', ProductSchema);

async function migrateData() {
  console.log('🚀 [Migration] Starting MongoDB Data Migration...');

  if (!fs.existsSync(diskDataPath)) {
    console.log('⚠️ [Migration] No disk products.json found. Skipping disk import.');
    return;
  }

  const diskContent = fs.readFileSync(diskDataPath, 'utf8');
  const products = JSON.parse(diskContent || '[]');

  console.log(`📦 [Migration] Read ${products.length} products from disk products.json.`);

  try {
    await mongoose.connect(MONGODB_URI, { dbName: 'hc_dtf_store', serverSelectionTimeoutMS: 4000 });
    console.log('🍃 [Migration] Connected to MongoDB database successfully.');

    for (const p of products) {
      await Product.findOneAndUpdate(
        { id: String(p.id).trim() },
        {
          $set: {
            id: String(p.id).trim(),
            name: p.name,
            slug: p.slug || p.name.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
            sku: p.sku || `SKU-${p.id}`,
            description: p.description || '',
            category: p.category || 'New Arrivals',
            categoryId: p.categoryId || 'cat-new',
            subcategory: p.subcategory || 'General',
            tags: Array.isArray(p.tags) ? p.tags : [],
            price: Number(p.price) || 0,
            offerPrice: Number(p.offerPrice) || Number(p.price) || 0,
            compareAtPrice: Number(p.price) || 0,
            discountPercent: Number(p.discountPercent) || 0,
            stock: Number(p.stock) || 100,
            images: Array.isArray(p.images) ? p.images : [],
            status: p.status || 'Published',
            enabled: p.enabled !== false,
            isPublished: p.isPublished !== false,
            isTrending: !!p.isTrending,
            isNewArrival: p.isNewArrival !== false,
            isBestSeller: !!p.isBestSeller,
            isPremium: !!p.isPremium,
            rating: p.rating || 5.0,
            reviewCount: p.reviewCount || 1,
            updatedAt: new Date()
          }
        },
        { upsert: true, new: true }
      );
      console.log(`  ✓ Migrated/Updated Product: ${p.name} (${p.id})`);
    }

    const count = await Product.countDocuments();
    console.log(`✅ [Migration] Migration completed successfully! Total MongoDB products: ${count}`);
    await mongoose.disconnect();
  } catch (err) {
    console.warn('⚠️ [Migration] MongoDB connection failed during migration script (fallback active):', err.message);
  }
}

migrateData();
