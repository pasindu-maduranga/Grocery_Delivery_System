async function test() {
  try {
    const res = await fetch('http://127.0.0.1:5004/api/orders/stats', {
      method: 'OPTIONS',
      headers: { 
        'Origin': 'http://localhost:5173',
        'Access-Control-Request-Method': 'GET',
        'Access-Control-Request-Headers': 'authorization,content-type'
      }
    });
    console.log('STATUS:', res.status, res.statusText);
    console.log('HEADERS:', Object.fromEntries(res.headers.entries()));
    const text = await res.text();
    console.log('RESPONSE:', text.slice(0, 300));
  } catch (err) {
    console.error('ERROR:', err.message);
  }
}
test();
