/**
 * VERCEL SERVERLESS FUNCTION: /api/webhook
 * Razorpay Webhook Event Handler (Idempotent)
 * Handles payment.captured, order.paid, payment.failed
 */
const crypto = require('crypto');

module.exports = async (req, res) => {
  // CORS Headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, X-Razorpay-Signature');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, message: 'Method Not Allowed' });
  }

  try {
    const webhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET || process.env.RAZORPAY_KEY_SECRET || 'xaYKE0Snqn5BvGosqx21AJgK';
    const razorpaySignature = req.headers['x-razorpay-signature'];

    // Verify webhook signature if provided
    if (razorpaySignature && req.body) {
      const rawBody = typeof req.body === 'string' ? req.body : JSON.stringify(req.body);
      const expectedSignature = crypto
        .createHmac('sha256', webhookSecret)
        .update(rawBody)
        .digest('hex');

      if (expectedSignature !== razorpaySignature) {
        console.warn('⚠️ Razorpay Webhook Signature Mismatch');
        return res.status(400).json({ success: false, message: 'Invalid webhook signature' });
      }
    }

    const event = typeof req.body === 'string' ? JSON.parse(req.body) : req.body;
    const eventType = event.event;
    const payload = event.payload?.payment?.entity || event.payload?.order?.entity;

    if (!payload) {
      return res.status(200).json({ success: true, message: 'Ignored empty payload' });
    }

    const paymentId = payload.id;
    const orderId = payload.order_id;
    const amountInr = payload.amount ? Math.round(payload.amount / 100) : 149;
    const email = payload.email || payload.notes?.student_email || '';
    const phone = payload.contact || payload.notes?.student_phone || '';
    const ticketNo = payload.notes?.ticket_no;
    const isWorkshop = (payload.notes?.type === 'workshop' || payload.notes?.course_id === 'workshop-30-aug' || !!ticketNo);

    console.log(`📥 Razorpay Webhook Event: ${eventType} for ${paymentId || orderId}`);

    const SUPABASE_URL = process.env.SUPABASE_URL || 'https://iqssjqfyfdmujlmlbjhl.supabase.co';
    const SUPABASE_KEY = process.env.SUPABASE_ANON_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imlxc3NqcWZ5ZmRtdWpsbWxiamhsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODcxMzY3NzIsImV4cCI6MjEwMjcxMjc3Mn0.o7gGbhiuRkLxxJCRJNM1RzBrIVHnOTxuzX0-EOQVyyU';

    if (eventType === 'payment.captured' || eventType === 'order.paid') {
      // 1. Idempotently update workshop registration
      if (isWorkshop) {
        let updateQuery = '';
        if (orderId) updateQuery = `razorpay_order_id=eq.${orderId}`;
        else if (ticketNo) updateQuery = `ticket_no=eq.${ticketNo}`;
        else if (email) updateQuery = `email=eq.${encodeURIComponent(email)}`;

        if (updateQuery) {
          try {
            await fetch(`${SUPABASE_URL}/rest/v1/workshop_registrations?${updateQuery}`, {
              method: 'PATCH',
              headers: {
                'apikey': SUPABASE_KEY,
                'Authorization': `Bearer ${SUPABASE_KEY}`,
                'Content-Type': 'application/json',
                'Prefer': 'return=representation'
              },
              body: JSON.stringify({
                payment_status: 'paid',
                status: 'Payment Verified',
                razorpay_payment_id: paymentId,
                amount_paid: amountInr,
                paid_at: new Date().toISOString()
              })
            });
          } catch (e) {
            console.warn('Webhook Supabase workshop update note:', e.message);
          }
        }
      }

      // 2. Log in payments table idempotently
      try {
        await fetch(`${SUPABASE_URL}/rest/v1/payments`, {
          method: 'POST',
          headers: {
            'apikey': SUPABASE_KEY,
            'Authorization': `Bearer ${SUPABASE_KEY}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            order_id: orderId || null,
            payment_id: paymentId,
            amount: amountInr,
            currency: 'INR',
            status: 'SUCCESS',
            payer_email: email,
            payer_phone: phone,
            metadata: {
              source: 'razorpay_webhook',
              event: eventType,
              ticket_no: ticketNo,
              notes: payload.notes
            }
          })
        });
      } catch (e) {}
    } else if (eventType === 'payment.failed') {
      if (isWorkshop && (orderId || ticketNo || email)) {
        let updateQuery = orderId ? `razorpay_order_id=eq.${orderId}` : (ticketNo ? `ticket_no=eq.${ticketNo}` : `email=eq.${encodeURIComponent(email)}`);
        try {
          await fetch(`${SUPABASE_URL}/rest/v1/workshop_registrations?${updateQuery}`, {
            method: 'PATCH',
            headers: {
              'apikey': SUPABASE_KEY,
              'Authorization': `Bearer ${SUPABASE_KEY}`,
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({
              payment_status: 'payment_failed',
              status: 'Payment Failed'
            })
          });
        } catch (e) {}
      }
    }

    return res.status(200).json({ success: true, message: 'Webhook processed successfully' });

  } catch (err) {
    console.error('Webhook error:', err);
    return res.status(500).json({ success: false, message: err.message });
  }
};
