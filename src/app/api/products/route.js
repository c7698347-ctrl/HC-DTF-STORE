import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

const dataFilePath = path.join(process.cwd(), 'src', 'data', 'products.json');

// Deep clone product array to guarantee ZERO shared memory references between products
function deepCloneProducts(arr) {
  if (!Array.isArray(arr)) return [];
  return arr.map(p => ({
    ...p,
    id: String(p.id || '').trim(),
    name: String(p.name || '').trim(),
    images: Array.isArray(p.images) ? [...p.images] : [],
    tags: Array.isArray(p.tags) ? [...p.tags] : []
  }));
}

// Read products array from disk database
function getProductsFromDisk() {
  try {
    const dir = path.dirname(dataFilePath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }

    if (!fs.existsSync(dataFilePath)) {
      fs.writeFileSync(dataFilePath, JSON.stringify([], null, 2), 'utf8');
      return [];
    }

    const content = fs.readFileSync(dataFilePath, 'utf8');
    const parsed = JSON.parse(content || '[]');
    return deepCloneProducts(parsed);
  } catch (e) {
    console.error('Error reading products.json from disk:', e);
    return [];
  }
}

// Write products array to disk database
function saveProductsToDisk(products) {
  try {
    const dir = path.dirname(dataFilePath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    const clean = deepCloneProducts(products);
    fs.writeFileSync(dataFilePath, JSON.stringify(clean, null, 2), 'utf8');
  } catch (e) {
    console.error('Error writing products.json to disk:', e);
  }
}

// GET /api/products - Read all products from canonical database
export async function GET() {
  const products = getProductsFromDisk();
  return NextResponse.json({
    success: true,
    products
  }, {
    headers: {
      'Cache-Control': 'no-store, max-age=0, must-revalidate'
    }
  });
}

// POST /api/products - Insert or append a new product without touching existing sibling products
export async function POST(req) {
  try {
    const body = await req.json();
    const currentProducts = getProductsFromDisk();

    const productId = String(body.id || `prod_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`).trim();

    const newProd = {
      id: productId,
      name: body.name?.trim() || 'Untitled Product',
      slug: (body.name || 'product').toLowerCase().replace(/[^a-z0-9]+/g, '-'),
      categoryId: body.categoryId || 'cat-new',
      category: body.categoryName || body.category || 'New Arrivals',
      subcategory: body.subcategory || 'General',
      tags: Array.isArray(body.tags) ? [...body.tags] : (typeof body.tags === 'string' ? body.tags.split(',').map(t => t.trim().toLowerCase()) : []),
      price: Number(body.price) || 0,
      offerPrice: Number(body.offerPrice) || Number(body.price) || 0,
      discountPercent: Number(body.price) > 0 ? Math.round(((Number(body.price) - Number(body.offerPrice)) / Number(body.price)) * 100) : 0,
      stock: Number(body.stock) || 100,
      description: body.description || '',
      images: Array.isArray(body.images) && body.images.length > 0 
        ? [...body.images] 
        : [`https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&q=80&w=800&id=${productId}`],
      status: body.status || 'Published',
      enabled: body.enabled !== false,
      isFeatured: body.isFeatured !== false,
      isTrending: body.isTrending !== false,
      isBestSeller: body.isBestSeller !== false,
      isPremium: body.isPremium !== false,
      rating: body.rating || 5.0,
      reviewCount: body.reviewCount || 1,
      createdAt: body.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    // Strict ID-based Deduplication: If ID exists, update in place; otherwise prepend
    const existingIndex = currentProducts.findIndex(p => String(p.id).trim() === productId);
    let updatedProducts;
    if (existingIndex >= 0) {
      updatedProducts = currentProducts.map(p => {
        if (String(p.id).trim() === productId) {
          return { ...p, ...newProd };
        }
        return p;
      });
    } else {
      updatedProducts = [newProd, ...currentProducts];
    }

    saveProductsToDisk(updatedProducts);
    console.log(`✅ [Database Engine] Saved product ${newProd.name} (${newProd.id}). Total count: ${updatedProducts.length}`);

    return NextResponse.json({
      success: true,
      product: newProd,
      products: updatedProducts
    });

  } catch (error) {
    console.error('POST /api/products Error:', error);
    return NextResponse.json({ success: false, error: 'Failed to insert product into database' }, { status: 500 });
  }
}

// PUT /api/products - Update target product strictly by ID without touching any sibling product
export async function PUT(req) {
  try {
    const body = await req.json();
    const { id, ...updates } = body;
    if (!id) {
      return NextResponse.json({ success: false, error: 'Product ID is required for update' }, { status: 400 });
    }

    const targetIdStr = String(id).trim();
    let currentProducts = getProductsFromDisk();

    const existingIndex = currentProducts.findIndex(p => String(p.id).trim() === targetIdStr);
    let updatedProducts;

    if (existingIndex >= 0) {
      updatedProducts = currentProducts.map(p => {
        if (String(p.id).trim() === targetIdStr) {
          return {
            ...p,
            ...updates,
            id: targetIdStr, // Keep ID immutable
            images: Array.isArray(updates.images) ? [...updates.images] : [...(p.images || [])],
            tags: Array.isArray(updates.tags) ? [...updates.tags] : [...(p.tags || [])],
            updatedAt: new Date().toISOString()
          };
        }
        // Sibling products remain byte-for-byte untouched
        return p;
      });
    } else {
      // If product missing on disk, append safely as new record
      const created = {
        id: targetIdStr,
        ...updates,
        images: Array.isArray(updates.images) ? [...updates.images] : [],
        updatedAt: new Date().toISOString()
      };
      updatedProducts = [created, ...currentProducts];
    }

    saveProductsToDisk(updatedProducts);
    console.log(`✏️ [Database Engine] Updated product ${targetIdStr} ONLY. Sibling products untouched. Total count: ${updatedProducts.length}`);
    return NextResponse.json({ success: true, products: updatedProducts });

  } catch (error) {
    console.error('PUT /api/products Error:', error);
    return NextResponse.json({ success: false, error: 'Failed to update product' }, { status: 500 });
  }
}

// DELETE /api/products - Delete product permanently by ID without touching sibling products
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
    let currentProducts = getProductsFromDisk();
    const updatedProducts = currentProducts.filter(p => String(p.id).trim() !== targetIdStr);

    saveProductsToDisk(updatedProducts);
    console.log(`🗑️ [Database Engine] Permanently deleted product ${targetIdStr}. Remaining count: ${updatedProducts.length}`);

    return NextResponse.json({ success: true, products: updatedProducts });

  } catch (error) {
    console.error('DELETE /api/products Error:', error);
    return NextResponse.json({ success: false, error: 'Failed to delete product' }, { status: 500 });
  }
}
