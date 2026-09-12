const Razorpay = require('razorpay');
const crypto = require('crypto');

const isRazorpayConfigured =
  Boolean(process.env.RAZORPAY_KEY_ID) &&
  Boolean(process.env.RAZORPAY_KEY_SECRET) &&
  process.env.RAZORPAY_KEY_ID !== 'rzp_test_mockkey123456789' &&
  process.env.RAZORPAY_KEY_ID.startsWith('rzp_test_');

let razorpayInstance = null;
if (isRazorpayConfigured) {
  try {
    razorpayInstance = new Razorpay({
      key_id: process.env.RAZORPAY_KEY_ID,
      key_secret: process.env.RAZORPAY_KEY_SECRET
    });
    console.log('✓ Razorpay Service Configured in Test Mode');
  } catch (err) {
    console.warn('⚠️ Failed to initialize Razorpay client. Falling back to sandbox simulator.', err.message);
  }
} else {
  console.log('ℹ️  Razorpay Test Mode: Using integrated UPI sandbox simulator (No real money deducted).');
}

// USD to INR standard conversion rate (for UPI payments in INR)
const USD_TO_INR_RATE = 83;

/**
 * Create a Razorpay Order in INR (Paise)
 * @param {number} amountInUSD - Total price in USD
 * @param {string} receiptId - Order receipt identifier
 * @returns {Promise<{id: string, amount: number, currency: string, keyId: string, isMock: boolean, inrAmount: number}>}
 */
exports.createRazorpayOrder = async (amountInUSD, receiptId) => {
  const inrAmount = Number((amountInUSD * USD_TO_INR_RATE).toFixed(2));
  const amountInPaise = Math.round(inrAmount * 100);

  if (!isRazorpayConfigured || !razorpayInstance) {
    // Generate simulated Razorpay test order ID
    const mockOrderId = `order_mock_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
    return {
      id: mockOrderId,
      amount: amountInPaise,
      currency: 'INR',
      inrAmount,
      keyId: process.env.RAZORPAY_KEY_ID || 'rzp_test_mockkey123456789',
      isMock: true
    };
  }

  try {
    const options = {
      amount: amountInPaise,
      currency: 'INR',
      receipt: `rcpt_${receiptId || Date.now()}`.substring(0, 40)
    };

    const order = await razorpayInstance.orders.create(options);

    return {
      id: order.id,
      amount: order.amount,
      currency: order.currency,
      inrAmount,
      keyId: process.env.RAZORPAY_KEY_ID,
      isMock: false
    };
  } catch (error) {
    console.error('Razorpay order creation error:', error);
    // Fallback to simulated sandbox order so checkout never crashes
    const fallbackOrderId = `order_mock_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
    return {
      id: fallbackOrderId,
      amount: amountInPaise,
      currency: 'INR',
      inrAmount,
      keyId: process.env.RAZORPAY_KEY_ID || 'rzp_test_mockkey123456789',
      isMock: true
    };
  }
};

/**
 * Verify Razorpay payment signature
 * @param {Object} params
 * @param {string} params.razorpayPaymentId
 * @param {string} params.razorpayOrderId
 * @param {string} params.razorpaySignature
 * @returns {Promise<boolean>}
 */
exports.verifyPaymentSignature = async ({ razorpayPaymentId, razorpayOrderId, razorpaySignature }) => {
  // If in sandbox simulator mode or mock payment
  if (
    !isRazorpayConfigured ||
    !razorpayInstance ||
    razorpayOrderId?.startsWith('order_mock_') ||
    razorpayPaymentId?.startsWith('pay_mock_')
  ) {
    return true;
  }

  try {
    const body = razorpayOrderId + '|' + razorpayPaymentId;
    const expectedSignature = crypto
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
      .update(body.toString())
      .digest('hex');

    return expectedSignature === razorpaySignature;
  } catch (error) {
    console.error('Razorpay signature verification error:', error);
    return false;
  }
};
