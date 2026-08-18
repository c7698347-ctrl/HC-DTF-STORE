import mongoose from 'mongoose';

const PaymentSchema = new mongoose.Schema(
  {
    paymentId: { type: String, required: true, unique: true, index: true },
    razorpayOrderId: { type: String, required: true },
    razorpayPaymentId: { type: String, required: true },
    razorpaySignature: { type: String, required: true },
    amount: { type: Number, required: true },
    currency: { type: String, default: 'INR' },
    status: { type: String, required: true, default: 'PAID' }, // 'PAID', 'FAILED'
    customerPhone: { type: String, default: '' },
    customerEmail: { type: String, default: '' }
  },
  {
    timestamps: true
  }
);

export default mongoose.models.Payment || mongoose.model('Payment', PaymentSchema);
