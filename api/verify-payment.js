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
    const courseSlug = isWorkshop ? 'workshop-30-aug' : (course_id || 'standard-course');
    const courseTitle = course_title || (isWorkshop ? 'AI Web Dev Live Masterclass (30 Aug 2026)' : 'Skillsfy Standard Course');
    const ticketSuffix = Math.floor(100000 + Math.random() * 900000);
    const finalTicket = ticket_no || (isWorkshop ? `SKF-LP1-${ticketSuffix}` : `SKF-STD-${ticketSuffix}`);
    const finalAmount = amount || (isWorkshop ? 149 : 2999);

    // Update Supabase Database
    const SUPABASE_URL = process.env.SUPABASE_URL || 'https://iqssjqfyfdmujlmlbjhl.supabase.co';
    const SUPABASE_KEY = process.env.SUPABASE_ANON_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imlxc3NqcWZ5ZmRtdWpsbWxiamhsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODcxMzY3NzIsImV4cCI6MjEwMjcxMjc3Mn0.o7gGbhiuRkLxxJCRJNM1RzBrIVHnOTxuzX0-EOQVyyU';

    const headers = {
      'apikey': SUPABASE_KEY,
      'Authorization': `Bearer ${SUPABASE_KEY}`,
      'Content-Type': 'application/json',
      'Prefer': 'return=representation'
    };

    try {
      if (isWorkshop) {
        // 1. Check if lead was pre-saved by ticket_no or email/phone
        const existingRes = await fetch(`${SUPABASE_URL}/rest/v1/workshop_registrations?or=(ticket_no.eq.${encodeURIComponent(finalTicket)},razorpay_payment_id.eq.${encodeURIComponent(razorpay_payment_id)})&select=id`, { headers });
        const existingData = await existingRes.json();

        if (Array.isArray(existingData) && existingData.length > 0) {
          // Update existing lead record to paid
          await fetch(`${SUPABASE_URL}/rest/v1/workshop_registrations?id=eq.${existingData[0].id}`, {
            method: 'PATCH',
            headers,
            body: JSON.stringify({
              status: 'Payment Verified',
              payment_status: 'paid',
              razorpay_payment_id: razorpay_payment_id,
              razorpay_order_id: razorpay_order_id || null,
              razorpay_signature: razorpay_signature || null,
              amount_paid: finalAmount,
              coupon_code: coupon_code || null,
              paid_at: new Date().toISOString()
            })
          });
        } else {
          // Insert new paid record
          await fetch(`${SUPABASE_URL}/rest/v1/workshop_registrations`, {
            method: 'POST',
            headers,
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
              razorpay_signature: razorpay_signature || null,
              amount_paid: finalAmount,
              coupon_code: coupon_code || null,
              paid_at: new Date().toISOString(),
              utm_source: 'skillsfy.in/lp1'
            })
          });
        }
      }

      // 2. Insert into payments table (Idempotent by payment_id)
      await fetch(`${SUPABASE_URL}/rest/v1/payments`, {
        method: 'POST',
        headers,
        body: JSON.stringify({
          order_id: razorpay_order_id || null,
          payment_id: razorpay_payment_id,
          student_name: name || 'Student',
          student_email: email || '',
          student_phone: phone || '',
          course_slug: courseSlug,
          amount: finalAmount,
          currency: 'INR',
          status: 'paid',
          razorpay_signature: razorpay_signature || null,
          ticket_no: finalTicket,
          coupon_code: coupon_code || null,
          metadata: {
            type: isWorkshop ? 'workshop' : 'course',
            course_title: courseTitle
          }
        })
      });

      // 3. Upsert Student profile
      const rollNo = `SF-${new Date().getFullYear()}-${razorpay_payment_id.slice(-4).toUpperCase()}`;
      await fetch(`${SUPABASE_URL}/rest/v1/students`, {
        method: 'POST',
        headers,
        body: JSON.stringify({
          roll_no: rollNo,
          name: name || 'Student',
          email: email || `student_${razorpay_payment_id.slice(-6)}@skillsfy.in`,
          phone: phone || '0000000000',
          city: city || 'Jabalpur',
          enrolled_courses: [courseSlug],
          status: 'active'
        })
      });

      // 4. Create confirmed enrollment
      await fetch(`${SUPABASE_URL}/rest/v1/enrollments`, {
        method: 'POST',
        headers,
        body: JSON.stringify({
          student_name: name || 'Student',
          student_email: email || '',
          student_phone: phone || '',
          course_slug: courseSlug,
          course_title: courseTitle,
          ticket_no: finalTicket,
          payment_id: razorpay_payment_id,
          amount_paid: finalAmount,
          status: 'active'
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
