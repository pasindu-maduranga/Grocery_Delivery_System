require('dotenv').config();
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

const paymentStripe = async (req, res) => {
  const { items, currency = 'usd' } = req.body;

  if (!items || items.length === 0) {
    return res.status(400).json({ error: 'No items provided' });
  }

  try {
    // Build Stripe line_items from cart items array
    const lineItems = items.map((item) => ({
      price_data: {
        currency,
        product_data: {
          name: item.name,
          // image must be a real HTTPS URL — skip emoji for now
          // images: [item.imageUrl],
        },
        // Stripe expects amount in cents — multiply by 100
        unit_amount: Math.round(item.price * 100),
      },
      quantity: item.qty,
    }));

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items:           lineItems,
      mode:                 'payment',
      // Pass userId in metadata so you can clear cart on webhook later
      metadata: {
        userId: req.user._id.toString(),
      },
      success_url: `${process.env.FRONTEND_URL}/payment/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url:  `${process.env.FRONTEND_URL}/payment/cancel`,
    });

    res.json({ 
      success: true, 
      url: session.url 
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      error: error.message 
    });
  }
};

module.exports={paymentStripe};
