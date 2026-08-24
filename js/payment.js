/**
 * RAZORPAY STANDARD WEB CHECKOUT CLIENT HELPER (FAIL-SAFE & ROBUST)
 * Skillsfy Institute of Technology
 */

const SkillsfyPayment = {
  // Public Key ID (Test Credentials)
  DEFAULT_KEY_ID: 'rzp_test_TT66f0GZnK72DV',

  /**
   * Load Razorpay Checkout Script Dynamically
   */
  loadScript: function() {
    return new Promise((resolve) => {
      if (window.Razorpay) {
        return resolve(true);
      }
      const existing = document.querySelector('script[src*="checkout.razorpay.com"]');
      if (existing) {
        existing.onload = () => resolve(true);
        setTimeout(() => resolve(!!window.Razorpay), 1500);
        return;
      }
      const script = document.createElement('script');
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      script.async = true;
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.head.appendChild(script);
    });
  },

  /**
   * Initiate Razorpay Standard Checkout
   * @param {Object} params - { amount, course_id, course_title, name, email, phone, onSuccess, onFailure, onDismiss }
   */
  checkout: async function(params = {}) {
    const {
      amount = 2999, // in INR
      course_id = 'standard-course',
      course_title = 'Skillsfy Standard Course: AI + Digital Business Masterclass',
      name = '',
      email = '',
      phone = '',
      onSuccess,
      onFailure,
      onDismiss
    } = params;

    // 1. Ensure Razorpay checkout script is loaded
    const isLoaded = await this.loadScript();
    if (!isLoaded || !window.Razorpay) {
      const errMsg = 'Razorpay Gateway is loading. Please click pay again in a few seconds.';
      if (typeof showToast === 'function') showToast(errMsg, 'warning');
      if (onFailure) onFailure(new Error(errMsg));
      return;
    }

    if (typeof showToast === 'function') {
      showToast('Initiating secure Razorpay checkout...', 'info');
    }

    let orderId = null;
    let keyId = null;
    const amountInPaise = Math.round(amount * 100);

    // 2. Try creating backend order if serverless route is live
    try {
      const orderRes = await fetch('/api/create-order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          amount: amountInPaise,
          currency: 'INR',
          course_id: course_id,
          course_title: course_title,
          name: name,
          email: email,
          phone: phone
        })
      });

      const contentType = orderRes.headers.get('content-type') || '';
      if (orderRes.ok && contentType.includes('application/json')) {
        const orderData = await orderRes.json();
        if (orderData && orderData.order_id) {
          orderId = orderData.order_id;
          if (orderData.key_id) keyId = orderData.key_id;
        }
      }
    } catch (orderErr) {
      console.warn('Backend order generation note:', orderErr);
    }

    if (!keyId) {
      try {
        const keyRes = await fetch('/api/payment/key');
        if (keyRes.ok) {
          const keyData = await keyRes.json();
          keyId = keyData.key_id;
        }
      } catch(e) {}
    }

    if (!keyId) keyId = 'rzp_test_TT66f0GZnK72DV';

    // 3. Configure Standard Checkout Options
    const options = {
      key: keyId,
      amount: amountInPaise,
      currency: 'INR',
      name: 'Skillsfy - Institute of Technology',
      description: course_title || 'Tuition Fee Payment',
      image: 'assets/logo-badge.png',
      order_id: orderId || undefined, // undefined enables standard client-side checkout
      prefill: {
        name: name,
        email: email,
        contact: phone
      },
      notes: {
        course_id: course_id,
        course_title: course_title,
        campus: 'Jabalpur Flagship Center'
      },
      theme: {
        color: '#031636'
      },
      modal: {
        backdropclose: false,
        escape: true,
        handleback: true,
        ondismiss: function() {
          if (typeof showToast === 'function') {
            showToast('Payment checkout cancelled.', 'info');
          }
          if (onDismiss) onDismiss();
        }
      },
      // 4. Handle Payment Success
      handler: async function(response) {
        if (typeof showToast === 'function') {
          showToast('Payment received! Verifying and creating student credentials...', 'info');
        }

        // Background server verify if endpoint exists
        try {
          await fetch('/api/verify-payment', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              razorpay_order_id: response.razorpay_order_id || orderId,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
              course_id: course_id,
              course_title: course_title,
              name: name,
              email: email,
              phone: phone,
              amount: amount
            })
          });
        } catch (e) {
          console.warn('Server verify network log:', e);
        }

        // Direct Supabase record sync
        try {
          if (window.SkillsfyAPI && typeof SkillsfyAPI.saveEnquiry === 'function') {
            await SkillsfyAPI.saveEnquiry({
              name: name || 'Student',
              phone: phone || '',
              email: email || '',
              course_interested: course_title,
              status: 'Payment Successful',
              notes: `Razorpay Payment ID: ${response.razorpay_payment_id}`
            });
          }
        } catch (dbErr) {
          console.warn('Supabase sync note:', dbErr);
        }

        if (typeof showToast === 'function') {
          showToast('Admission Confirmed! Redirecting...', 'success');
        }

        if (onSuccess) {
          onSuccess({ success: true, payment_id: response.razorpay_payment_id }, response);
        } else {
          setTimeout(() => {
            window.location.href = `/enrollment-success?payment_id=${response.razorpay_payment_id}&order_id=${response.razorpay_order_id || ''}&course=${encodeURIComponent(course_id)}`;
          }, 800);
        }
      }
    };

    // 5. Open Modal
    try {
      const rzp = new window.Razorpay(options);

      rzp.on('payment.failed', function(failureResponse) {
        console.error('Razorpay Payment Failed:', failureResponse.error);
        const errDesc = failureResponse.error?.description || failureResponse.error?.reason || 'Transaction could not be processed.';
        if (typeof showToast === 'function') {
          showToast(`Payment Failed: ${errDesc}`, 'error');
        }
        if (onFailure) onFailure(failureResponse.error);
      });

      rzp.open();

    } catch (rzpInitErr) {
      console.error('Razorpay open error:', rzpInitErr);
      if (typeof showToast === 'function') {
        showToast('Could not open Razorpay checkout. Please refresh and try again.', 'error');
      }
      if (onFailure) onFailure(rzpInitErr);
    }
  }
};

// Global assignment
window.SkillsfyPayment = SkillsfyPayment;
