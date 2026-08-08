import { NextResponse } from 'next/server';
import crypto from 'crypto';

export async function POST(req) {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = await req.json();

    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      return NextResponse.json({ error: 'Missing required Razorpay verification payload' }, { status: 400 });
    }

    const key_secret = process.env.RAZORPAY_KEY_SECRET;

    if (!key_secret) {
      return NextResponse.json(
        { error: 'Razorpay secret key not configured in .env.local' },
        { status: 500 }
      );
    }

    const generated_signature = crypto
      .createHmac('sha256', key_secret)
      .update(`${razorpay_order_id}|${razorpay_payment_id}`)
      .digest('hex');

    const isValid = generated_signature === razorpay_signature;

    if (!isValid) {
      return NextResponse.json({ success: false, error: 'Invalid Razorpay Signature' }, { status: 400 });
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
      { error: error.message || 'Payment verification failed' },
      { status: 500 }
    );
  }
}
