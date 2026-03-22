// // src/pages/DeliveryTrackingPage.jsx
// // Customer-facing live delivery tracker

// import React, { useState, useEffect } from 'react';
// import { deliveryApi } from '../api/deliveryApi';
// import { useSocket } from '../context/SocketContext';

// const STATUS_STEPS = [
//   { key: 'pending',           label: 'Order Placed',     icon: '📋' },
//   { key: 'picking',           label: 'Picking Items',    icon: '🛒' },
//   { key: 'ready_for_pickup',  label: 'Ready',            icon: '✅' },
//   { key: 'driver_assigned',   label: 'Driver Assigned',  icon: '👤' },
//   { key: 'picked_up',         label: 'Picked Up',        icon: '📦' },
//   { key: 'in_transit',        label: 'On the Way',       icon: '🚚' },
//   { key: 'delivered',         label: 'Delivered',        icon: '🎉' },
// ];

// export default function DeliveryTrackingPage({ deliveryId: propId }) {
//   const [deliveryId, setDeliveryId] = useState(propId || '');
//   const [delivery, setDelivery]     = useState(null);
//   const [loading, setLoading]       = useState(false);
//   const [error, setError]           = useState('');
//   const { socket }                  = useSocket();

//   const fetchDelivery = async (id = deliveryId) => {
//     if (!id) return;
//     setLoading(true); setError('');
//     try {
//       const data = await deliveryApi.getById(id);
//       setDelivery(data);
//     } catch (err) {
//       setError('Delivery not found. Check the ID.');
//     } finally {
//       setLoading(false);
//     }
//   };

//   // Real-time status updates
//   useEffect(() => {
//     if (!socket || !deliveryId) return;
//     socket.emit('join', `delivery:${deliveryId}`);
//     socket.on('status-update', ({ status }) => {
//       setDelivery(d => d ? { ...d, status } : d);
//     });
//     socket.on('location-update', ({ driverLocation }) => {
//       setDelivery(d => d ? { ...d, driverLocation } : d);
//     });
//     return () => {
//       socket.off('status-update');
//       socket.off('location-update');
//     };
//   }, [socket, deliveryId]);

//   const currentStep = STATUS_STEPS.findIndex(s => s.key === delivery?.status);

//   return (
//     <div style={s.page}>
//       <header style={s.header}>
//         <span style={{ color: '#6ee7b7' }}>🌿</span>
//         <span style={s.brand}>FreshCart</span>
//         <span style={s.subBrand}>Track Delivery</span>
//       </header>

//       <div style={s.body}>
//         {/* Search box */}
//         <div style={s.searchCard}>
//           <p style={s.searchLabel}>Enter Delivery ID</p>
//           <div style={s.searchRow}>
//             <input
//               value={deliveryId}
//               onChange={e => setDeliveryId(e.target.value)}
//               placeholder="e.g. 64f3c2a1b..."
//               style={s.searchInput}
//               onKeyDown={e => e.key === 'Enter' && fetchDelivery()}
//             />
//             <button onClick={() => fetchDelivery()} style={s.searchBtn} disabled={loading}>
//               {loading ? '…' : '🔍 Track'}
//             </button>
//           </div>
//           {error && <p style={s.errorText}>{error}</p>}
//         </div>

//         {delivery && (
//           <>
//             {/* Status timeline */}
//             <div style={s.card}>
//               <h3 style={s.cardTitle}>Delivery Status</h3>
//               <div style={s.timeline}>
//                 {STATUS_STEPS.map((step, i) => {
//                   const done    = i <= currentStep;
//                   const active  = i === currentStep;
//                   return (
//                     <div key={step.key} style={s.timelineItem}>
//                       <div style={s.timelineLeft}>
//                         <div style={{ ...s.dot, background: done ? '#065f46' : '#e5e7eb',
//                                       border: active ? '3px solid #34d399' : 'none',
//                                       transform: active ? 'scale(1.25)' : 'scale(1)' }}>
//                           {done && <span style={{ fontSize: 10 }}>✓</span>}
//                         </div>
//                         {i < STATUS_STEPS.length - 1 && (
//                           <div style={{ ...s.line, background: i < currentStep ? '#065f46' : '#e5e7eb' }} />
//                         )}
//                       </div>
//                       <div style={s.timelineContent}>
//                         <span style={s.stepIcon}>{step.icon}</span>
//                         <span style={{ ...s.stepLabel, color: done ? '#064e3b' : '#9ca3af',
//                                        fontWeight: active ? 800 : 500 }}>
//                           {step.label}
//                         </span>
//                         {active && <span style={s.activeBadge}>Now</span>}
//                       </div>
//                     </div>
//                   );
//                 })}
//               </div>
//             </div>

//             {/* Delivery details */}
//             <div style={s.card}>
//               <h3 style={s.cardTitle}>Details</h3>
//               <DetailRow label="Order ID" value={delivery.orderId} />
//               <DetailRow label="Store"    value={delivery.storeId} />
//               <DetailRow label="Status"   value={delivery.status?.replace(/_/g, ' ')} />
//               {delivery.estimatedDeliveryTime && (
//                 <DetailRow label="Estimated Delivery"
//                   value={new Date(delivery.estimatedDeliveryTime).toLocaleTimeString()} />
//               )}
//               {delivery.driverId && (
//                 <DetailRow label="Driver" value={typeof delivery.driverId === 'object'
//                   ? delivery.driverId.name : delivery.driverId} />
//               )}
//             </div>

//             {/* Rating (if delivered) */}
//             {delivery.status === 'delivered' && !delivery.rating && (
//               <RateDelivery deliveryId={deliveryId} onRated={(r) => setDelivery(d => ({ ...d, rating: r }))} />
//             )}
//             {delivery.rating && (
//               <div style={{ ...s.card, textAlign: 'center', padding: '20px' }}>
//                 <p style={{ fontSize: 28 }}>{'★'.repeat(delivery.rating)}</p>
//                 <p style={{ color: '#065f46', fontWeight: 700 }}>You rated this delivery {delivery.rating}/5</p>
//               </div>
//             )}
//           </>
//         )}
//       </div>
//     </div>
//   );
// }

// function DetailRow({ label, value }) {
//   return (
//     <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0',
//                   borderBottom: '1px solid #f0fdf4', fontSize: 14 }}>
//       <span style={{ color: '#9ca3af', fontWeight: 600 }}>{label}</span>
//       <span style={{ color: '#064e3b', fontWeight: 700, textAlign: 'right', maxWidth: '60%',
//                      wordBreak: 'break-all' }}>{value || '—'}</span>
//     </div>
//   );
// }

// function RateDelivery({ deliveryId, onRated }) {
//   const [rating, setRating]   = useState(0);
//   const [hover, setHover]     = useState(0);
//   const [loading, setLoading] = useState(false);
//   const [done, setDone]       = useState(false);

//   const submit = async () => {
//     if (!rating) return;
//     setLoading(true);
//     try {
//       await deliveryApi.rate(deliveryId, rating);
//       setDone(true);
//       onRated(rating);
//     } finally { setLoading(false); }
//   };

//   if (done) return null;

//   return (
//     <div style={{ ...s.card, textAlign: 'center' }}>
//       <h3 style={s.cardTitle}>Rate your delivery</h3>
//       <div style={{ display: 'flex', justifyContent: 'center', gap: 8, margin: '12px 0' }}>
//         {[1, 2, 3, 4, 5].map(n => (
//           <span
//             key={n}
//             onMouseEnter={() => setHover(n)}
//             onMouseLeave={() => setHover(0)}
//             onClick={() => setRating(n)}
//             style={{ fontSize: 36, cursor: 'pointer', transition: 'transform 0.1s',
//                      transform: (hover || rating) >= n ? 'scale(1.15)' : 'scale(1)',
//                      filter: (hover || rating) >= n ? 'none' : 'grayscale(1)' }}
//           >⭐</span>
//         ))}
//       </div>
//       <button onClick={submit} disabled={!rating || loading}
//         style={{ ...s.searchBtn, opacity: !rating ? 0.5 : 1 }}>
//         {loading ? '…' : 'Submit Rating'}
//       </button>
//     </div>
//   );
// }

// const s = {
//   page:         { minHeight: '100vh', background: '#f0fdf4', fontFamily: "'Nunito', sans-serif" },
//   header:       { background: '#064e3b', padding: '16px 24px', display: 'flex',
//                   alignItems: 'center', gap: 10 },
//   brand:        { color: '#fff', fontWeight: 800, fontSize: 20 },
//   subBrand:     { color: '#6ee7b7', fontSize: 14, fontWeight: 600, marginLeft: 4 },
//   body:         { maxWidth: 560, margin: '0 auto', padding: '24px 16px',
//                   display: 'flex', flexDirection: 'column', gap: 16 },
//   searchCard:   { background: '#fff', borderRadius: 20, padding: 24,
//                   boxShadow: '0 4px 20px rgba(0,0,0,0.07)' },
//   searchLabel:  { margin: '0 0 10px', fontWeight: 700, color: '#374151', fontSize: 14 },
//   searchRow:    { display: 'flex', gap: 10 },
//   searchInput:  { flex: 1, padding: '10px 14px', borderRadius: 12, fontSize: 14,
//                   border: '1.5px solid #d1fae5', outline: 'none', background: '#f9fafb' },
//   searchBtn:    { padding: '10px 20px', borderRadius: 12, border: 'none',
//                   background: 'linear-gradient(90deg,#065f46,#047857)',
//                   color: '#fff', fontWeight: 700, cursor: 'pointer', fontSize: 14 },
//   errorText:    { color: '#b91c1c', fontSize: 13, marginTop: 8 },
//   card:         { background: '#fff', borderRadius: 20, padding: 24,
//                   boxShadow: '0 4px 20px rgba(0,0,0,0.07)' },
//   cardTitle:    { margin: '0 0 16px', fontSize: 16, fontWeight: 800, color: '#064e3b' },
//   timeline:     { paddingLeft: 4 },
//   timelineItem: { display: 'flex', alignItems: 'flex-start', minHeight: 40 },
//   timelineLeft: { display: 'flex', flexDirection: 'column', alignItems: 'center',
//                   marginRight: 14, width: 20 },
//   dot:          { width: 20, height: 20, borderRadius: '50%', display: 'flex',
//                   alignItems: 'center', justifyContent: 'center',
//                   color: '#fff', fontSize: 10, transition: 'all 0.3s', flexShrink: 0 },
//   line:         { width: 2, flex: 1, minHeight: 16, transition: 'background 0.4s' },
//   timelineContent:{ display: 'flex', alignItems: 'center', gap: 8, paddingBottom: 16 },
//   stepIcon:     { fontSize: 16 },
//   stepLabel:    { fontSize: 14, transition: 'color 0.3s' },
//   activeBadge:  { background: '#d1fae5', color: '#065f46', fontSize: 11,
//                   fontWeight: 700, padding: '2px 8px', borderRadius: 20 },
// };

// src/pages/DeliveryTrackingPage.jsx
// src/pages/DeliveryTrackingPage.jsx
// src/pages/DeliveryTrackingPage.jsx
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { deliveryApi } from '../api/deliveryApi';
import { useSocket } from '../context/SocketContext';

const STATUS_STEPS = [
  { key: 'pending',          label: 'Order Placed',    icon: '📋', desc: 'Your order has been placed' },
  { key: 'picking',          label: 'Picking Items',   icon: '🛒', desc: 'Store is preparing your order' },
  { key: 'ready_for_pickup', label: 'Ready',           icon: '✅', desc: 'Order is ready for pickup' },
  { key: 'driver_assigned',  label: 'Driver Assigned', icon: '👤', desc: 'A driver is on the way to store' },
  { key: 'picked_up',        label: 'Picked Up',       icon: '📦', desc: 'Driver has collected your order' },
  { key: 'in_transit',       label: 'On the Way',      icon: '🚚', desc: 'Driver is heading to you' },
  { key: 'delivered',        label: 'Delivered',       icon: '🎉', desc: 'Order delivered successfully' },
];

const MOCK_DELIVERIES = {
  'ORD-001': {
    orderId: 'ORD-001', _id: 'mock-001',
    storeId: 'FreshMart Colombo 03',
    status: 'in_transit',
    driverId: { name: 'Kasun Siriwardena', phone: '077-123-4567', vehicleType: 'Motorcycle' },
    estimatedDeliveryTime: new Date(Date.now() + 15 * 60000).toISOString(),
    createdAt: new Date(Date.now() - 35 * 60000).toISOString(),
    rating: null,
  },
  'ORD-002': {
    orderId: 'ORD-002', _id: 'mock-002',
    storeId: 'Green Basket Nugegoda',
    status: 'picked_up',
    driverId: { name: 'Ruwan Madusanka', phone: '077-234-5678', vehicleType: 'Car' },
    estimatedDeliveryTime: new Date(Date.now() + 25 * 60000).toISOString(),
    createdAt: new Date(Date.now() - 20 * 60000).toISOString(),
    rating: null,
  },
  'ORD-003': {
    orderId: 'ORD-003', _id: 'mock-003',
    storeId: 'FreshCart Boralesgamuwa',
    status: 'driver_assigned',
    driverId: { name: 'Saman Kumara', phone: '077-345-6789', vehicleType: 'Scooter' },
    estimatedDeliveryTime: new Date(Date.now() + 40 * 60000).toISOString(),
    createdAt: new Date(Date.now() - 10 * 60000).toISOString(),
    rating: null,
  },
  'ORD-004': {
    orderId: 'ORD-004', _id: 'mock-004',
    storeId: 'SuperMart Kollupitiya',
    status: 'delivered',
    driverId: { name: 'Kasun Siriwardena', phone: '077-123-4567', vehicleType: 'Motorcycle' },
    estimatedDeliveryTime: new Date(Date.now() - 10 * 60000).toISOString(),
    actualDeliveryTime:    new Date(Date.now() - 8  * 60000).toISOString(),
    createdAt: new Date(Date.now() - 60 * 60000).toISOString(),
    rating: 0,
  },
};

const MOCK_IDS = Object.keys(MOCK_DELIVERIES);

export default function DeliveryTrackingPage({ deliveryId: propId }) {
  const { deliveryId: paramId } = useParams();
  const navigate = useNavigate();

  const [deliveryId, setDeliveryId] = useState(propId || paramId || '');
  const [delivery, setDelivery]     = useState(null);
  const [loading, setLoading]       = useState(false);
  const [error, setError]           = useState('');
  const [useMock, setUseMock]       = useState(false);
  const { socket }                  = useSocket();

  useEffect(() => {
    if (paramId || propId) fetchDelivery(paramId || propId);
  }, [paramId, propId]);

  const fetchDelivery = async (id = deliveryId) => {
    if (!id) return;
    setLoading(true); setError(''); setUseMock(false);
    const mockKey = MOCK_IDS.find(k => k === id || id.includes(k.replace('ORD-', '')));
    if (mockKey) {
      setTimeout(() => {
        setDelivery(MOCK_DELIVERIES[mockKey]);
        setUseMock(true);
        setLoading(false);
      }, 500);
      return;
    }
    try {
      const data = await deliveryApi.getById(id);
      setDelivery(data);
    } catch {
      setError('Delivery not found. Try a demo: ORD-001, ORD-002, ORD-003 or ORD-004');
    } finally { setLoading(false); }
  };

  useEffect(() => {
    if (!socket || !deliveryId || useMock) return;
    socket.emit('join', `delivery:${deliveryId}`);
    socket.on('status-update', ({ status }) => setDelivery(d => d ? { ...d, status } : d));
    socket.on('location-update', ({ driverLocation }) => setDelivery(d => d ? { ...d, driverLocation } : d));
    return () => { socket.off('status-update'); socket.off('location-update'); };
  }, [socket, deliveryId, useMock]);

  const currentStep = STATUS_STEPS.findIndex(s => s.key === delivery?.status);
  const driverName  = typeof delivery?.driverId === 'object' ? delivery?.driverId?.name : delivery?.driverId;
  const driverPhone = typeof delivery?.driverId === 'object' ? delivery?.driverId?.phone : null;
  const driverVehicle = typeof delivery?.driverId === 'object' ? delivery?.driverId?.vehicleType : null;

  return (
    <div style={{ minHeight:'100vh', background:'#f0fdf4', fontFamily:"'Nunito',sans-serif" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Nunito:wght@400;600;700;800;900&display=swap');
        @keyframes spin   { to { transform: rotate(360deg); } }
        @keyframes pulse  { 0%,100%{opacity:1} 50%{opacity:0.5} }
        @keyframes ping   { 0%{transform:scale(1);opacity:0.8} 100%{transform:scale(2.2);opacity:0} }
        @keyframes fadeUp { from{transform:translateY(10px);opacity:0} to{transform:translateY(0);opacity:1} }
        @keyframes slideIn{ from{transform:translateX(-10px);opacity:0} to{transform:translateX(0);opacity:1} }
      `}</style>

      {/* ── HEADER ── */}
      <header style={{ background:'linear-gradient(90deg,#052e16,#064e3b)', padding:'14px 32px',
                       display:'flex', alignItems:'center', justifyContent:'space-between',
                       boxShadow:'0 4px 24px rgba(0,0,0,0.25)', position:'sticky', top:0, zIndex:100 }}>
        <div style={{ display:'flex', alignItems:'center', gap:12 }}>
          {paramId && (
            <button onClick={() => navigate('/driver/dashboard')}
              style={{ background:'rgba(255,255,255,0.1)', border:'1px solid rgba(255,255,255,0.2)',
                       borderRadius:10, padding:'6px 14px', color:'#6ee7b7', fontSize:13,
                       fontWeight:700, cursor:'pointer', fontFamily:"'Nunito',sans-serif" }}>
              ← Dashboard
            </button>
          )}
          <div style={{ display:'flex', alignItems:'center', gap:8 }}>
            <div style={{ width:34, height:34, borderRadius:9, background:'rgba(255,255,255,0.12)',
                          display:'flex', alignItems:'center', justifyContent:'center', fontSize:18 }}>🌿</div>
            <div>
              <div style={{ color:'#fff', fontWeight:900, fontSize:16 }}>FreshCart</div>
              <div style={{ color:'#6ee7b7', fontSize:9, fontWeight:700, letterSpacing:2 }}>DELIVERY TRACKING</div>
            </div>
          </div>
        </div>
        <div style={{ display:'flex', alignItems:'center', gap:8, background:'rgba(255,255,255,0.08)',
                      border:'1px solid rgba(255,255,255,0.12)', borderRadius:20, padding:'6px 16px' }}>
          <div style={{ position:'relative', width:8, height:8 }}>
            <div style={{ position:'absolute', inset:0, borderRadius:'50%', background:'#34d399',
                          animation:'ping 1.5s ease-out infinite' }} />
            <div style={{ position:'relative', width:8, height:8, borderRadius:'50%',
                          background:'#34d399', boxShadow:'0 0 6px #34d399' }} />
          </div>
          <span style={{ color:'#d1fae5', fontSize:12, fontWeight:700 }}>Live Updates</span>
        </div>
      </header>

      <div style={{ maxWidth:1200, margin:'0 auto', padding:'28px 32px 48px' }}>

        {/* ── SEARCH PANEL (no URL param) ── */}
        {!paramId && (
          <div style={{ background:'#fff', borderRadius:20, padding:'28px 32px', marginBottom:24,
                        boxShadow:'0 4px 20px rgba(0,0,0,0.07)', border:'1.5px solid #d1fae5' }}>
            <h2 style={{ margin:'0 0 6px', fontSize:22, fontWeight:900, color:'#064e3b' }}>
              Track Your Delivery
            </h2>
            <p style={{ margin:'0 0 20px', fontSize:14, color:'#6b7280' }}>
              Enter your delivery ID or click a demo order below
            </p>
            <div style={{ display:'flex', gap:12, marginBottom:20 }}>
              <input value={deliveryId} onChange={e => setDeliveryId(e.target.value)}
                placeholder="Enter delivery ID e.g. ORD-001..."
                style={{ flex:1, padding:'13px 18px', borderRadius:14, fontSize:15,
                         border:'1.5px solid #d1fae5', outline:'none', background:'#f9fafb',
                         fontFamily:"'Nunito',sans-serif" }}
                onKeyDown={e => e.key === 'Enter' && fetchDelivery()} />
              <button onClick={() => fetchDelivery()} disabled={loading}
                style={{ padding:'13px 28px', borderRadius:14, border:'none',
                         background:'linear-gradient(90deg,#065f46,#047857)',
                         color:'#fff', fontWeight:800, cursor:'pointer', fontSize:15,
                         fontFamily:"'Nunito',sans-serif", opacity:loading?0.7:1,
                         boxShadow:'0 4px 16px rgba(6,95,70,0.3)' }}>
                {loading ? '…' : '🔍 Track'}
              </button>
            </div>

            {/* Demo buttons */}
            <div style={{ borderTop:'1.5px solid #f0fdf4', paddingTop:20 }}>
              <p style={{ margin:'0 0 12px', fontSize:12, color:'#9ca3af', fontWeight:700, letterSpacing:0.5 }}>
                DEMO ORDERS — CLICK TO PREVIEW
              </p>
              <div style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:12 }}>
                {[
                  { id:'ORD-001', label:'In Transit',      icon:'🚚', color:'#dbeafe', text:'#1d4ed8', border:'#93c5fd' },
                  { id:'ORD-002', label:'Picked Up',       icon:'📦', color:'#ede9fe', text:'#7c3aed', border:'#c4b5fd' },
                  { id:'ORD-003', label:'Driver Assigned', icon:'👤', color:'#fef3c7', text:'#b45309', border:'#fcd34d' },
                  { id:'ORD-004', label:'Delivered',       icon:'🎉', color:'#d1fae5', text:'#065f46', border:'#6ee7b7' },
                ].map(({ id, label, icon, color, text, border }) => (
                  <button key={id}
                    onClick={() => { setDeliveryId(id); fetchDelivery(id); }}
                    style={{ padding:'14px 12px', borderRadius:14, border:`1.5px solid ${border}`,
                             cursor:'pointer', background:color, fontFamily:"'Nunito',sans-serif",
                             textAlign:'center', transition:'transform 0.15s, box-shadow 0.15s' }}
                    onMouseEnter={e => { e.currentTarget.style.transform='translateY(-2px)'; e.currentTarget.style.boxShadow='0 6px 16px rgba(0,0,0,0.1)'; }}
                    onMouseLeave={e => { e.currentTarget.style.transform='translateY(0)';    e.currentTarget.style.boxShadow='none'; }}>
                    <div style={{ fontSize:24, marginBottom:6 }}>{icon}</div>
                    <div style={{ fontSize:13, fontWeight:800, color, marginBottom:2 }}>{id}</div>
                    <div style={{ fontSize:11, fontWeight:600, color: text }}>{label}</div>
                  </button>
                ))}
              </div>
            </div>
            {error && (
              <div style={{ marginTop:16, padding:'12px 16px', background:'#fef2f2',
                            border:'1px solid #fca5a5', borderRadius:12, color:'#b91c1c',
                            fontSize:13, fontWeight:600 }}>{error}</div>
            )}
          </div>
        )}

        {/* Loading */}
        {loading && (
          <div style={{ textAlign:'center', padding:'64px 0', background:'#fff', borderRadius:20,
                        boxShadow:'0 4px 20px rgba(0,0,0,0.07)', border:'1.5px solid #d1fae5' }}>
            <div style={{ width:48, height:48, border:'4px solid #d1fae5', borderTop:'4px solid #047857',
                          borderRadius:'50%', animation:'spin 0.8s linear infinite', margin:'0 auto 16px' }} />
            <p style={{ color:'#047857', fontWeight:800, fontSize:16 }}>Loading delivery…</p>
          </div>
        )}

        {/* Error (URL param) */}
        {paramId && error && !loading && (
          <div style={{ background:'#fef2f2', border:'1px solid #fca5a5', borderRadius:20,
                        padding:'40px', textAlign:'center' }}>
            <p style={{ fontSize:48, margin:'0 0 12px' }}>❌</p>
            <p style={{ color:'#b91c1c', fontWeight:800, fontSize:18, margin:'0 0 6px' }}>Delivery not found</p>
            <p style={{ color:'#6b7280', fontSize:14, margin:'0 0 20px' }}>{error}</p>
            <button onClick={() => navigate('/driver/dashboard')}
              style={{ padding:'12px 28px', borderRadius:12, border:'none',
                       background:'linear-gradient(90deg,#065f46,#047857)', color:'#fff',
                       fontWeight:800, cursor:'pointer', fontFamily:"'Nunito',sans-serif" }}>
              ← Back to Dashboard
            </button>
          </div>
        )}

        {/* ── MAIN CONTENT ── */}
        {delivery && !loading && (
          <div style={{ animation:'fadeUp 0.4s ease' }}>

            {useMock && (
              <div style={{ background:'rgba(251,191,36,0.08)', border:'1px solid rgba(251,191,36,0.3)',
                            borderRadius:12, padding:'10px 18px', marginBottom:20,
                            display:'flex', alignItems:'center', gap:8 }}>
                <span style={{ fontSize:16 }}>⚠️</span>
                <span style={{ fontSize:13, color:'#b45309', fontWeight:600 }}>
                  Demo data — connect your backend for live tracking
                </span>
              </div>
            )}

            {/* Two-column layout */}
            <div style={{ display:'grid', gridTemplateColumns:'1fr 380px', gap:24, alignItems:'start' }}>

              {/* LEFT — main content */}
              <div style={{ display:'flex', flexDirection:'column', gap:18 }}>

                {/* Hero summary */}
                <div style={{ background:'linear-gradient(145deg,#052e16,#065f46,#047857)',
                              borderRadius:24, padding:'32px 36px', position:'relative', overflow:'hidden',
                              boxShadow:'0 12px 40px rgba(6,79,58,0.35)' }}>
                  <div style={{ position:'absolute', top:-50, right:-50, width:180, height:180,
                                borderRadius:'50%', background:'rgba(255,255,255,0.04)' }} />
                  <div style={{ position:'absolute', bottom:-30, left:'30%', width:120, height:120,
                                borderRadius:'50%', background:'rgba(255,255,255,0.03)' }} />
                  <div style={{ position:'relative', zIndex:1 }}>
                    <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:20 }}>
                      <div>
                        <p style={{ margin:'0 0 4px', fontSize:11, color:'rgba(255,255,255,0.5)',
                                     fontWeight:700, letterSpacing:2 }}>ORDER</p>
                        <h1 style={{ margin:'0 0 8px', fontSize:32, fontWeight:900, color:'#fff', letterSpacing:-1 }}>
                          #{(delivery.orderId||delivery._id||'').toString().slice(-6).toUpperCase()}
                        </h1>
                        <p style={{ margin:'0 0 4px', fontSize:14, color:'rgba(255,255,255,0.7)' }}>
                          🏪 {delivery.storeId || 'Store'} → 📍 Customer
                        </p>
                      </div>
                      <span style={{ fontSize:13, fontWeight:800, padding:'8px 18px', borderRadius:20,
                                     background: delivery.status==='delivered' ? '#d1fae5' :
                                                 ['in_transit','picked_up'].includes(delivery.status) ? 'rgba(59,130,246,0.3)' :
                                                 'rgba(251,191,36,0.3)',
                                     color: delivery.status==='delivered' ? '#065f46' :
                                            ['in_transit','picked_up'].includes(delivery.status) ? '#93c5fd' : '#fbbf24',
                                     textTransform:'capitalize', whiteSpace:'nowrap',
                                     border: `1px solid ${delivery.status==='delivered' ? '#86efac' :
                                              ['in_transit','picked_up'].includes(delivery.status) ? 'rgba(147,197,253,0.4)' :
                                              'rgba(251,191,36,0.4)'}` }}>
                        {delivery.status?.replace(/_/g, ' ')}
                      </span>
                    </div>

                    {/* Time info */}
                    <div style={{ display:'flex', gap:24 }}>
                      {delivery.estimatedDeliveryTime && delivery.status !== 'delivered' && (
                        <div>
                          <p style={{ margin:'0 0 2px', fontSize:11, color:'rgba(255,255,255,0.5)', fontWeight:700 }}>
                            ESTIMATED DELIVERY
                          </p>
                          <p style={{ margin:0, fontSize:20, fontWeight:900, color:'#6ee7b7' }}>
                            {new Date(delivery.estimatedDeliveryTime).toLocaleTimeString([],{hour:'2-digit',minute:'2-digit'})}
                          </p>
                        </div>
                      )}
                      {delivery.actualDeliveryTime && (
                        <div>
                          <p style={{ margin:'0 0 2px', fontSize:11, color:'rgba(255,255,255,0.5)', fontWeight:700 }}>
                            DELIVERED AT
                          </p>
                          <p style={{ margin:0, fontSize:20, fontWeight:900, color:'#6ee7b7' }}>
                            {new Date(delivery.actualDeliveryTime).toLocaleTimeString([],{hour:'2-digit',minute:'2-digit'})}
                          </p>
                        </div>
                      )}
                      <div>
                        <p style={{ margin:'0 0 2px', fontSize:11, color:'rgba(255,255,255,0.5)', fontWeight:700 }}>
                          ORDERED AT
                        </p>
                        <p style={{ margin:0, fontSize:16, fontWeight:700, color:'rgba(255,255,255,0.8)' }}>
                          {new Date(delivery.createdAt).toLocaleTimeString([],{hour:'2-digit',minute:'2-digit'})}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Progress timeline */}
                <div style={{ background:'#fff', borderRadius:20, padding:'28px 32px',
                              boxShadow:'0 4px 20px rgba(0,0,0,0.07)', border:'1.5px solid #d1fae5' }}>
                  <h3 style={{ margin:'0 0 24px', fontSize:17, fontWeight:800, color:'#064e3b' }}>
                    Delivery Progress
                  </h3>
                  <div style={{ display:'grid', gridTemplateColumns:'repeat(7,1fr)', gap:8,
                                textAlign:'center', position:'relative' }}>
                    {/* Connecting line */}
                    <div style={{ position:'absolute', top:20, left:'7%', right:'7%', height:3,
                                  background:'#e5e7eb', borderRadius:2, zIndex:0 }} />
                    <div style={{ position:'absolute', top:20, left:'7%', height:3,
                                  width: `${Math.max(0, (currentStep / (STATUS_STEPS.length-1)) * 86)}%`,
                                  background:'linear-gradient(90deg,#065f46,#10b981)',
                                  borderRadius:2, zIndex:1, transition:'width 0.5s ease' }} />

                    {STATUS_STEPS.map((step, i) => {
                      const done   = i <= currentStep;
                      const active = i === currentStep;
                      return (
                        <div key={step.key} style={{ position:'relative', zIndex:2,
                                                     animation:`slideIn 0.3s ease ${i*0.06}s both` }}>
                          <div style={{ width:40, height:40, borderRadius:'50%', margin:'0 auto 10px',
                                        display:'flex', alignItems:'center', justifyContent:'center',
                                        fontSize:16, transition:'all 0.3s',
                                        background: active ? '#10b981' : done ? '#065f46' : '#fff',
                                        border: `3px solid ${active ? '#10b981' : done ? '#065f46' : '#e5e7eb'}`,
                                        boxShadow: active ? '0 0 16px rgba(16,185,129,0.5)' : 'none',
                                        transform: active ? 'scale(1.2)' : 'scale(1)' }}>
                            {done ? (active ? step.icon : '✓') : <span style={{ color:'#d1d5db', fontSize:14 }}>○</span>}
                          </div>
                          <p style={{ margin:'0 0 2px', fontSize:11, fontWeight: active ? 800 : done ? 700 : 500,
                                      color: active ? '#064e3b' : done ? '#374151' : '#9ca3af',
                                      lineHeight:1.3 }}>
                            {step.label}
                          </p>
                          {active && (
                            <span style={{ fontSize:9, fontWeight:700, padding:'2px 6px', borderRadius:10,
                                           background:'#d1fae5', color:'#065f46',
                                           animation:'pulse 1.5s ease-in-out infinite' }}>NOW</span>
                          )}
                        </div>
                      );
                    })}
                  </div>
                  {/* Current step description */}
                  {currentStep >= 0 && (
                    <div style={{ marginTop:20, padding:'14px 18px', background:'#f0fdf4',
                                  borderRadius:12, border:'1px solid #d1fae5',
                                  display:'flex', alignItems:'center', gap:10 }}>
                      <span style={{ fontSize:22 }}>{STATUS_STEPS[currentStep]?.icon}</span>
                      <p style={{ margin:0, fontSize:14, color:'#064e3b', fontWeight:700 }}>
                        {STATUS_STEPS[currentStep]?.desc}
                      </p>
                    </div>
                  )}
                </div>

                {/* Rating */}
                {delivery.status === 'delivered' && delivery.rating === 0 && (
                  <RateDelivery deliveryId={delivery._id||delivery.orderId} useMock={useMock}
                    onRated={r => setDelivery(d => ({ ...d, rating:r }))} />
                )}
                {delivery.rating > 0 && (
                  <div style={{ background:'#fff', borderRadius:20, padding:'28px 32px', textAlign:'center',
                                boxShadow:'0 4px 20px rgba(0,0,0,0.07)', border:'1.5px solid #d1fae5' }}>
                    <p style={{ fontSize:40, margin:'0 0 10px' }}>{'★'.repeat(delivery.rating)}</p>
                    <p style={{ color:'#065f46', fontWeight:800, margin:0, fontSize:16 }}>
                      You rated this delivery {delivery.rating}/5 ⭐
                    </p>
                  </div>
                )}
              </div>

              {/* RIGHT — sidebar */}
              <div style={{ display:'flex', flexDirection:'column', gap:16 }}>

                {/* Driver card */}
                {driverName && delivery.status !== 'pending' && (
                  <div style={{ background:'#fff', borderRadius:20, padding:24,
                                boxShadow:'0 4px 20px rgba(0,0,0,0.07)', border:'1.5px solid #d1fae5' }}>
                    <h4 style={{ margin:'0 0 16px', fontSize:13, fontWeight:800, color:'#064e3b',
                                 textTransform:'uppercase', letterSpacing:0.5 }}>Your Driver</h4>
                    <div style={{ display:'flex', alignItems:'center', gap:14, marginBottom:16 }}>
                      <div style={{ width:56, height:56, borderRadius:'50%', flexShrink:0,
                                    background:'linear-gradient(135deg,#065f46,#10b981)',
                                    display:'flex', alignItems:'center', justifyContent:'center',
                                    color:'#fff', fontSize:22, fontWeight:900 }}>
                        {driverName[0]}
                      </div>
                      <div>
                        <p style={{ margin:'0 0 2px', fontWeight:800, color:'#064e3b', fontSize:16 }}>
                          {driverName}
                        </p>
                        <p style={{ margin:0, fontSize:12, color:'#6b7280' }}>
                          {driverVehicle || 'Delivery Driver'}
                        </p>
                      </div>
                      <div style={{ marginLeft:'auto', width:12, height:12, borderRadius:'50%', flexShrink:0,
                                    background: delivery.status==='delivered' ? '#9ca3af' : '#34d399',
                                    boxShadow: delivery.status!=='delivered' ? '0 0 8px #34d399' : 'none' }} />
                    </div>
                    {driverPhone && (
                      <div style={{ display:'flex', alignItems:'center', gap:10, padding:'12px 14px',
                                    background:'#f0fdf4', borderRadius:12, border:'1px solid #d1fae5' }}>
                        <span style={{ fontSize:18 }}>📞</span>
                        <div>
                          <p style={{ margin:'0 0 1px', fontSize:11, color:'#9ca3af', fontWeight:600 }}>PHONE</p>
                          <p style={{ margin:0, fontSize:14, fontWeight:700, color:'#064e3b' }}>{driverPhone}</p>
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* Delivery details */}
                <div style={{ background:'#fff', borderRadius:20, padding:24,
                              boxShadow:'0 4px 20px rgba(0,0,0,0.07)', border:'1.5px solid #d1fae5' }}>
                  <h4 style={{ margin:'0 0 16px', fontSize:13, fontWeight:800, color:'#064e3b',
                               textTransform:'uppercase', letterSpacing:0.5 }}>Order Details</h4>
                  {[
                    { icon:'🆔', label:'Order ID',    value: (delivery.orderId||delivery._id||'').toString().slice(-6).toUpperCase() },
                    { icon:'🏪', label:'From',        value: delivery.storeId },
                    { icon:'📋', label:'Status',      value: delivery.status?.replace(/_/g,' ') },
                    { icon:'⏱',  label:'Est. Time',   value: delivery.estimatedDeliveryTime
                        ? new Date(delivery.estimatedDeliveryTime).toLocaleTimeString([],{hour:'2-digit',minute:'2-digit'}) : '—' },
                    { icon:'🕐', label:'Ordered',     value: new Date(delivery.createdAt).toLocaleTimeString([],{hour:'2-digit',minute:'2-digit'}) },
                  ].map(({ icon, label, value }) => (
                    <div key={label} style={{ display:'flex', alignItems:'center', gap:10,
                                              padding:'10px 0', borderBottom:'1px solid #f0fdf4' }}>
                      <span style={{ fontSize:16, width:22, textAlign:'center', flexShrink:0 }}>{icon}</span>
                      <span style={{ fontSize:12, color:'#9ca3af', fontWeight:600, width:80, flexShrink:0 }}>{label}</span>
                      <span style={{ fontSize:13, color:'#064e3b', fontWeight:700, flex:1,
                                     textTransform:'capitalize', wordBreak:'break-all' }}>{value||'—'}</span>
                    </div>
                  ))}
                </div>

                {/* Need help */}
                <div style={{ background:'linear-gradient(135deg,#064e3b,#065f46)', borderRadius:20,
                              padding:24, textAlign:'center',
                              boxShadow:'0 4px 20px rgba(6,79,58,0.2)' }}>
                  <p style={{ fontSize:24, margin:'0 0 8px' }}>🌿</p>
                  <p style={{ margin:'0 0 4px', fontWeight:800, color:'#fff', fontSize:15 }}>Need Help?</p>
                  <p style={{ margin:'0 0 16px', fontSize:12, color:'rgba(255,255,255,0.65)' }}>
                    Our support team is available 24/7
                  </p>
                  <div style={{ display:'flex', gap:8 }}>
                    <button style={{ flex:1, padding:'10px 0', borderRadius:12, border:'none',
                                     background:'rgba(255,255,255,0.15)', color:'#fff',
                                     fontWeight:700, fontSize:13, cursor:'pointer',
                                     fontFamily:"'Nunito',sans-serif" }}>📞 Call</button>
                    <button style={{ flex:1, padding:'10px 0', borderRadius:12, border:'none',
                                     background:'rgba(255,255,255,0.15)', color:'#fff',
                                     fontWeight:700, fontSize:13, cursor:'pointer',
                                     fontFamily:"'Nunito',sans-serif" }}>💬 Chat</button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function RateDelivery({ deliveryId, useMock, onRated }) {
  const [rating, setRating]   = useState(0);
  const [hover, setHover]     = useState(0);
  const [loading, setLoading] = useState(false);
  const [done, setDone]       = useState(false);

  const submit = async () => {
    if (!rating) return;
    setLoading(true);
    try {
      if (!useMock) await deliveryApi.rate(deliveryId, rating);
      else await new Promise(r => setTimeout(r, 600));
      setDone(true); onRated(rating);
    } finally { setLoading(false); }
  };

  if (done) return null;

  return (
    <div style={{ background:'#fff', borderRadius:20, padding:'28px 32px', textAlign:'center',
                  boxShadow:'0 4px 20px rgba(0,0,0,0.07)', border:'1.5px solid #d1fae5' }}>
      <h3 style={{ margin:'0 0 6px', fontSize:18, fontWeight:800, color:'#064e3b' }}>Rate Your Delivery</h3>
      <p style={{ margin:'0 0 20px', fontSize:14, color:'#9ca3af' }}>How was your experience?</p>
      <div style={{ display:'flex', justifyContent:'center', gap:12, margin:'0 0 24px' }}>
        {[1,2,3,4,5].map(n => (
          <span key={n} onMouseEnter={() => setHover(n)} onMouseLeave={() => setHover(0)}
            onClick={() => setRating(n)}
            style={{ fontSize:48, cursor:'pointer', transition:'transform 0.15s',
                     transform:(hover||rating)>=n ? 'scale(1.25)':'scale(1)',
                     filter:(hover||rating)>=n ? 'none':'grayscale(1)' }}>⭐</span>
        ))}
      </div>
      <button onClick={submit} disabled={!rating||loading}
        style={{ padding:'13px 40px', borderRadius:14, border:'none', cursor:'pointer',
                 background:'linear-gradient(90deg,#065f46,#047857)', color:'#fff',
                 fontWeight:800, fontSize:16, opacity:!rating?0.5:1,
                 fontFamily:"'Nunito',sans-serif", boxShadow:'0 4px 16px rgba(6,95,70,0.3)' }}>
        {loading ? 'Submitting…' : 'Submit Rating ✓'}
      </button>
    </div>
  );
}