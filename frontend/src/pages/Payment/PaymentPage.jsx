// import React, { useState } from 'react';
// import { loadStripe } from '@stripe/stripe-js';
// import axios from 'axios';

// const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY);

// export default function PaymentPage() {
//   const [loading, setLoading] = useState(false);

//   const handlePayment = async () => {
//     setLoading(true);
//     try {
//       const response = await axios.post(`${import.meta.env.VITE_API_URL_ORDER}/payment/create-checkout-session`, {
//         amount: 0.5, // Example amount in dollars
//         currency: 'usd',
//         product: { name: 'Sample Product', description: 'Test payment' }
//       });
//       window.location.href = response.data.url;
//     } catch (err) {
//       alert('Payment error: ' + err.message);
//     }
//     setLoading(false);
//   };

//   return (
//     <div>
//       <h2>Payment Page</h2>
//       <button onClick={handlePayment} disabled={loading}>
//         {loading ? 'Processing...' : 'Pay $0.5'}
//       </button>
//     </div>
//   );
// }