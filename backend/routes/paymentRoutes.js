/**
 * RAZORPAY PAYMENT GATEWAY ROUTES
 * Skillsfy Institute of Technology
 */

const express = require('express');
const router = express.Router();
const paymentController = require('../controllers/paymentController');

// 1. Create Razorpay Order: POST /api/create-order or POST /api/payment/create-order
router.post('/create-order', paymentController.createOrder);
router.post('/payment/create-order', paymentController.createOrder);

// 2. Verify Razorpay Signature: POST /api/verify-payment or POST /api/payment/verify
router.post('/verify-payment', paymentController.verifyPayment);
router.post('/payment/verify', paymentController.verifyPayment);

// 3. Get Public Razorpay Key ID: GET /api/payment/key or GET /api/get-key
router.get('/payment/key', paymentController.getPublicKey);
router.get('/get-key', paymentController.getPublicKey);

// 4. Razorpay Webhooks: POST /api/webhook or POST /api/payment/webhook
router.post('/webhook', paymentController.handleWebhook);
router.post('/payment/webhook', paymentController.handleWebhook);

module.exports = router;
