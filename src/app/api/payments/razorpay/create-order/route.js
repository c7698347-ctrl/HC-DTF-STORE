import { NextResponse } from 'next/server';
import Razorpay from 'razorpay';

export async function POST(req) {
  try {
    const { amount, currency = 'INR', receipt, notes } = await req.json();

    if (!amount || amount <= 0) {
      return NextResponse.json({ error: 'Invalid order amount' }, { status: 400 });
    }

    const key_id = process.env.RAZORPAY_KEY_ID || process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || 'rzp_test_HC_DTF_STORE';
    const key_secret = process.env.RAZORPAY_KEY_SECRET || 'HC_DTF_STORE_SECRET';

    const instance = new Razorpay({
      key_id,
      key_secret
    });

    const options = {
      amount: Math.round(amount * 100), // Amount in paise
      currency,
      receipt: receipt || `rcpt_${Date.now()}`,
      notes: notes || { store: 'HC DTF STORE' }
    };

    const order = await instance.orders.create(options);

    return NextResponse.json({
      success: true,
      id: order.id,
      amount: order.amount,
      currency: order.currency,
      key_id
    });
  } catch (error) {
    console.error('Razorpay Create Order Error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to create Razorpay order' },
      { status: 500 }
    );
  }
}
