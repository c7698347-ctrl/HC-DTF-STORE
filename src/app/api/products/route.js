import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

const dataFilePath = path.join(process.cwd(), 'src', 'data', 'products.json');

// Ensure directory and file exist
function getProductsFromDisk() {
  try {
    if (!fs.existsSync(dataFilePath)) {
      const dir = path.dirname(dataFilePath);
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }
      fs.writeFileSync(dataFilePath, JSON.stringify([]), 'utf8');
      return [];
    }
    const content = fs.readFileSync(dataFilePath, 'utf8');
    return JSON.parse(content || '[]');
  } catch (e) {
    console.error('Error reading products.json from disk:', e);
    return [];
  }
}

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

// GET /api/products - Read all products from database
export async function GET() {
  const products = getProductsFromDisk();
  return NextResponse.json({
    success: true,
    products
  }, {
    headers: {
      'Cache-Control': 'no-store, max-age=0'
    }
  });
}

// POST /api/products - Insert a new product into database
export async function POST(req) {
  try {
    const body = await req.json();
    const currentProducts = getProductsFromDisk();

    const newProd = {
      id: body.id || `prod-${Date.now()}`,
      name: body.name?.trim() || 'Untitled Product',
      slug: (body.name || 'product').toLowerCase().replace(/[^a-z0-9]+/g, '-'),
      categoryId: body.categoryId || 'cat-independence',
      category: body.categoryName || body.category || 'Independence',
      subcategory: body.subcategory || 'General',
      tags: Array.isArray(body.tags) ? body.tags : (typeof body.tags === 'string' ? body.tags.split(',').map(t => t.trim().toLowerCase()) : []),
      price: Number(body.price) || 0,
      offerPrice: Number(body.offerPrice) || Number(body.price) || 0,
      discountPercent: Number(body.price) > 0 ? Math.round(((Number(body.price) - Number(body.offerPrice)) / Number(body.price)) * 100) : 0,
      stock: Number(body.stock) || 100,
      description: body.description || '',
      images: Array.isArray(body.images) && body.images.length > 0 ? body.images : ['https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&q=80&w=800'],
      status: body.status || 'Published',
      enabled: true,
      isFeatured: true,
      isTrending: true,
      isBestSeller: true,
      isPremium: true,
      rating: 5.0,
      reviewCount: 1,
      createdAt: new Date().toISOString()
    };

    const updatedProducts = [newProd, ...currentProducts];
    saveProductsToDisk(updatedProducts);

    console.log('✅ [Database Engine] Saved new product to single database file:', newProd.name);

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

    currentProducts = currentProducts.map(p => {
      if (p.id === id) {
        return { ...p, ...updates };
      }
      return p;
    });

    saveProductsToDisk(currentProducts);
    return NextResponse.json({ success: true, products: currentProducts });

  } catch (error) {
    return NextResponse.json({ success: false, error: 'Failed to update product' }, { status: 500 });
  }
}

// DELETE /api/products - Delete product by ID
export async function DELETE(req) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');
    let currentProducts = getProductsFromDisk();

    currentProducts = currentProducts.filter(p => p.id !== id);
    saveProductsToDisk(currentProducts);

    return NextResponse.json({ success: true, products: currentProducts });

  } catch (error) {
    return NextResponse.json({ success: false, error: 'Failed to delete product' }, { status: 500 });
  }
}
