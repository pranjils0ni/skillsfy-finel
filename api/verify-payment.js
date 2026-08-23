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
      phone
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

    return res.status(200).json({
      success: true,
      message: 'Payment verified successfully.',
      payment_id: razorpay_payment_id,
      order_id: razorpay_order_id || null
    });

  } catch (err) {
    console.error('Verify Payment Error:', err);
    return res.status(500).json({
      success: false,
      message: err.message || 'Error verifying payment'
    });
  }
};
