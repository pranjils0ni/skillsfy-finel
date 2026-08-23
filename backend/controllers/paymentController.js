/**
 * RAZORPAY PAYMENT GATEWAY CONTROLLER
 * Skillsfy Institute of Technology
 * 
 * Standard Web Checkout Integration:
 * 1. Create Razorpay Order (POST /api/create-order)
 * 2. Verify Payment Signature (POST /api/verify-payment)
 */

const Razorpay = require('razorpay');
const crypto = require('crypto');
const Enrollment = require('../models/Enrollment');
const Course = require('../models/Course');
const { supabaseAdmin, supabase } = require('../database/supabase');

// Initialize Razorpay SDK instance
function getRazorpayInstance() {
  const key_id = process.env.RAZORPAY_KEY_ID;
  const key_secret = process.env.RAZORPAY_KEY_SECRET;

  if (!key_id || !key_secret) {
    throw new Error('Razorpay credentials (RAZORPAY_KEY_ID / RAZORPAY_KEY_SECRET) not configured in environment.');
  }

  return new Razorpay({
    key_id: key_id,
    key_secret: key_secret
  });
}

/**
 * STEP 1: CREATE ORDER
 * Endpoint: POST /api/create-order or POST /api/payment/create-order
 * Request Body: { amount (in paise), currency, receipt, notes, course_id, name, email, phone }
 * Response: { success: true, order_id, amount, currency, key_id }
 */
async function createOrder(req, res) {
  try {
    const key_id = process.env.RAZORPAY_KEY_ID;
    const key_secret = process.env.RAZORPAY_KEY_SECRET;

    if (!key_id || !key_secret) {
      return res.status(401).json({
        success: false,
        message: 'Razorpay API credentials not configured on the server.'
      });
    }

    let { amount, currency = 'INR', receipt, notes = {}, course_id, course_title, name, email, phone } = req.body;

    // Amount validation in Paise (minimum 100 paise = ₹1.00)
    let amountInPaise;
    if (amount === undefined || amount === null || amount === '') {
      amountInPaise = 299900; // Default ₹2,999 in paise
    } else {
      amountInPaise = parseInt(amount, 10);
      if (isNaN(amountInPaise) || amountInPaise < 100) {
        return res.status(400).json({
          success: false,
          message: 'Invalid amount: Minimum transaction amount is 100 paise (₹1.00).'
        });
      }
    }

    const orderReceipt = receipt || `rcpt_${Date.now()}_${Math.floor(Math.random() * 1000)}`;

    const orderOptions = {
      amount: amountInPaise,
      currency: currency.toUpperCase(),
      receipt: orderReceipt,
      notes: {
        course_id: course_id || 'standard-course',
        course_title: course_title || 'Skillsfy Standard Course',
        student_name: name || '',
        student_email: email || '',
        student_phone: phone || '',
        institute: 'Skillsfy Institute of Technology',
        ...notes
      }
    };

    const razorpay = getRazorpayInstance();
    const order = await razorpay.orders.create(orderOptions);

    if (!order || !order.id) {
      return res.status(500).json({
        success: false,
        message: 'Failed to create order with Razorpay gateway.'
      });
    }

    return res.status(200).json({
      success: true,
      order_id: order.id,
      id: order.id,
      amount: order.amount,
      currency: order.currency,
      key_id: key_id,
      receipt: order.receipt
    });

  } catch (error) {
    console.error('Razorpay Create Order Error:', error);
    
    // Check if error is authentication related
    if (error.statusCode === 401 || error.error?.code === 'BAD_REQUEST_ERROR') {
      return res.status(error.statusCode || 401).json({
        success: false,
        message: error.error?.description || 'Razorpay Authentication / Bad Request Error',
        error: error.message
      });
    }

    return res.status(500).json({
      success: false,
      message: error.description || error.message || 'Internal error creating Razorpay order.',
      error: error.message
    });
  }
}

/**
 * STEP 3: VERIFY PAYMENT SIGNATURE
 * Endpoint: POST /api/verify-payment or POST /api/payment/verify
 * Algorithm: HMAC-SHA256(order_id + "|" + payment_id, KEY_SECRET)
 * Compare generated signature with razorpay_signature
 * Return success only if signatures match
 */
async function verifyPayment(req, res) {
  try {
    const key_secret = process.env.RAZORPAY_KEY_SECRET;

    if (!key_secret) {
      return res.status(500).json({
        success: false,
        message: 'Razorpay Secret Key not configured on the server.'
      });
    }

    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      course_id,
      course_title,
      name,
      email,
      phone,
      amount
    } = req.body;

    // Validate presence of required fields
    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      return res.status(400).json({
        success: false,
        message: 'Missing required payment verification fields: razorpay_order_id, razorpay_payment_id, and razorpay_signature are required.'
      });
    }

    // Construct verification payload
    const body = `${razorpay_order_id}|${razorpay_payment_id}`;

    // Generate expected HMAC-SHA256 signature
    const expectedSignature = crypto
      .createHmac('sha256', key_secret)
      .update(body.toString())
      .digest('hex');

    // Constant-time comparison to prevent timing attacks
    let isAuthentic = false;
    try {
      const expectedBuffer = Buffer.from(expectedSignature, 'utf8');
      const receivedBuffer = Buffer.from(razorpay_signature, 'utf8');

      if (expectedBuffer.length === receivedBuffer.length) {
        isAuthentic = crypto.timingSafeEqual(expectedBuffer, receivedBuffer);
      }
    } catch (cmpErr) {
      isAuthentic = false;
    }

    // If signature mismatch: return 400, do NOT mark as paid
    if (!isAuthentic) {
      console.warn(`❌ Invalid Razorpay Signature for Order: ${razorpay_order_id}, Payment: ${razorpay_payment_id}`);
      return res.status(400).json({
        success: false,
        message: 'Payment verification failed: Invalid signature. Transaction could not be verified.'
      });
    }

    console.log(`✅ Razorpay Payment Verified: Order=${razorpay_order_id}, Payment=${razorpay_payment_id}`);

    // Record enrollment in Database / Supabase if available
    try {
      const dbClient = supabaseAdmin || supabase;
      if (dbClient && (email || phone)) {
        await dbClient.from('enrollments').insert([{
          student_name: name || 'Student',
          student_phone: phone || '',
          course_title: course_title || 'Skillsfy Standard Course',
          payment_gateway: 'Razorpay',
          payment_id: razorpay_payment_id,
          amount_paid_inr: amount ? (amount > 1000 ? amount : amount) : 2999,
          status: 'active'
        }]);

        // Also update enquiries CRM
        await dbClient.from('enquiries').insert([{
          name: name || 'Student',
          phone: phone || '',
          email: email || '',
          course_interested: course_title || 'Skillsfy Standard Course',
          status: 'Payment Verified',
          notes: `Razorpay Payment ID: ${razorpay_payment_id} | Order: ${razorpay_order_id}`
        }]);
      }
    } catch (dbErr) {
      console.warn('Database logging note:', dbErr.message);
    }

    // Return Success
    return res.status(200).json({
      success: true,
      message: 'Payment verified successfully. Welcome to Skillsfy Institute of Technology!',
      payment_id: razorpay_payment_id,
      order_id: razorpay_order_id,
      enrollment: {
        payment_id: razorpay_payment_id,
        order_id: razorpay_order_id,
        course_id: course_id || 'standard-course',
        course_title: course_title || 'Skillsfy Standard Course',
        status: 'paid'
      }
    });

  } catch (error) {
    console.error('Razorpay Verify Payment Error:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error during payment verification.',
      error: error.message
    });
  }
}

/**
 * Public Key ID retrieval for frontend initialization
 * Endpoint: GET /api/payment/key
 */
function getPublicKey(req, res) {
  const key_id = process.env.RAZORPAY_KEY_ID;
  if (!key_id) {
    return res.status(500).json({ success: false, message: 'Razorpay Key ID not configured.' });
  }
  return res.status(200).json({ success: true, key_id });
}

module.exports = {
  createOrder,
  verifyPayment,
  getPublicKey
};
