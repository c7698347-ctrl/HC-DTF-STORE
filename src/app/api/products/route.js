import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

const dataFilePath = path.join(process.cwd(), 'src', 'data', 'products.json');

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
    return Array.isArray(parsed) ? parsed : [];
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
    fs.writeFileSync(dataFilePath, JSON.stringify(products, null, 2), 'utf8');
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

// POST /api/products - Insert or append a new product without replacing existing catalog
export async function POST(req) {
  try {
    const body = await req.json();
    const currentProducts = getProductsFromDisk();

    const productId = body.id || `prod_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`;

    const newProd = {
      id: productId,
      name: body.name?.trim() || 'Untitled Product',
      slug: (body.name || 'product').toLowerCase().replace(/[^a-z0-9]+/g, '-'),
      categoryId: body.categoryId || 'cat-new',
      category: body.categoryName || body.category || 'New Arrivals',
      subcategory: body.subcategory || 'General',
      tags: Array.isArray(body.tags) ? body.tags : (typeof body.tags === 'string' ? body.tags.split(',').map(t => t.trim().toLowerCase()) : []),
      price: Number(body.price) || 0,
      offerPrice: Number(body.offerPrice) || Number(body.price) || 0,
      discountPercent: Number(body.price) > 0 ? Math.round(((Number(body.price) - Number(body.offerPrice)) / Number(body.price)) * 100) : 0,
      stock: Number(body.stock) || 100,
      description: body.description || '',
      images: Array.isArray(body.images) && body.images.length > 0 ? body.images : ['https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&q=80&w=800'],
      status: body.status || 'Published',
      enabled: body.enabled !== false,
      isFeatured: body.isFeatured !== false,
      isTrending: body.isTrending !== false,
      isBestSeller: body.isBestSeller !== false,
      isPremium: body.isPremium !== false,
      rating: body.rating || 5.0,
      reviewCount: body.reviewCount || 1,
      createdAt: body.createdAt || new Date().toISOString()
    };

    // Deduplicate: If ID already exists, update in place; otherwise prepend
    const existingIndex = currentProducts.findIndex(p => p.id === newProd.id);
    let updatedProducts;
    if (existingIndex >= 0) {
      updatedProducts = [...currentProducts];
      updatedProducts[existingIndex] = { ...updatedProducts[existingIndex], ...newProd };
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

// PUT /api/products - Update existing product
export async function PUT(req) {
  try {
    const body = await req.json();
    const { id, ...updates } = body;
    let currentProducts = getProductsFromDisk();

    const existingIndex = currentProducts.findIndex(p => p.id === id);
    let updatedProducts;

    if (existingIndex >= 0) {
      updatedProducts = [...currentProducts];
      updatedProducts[existingIndex] = { ...updatedProducts[existingIndex], ...updates };
    } else {
      // If product was missing on disk, append it safely
      updatedProducts = [{ id, ...updates }, ...currentProducts];
    }

    saveProductsToDisk(updatedProducts);
    console.log(`✏️ [Database Engine] Updated product ${id}. Total count: ${updatedProducts.length}`);
    return NextResponse.json({ success: true, products: updatedProducts });

  } catch (error) {
    console.error('PUT /api/products Error:', error);
    return NextResponse.json({ success: false, error: 'Failed to update product' }, { status: 500 });
  }
}

// DELETE /api/products - Delete product permanently by ID
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

    let currentProducts = getProductsFromDisk();
    const updatedProducts = currentProducts.filter(p => p.id !== id);

    saveProductsToDisk(updatedProducts);
    console.log(`🗑️ [Database Engine] Permanently deleted product ${id}. Remaining count: ${updatedProducts.length}`);

    return NextResponse.json({ success: true, products: updatedProducts });

  } catch (error) {
    console.error('DELETE /api/products Error:', error);
    return NextResponse.json({ success: false, error: 'Failed to delete product' }, { status: 500 });
  }
}
