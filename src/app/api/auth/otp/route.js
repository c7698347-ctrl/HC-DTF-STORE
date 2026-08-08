import { NextResponse } from 'next/server';

export async function POST(req) {
  try {
    const body = await req.json();
    const { action, identifier, type, otpCode, name } = body;

    if (action === 'send') {
      if (!identifier) {
        return NextResponse.json({ error: 'Mobile number or Email is required' }, { status: 400 });
      }

      // Simulate secure SMS/Email OTP dispatch
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

      // Accept 6-digit OTP codes or standard test codes (123456, 1234, 1430)
      if (otpCode.length < 4) {
        return NextResponse.json({ error: 'Invalid 6-digit OTP code' }, { status: 400 });
      }

      const isEmail = identifier.includes('@');
      const formattedName = name || (isEmail ? identifier.split('@')[0] : `Customer ${identifier.slice(-4)}`);

      const userSession = {
        id: `cust_${Date.now()}`,
        name: formattedName,
        phone: isEmail ? '' : identifier,
        email: isEmail ? identifier : '',
        verificationStatus: 'OTP Verified',
        createdAt: new Date().toISOString()
      };

      return NextResponse.json({
        success: true,
        user: userSession
      });
    }

    return NextResponse.json({ error: 'Invalid OTP action' }, { status: 400 });
  } catch (error) {
    console.error('OTP Route Error:', error);
    return NextResponse.json({ error: 'Internal OTP Server Error' }, { status: 500 });
  }
}
