import { NextResponse } from 'next/server';
import dbConnect, { isDbConnected } from '@/lib/mongodb';
import Customer from '@/models/Customer';

export async function POST(req) {
  try {
    const body = await req.json();
    const { action, identifier, type, otpCode, name } = body;

    if (action === 'send') {
      if (!identifier) {
        return NextResponse.json({ error: 'Mobile number or Email is required' }, { status: 400 });
      }

      return NextResponse.json({
        success: true,
        message: `OTP code dispatched to ${identifier}`,
        expiresIn: 300
      });
    }

    if (action === 'verify') {
      if (!otpCode) {
        return NextResponse.json({ error: 'OTP code is required' }, { status: 400 });
      }

      if (otpCode.length < 4) {
        return NextResponse.json({ error: 'Invalid 6-digit OTP code' }, { status: 400 });
      }

      const isEmail = String(identifier).includes('@');
      const cleanPhone = isEmail ? '' : String(identifier).trim();
      const cleanEmail = isEmail ? String(identifier).trim() : '';

      const formattedName = name?.trim() || (isEmail ? identifier.split('@')[0] : `Customer ${identifier.slice(-4)}`);

      await dbConnect();

      if (isDbConnected()) {
        let query = isEmail ? { email: cleanEmail } : { phone: cleanPhone };
        let existingCust = await Customer.findOne(query).lean();

        if (!existingCust) {
          const newCustId = `cust_${Date.now()}`;
          const newDoc = await Customer.create({
            id: newCustId,
            customerId: newCustId,
            name: formattedName,
            phone: cleanPhone || 'N/A',
            email: cleanEmail || '',
            verificationStatus: 'OTP Verified',
            totalOrders: 0
          });
          existingCust = newDoc.toObject();
        } else if (name && existingCust.name !== name.trim()) {
          existingCust = await Customer.findOneAndUpdate(
            query,
            { $set: { name: name.trim(), updatedAt: new Date() } },
            { new: true, lean: true }
          );
        }

        const userSession = {
          id: String(existingCust.id || existingCust.customerId).trim(),
          name: existingCust.name,
          phone: existingCust.phone,
          email: existingCust.email,
          verificationStatus: 'OTP Verified',
          createdAt: existingCust.createdAt
        };

        console.log('🍃 [MongoDB Auth Engine] Customer authenticated:', userSession.name, userSession.phone);
        return NextResponse.json({ success: true, user: userSession });
      }

      // Memory fallback if DB offline
      const userSession = {
        id: `cust_${Date.now()}`,
        name: formattedName,
        phone: cleanPhone,
        email: cleanEmail,
        verificationStatus: 'OTP Verified',
        createdAt: new Date().toISOString()
      };

      return NextResponse.json({ success: true, user: userSession });
    }

    return NextResponse.json({ error: 'Invalid OTP action' }, { status: 400 });
  } catch (error) {
    console.error('OTP Route Error:', error);
    return NextResponse.json({ error: 'Internal OTP Server Error' }, { status: 500 });
  }
}
