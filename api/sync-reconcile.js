/**
-- VERCEL SERVERLESS FUNCTION: /api/sync-reconcile
-- Reconciles Razorpay live payments directly with Supabase database
-- Single Source of Truth Payment Sync
*/
const Razorpay = require('razorpay');

module.exports = async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') return res.status(200).end();

  try {
    const key_id = process.env.RAZORPAY_KEY_ID || 'rzp_test_TT66f0GZnK72DV';
    const key_secret = process.env.RAZORPAY_KEY_SECRET || 'xaYKE0Snqn5BvGosqx21AJgK';
    const SUPABASE_URL = process.env.SUPABASE_URL || 'https://iqssjqfyfdmujlmlbjhl.supabase.co';
    const SUPABASE_KEY = process.env.SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imlxc3NqcWZ5ZmRtdWpsbWxiamhsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODcxMzY3NzIsImV4cCI6MjEwMjcxMjc3Mn0.o7gGbhiuRkLxxJCRJNM1RzBrIVHnOTxuzX0-EOQVyyU';

    const razorpay = new Razorpay({ key_id, key_secret });

    // 1. Fetch last 50 captured payments from Razorpay
    const rzpPayments = await razorpay.payments.all({ count: 50 });
    const paymentsList = (rzpPayments && rzpPayments.items) ? rzpPayments.items : [];

    const reconciled = [];
    const headers = {
      'apikey': SUPABASE_KEY,
      'Authorization': `Bearer ${SUPABASE_KEY}`,
      'Content-Type': 'application/json',
      'Prefer': 'return=representation'
    };

    for (const p of paymentsList) {
      if (p.status !== 'captured') continue;

      const pAmountINR = Math.round(p.amount / 100);
      const email = p.email || '';
      const phone = (p.contact || '').replace(/[^0-9]/g, '');
      const notes = p.notes || {};
      const name = notes.student_name || notes.name || (email.split('@')[0]) || 'Paid Student';
      const isWorkshop = (notes.type === 'workshop' || notes.course_id === 'workshop-30-aug' || pAmountINR <= 150);
      const courseSlug = isWorkshop ? 'workshop-30-aug' : (notes.course_id || 'standard-course');
      const ticketNo = notes.ticket_no || `SKF-LP1-${p.id.slice(-6).toUpperCase()}`;

      // Check if this payment already exists in Supabase
      const checkRes = await fetch(`${SUPABASE_URL}/rest/v1/payments?payment_id=eq.${p.id}`, { headers });
      const existingPayments = await checkRes.json();

      if (!Array.isArray(existingPayments) || existingPayments.length === 0) {
        // Insert into payments
        await fetch(`${SUPABASE_URL}/rest/v1/payments`, {
          method: 'POST',
          headers,
          body: JSON.stringify({
            payment_id: p.id,
            order_id: p.order_id || null,
            student_name: name,
            student_email: email,
            student_phone: phone,
            course_slug: courseSlug,
            amount: pAmountINR,
            currency: p.currency || 'INR',
            status: 'paid',
            ticket_no: ticketNo,
            coupon_code: notes.coupon_code || null,
            metadata: {
              method: p.method,
              bank: p.bank,
              wallet: p.wallet,
              vpa: p.vpa,
              fee: p.fee,
              tax: p.tax
            }
          })
        });

        // Insert/Upsert into workshop_registrations if workshop
        if (isWorkshop) {
          await fetch(`${SUPABASE_URL}/rest/v1/workshop_registrations`, {
            method: 'POST',
            headers,
            body: JSON.stringify({
              ticket_no: ticketNo,
              name: name,
              phone: phone,
              email: email,
              city: notes.city || 'India',
              goal: notes.goal || 'AI Web Development',
              workshop_date: '30 August 2026 (Live)',
              status: 'Payment Verified',
              payment_status: 'paid',
              razorpay_payment_id: p.id,
              razorpay_order_id: p.order_id || null,
              amount_paid: pAmountINR,
              coupon_code: notes.coupon_code || null,
              paid_at: new Date(p.created_at * 1000).toISOString()
            })
          });
        }

        // Insert/Upsert student record
        const rollNo = `SF-2026-${p.id.slice(-4).toUpperCase()}`;
        await fetch(`${SUPABASE_URL}/rest/v1/students`, {
          method: 'POST',
          headers,
          body: JSON.stringify({
            roll_no: rollNo,
            name: name,
            email: email || `student_${p.id.slice(-6)}@skillsfy.in`,
            phone: phone || '0000000000',
            city: notes.city || 'Jabalpur',
            enrolled_courses: [courseSlug],
            status: 'active'
          })
        });

        // Insert into enrollments
        await fetch(`${SUPABASE_URL}/rest/v1/enrollments`, {
          method: 'POST',
          headers,
          body: JSON.stringify({
            student_name: name,
            student_email: email,
            student_phone: phone,
            course_slug: courseSlug,
            course_title: isWorkshop ? 'AI Web Dev Live Masterclass (30 Aug 2026)' : 'Skillsfy Standard Course',
            ticket_no: ticketNo,
            payment_id: p.id,
            amount_paid: pAmountINR,
            status: 'active'
          })
        });

        reconciled.push({
          payment_id: p.id,
          name,
          email,
          amount: pAmountINR,
          ticket_no: ticketNo
        });
      }
    }

    return res.status(200).json({
      success: true,
      total_rzp_payments: paymentsList.length,
      newly_reconciled_count: reconciled.length,
      reconciled
    });

  } catch (err) {
    console.error('Reconciliation Error:', err);
    return res.status(500).json({
      success: false,
      message: err.message || 'Error reconciling Razorpay payments',
      error: err.toString()
    });
  }
};
