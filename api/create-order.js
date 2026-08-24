/**
 * VERCEL SERVERLESS FUNCTION: /api/create-order
 */
const Razorpay = require('razorpay');

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
    const key_id = process.env.RAZORPAY_KEY_ID || 'rzp_test_TT66f0GZnK72DV';
    const key_secret = process.env.RAZORPAY_KEY_SECRET || 'xaYKE0Snqn5BvGosqx21AJgK';

    const razorpay = new Razorpay({
      key_id: key_id,
      key_secret: key_secret
    });

    let { amount, currency = 'INR', receipt, notes = {}, course_id, course_title, name, email, phone, type, ticket_no, city, goal, coupon_code } = req.body || {};

    const SUPABASE_URL = process.env.SUPABASE_URL || 'https://iqssjqfyfdmujlmlbjhl.supabase.co';
    const SUPABASE_KEY = process.env.SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imlxc3NqcWZ5ZmRtdWpsbWxiamhsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODcxMzY3NzIsImV4cCI6MjEwMjcxMjc3Mn0.o7gGbhiuRkLxxJCRJNM1RzBrIVHnOTxuzX0-EOQVyyU';
    const courseSlug = (type === 'workshop' || course_id === 'workshop-30-aug') ? 'workshop-30-aug' : (course_id || 'standard-course');

    // 1. Server-side Seat Inventory Check (Overselling Prevention)
    try {
      const headers = { 'apikey': SUPABASE_KEY, 'Authorization': `Bearer ${SUPABASE_KEY}` };
      let totalSeats = courseSlug === 'workshop-30-aug' ? 150 : 50;
      const cRes = await fetch(`${SUPABASE_URL}/rest/v1/courses?slug=eq.${courseSlug}&select=total_seats`, { headers });
      if (cRes.ok) {
        const cData = await cRes.json();
        if (Array.isArray(cData) && cData.length > 0 && cData[0].total_seats) totalSeats = cData[0].total_seats;
      }

      let filledSeats = 0;
      if (courseSlug === 'workshop-30-aug') {
        const rRes = await fetch(`${SUPABASE_URL}/rest/v1/workshop_registrations?payment_status=eq.paid&select=id`, { headers });
        if (rRes.ok) {
          const rData = await rRes.json();
          if (Array.isArray(rData)) filledSeats = rData.length;
        }
      } else {
        const eRes = await fetch(`${SUPABASE_URL}/rest/v1/enrollments?course_slug=eq.${courseSlug}&status=eq.active&select=id`, { headers });
        if (eRes.ok) {
          const eData = await eRes.json();
          if (Array.isArray(eData)) filledSeats = eData.length;
        }
      }

      if (filledSeats >= totalSeats) {
        return res.status(400).json({
          success: false,
          message: 'All seats for this batch are currently sold out.'
        });
      }
    } catch (seatErr) {
      console.warn('Seat verification notice:', seatErr.message);
    }

    let amountInPaise = parseInt(amount, 10);
    if (isNaN(amountInPaise) || amountInPaise < 100) {
      amountInPaise = (type === 'workshop' || course_id === 'workshop-30-aug') ? 14900 : 299900;
    }

    const orderOptions = {
      amount: amountInPaise,
      currency: currency.toUpperCase(),
      receipt: receipt || `rcpt_${type === 'workshop' ? 'wksp_' : ''}${Date.now()}_${Math.floor(Math.random() * 1000)}`,
      notes: {
        type: type || (course_id === 'workshop-30-aug' ? 'workshop' : 'course'),
        course_id: course_id || 'standard-course',
        course_title: course_title || (type === 'workshop' ? 'AI Web Dev Live Masterclass (30 Aug)' : 'Skillsfy Standard Course'),
        student_name: name || '',
        student_email: email || '',
        student_phone: phone || '',
        city: city || '',
        goal: goal || '',
        ticket_no: ticket_no || '',
        coupon_code: coupon_code || '',
        institute: 'Skillsfy Institute of Technology',
        ...notes
      }
    };

    const order = await razorpay.orders.create(orderOptions);

    return res.status(200).json({
      success: true,
      order_id: order.id,
      id: order.id,
      amount: order.amount,
      currency: order.currency,
      key_id: key_id
    });

  } catch (err) {
    console.error('Create Order Error:', err);
    return res.status(500).json({
      success: false,
      message: err.message || 'Error creating Razorpay order',
      error: err.toString()
    });
  }
};
