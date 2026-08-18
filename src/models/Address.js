import mongoose from 'mongoose';

const AddressSchema = new mongoose.Schema(
  {
    id: { type: String, required: true, unique: true, index: true },
    customerId: { type: String, required: true, index: true },
    label: { type: String, default: 'Home' },
    isDefault: { type: Boolean, default: false },
    fullName: { type: String, required: true },
    mobile: { type: String, required: true },
    email: { type: String, default: '' },
    houseFlatNo: { type: String, required: true },
    street: { type: String, required: true },
    area: { type: String, required: true },
    landmark: { type: String, default: '' },
    city: { type: String, required: true },
    district: { type: String, default: '' },
    state: { type: String, required: true },
    pincode: { type: String, required: true },
    lat: { type: Number, default: null },
    lng: { type: Number, default: null }
  },
  {
    timestamps: true
  }
);

export default mongoose.models.Address || mongoose.model('Address', AddressSchema);
