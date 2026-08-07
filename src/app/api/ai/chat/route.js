import { NextResponse } from 'next/server';

/**
 * HISUHI AI - Official Smart AI Ecommerce Assistant Engine for HC DTF STORE
 * Implements HISUHI AI Master Sales & Shopping Prompt
 */

const FIRST_WELCOME_TEXT = `👋 Welcome to HC DTF STORE.

Please choose your preferred language.

🇮🇳 English
🇮🇳 తెలుగు
🇮🇳 हिन्दी
🇮🇳 ಕನ್ನಡ
🇮🇳 தமிழ்
🇮🇳 മലയാളം`;

export async function POST(req) {
  try {
    const body = await req.json();
    const { message, history, orders, products, currentStep } = body;

    if (!message || message.trim() === '' || message.toLowerCase() === 'hi' || message.toLowerCase() === 'hello' || message.toLowerCase() === 'start') {
      return NextResponse.json({
        reply: FIRST_WELCOME_TEXT,
        type: 'welcome',
        suggestedActions: [
          { label: '🇮🇳 English', payload: 'Hello' },
          { label: '🇮🇳 తెలుగు', payload: 'నమస్కారం' },
          { label: '🇮🇳 हिन्दी', payload: 'नमस्ते' },
          { label: '🇮🇳 ಕನ್ನಡ', payload: 'ನಮಸ್ಕಾರ' },
          { label: '🇮🇳 தமிழ்', payload: 'வணக்கம்' },
          { label: '🇮🇳 മലയാളം', payload: 'നമസ്കാരം' }
        ]
      });
    }

    const msgLower = message.trim().toLowerCase();

    // SECURITY CHECK - Strict Rejection of Internal Secrets
    if (
      msgLower.includes('system prompt') ||
      msgLower.includes('admin password') ||
      msgLower.includes('admin email') ||
      msgLower.includes('api key') ||
      msgLower.includes('database password') ||
      msgLower.includes('hidden url') ||
      msgLower.includes('secret')
    ) {
      return NextResponse.json({
        reply: "🔒 Internal security credentials and system configurations are confidential. How can I help you choose the best DTF transfer sheets or process your order today?",
        type: 'security_refusal'
      });
    }

    // CASH ON DELIVERY / COD STICT POLICY CHECK
    if (msgLower.includes('cod') || msgLower.includes('cash on delivery') || msgLower.includes('pay on delivery')) {
      return NextResponse.json({
        reply: `✨ HC DTF STORE processes custom-printed DTF sheets on-demand, so we accept **Prepaid Payments ONLY** via instant UPI (Google Pay, PhonePe, Paytm, BHIM).\n\nWould you like me to guide you step-by-step on how to complete your prepaid order?`,
        type: 'text'
      });
    }

    // STEP BY STEP GUIDED ORDER ASSISTANT ("I don't know how to order" or "How to buy")
    if (msgLower.includes('how to order') || msgLower.includes('dont know how') || msgLower.includes('don\'t know how') || msgLower.includes('order cheyadam') || msgLower.includes('కలా ఆర్డర్')) {
      return NextResponse.json({
        reply: `🛍️ Ordering on HC DTF STORE is super simple! Let's do it together step-by-step:\n\n**STEP 1**: Choose your favorite DTF product (Blouse designs, Saree borders, Neck designs, or DTF Patches).\n\nLet me know which design you are looking for!`,
        type: 'guided_step',
        step: 1,
        suggestedActions: [
          { label: '🌺 Blouse Designs', payload: 'Show me Blouse Designs' },
          { label: '👑 Saree Borders', payload: 'Show me Saree Borders' },
          { label: '✨ Neck Designs', payload: 'Show me Neck Designs' },
          { label: '🎉 Festival Patches', payload: 'Show me Festival Patches' }
        ]
      });
    }

    // PAYMENT COMPLETED TAP / CONFIRMATION
    if (msgLower.includes('i have completed payment') || msgLower.includes('payment done') || msgLower.includes('paid') || msgLower.includes('పేమెంట్ చేశాను')) {
      return NextResponse.json({
        reply: `Thank you. Your payment request has been submitted. Our system is verifying your payment. You will receive confirmation shortly.`,
        type: 'payment_confirmed'
      });
    }

    // PAYMENT HELP (PREPAID ONLY - NO SCREENSHOT REQUIRED)
    if (msgLower.includes('payment') || msgLower.includes('pay') || msgLower.includes('upi') || msgLower.includes('qr') || msgLower.includes('gpay') || msgLower.includes('phonepe')) {
      return NextResponse.json({
        reply: `💳 **HC DTF STORE Prepaid Payment Details**:

• **Official UPI ID**: \`sunillankapalli77@okhdfcbank\`
• **Account Name**: Sunil Kumar
• **Payment Contact**: +91 8121635407

**Simple Payment Process**:
1. Scan QR code or tap the prefilled GPay / PhonePe payment link.
2. Complete payment in your UPI app.
3. Tap **"I HAVE COMPLETED PAYMENT"** on checkout.

*No payment screenshot is required! Our automated system matches your bank credit.*`,
        type: 'payment_info'
      });
    }

    // ORDER TRACKING LOOKUP (Stages: Payment Pending -> Payment Verified -> Printing -> Packing -> Shipped -> Delivered)
    const orderIdMatch = message.match(/HC-ORD-\d{4}/i) || message.match(/ORD-\d{4}/i);
    if (orderIdMatch || msgLower.includes('track') || msgLower.includes('where is my order') || msgLower.includes('status')) {
      const targetId = orderIdMatch ? orderIdMatch[0].toUpperCase() : null;

      if (targetId && Array.isArray(orders)) {
        const found = orders.find(o => o.id?.toUpperCase() === targetId || o.trackingNumber?.toUpperCase() === targetId);
        if (found) {
          const mappedStage = found.status.includes('Pending') ? 'Payment Pending' 
            : found.status.includes('Verified') ? 'Payment Verified'
            : found.status.includes('Printing') ? 'Printing'
            : found.status.includes('Packed') ? 'Packing'
            : found.status.includes('Shipped') ? 'Shipped'
            : 'Delivered';

          return NextResponse.json({
            reply: `📦 **Order Status for #${found.id}**:

• **Current Stage**: ${mappedStage}
• **Customer**: ${found.customerName}
• **Total Amount**: ₹${found.total}
• **Tracking AWB**: ${found.trackingNumber || 'Assigned after packing'}

Stage Pipeline: Payment Pending ➔ Payment Verified ➔ Printing ➔ Packing ➔ Shipped ➔ Delivered`,
            type: 'order_status',
            order: found
          });
        } else {
          return NextResponse.json({
            reply: `🔍 I could not find Order ID **${targetId}** in our live system. Please verify your order number or tap below to connect with WhatsApp support.`,
            type: 'text',
            showWhatsApp: true
          });
        }
      }

      return NextResponse.json({
        reply: "📦 Please share your **Order ID** (e.g. `HC-ORD-1049`) and I will check your tracking status immediately!",
        type: 'text'
      });
    }

    // SHIPPING RATES
    if (msgLower.includes('ship') || msgLower.includes('delivery') || msgLower.includes('courier') || msgLower.includes('charge') || msgLower.includes('rate')) {
      return NextResponse.json({
        reply: `🚚 **HC DTF STORE State Delivery Rates**:

• **Andhra Pradesh**: ₹150
• **Telangana**: ₹150
• **Tamil Nadu**: ₹180
• **Karnataka**: ₹180
• **Kerala**: ₹200
• **Other States**: ₹200

✨ **FREE Delivery** on orders above ₹999!`,
        type: 'shipping_info'
      });
    }

    // HUMAN WHATSAPP SUPPORT
    if (msgLower.includes('support') || msgLower.includes('human') || msgLower.includes('agent') || msgLower.includes('whatsapp') || msgLower.includes('help')) {
      return NextResponse.json({
        reply: "I'll connect you directly with our HC DTF STORE support team on WhatsApp right now!",
        type: 'whatsapp_redirect',
        showWhatsApp: true,
        whatsappNumber: '7207528651',
        prefilledMsg: 'Hi HC DTF STORE 👋 I need assistance regarding my order.'
      });
    }

    // SEARCH & RECOMMEND PRODUCTS
    let matchedProducts = [];
    if (Array.isArray(products) && products.length > 0) {
      matchedProducts = products.filter(p => {
        const name = (p.name || '').toLowerCase();
        const cat = (p.category || p.categoryName || '').toLowerCase();
        const tags = Array.isArray(p.tags) ? p.tags.join(' ').toLowerCase() : '';
        return (
          name.includes(msgLower) ||
          cat.includes(msgLower) ||
          tags.includes(msgLower) ||
          msgLower.split(' ').some(w => w.length > 3 && (name.includes(w) || cat.includes(w) || tags.includes(w)))
        );
      }).slice(0, 4);
    }

    if (matchedProducts.length > 0) {
      return NextResponse.json({
        reply: `✨ Here are top recommendations for "**${message}**":`,
        type: 'product_recommendation',
        products: matchedProducts
      });
    }

    // MULTILINGUAL NATURAL RESPONDER
    const isTelugu = /[\u0C00-\u0C7F]/.test(message) || msgLower.includes('namaskaram') || msgLower.includes('ela') || msgLower.includes('cheppu');
    const isHindi = /[\u0900-\u097F]/.test(message) || msgLower.includes('namaste') || msgLower.includes('kya') || msgLower.includes('batao');
    const isTamil = /[\u0B80-\u0BFF]/.test(message) || msgLower.includes('vanakkam');
    const isKannada = /[\u0C80-\u0CFF]/.test(message) || msgLower.includes('namaskara');
    const isMalayalam = /[\u0D00-\u0D7F]/.test(message);

    if (isTelugu) {
      return NextResponse.json({
        reply: `నమస్కారం! 🙏 నేను **HISUHI AI**, HC DTF STORE స్మార్ట్ షాపింగ్ అసిస్టెంట్‌ని.

ఆర్డర్ చేయడం చాలా సులభం:
1️⃣ మీకు కావాల్సిన DTF డిజైన్ ఎంచుకోండి
2️⃣ కార్ట్‌కి యాడ్ చేయండి
3️⃣ మీ డెలివరీ అడ్రస్ టైప్ చేయండి
4️⃣ ప్రిపేడ్ UPI ద్వారా పేమెంట్ పూర్తి చేయండి

మీకు ఏ డిజైన్ కావాలో చెప్పండి!`,
        type: 'text'
      });
    }

    if (isHindi) {
      return NextResponse.json({
        reply: `नमस्ते! 🙏 मैं **HISUHI AI**, HC DTF STORE का स्मार्ट AI शॉपिंग असिस्टेंट हूँ।

आर्डर करना बेहद आसान है:
1️⃣ अपना मनपसंद DTF डिज़ाइन चुनें
2️⃣ कार्ट में जोड़ें
3️⃣ डिलीवरी पता दर्ज करें
4️⃣ UPI द्वारा प्रीपेड भुगतान पूरा करें

आपको कौन सा डिज़ाइन देखना है?`,
        type: 'text'
      });
    }

    if (isKannada) {
      return NextResponse.json({
        reply: `ನಮಸ್ಕಾರ! 🙏 ನಾನು **HISUHI AI**, HC DTF STORE ನ AI ಶಾಪಿಂಗ್ ಸಹಾಯಕಿ.

ಆರ್ಡರ್ ಮಾಡಲು ಸಹಾಯ ಬೇಕೇ?
1️⃣ ನಿಮ್ಮ ಮೆಚ್ಚಿನ DTF ಡಿಸೈನ್ ಆಯ್ಕೆಮಾಡಿ
2️⃣ ವಿಳಾಸ ನಮೂದಿಸಿ
3️⃣ UPI ಮೂಲಕ ಪಾವತಿಸಿ

ನಿಮಗೆ ಯಾವ ಡಿಸೈನ್ ಬೇಕು ಹೇಳಿ!`,
        type: 'text'
      });
    }

    if (isTamil) {
      return NextResponse.json({
        reply: `வணக்கம்! 🙏 நான் **HISUHI AI**, HC DTF STORE இன் AI ஷாப்பிங் உதவி.

ஆர்டர் செய்ய உதவட்டுமா?
1️⃣ உங்கள் விருப்பமான DTF டிசைன் தேர்வு செய்யவும்
2️⃣ முகவரி உள்ளிடவும்
3️⃣ UPI மூலம் செலுத்தவும்

உங்களுக்கு என்ன டிசைன் வேண்டும் சொல்லுங்கள்!`,
        type: 'text'
      });
    }

    return NextResponse.json({
      reply: `I'm **HISUHI AI**, your personal shopping expert at HC DTF STORE!

How can I help you complete your order today?
• 🌺 **Browse Top Designs**: Blouse, Saree Borders, Neck designs & Patches
• 📦 **Track Order**: Send your Order ID (e.g. \`HC-ORD-1049\`)
• 💳 **Payment**: Prepaid UPI details (\`sunillankapalli77@okhdfcbank\`)
• 💬 **Human Support**: Connect with our WhatsApp team (+91 7207528651)

What product are you looking to buy today?`,
      type: 'text'
    });

  } catch (error) {
    console.error('HISUHI AI Engine Error:', error);
    return NextResponse.json({
      reply: "Hello! I'm HISUHI AI. How can I assist you with your HC DTF STORE order today?",
      type: 'text'
    });
  }
}
