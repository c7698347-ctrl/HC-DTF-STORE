import mongoose from 'mongoose';

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
  {
    timestamps: true
  }
);

export default mongoose.models.Product || mongoose.model('Product', ProductSchema);
