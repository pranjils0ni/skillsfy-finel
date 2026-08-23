/**
 * VERCEL SERVERLESS FUNCTION: /api/verify-payment
 */
const crypto = require('crypto');

module.exports = async (req, res) => {
  // CORS Headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, message: 'Method Not Allowed' });
  }

  try {
    const key_secret = process.env.RAZORPAY_KEY_SECRET || 'xaYKE0Snqn5BvGosqx21AJgK';
    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      course_id,
      course_title,
      name,
      email,
      phone,
      city,
      goal,
      ticket_no,
      amount,
      coupon_code,
      type
    } = req.body || {};

    if (!razorpay_payment_id) {
      return res.status(400).json({
        success: false,
        message: 'Missing razorpay_payment_id'
      });
    }

    // If order_id and signature exist, perform HMAC validation
    if (razorpay_order_id && razorpay_signature) {
      const body = `${razorpay_order_id}|${razorpay_payment_id}`;
      const expectedSignature = crypto
        .createHmac('sha256', key_secret)
        .update(body.toString())
        .digest('hex');

      if (expectedSignature !== razorpay_signature) {
        return res.status(400).json({
          success: false,
          message: 'Invalid signature. Payment could not be verified.'
        });
      }
    }

    const isWorkshop = (type === 'workshop' || course_id === 'workshop-30-aug' || !!ticket_no);
    const finalTicket = ticket_no || `SKF-WKSP-${Math.floor(10000 + Math.random() * 90000)}`;
    const finalAmount = amount || (isWorkshop ? 149 : 2999);

    // Update Supabase Database if Supabase URL / Key configured
    const SUPABASE_URL = process.env.SUPABASE_URL || 'https://iqssjqfyfdmujlmlbjhl.supabase.co';
    const SUPABASE_KEY = process.env.SUPABASE_ANON_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imlxc3NqcWZ5ZmRtdWpsbWxiamhsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODcxMzY3NzIsImV4cCI6MjEwMjcxMjc3Mn0.o7gGbhiuRkLxxJCRJNM1RzBrIVHnOTxuzX0-EOQVyyU';

    try {
      if (isWorkshop) {
        // Upsert/Insert into workshop_registrations
        await fetch(`${SUPABASE_URL}/rest/v1/workshop_registrations`, {
          method: 'POST',
          headers: {
            'apikey': SUPABASE_KEY,
            'Authorization': `Bearer ${SUPABASE_KEY}`,
            'Content-Type': 'application/json',
            'Prefer': 'return=representation'
          },
          body: JSON.stringify({
            ticket_no: finalTicket,
            name: name || 'Student',
            phone: phone || '',
            email: email || '',
            city: city || 'India',
            goal: goal || 'AI Web Development',
            workshop_date: '30 August 2026 (Live)',
            status: 'Payment Verified',
            payment_status: 'paid',
            razorpay_payment_id: razorpay_payment_id,
            razorpay_order_id: razorpay_order_id || null,
            amount_paid: finalAmount,
            coupon_code: coupon_code || null,
            utm_source: 'skillsfy.in/lp1'
          })
        });
      }

      // Log in payments table
      await fetch(`${SUPABASE_URL}/rest/v1/payments`, {
        method: 'POST',
        headers: {
          'apikey': SUPABASE_KEY,
          'Authorization': `Bearer ${SUPABASE_KEY}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          order_id: razorpay_order_id || null,
          payment_id: razorpay_payment_id,
          amount: finalAmount,
          currency: 'INR',
          status: 'SUCCESS',
          payer_email: email || '',
          payer_phone: phone || '',
          metadata: {
            type: isWorkshop ? 'workshop' : 'course',
            ticket_no: isWorkshop ? finalTicket : null,
            course_id: course_id || 'workshop-30-aug',
            coupon: coupon_code || null
          }
        })
      });
    } catch (dbErr) {
      console.warn('Supabase verification logging notice:', dbErr.message);
    }

    return res.status(200).json({
      success: true,
      message: 'Payment verified successfully.',
      payment_id: razorpay_payment_id,
      order_id: razorpay_order_id || null,
      ticket_no: finalTicket,
      amount: finalAmount,
      whatsapp_group: 'https://chat.whatsapp.com/B9K976oiCsOKS4Y8ToVfEN'
    });

  } catch (err) {
    console.error('Verify Payment Error:', err);
    return res.status(500).json({
      success: false,
      message: err.message || 'Error verifying payment'
    });
  }
};
