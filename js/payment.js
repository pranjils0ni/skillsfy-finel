/**
 * RAZORPAY STANDARD WEB CHECKOUT CLIENT HELPER
 * Skillsfy Institute of Technology
 */

const SkillsfyPayment = {
  // Public Key ID fallback (if server key fetch not available)
  DEFAULT_KEY_ID: 'rzp_test_TT66f0GZnK72DV',

  /**
   * Load Razorpay Checkout Script Dynamically
   */
  loadScript: function() {
    return new Promise((resolve) => {
      if (window.Razorpay) {
        return resolve(true);
      }
      const script = document.createElement('script');
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
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
      const errMsg = 'Failed to load Razorpay Checkout SDK. Please check your internet connection.';
      if (typeof showToast === 'function') showToast(errMsg, 'error');
      if (onFailure) onFailure(new Error(errMsg));
      return;
    }

    if (typeof showToast === 'function') {
      showToast('Creating secure Razorpay order...', 'info');
    }

    try {
      // 2. Call backend to create Razorpay Order (POST /api/create-order)
      const orderAmountPaise = Math.round(amount * 100);
      const res = await fetch('/api/create-order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          amount: orderAmountPaise,
          currency: 'INR',
          course_id: course_id,
          course_title: course_title,
          name: name,
          email: email,
          phone: phone
        })
      });

      const orderData = await res.json();

      if (!res.ok || !orderData.success || !orderData.order_id) {
        throw new Error(orderData.message || 'Unable to generate Razorpay order from server.');
      }

      // 3. Configure Razorpay Standard Checkout Modal Options
      const options = {
        key: orderData.key_id || this.DEFAULT_KEY_ID,
        amount: orderData.amount,
        currency: orderData.currency || 'INR',
        name: 'Skillsfy - Institute of Technology',
        description: course_title,
        image: 'assets/logo-badge.png',
        order_id: orderData.order_id,
        prefill: {
          name: name,
          email: email,
          contact: phone
        },
        notes: {
          course_id: course_id,
          course_title: course_title,
          institute: 'Skillsfy Jabalpur Flagship Campus'
        },
        theme: {
          color: '#031636' // Skillsfy Brand Navy
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
        // 4. Verification Handler on Payment Completion
        handler: async function(response) {
          if (typeof showToast === 'function') {
            showToast('Verifying payment signature with security engine...', 'info');
          }

          try {
            // Send payment details to Backend verification endpoint
            const verifyRes = await fetch('/api/verify-payment', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                razorpay_order_id: response.razorpay_order_id,
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

            const verifyResult = await verifyRes.json();

            if (verifyRes.ok && verifyResult.success) {
              if (typeof showToast === 'function') {
                showToast('Payment verified successfully! Redirecting...', 'success');
              }
              if (onSuccess) {
                onSuccess(verifyResult, response);
              } else {
                setTimeout(() => {
                  window.location.href = `/enrollment-success?payment_id=${response.razorpay_payment_id}&order_id=${response.razorpay_order_id}&course=${course_id}`;
                }, 1000);
              }
            } else {
              const failMsg = verifyResult.message || 'Payment signature verification failed.';
              if (typeof showToast === 'function') {
                showToast(failMsg, 'error');
              }
              if (onFailure) onFailure(new Error(failMsg));
            }

          } catch (verifyErr) {
            console.error('Payment Verification Network Error:', verifyErr);
            const netMsg = 'Network error during payment verification. Please contact support with payment ID: ' + response.razorpay_payment_id;
            if (typeof showToast === 'function') showToast(netMsg, 'error');
            if (onFailure) onFailure(verifyErr);
          }
        }
      };

      // 5. Open Razorpay Standard Checkout Window
      const rzp = new window.Razorpay(options);

      rzp.on('payment.failed', function(failureResponse) {
        console.error('Razorpay Payment Failed:', failureResponse.error);
        const errDesc = failureResponse.error.description || failureResponse.error.reason || 'Transaction could not be processed.';
        if (typeof showToast === 'function') {
          showToast(`Payment Failed: ${errDesc}`, 'error');
        }
        if (onFailure) onFailure(failureResponse.error);
      });

      rzp.open();

    } catch (err) {
      console.error('Checkout Initialization Error:', err);
      if (typeof showToast === 'function') {
        showToast(err.message || 'Payment initiation failed.', 'error');
      }
      if (onFailure) onFailure(err);
    }
  }
};

// Expose globally
window.SkillsfyPayment = SkillsfyPayment;
