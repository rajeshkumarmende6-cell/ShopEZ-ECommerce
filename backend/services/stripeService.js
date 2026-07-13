const stripe = require('stripe');

const isStripeConfigured =
  process.env.STRIPE_SECRET_KEY &&
  process.env.STRIPE_SECRET_KEY !== 'sk_test_mockstripekey5173abcdefghijk';

let stripeClient;
if (isStripeConfigured) {
  stripeClient = stripe(process.env.STRIPE_SECRET_KEY);
  console.log('✓ Stripe Service Configured');
} else {
  console.log('⚠️  Stripe secret key missing or default. Using mock payments.');
}

/**
 * Create a Stripe PaymentIntent (or mock PaymentIntent if not configured)
 * @param {number} amount Total amount in dollars (e.g. 19.99)
 * @returns {Promise<{clientSecret: string, id: string}>}
 */
exports.createPaymentIntent = async (amount) => {
  const amountInCents = Math.round(amount * 100);

  if (!isStripeConfigured) {
    // Simulated delay
    await new Promise((resolve) => setTimeout(resolve, 100));
    return {
      clientSecret: `pi_mock_${Math.random().toString(36).substring(2, 11)}_secret_${Math.random().toString(36).substring(2, 11)}`,
      id: `pi_mock_${Math.random().toString(36).substring(2, 11)}`
    };
  }

  try {
    const paymentIntent = await stripeClient.paymentIntents.create({
      amount: amountInCents,
      currency: 'usd',
      metadata: { integration_check: 'accept_a_payment' }
    });

    return {
      clientSecret: paymentIntent.client_secret,
      id: paymentIntent.id
    };
  } catch (error) {
    throw error;
  }
};

/**
 * Confirm a Stripe PaymentIntent status
 * @param {string} paymentIntentId
 * @returns {Promise<{status: string}>}
 */
exports.confirmPaymentIntent = async (paymentIntentId) => {
  if (!isStripeConfigured || paymentIntentId.startsWith('pi_mock_')) {
    return { status: 'succeeded' };
  }

  try {
    const paymentIntent = await stripeClient.paymentIntents.retrieve(paymentIntentId);
    return {
      status: paymentIntent.status
    };
  } catch (error) {
    throw error;
  }
};
