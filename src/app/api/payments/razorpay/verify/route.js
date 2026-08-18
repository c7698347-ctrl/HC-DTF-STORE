import { NextResponse } from 'next/server';
import crypto from 'crypto';
import dbConnect, { isDbConnected } from '@/lib/mongodb';
import Payment from '@/models/Payment';
import Order from '@/models/Order';

export async function POST(req) {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature, orderId, amount } = await req.json();

    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      return NextResponse.json({ success: false, error: 'Missing required Razorpay verification payload' }, { status: 400 });
    }

    const key_secret = process.env.RAZORPAY_KEY_SECRET;

    if (!key_secret) {
      return NextResponse.json(
        { success: false, error: 'Razorpay secret key not configured in .env.local' },
        { status: 500 }
      );
    }

    // 1. HMAC SHA256 Signature Verification
    const generated_signature = crypto
      .createHmac('sha256', key_secret)
      .update(`${razorpay_order_id}|${razorpay_payment_id}`)
      .digest('hex');

    const isValid = generated_signature === razorpay_signature;

    if (!isValid) {
      console.error('❌ [Razorpay Verification] Invalid HMAC Signature');
      return NextResponse.json({ success: false, error: 'Invalid Razorpay Signature' }, { status: 400 });
    }

    // 2. Canonical Backend MongoDB Payment Persistence & Order Status Update
    await dbConnect();

    if (isDbConnected()) {
      // Create Payment Record in MongoDB
      await Payment.findOneAndUpdate(
        { razorpayPaymentId: razorpay_payment_id },
        {
          $set: {
            paymentId: razorpay_payment_id,
            razorpayOrderId: razorpay_order_id,
            razorpayPaymentId: razorpay_payment_id,
            razorpaySignature: razorpay_signature,
            amount: Number(amount) || 0,
            currency: 'INR',
            status: 'PAID',
            updatedAt: new Date()
          }
        },
        { upsert: true, new: true }
      );

      // Update matching Order document in MongoDB to 'PAID'
      let query = {};
      if (orderId) query = { $or: [{ id: String(orderId).trim() }, { orderId: String(orderId).trim() }] };
      else query = { razorpayOrderId: razorpay_order_id };

      const updatedOrder = await Order.findOneAndUpdate(
        query,
        {
          $set: {
            paymentStatus: 'PAID',
            status: 'Payment Verified',
            razorpayPaymentId: razorpay_payment_id,
            razorpayOrderId: razorpay_order_id,
            updatedAt: new Date()
          }
        },
        { new: true, lean: true }
      );

      console.log('✅ [MongoDB Payment Engine] Verified & Updated Payment to PAID in database:', razorpay_payment_id);

      return NextResponse.json({
        success: true,
        message: 'Razorpay payment verified & persisted successfully',
        razorpay_payment_id,
        razorpay_order_id,
        order: updatedOrder
      });
    }

    return NextResponse.json({
      success: true,
      message: 'Razorpay payment verified successfully',
      razorpay_payment_id,
      razorpay_order_id
    });
  } catch (error) {
    console.error('Razorpay Verification Error:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Payment verification failed' },
      { status: 500 }
    );
  }
}
