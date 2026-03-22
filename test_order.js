async function test() {
  try {
    const res = await fetch('http://127.0.0.1:5004/api/orders/stats', {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' }
    });
    const text = await res.text();
    console.log('STATUS:', res.status, res.statusText);
    console.log('RESPONSE:', text.slice(0, 300));
  } catch (err) {
    console.error('ERROR:', err.message);
  }
}

test();
