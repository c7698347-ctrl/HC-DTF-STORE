import { NextResponse } from 'next/server';
import dbConnect, { isDbConnected } from '@/lib/mongodb';
import Order from '@/models/Order';
import Product from '@/models/Product';
import Customer from '@/models/Customer';

// GET /api/orders - Read orders from MongoDB
export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url);
    const customerId = searchParams.get('customerId');
    const phone = searchParams.get('phone');

    await dbConnect();

    if (isDbConnected()) {
      let query = {};
      if (customerId) query.customerId = String(customerId).trim();
      else if (phone) query.phone = String(phone).trim();

      const orders = await Order.find(query).sort({ createdAt: -1 }).lean();
      return NextResponse.json({ success: true, orders }, {
        headers: { 'Cache-Control': 'no-store, max-age=0, must-revalidate' }
      });
    }

    return NextResponse.json({ success: true, orders: [] });
  } catch (e) {
    console.error('GET /api/orders Error:', e);
    return NextResponse.json({ success: false, error: 'Failed to fetch orders' }, { status: 500 });
  }
}

// POST /api/orders - Create Order with Backend Price & Atomic Stock Validation in MongoDB
export async function POST(req) {
  try {
    const body = await req.json();
    const { items, shippingAddress, customerId, customerName, phone, email, shippingFee = 150 } = body;

    if (!items || !Array.isArray(items) || items.length === 0) {
      return NextResponse.json({ success: false, error: 'Order must contain at least one item' }, { status: 400 });
    }

    if (!shippingAddress || !shippingAddress.houseFlatNo || !shippingAddress.state || !shippingAddress.pincode) {
      return NextResponse.json({ success: false, error: 'Complete shipping address is required' }, { status: 400 });
    }

    await dbConnect();

    let verifiedItems = [];
    let calculatedSubtotal = 0;

    if (isDbConnected()) {
      // 1. Backend Price & Stock Validation against MongoDB Single Source of Truth
      for (const cartItem of items) {
        const pId = String(cartItem.id || cartItem.productId).trim();
        const dbProd = await Product.findOne({ id: pId }).lean();

        if (!dbProd || dbProd.status === 'Draft' || dbProd.enabled === false) {
          return NextResponse.json({
            success: false,
            error: `Product "${cartItem.name || pId}" is unavailable or no longer published.`
          }, { status: 400 });
        }

        const requestedQty = Number(cartItem.quantity) || 1;
        if (dbProd.stock < requestedQty) {
          return NextResponse.json({
            success: false,
            error: `Insufficient stock for "${dbProd.name}". Available: ${dbProd.stock}, Requested: ${requestedQty}`
          }, { status: 400 });
        }

        // Canonical Price from DB
        const unitPrice = Number(dbProd.offerPrice ?? dbProd.price ?? 0);
        const itemSubtotal = unitPrice * requestedQty;
        calculatedSubtotal += itemSubtotal;

        verifiedItems.push({
          productId: dbProd.id,
          name: dbProd.name,
          image: dbProd.images?.[0] || '',
          price: dbProd.price,
          offerPrice: unitPrice,
          quantity: requestedQty,
          subtotal: itemSubtotal
        });
      }

      // 2. Calculate Grand Total
      const finalShippingFee = Number(shippingFee) || 0;
      const grandTotal = Number((calculatedSubtotal + finalShippingFee).toFixed(2));

      const orderNumber = `HC-ORD-${Math.floor(100000 + Math.random() * 900000)}`;

      // 3. Atomically Deduct Inventory Stock in MongoDB
      for (const item of verifiedItems) {
        await Product.updateOne(
          { id: item.productId, stock: { $gte: item.quantity } },
          { $inc: { stock: -item.quantity } }
        );
      }

      // 4. Create Order document in MongoDB
      const createdOrder = await Order.create({
        id: orderNumber,
        orderId: orderNumber,
        customerId: customerId ? String(customerId).trim() : '',
        customerName: customerName || shippingAddress.fullName || 'Customer',
        phone: phone || shippingAddress.mobile || '',
        email: email || shippingAddress.email || '',
        shippingAddress: {
          fullName: shippingAddress.fullName || customerName,
          mobile: shippingAddress.mobile || phone,
          email: shippingAddress.email || email,
          houseFlatNo: shippingAddress.houseFlatNo,
          street: shippingAddress.street,
          area: shippingAddress.area,
          landmark: shippingAddress.landmark || '',
          city: shippingAddress.city,
          district: shippingAddress.district || shippingAddress.city,
          state: shippingAddress.state,
          pincode: shippingAddress.pincode
        },
        items: verifiedItems,
        subtotal: calculatedSubtotal,
        shippingFee: finalShippingFee,
        total: grandTotal,
        paymentMethod: body.paymentMethod || 'Razorpay Online Checkout',
        razorpayPaymentId: body.razorpayPaymentId || '',
        razorpayOrderId: body.razorpayOrderId || '',
        paymentStatus: body.paymentStatus || 'PENDING',
        status: body.status || 'Processing'
      });

      // Update customer totalOrders counter
      if (customerId || phone) {
        await Customer.updateOne(
          { $or: [{ id: String(customerId).trim() }, { phone: String(phone).trim() }] },
          { $inc: { totalOrders: 1 } }
        );
      }

      console.log('🍃 [MongoDB Order Engine] Created order:', createdOrder.orderId, 'Total:', grandTotal);
      return NextResponse.json({ success: true, order: createdOrder.toObject() });
    }

    // Memory fallback if DB offline
    const orderNumber = `HC-ORD-${Math.floor(100000 + Math.random() * 900000)}`;
    const fallbackOrder = {
      id: orderNumber,
      orderId: orderNumber,
      customerName: customerName || 'Customer',
      phone: phone || '',
      email: email || '',
      shippingAddress,
      items,
      subtotal: body.subtotal || 0,
      shippingFee,
      total: body.total || 0,
      paymentStatus: 'PENDING',
      status: 'Processing',
      createdAt: new Date().toISOString()
    };
    return NextResponse.json({ success: true, order: fallbackOrder });

  } catch (error) {
    console.error('POST /api/orders Error:', error);
    return NextResponse.json({ success: false, error: 'Failed to create order in database' }, { status: 500 });
  }
}
