require('dotenv').config();
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

const paymentStripe = async (req, res) => {
  const { amount, currency = 'usd', product } = req.body;

  try {
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [{
        price_data: {
          currency: currency,
          product_data: {
            name: product.name,
            description: product.description,
          },
          unit_amount: amount * 100, // Amount in smallest currency unit (e.g., cents)
        },
        quantity: 1,
      }],
      mode: 'payment',
      success_url: 'http://localhost:5173/payment/success',
      cancel_url: 'http://localhost:5173/payment/cancel',
    });

    res.json({ url: session.url });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports=paymentStripe;
