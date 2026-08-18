import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import dbConnect, { isDbConnected } from '@/lib/mongodb';
import Product from '@/models/Product';

const diskDataPath = path.join(process.cwd(), 'src', 'data', 'products.json');

// Disk fallback utilities
function getProductsFromDisk() {
  try {
    const dir = path.dirname(diskDataPath);
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    if (!fs.existsSync(diskDataPath)) fs.writeFileSync(diskDataPath, JSON.stringify([], null, 2), 'utf8');
    const content = fs.readFileSync(diskDataPath, 'utf8');
    const parsed = JSON.parse(content || '[]');
    return Array.isArray(parsed) ? parsed : [];
  } catch (e) {
    console.error('Disk read error:', e);
    return [];
  }
}

function saveProductsToDisk(products) {
  try {
    const dir = path.dirname(diskDataPath);
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    fs.writeFileSync(diskDataPath, JSON.stringify(products, null, 2), 'utf8');
  } catch (e) {
    console.error('Disk write error:', e);
  }
}

// GET /api/products - Read all products from canonical MongoDB database
export async function GET(req) {
  try {
    await dbConnect();

    if (isDbConnected()) {
      const dbProducts = await Product.find({}).sort({ createdAt: -1 }).lean();
      const formatted = dbProducts.map(p => ({
        ...p,
        id: String(p.id).trim(),
        _id: String(p._id)
      }));
      // Keep disk file synced with MongoDB canonical data
      saveProductsToDisk(formatted);
      return NextResponse.json({ success: true, products: formatted }, {
        headers: { 'Cache-Control': 'no-store, max-age=0, must-revalidate' }
      });
    }
  } catch (e) {
    console.warn('MongoDB GET error, falling back to disk:', e.message);
  }

  const diskProducts = getProductsFromDisk();
  return NextResponse.json({ success: true, products: diskProducts }, {
    headers: { 'Cache-Control': 'no-store, max-age=0, must-revalidate' }
  });
}

// POST /api/products - Create new product document in MongoDB
export async function POST(req) {
  try {
    const body = await req.json();
    const productId = String(body.id || `prod_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`).trim();

    const productData = {
      id: productId,
      name: body.name?.trim() || 'Untitled Product',
      slug: (body.name || 'product').toLowerCase().replace(/[^a-z0-9]+/g, '-'),
      sku: body.sku || `SKU-${Date.now()}`,
      categoryId: body.categoryId || 'cat-new',
      category: body.categoryName || body.category || 'New Arrivals',
      subcategory: body.subcategory || 'General',
      tags: Array.isArray(body.tags) ? [...body.tags] : (typeof body.tags === 'string' ? body.tags.split(',').map(t => t.trim().toLowerCase()) : []),
      price: Number(body.price) || 0,
      offerPrice: Number(body.offerPrice) || Number(body.price) || 0,
      compareAtPrice: Number(body.compareAtPrice) || Number(body.price) || 0,
      discountPercent: Number(body.price) > 0 ? Math.round(((Number(body.price) - Number(body.offerPrice)) / Number(body.price)) * 100) : 0,
      stock: Number(body.stock) || 100,
      description: body.description || '',
      images: Array.isArray(body.images) && body.images.length > 0 
        ? [...body.images] 
        : [`https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?auto=format&fit=crop&q=80&w=800&id=${productId}`],
      status: body.status || 'Published',
      enabled: body.enabled !== false,
      isPublished: body.isPublished !== false,
      isTrending: body.isTrending !== false,
      isNewArrival: body.isNewArrival !== false,
      isBestSeller: body.isBestSeller !== false,
      isPremium: body.isPremium !== false,
      rating: body.rating || 5.0,
      reviewCount: body.reviewCount || 1
    };

    await dbConnect();

    if (isDbConnected()) {
      const doc = await Product.findOneAndUpdate(
        { id: productId },
        { $set: productData },
        { upsert: true, new: true, lean: true }
      );

      const allDbProducts = await Product.find({}).sort({ createdAt: -1 }).lean();
      const formatted = allDbProducts.map(p => ({ ...p, id: String(p.id).trim(), _id: String(p._id) }));
      saveProductsToDisk(formatted);

      console.log(`🍃 [MongoDB Engine] Saved product ${doc.name} (${doc.id}). Count: ${formatted.length}`);
      return NextResponse.json({ success: true, product: doc, products: formatted });
    }

    // Disk fallback if MongoDB disconnected
    const disk = getProductsFromDisk();
    const idx = disk.findIndex(p => String(p.id).trim() === productId);
    let updated;
    if (idx >= 0) {
      updated = [...disk];
      updated[idx] = { ...updated[idx], ...productData };
    } else {
      updated = [productData, ...disk];
    }
    saveProductsToDisk(updated);
    return NextResponse.json({ success: true, product: productData, products: updated });

  } catch (error) {
    console.error('POST /api/products Error:', error);
    return NextResponse.json({ success: false, error: 'Failed to create product in database' }, { status: 500 });
  }
}

// PUT /api/products - Update target product strictly by ID in MongoDB
export async function PUT(req) {
  try {
    const body = await req.json();
    const { id, ...updates } = body;

    if (!id) {
      return NextResponse.json({ success: false, error: 'Product ID is required for update' }, { status: 400 });
    }

    const targetIdStr = String(id).trim();
    await dbConnect();

    if (isDbConnected()) {
      const updatedDoc = await Product.findOneAndUpdate(
        { id: targetIdStr },
        { $set: { ...updates, id: targetIdStr, updatedAt: new Date() } },
        { new: true, lean: true }
      );

      const allDbProducts = await Product.find({}).sort({ createdAt: -1 }).lean();
      const formatted = allDbProducts.map(p => ({ ...p, id: String(p.id).trim(), _id: String(p._id) }));
      saveProductsToDisk(formatted);

      console.log(`✏️ [MongoDB Engine] Updated product ${targetIdStr} ONLY. Count: ${formatted.length}`);
      return NextResponse.json({ success: true, product: updatedDoc, products: formatted });
    }

    // Disk fallback if MongoDB disconnected
    const disk = getProductsFromDisk();
    const updated = disk.map(p => {
      if (String(p.id).trim() === targetIdStr) {
        return { ...p, ...updates, id: targetIdStr, updatedAt: new Date().toISOString() };
      }
      return p;
    });
    saveProductsToDisk(updated);
    return NextResponse.json({ success: true, products: updated });

  } catch (error) {
    console.error('PUT /api/products Error:', error);
    return NextResponse.json({ success: false, error: 'Failed to update product' }, { status: 500 });
  }
}

// DELETE /api/products - Delete target product permanently from MongoDB
export async function DELETE(req) {
  try {
    const { searchParams } = new URL(req.url);
    let id = searchParams.get('id');

    if (!id) {
      try {
        const body = await req.json();
        id = body.id;
      } catch (e) {}
    }

    if (!id) {
      return NextResponse.json({ success: false, error: 'Product ID is required for deletion' }, { status: 400 });
    }

    const targetIdStr = String(id).trim();
    await dbConnect();

    if (isDbConnected()) {
      await Product.deleteOne({ id: targetIdStr });
      const remainingDbProducts = await Product.find({}).sort({ createdAt: -1 }).lean();
      const formatted = remainingDbProducts.map(p => ({ ...p, id: String(p.id).trim(), _id: String(p._id) }));
      saveProductsToDisk(formatted);

      console.log(`🗑️ [MongoDB Engine] Permanently deleted product ${targetIdStr}. Remaining: ${formatted.length}`);
      return NextResponse.json({ success: true, products: formatted });
    }

    // Disk fallback if MongoDB disconnected
    const disk = getProductsFromDisk();
    const updated = disk.filter(p => String(p.id).trim() !== targetIdStr);
    saveProductsToDisk(updated);
    return NextResponse.json({ success: true, products: updated });

  } catch (error) {
    console.error('DELETE /api/products Error:', error);
    return NextResponse.json({ success: false, error: 'Failed to delete product' }, { status: 500 });
  }
}
