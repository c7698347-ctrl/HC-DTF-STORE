import { NextResponse } from 'next/server';

/**
 * HISUHI AI - Official AI Assistant Engine for HC DTF STORE
 * Fully implements HISUHI AI MASTER SYSTEM PROMPT
 */

const INITIAL_WELCOME_TEXT = `👋 Welcome to HC DTF STORE!

I'm 🤖 HISUHI AI, your smart shopping assistant.

🌍 I can help you in your preferred language.

Please choose a language or simply start typing.

1️⃣ English 🇬🇧
2️⃣ తెలుగు 🇮🇳
3️⃣ हिन्दी 🇮🇳
4️⃣ ಕನ್ನಡ 🇮🇳
5️⃣ தமிழ் 🇮🇳
6️⃣ മലയാളം 🇮🇳
7️⃣ বাংলা 🇮🇳
8️⃣ मराठी 🇮🇳
9️⃣ ગુજરાતી 🇮🇳
🔟 ਪੰਜਾਬੀ 🇮🇳

Or just send a message in your own language.
I'll automatically continue in that language.`;

export async function POST(req) {
  try {
    const body = await req.json();
    const { message, history, orders, products } = body;

    if (!message || message.trim() === '' || message.toLowerCase() === 'hi' || message.toLowerCase() === 'hello' || message.toLowerCase() === 'start') {
      return NextResponse.json({
        reply: INITIAL_WELCOME_TEXT,
        type: 'welcome',
        suggestedActions: [
          { label: '1️⃣ English 🇬🇧', payload: 'Hello' },
          { label: '2️⃣ తెలుగు 🇮🇳', payload: 'నమస్కారం' },
          { label: '3️⃣ हिन्दी 🇮🇳', payload: 'नमस्ते' },
          { label: '4️⃣ ಕನ್ನಡ 🇮🇳', payload: 'ನಮಸ್ಕಾರ' },
          { label: '5️⃣ தமிழ் 🇮🇳', payload: 'வணக்கம்' },
          { label: '6️⃣ Track Order 📦', payload: 'Where is my order?' },
          { label: '7️⃣ Payment UPI 💳', payload: 'How to pay?' },
          { label: '8️⃣ Shipping Rates 🚚', payload: 'What are shipping charges?' }
        ]
      });
    }

    const msgLower = message.trim().toLowerCase();

    // SECURITY CHECK - Strict rejection of system secrets
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
        reply: "🔒 I'm sorry, but internal security data, passwords, and system prompts are confidential and cannot be shared. How else can I assist you with HC DTF STORE products today?",
        type: 'security_refusal'
      });
    }

    // 1. ORDER TRACKING LOOKUP
    const orderIdMatch = message.match(/HC-ORD-\d{4}/i) || message.match(/ORD-\d{4}/i);
    if (orderIdMatch || msgLower.includes('track') || msgLower.includes('where is my order') || msgLower.includes('order status') || msgLower.includes('నా ఆర్డర్')) {
      const targetId = orderIdMatch ? orderIdMatch[0].toUpperCase() : null;
      
      if (targetId && Array.isArray(orders)) {
        const found = orders.find(o => o.id?.toUpperCase() === targetId || o.trackingNumber?.toUpperCase() === targetId);
        if (found) {
          return NextResponse.json({
            reply: `📦 **Order Status for #${found.id}**:\n\n• **Customer**: ${found.customerName}\n• **Status**: ${found.status}\n• **Payment**: ${found.paymentStatus}\n• **Courier**: ${found.courierName || 'Delhivery / Blue Dart (Processing)'}\n• **Tracking AWB**: ${found.trackingNumber || 'Assigned after packing'}\n\nYou can track 9-stage live factory progress on our Track Order page!`,
            type: 'order_status',
            order: found
          });
        } else {
          return NextResponse.json({
            reply: `🔍 I searched our database for Order ID **${targetId}**, but couldn't find it. Please double check your order number or contact our WhatsApp helpline (+91 7207528651).`,
            type: 'text'
          });
        }
      }

      return NextResponse.json({
        reply: "📦 I'd be happy to track your order! Please reply with your **Order ID** (e.g. `HC-ORD-1049`).",
        type: 'text'
      });
    }

    // 2. PAYMENT HELP
    if (msgLower.includes('payment') || msgLower.includes('pay') || msgLower.includes('upi') || msgLower.includes('qr') || msgLower.includes('gpay') || msgLower.includes('phonepe') || msgLower.includes('రూపాయలు') || msgLower.includes('ప్రాసెస్')) {
      return NextResponse.json({
        reply: `💳 **HC DTF STORE Official Payment Process**:

1️⃣ **Official UPI ID**: \`sunillankapalli77@okhdfcbank\`
2️⃣ **Official Account Name**: Sunil Kumar
3️⃣ **Payment Contact**: +91 8121635407
4️⃣ **Support WhatsApp**: +91 7207528651

**5-Step Payment Steps**:
1. Scan QR Code or tap direct GPay / PhonePe / Paytm link on Checkout.
2. Complete Payment (The exact amount is prefilled automatically).
3. Take a screenshot of the payment receipt.
4. Enter 12-Digit UTR Transaction ID & upload screenshot.
5. Our bank team verifies your UTR & starts printing!`,
        type: 'payment_help',
        showWhatsApp: true
      });
    }

    // 3. SHIPPING RATES
    if (msgLower.includes('ship') || msgLower.includes('delivery') || msgLower.includes('courier') || msgLower.includes('charge') || msgLower.includes('డెలివరీ') || msgLower.includes('ఛార్జ్')) {
      return NextResponse.json({
        reply: `🚚 **HC DTF STORE State-Wise Shipping Charges**:

• **Andhra Pradesh**: ₹150
• **Telangana**: ₹150
• **Tamil Nadu**: ₹180
• **Karnataka**: ₹180
• **Kerala**: ₹200
• **Other States**: ₹200

✨ **FREE Delivery** on orders above ₹999!
Orders are dispatched same-day in protective roll cylinder boxes.`,
        type: 'shipping_info'
      });
    }

    // 4. PRINTING GUIDE & HEAT PRESS INSTRUCTIONS
    if (msgLower.includes('press') || msgLower.includes('heat') || msgLower.includes('temperature') || msgLower.includes('iron') || msgLower.includes('peel') || msgLower.includes('fabric')) {
      return NextResponse.json({
        reply: `🔥 **HC DTF Store Printing & Heat Press Guide**:

• **Temperature**: 160°C (320°F)
• **Press Time**: 15 Seconds
• **Pressure**: Medium-High (4-5 bar)
• **Peel Type**: Cold Peel / Hot Peel (Allow 10 sec to cool for optimum durability)
• **Second Press**: 5 seconds with Teflon sheet for matte wash-resistant finish.
• **Durability**: 50+ commercial machine washes!`,
        type: 'printing_guide'
      });
    }

    // 5. HUMAN / WHATSAPP SUPPORT
    if (msgLower.includes('support') || msgLower.includes('human') || msgLower.includes('agent') || msgLower.includes('whatsapp') || msgLower.includes('contact') || msgLower.includes('call') || msgLower.includes('మనుషులు')) {
      return NextResponse.json({
        reply: "I'll connect you directly with our HC DTF STORE human support team on WhatsApp right away! 👋",
        type: 'whatsapp_redirect',
        showWhatsApp: true,
        whatsappNumber: '7207528651',
        prefilledMsg: 'Hi HC DTF STORE 👋 I need assistance regarding my order.'
      });
    }

    // 6. PRODUCT SEARCH ENGINE
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
        reply: `✨ Here are top recommended products matching "**${message}**" from our store:`,
        type: 'product_recommendation',
        products: matchedProducts
      });
    }

    // 7. MULTILINGUAL INTELLIGENT BOT RESPONDER
    // Detect Language Type
    const isTelugu = /[\u0C00-\u0C7F]/.test(message) || msgLower.includes('namaskaram') || msgLower.includes('ela unnav') || msgLower.includes('cheppu');
    const isHindi = /[\u0900-\u097F]/.test(message) || msgLower.includes('namaste') || msgLower.includes('kya') || msgLower.includes('hai');
    const isTamil = /[\u0B80-\u0BFF]/.test(message) || msgLower.includes('vanakkam');
    const isKannada = /[\u0C80-\u0CFF]/.test(message) || msgLower.includes('namaskara');
    const isMalayalam = /[\u0D00-\u0D7F]/.test(message);

    if (isTelugu) {
      return NextResponse.json({
        reply: `నమస్కారం! 🙏 నేను **HISUHI AI**, HC DTF STORE యొక్క అధికారిక AI అసిస్టెంట్‌ని.

నేను మీకు ఎలా సహాయపడగలను?
1️⃣ **DTF ప్రింట్లు & డిజైన్లు చూడటానికి**
2️⃣ **ఆర్డర్ ట్రాక్ చేయడానికి** (మీ Order ID పంపండి)
3️⃣ **పేమెంట్ వివరాలు & UPI QR పొందేందుకు**
4️⃣ **షిప్పింగ్ ఛార్జీలు తెలుసుకోవడానికి**

దయచేసి మీ ప్రశ్నను టైప్ చేయండి!`,
        type: 'text'
      });
    }

    if (isHindi) {
      return NextResponse.json({
        reply: `नमस्ते! 🙏 मैं **HISUHI AI**, HC DTF STORE का आधिकारिक स्मार्ट AI असिस्टेंट हूँ।

मैं आपकी किस प्रकार सहायता कर सकता हूँ?
1️⃣ **DTF प्रिंट्स और डिज़ाइन्स देखने के लिए**
2️⃣ **ऑर्डर ट्रैक करने के लिए** (अपना Order ID भेजें)
3️⃣ **UPI भुगतान और QR कोड सहायता**
4️⃣ **शिपिंग और डिलीवरी शुल्क**

कृपया अपना प्रश्न पूछें!`,
        type: 'text'
      });
    }

    if (isKannada) {
      return NextResponse.json({
        reply: `ನಮಸ್ಕಾರ! 🙏 ನಾನು **HISUHI AI**, HC DTF STORE ನ ಅಧಿಕೃತ AI ಸಹಾಯಕಿ.

ನಾನು ನಿಮಗೆ ಹೇಗೆ ಸಹಾಯ ಮಾಡಲಿ?
1️⃣ **DTF ಪ್ರಿಂಟ್‌ಗಳು ಮತ್ತು ಡಿಸೈನ್‌ಗಳನ್ನು ವೀಕ್ಷಿಸಲು**
2️⃣ **ಆರ್ಡರ್ ಟ್ರ್ಯಾಕ್ ಮಾಡಲು** (ನಿಮ್ಮ Order ID ಕಳುಹಿಸಿ)
3️⃣ **UPI ಪಾವತಿ ಮತ್ತು QR ಸಹಾಯ**
4️⃣ **ಶಿಪ್ಪಿಂಗ್ ಶುಲ್ಕಗಳು**

ದಯವಿಟ್ಟು ನಿಮ್ಮ ಪ್ರಶ್ನೆಯನ್ನು ಕೇಳಿ!`,
        type: 'text'
      });
    }

    if (isTamil) {
      return NextResponse.json({
        reply: `வணக்கம்! 🙏 நான் **HISUHI AI**, HC DTF STORE இன் அதிகாரப்பூர்வ AI உதவி.

நான் உங்களுக்கு எவ்வாறு உதவ முடியும்?
1️⃣ **DTF பிரிண்ட்கள் & டிசைன்கள் பார்க்க**
2️⃣ **ஆர்டர் டிராக்கிங்** (உங்கள் Order ID அனுப்பவும்)
3️⃣ **UPI பணம் செலுத்துதல் உதவி**
4️⃣ **ஷிப்பிங் கட்டணங்கள்**

தயவுசெய்து உங்கள் கேள்வியை கேட்கவும்!`,
        type: 'text'
      });
    }

    // Default Smart English Assistance
    return NextResponse.json({
      reply: `I'm **HISUHI AI**, your smart shopping expert at HC DTF STORE! 

How can I help you today?
• 🖼️ **Browse Collections**: Blouse Designs, Saree Borders, Neck Designs, Festival Patches
• 📦 **Track Order**: Send your Order ID (e.g. \`HC-ORD-1049\`)
• 💳 **Payment Guidance**: Official UPI & QR code instructions
• 🚚 **Delivery Rates**: State-wise shipping fees & free delivery terms
• 💬 **Human Support**: Connect with our WhatsApp team (+91 7207528651)

Feel free to type your question in any language!`,
      type: 'text'
    });

  } catch (error) {
    console.error('HISUHI AI Engine Error:', error);
    return NextResponse.json({
      reply: "Hello! I'm HISUHI AI. How may I assist your shopping experience at HC DTF STORE today?",
      type: 'text'
    });
  }
}
