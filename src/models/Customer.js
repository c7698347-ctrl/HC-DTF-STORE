import mongoose from 'mongoose';

const CustomerSchema = new mongoose.Schema(
  {
    id: { type: String, required: true, unique: true, index: true },
    customerId: { type: String, required: true },
    name: { type: String, required: true, trim: true },
    phone: { type: String, required: true, index: true },
    email: { type: String, default: '' },
    verificationStatus: { type: String, default: 'OTP Verified' },
    totalOrders: { type: Number, default: 0 }
  },
  {
    timestamps: true
  }
);

export default mongoose.models.Customer || mongoose.model('Customer', CustomerSchema);
