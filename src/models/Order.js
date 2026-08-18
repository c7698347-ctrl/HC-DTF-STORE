import mongoose from 'mongoose';

const OrderItemSchema = new mongoose.Schema(
  {
    productId: { type: String, required: true },
    name: { type: String, required: true },
    image: { type: String, default: '' },
    price: { type: Number, required: true },
    offerPrice: { type: Number, required: true },
    quantity: { type: Number, required: true, default: 1 },
    subtotal: { type: Number, required: true }
  },
  { _id: false }
);

const ShippingAddressSchema = new mongoose.Schema(
  {
    fullName: { type: String, default: '' },
    mobile: { type: String, default: '' },
    email: { type: String, default: '' },
    houseFlatNo: { type: String, required: true },
    street: { type: String, required: true },
    area: { type: String, required: true },
    landmark: { type: String, default: '' },
    city: { type: String, required: true },
    district: { type: String, default: '' },
    state: { type: String, required: true },
    pincode: { type: String, required: true }
  },
  { _id: false }
);

const OrderSchema = new mongoose.Schema(
  {
    id: { type: String, required: true, unique: true, index: true },
    orderId: { type: String, required: true, unique: true, index: true },
    customerId: { type: String, default: '' },
    customerName: { type: String, required: true },
    phone: { type: String, required: true },
    email: { type: String, default: '' },
    shippingAddress: { type: ShippingAddressSchema, required: true },
    items: [OrderItemSchema],
    subtotal: { type: Number, required: true },
    shippingFee: { type: Number, required: true },
    total: { type: Number, required: true },
    paymentMethod: { type: String, default: 'Razorpay Online Checkout' },
    razorpayPaymentId: { type: String, default: '' },
    razorpayOrderId: { type: String, default: '' },
    paymentStatus: { type: String, required: true, default: 'PENDING' }, // 'PENDING', 'PAID', 'FAILED'
    status: { type: String, required: true, default: 'Processing' }, // 'Processing', 'Payment Verified', 'Shipped', 'Delivered'
    trackingNumber: { type: String, default: '' },
    courierPartner: { type: String, default: '' }
  },
  {
    timestamps: true
  }
);

export default mongoose.models.Order || mongoose.model('Order', OrderSchema);
