import { NextResponse } from 'next/server';
import dbConnect, { isDbConnected } from '@/lib/mongodb';
import Order from '@/models/Order';

// GET /api/orders/[id] - Fetch single order by orderId
export async function GET(req, { params }) {
  try {
    const targetId = String(params?.id || '').trim();
    await dbConnect();

    if (isDbConnected()) {
      const order = await Order.findOne({
        $or: [{ id: targetId }, { orderId: targetId }]
      }).lean();

      if (order) {
        return NextResponse.json({ success: true, order });
      }
    }

    return NextResponse.json({ success: false, error: 'Order not found' }, { status: 404 });
  } catch (e) {
    return NextResponse.json({ success: false, error: 'Failed to fetch order' }, { status: 500 });
  }
}

// PATCH /api/orders/[id] - Update order status & tracking info
export async function PATCH(req, { params }) {
  try {
    const targetId = String(params?.id || '').trim();
    const body = await req.json();
    const { status, trackingNumber, courierPartner, paymentStatus } = body;

    await dbConnect();

    if (isDbConnected()) {
      let updateFields = { updatedAt: new Date() };
      if (status) updateFields.status = status;
      if (paymentStatus) updateFields.paymentStatus = paymentStatus;
      if (trackingNumber !== undefined) updateFields.trackingNumber = trackingNumber;
      if (courierPartner !== undefined) updateFields.courierPartner = courierPartner;

      const updated = await Order.findOneAndUpdate(
        { $or: [{ id: targetId }, { orderId: targetId }] },
        { $set: updateFields },
        { new: true, lean: true }
      );

      console.log('🍃 [MongoDB Order Engine] Updated order status:', targetId, status);
      return NextResponse.json({ success: true, order: updated });
    }

    return NextResponse.json({ success: true, message: 'Updated' });
  } catch (e) {
    return NextResponse.json({ success: false, error: 'Failed to update order' }, { status: 500 });
  }
}
