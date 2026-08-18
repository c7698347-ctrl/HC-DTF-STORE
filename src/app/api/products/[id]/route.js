import { NextResponse } from 'next/server';
import dbConnect, { isDbConnected } from '@/lib/mongodb';
import Product from '@/models/Product';
import fs from 'fs';
import path from 'path';

const diskDataPath = path.join(process.cwd(), 'src', 'data', 'products.json');

function getProductsFromDisk() {
  try {
    if (!fs.existsSync(diskDataPath)) return [];
    const content = fs.readFileSync(diskDataPath, 'utf8');
    return JSON.parse(content || '[]');
  } catch (e) {
    return [];
  }
}

// GET /api/products/[id] - Read single product by ID
export async function GET(req, { params }) {
  try {
    const targetId = String(params?.id || '').trim();
    await dbConnect();

    if (isDbConnected()) {
      const p = await Product.findOne({ id: targetId }).lean();
      if (p) {
        return NextResponse.json({ success: true, product: { ...p, id: String(p.id).trim() } });
      }
    }

    const disk = getProductsFromDisk();
    const found = disk.find(p => String(p.id).trim() === targetId);
    if (found) {
      return NextResponse.json({ success: true, product: found });
    }

    return NextResponse.json({ success: false, error: 'Product not found' }, { status: 404 });
  } catch (e) {
    return NextResponse.json({ success: false, error: 'Failed to fetch product' }, { status: 500 });
  }
}

// PATCH /api/products/[id] - Update single product fields by ID
export async function PATCH(req, { params }) {
  try {
    const targetId = String(params?.id || '').trim();
    const updates = await req.json();

    await dbConnect();

    if (isDbConnected()) {
      const updatedDoc = await Product.findOneAndUpdate(
        { id: targetId },
        { $set: { ...updates, id: targetId, updatedAt: new Date() } },
        { new: true, lean: true }
      );
      return NextResponse.json({ success: true, product: updatedDoc });
    }

    return NextResponse.json({ success: true, message: 'Updated' });
  } catch (e) {
    return NextResponse.json({ success: false, error: 'Failed to update product' }, { status: 500 });
  }
}

// DELETE /api/products/[id] - Delete single product by ID permanently
export async function DELETE(req, { params }) {
  try {
    const targetIdStr = String(params?.id || '').trim();
    if (!targetIdStr) {
      return NextResponse.json({ success: false, error: 'Product ID is required' }, { status: 400 });
    }

    // 1. Remove from Disk Persistence
    const disk = getProductsFromDisk();
    const remainingDisk = disk.filter(p => String(p.id).trim() !== targetIdStr);

    try {
      const dir = path.dirname(diskDataPath);
      if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
      fs.writeFileSync(diskDataPath, JSON.stringify(remainingDisk, null, 2), 'utf8');
    } catch (e) {}

    // 2. Remove from MongoDB Database
    await dbConnect();
    let finalProducts = remainingDisk;

    if (isDbConnected()) {
      await Product.deleteMany({
        $or: [{ id: targetIdStr }, { _id: targetIdStr }]
      });
      const remainingDbProducts = await Product.find({}).sort({ createdAt: -1 }).lean();
      finalProducts = remainingDbProducts.map(p => ({ ...p, id: String(p.id).trim(), _id: String(p._id) }));
    }

    return NextResponse.json({
      success: true,
      message: `Product ${targetIdStr} deleted permanently`,
      deletedId: targetIdStr,
      products: finalProducts
    });
  } catch (e) {
    return NextResponse.json({ success: false, error: 'Failed to delete product' }, { status: 500 });
  }
}
