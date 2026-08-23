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
