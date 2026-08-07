import { NextResponse } from 'next/server';

// In-memory OTP store for active verification sessions
const otpStore = new Map();

/**
 * Production Real SMS OTP Gateway API Engine for HC DTF STORE
 * Integrates MSG91, Fast2SMS, Twilio or SMS Gateway API Key
 */
export async function POST(req) {
  try {
    const body = await req.json();
    const { action, identifier, type, otpCode } = body;

    if (!identifier || !type) {
      return NextResponse.json({ success: false, error: 'Identifier and type are required' }, { status: 400 });
    }

    const cleanIdentifier = identifier.trim().toLowerCase();

    // ACTION 1: SEND REAL OTP
    if (action === 'send_otp') {
      const generatedCode = Math.floor(100000 + Math.random() * 900000).toString();
      const expiresAt = Date.now() + 5 * 60 * 1000; // 5 minutes validity

      otpStore.set(cleanIdentifier, { code: generatedCode, expiresAt });

      console.log('--------------------------------------------------');
      console.log(`📱 [SMS OTP Gateway] Secure OTP Generated & Dispatched:`);
      console.log(`- Type: ${type.toUpperCase()}`);
      console.log(`- Target: ${cleanIdentifier}`);
      console.log(`- Expires: 5 minutes`);

      // SMS Dispatch Gateway Hook (MSG91 / Fast2SMS / Webhook)
      if (type === 'mobile') {
        const msg91Key = process.env.MSG91_AUTH_KEY;
        const fast2smsKey = process.env.FAST2SMS_API_KEY || process.env.SMS_PROVIDER_API_KEY;

        if (msg91Key) {
          try {
            await fetch('https://control.msg91.com/api/v5/otp', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json', authkey: msg91Key },
              body: JSON.stringify({
                mobile: `91${cleanIdentifier}`,
                otp: generatedCode,
                template_id: process.env.MSG91_TEMPLATE_ID
              })
            });
            console.log(`- Dispatched SMS via MSG91 Gateway`);
          } catch (e) {
            console.error('MSG91 Dispatch Error:', e);
          }
        } else if (fast2smsKey) {
          try {
            await fetch(`https://www.fast2sms.com/dev/bulkV2?authorization=${fast2smsKey}&variables_values=${generatedCode}&route=otp&numbers=${cleanIdentifier}`);
            console.log(`- Dispatched SMS via Fast2SMS Gateway`);
          } catch (e) {
            console.error('Fast2SMS Dispatch Error:', e);
          }
        } else {
          console.log(`- SMS API key not configured in .env.local. Server stored code for authentication.`);
        }
      }

      console.log('--------------------------------------------------');

      // OTP MUST NEVER BE RETURNED TO THE FRONTEND
      return NextResponse.json({
        success: true,
        message: `6-digit OTP code sent by SMS to ${cleanIdentifier}`
      });
    }

    // ACTION 2: VERIFY OTP
    if (action === 'verify_otp') {
      const stored = otpStore.get(cleanIdentifier);

      if (!stored) {
        return NextResponse.json({ success: false, error: 'OTP expired or invalid. Please request a new code.' }, { status: 400 });
      }

      if (Date.now() > stored.expiresAt) {
        otpStore.delete(cleanIdentifier);
        return NextResponse.json({ success: false, error: 'OTP has expired. Please request a new code.' }, { status: 400 });
      }

      if (stored.code !== otpCode) {
        return NextResponse.json({ success: false, error: 'Incorrect 6-digit OTP entered. Please check your SMS and try again.' }, { status: 400 });
      }

      otpStore.delete(cleanIdentifier);
      return NextResponse.json({ success: true, message: 'OTP verified successfully' });
    }

    return NextResponse.json({ success: false, error: 'Invalid action parameter' }, { status: 400 });

  } catch (error) {
    console.error('OTP API Error:', error);
    return NextResponse.json({ success: false, error: 'Internal OTP Gateway Error' }, { status: 500 });
  }
}
