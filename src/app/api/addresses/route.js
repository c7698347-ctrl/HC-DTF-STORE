import { NextResponse } from 'next/server';
import dbConnect, { isDbConnected } from '@/lib/mongodb';
import Address from '@/models/Address';

// GET /api/addresses - Read customer addresses
export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url);
    const customerId = searchParams.get('customerId');

    if (!customerId) {
      return NextResponse.json({ success: true, addresses: [] });
    }

    await dbConnect();

    if (isDbConnected()) {
      const addresses = await Address.find({ customerId: String(customerId).trim() }).sort({ isDefault: -1, createdAt: -1 }).lean();
      return NextResponse.json({ success: true, addresses });
    }

    return NextResponse.json({ success: true, addresses: [] });
  } catch (e) {
    console.error('GET /api/addresses Error:', e);
    return NextResponse.json({ success: false, error: 'Failed to fetch addresses' }, { status: 500 });
  }
}

// POST /api/addresses - Create new customer address in MongoDB
export async function POST(req) {
  try {
    const body = await req.json();
    const { customerId, fullName, mobile, houseFlatNo, street, area, city, state, pincode } = body;

    if (!customerId || !fullName || !mobile || !houseFlatNo || !street || !area || !city || !state || !pincode) {
      return NextResponse.json({ success: false, error: 'Missing required address fields' }, { status: 400 });
    }

    const addressId = `addr_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`;
    await dbConnect();

    if (isDbConnected()) {
      // If setting default, unset existing default
      if (body.isDefault) {
        await Address.updateMany({ customerId: String(customerId).trim() }, { $set: { isDefault: false } });
      }

      const created = await Address.create({
        id: addressId,
        customerId: String(customerId).trim(),
        label: body.label || 'Home',
        isDefault: !!body.isDefault,
        fullName: fullName.trim(),
        mobile: mobile.trim(),
        email: body.email || '',
        houseFlatNo: houseFlatNo.trim(),
        street: street.trim(),
        area: area.trim(),
        landmark: body.landmark || '',
        city: city.trim(),
        district: body.district || city.trim(),
        state: state.trim(),
        pincode: pincode.trim(),
        lat: body.lat || null,
        lng: body.lng || null
      });

      console.log('🍃 [MongoDB Address Engine] Saved address:', created.label, created.pincode);
      return NextResponse.json({ success: true, address: created.toObject() });
    }

    return NextResponse.json({ success: true, address: { id: addressId, ...body } });
  } catch (e) {
    console.error('POST /api/addresses Error:', e);
    return NextResponse.json({ success: false, error: 'Failed to save address' }, { status: 500 });
  }
}

// DELETE /api/addresses - Delete address by ID
export async function DELETE(req) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ success: false, error: 'Address ID required' }, { status: 400 });
    }

    await dbConnect();

    if (isDbConnected()) {
      await Address.deleteOne({ id: String(id).trim() });
    }

    return NextResponse.json({ success: true, message: 'Address deleted' });
  } catch (e) {
    return NextResponse.json({ success: false, error: 'Failed to delete address' }, { status: 500 });
  }
}
