// // src/pages/DriverDashboardPage.jsx
// import React, { useState, useEffect, useCallback } from 'react';
// import { useNavigate } from 'react-router-dom';
// import { driverApi } from '../api/deliveryApi';
// import { useSocket } from '../context/SocketContext';
// import OrderCard from '../components/OrderCard';
// import AssignmentToast from '../components/AssignmentToast';

// export default function DriverDashboardPage({ driverId }) {
//   const navigate = useNavigate();
//   const [driver, setDriver]               = useState(null);
//   const [pendingOrders, setPendingOrders] = useState([]);
//   const [currentOrders, setCurrentOrders] = useState([]);
//   const [loading, setLoading]             = useState(true);
//   const [toggling, setToggling]           = useState(false);
//   const [isOnline, setIsOnline]           = useState(false);
//   const [tab, setTab]                     = useState('pending');
//   const { connected, newAssignment, clearAssignment, goOnline, goOffline } = useSocket();

//   const fetchAll = useCallback(async () => {
//     if (!driverId) { setLoading(false); return; }
//     try {
//       const [driverRes, pending, current] = await Promise.all([
//         driverApi.getById(driverId),
//         driverApi.getPendingAssignments(driverId),
//         driverApi.getCurrentOrders(driverId),
//       ]);
//       const d = driverRes.driver || driverRes;
//       setDriver(d);
//       setIsOnline(d?.isAvailable || false);
//       setPendingOrders(Array.isArray(pending) ? pending : []);
//       setCurrentOrders(Array.isArray(current) ? current : []);
//     } catch (err) {
//       console.error(err);
//     } finally {
//       setLoading(false);
//     }
//   }, [driverId]);

//   useEffect(() => { fetchAll(); }, [fetchAll]);

//   useEffect(() => {
//     if (newAssignment) { fetchAll(); }
//   }, [newAssignment, fetchAll]);

//   // ✅ FIXED toggle
//   const toggleAvailability = async () => {
//     if (!driver || toggling) return;
//     setToggling(true);
//     const next = !isOnline;
//     setIsOnline(next);
//     try {
//       await driverApi.updateAvailability(driverId, next);
//       if (next) {
//         goOnline(driverId, driver.currentLocation || { latitude: 6.9271, longitude: 79.8612 });
//       } else {
//         goOffline(driverId);
//       }
//       setDriver(d => ({ ...d, isAvailable: next }));
//     } catch (err) {
//       console.error(err);
//       setIsOnline(!next);
//     } finally {
//       setToggling(false);
//     }
//   };

//   const handleAccept = async (orderId) => {
//     try { await driverApi.acceptOrder(driverId, orderId); await fetchAll(); }
//     catch (err) { console.error(err); }
//   };

//   const handleReject = async (orderId) => {
//     try { await driverApi.rejectOrder(driverId, orderId, 'Driver unavailable'); await fetchAll(); }
//     catch (err) { console.error(err); }
//   };

//   const handleComplete = async (orderId) => {
//     try { await driverApi.completeDelivery(driverId, orderId); await fetchAll(); }
//     catch (err) { console.error(err); }
//   };

//   if (loading) return <Loading />;

//   if (!driverId) {
//     return (
//       <div style={{ minHeight:'100vh', background:'#f0fdf4', display:'flex', alignItems:'center',
//                     justifyContent:'center', flexDirection:'column', gap:16, fontFamily:"'Nunito',sans-serif" }}>
//         <div style={{ fontSize:56 }}>🚗</div>
//         <h2 style={{ margin:0, color:'#064e3b', fontWeight:900 }}>No driver ID found</h2>
//         <p style={{ margin:0, color:'#6b7280' }}>Please register as a driver first</p>
//         <a href="/driver/register" style={{ padding:'12px 28px', borderRadius:12, background:'linear-gradient(90deg,#065f46,#047857)',
//                                              color:'#fff', fontWeight:800, fontSize:14, textDecoration:'none' }}>
//           Register Now →
//         </a>
//       </div>
//     );
//   }

//   const shown    = tab === 'pending' ? pendingOrders : currentOrders;
//   const initials = driver?.name?.split(' ').map(w => w[0]).join('').toUpperCase().slice(0,2) || '?';

//   return (
//     <div style={{ minHeight:'100vh', background:'#f0fdf4', fontFamily:"'Nunito',sans-serif" }}>
//       <style>{`
//         @import url('https://fonts.googleapis.com/css2?family=Nunito:wght@400;600;700;800;900&display=swap');
//         @keyframes spin    { to { transform: rotate(360deg); } }
//         @keyframes fadeUp  { from{transform:translateY(12px);opacity:0} to{transform:translateY(0);opacity:1} }
//         @keyframes pulse   { 0%,100%{opacity:1} 50%{opacity:0.4} }
//         @keyframes ping    { 0%{transform:scale(1);opacity:0.8} 100%{transform:scale(2.5);opacity:0} }
//         .fc-order { animation: fadeUp 0.3s ease both; }
//         .fc-toggle:hover:not(:disabled) { transform: scale(1.03); box-shadow: 0 6px 20px rgba(0,0,0,0.2) !important; }
//         .fc-toggle:active:not(:disabled) { transform: scale(0.97); }
//         .fc-tab:hover { opacity: 0.88; }
//         .fc-stat:hover { transform: translateY(-3px); }
//       `}</style>

//       {newAssignment && (
//         <AssignmentToast
//           assignment={newAssignment}
//           onAccept={() => { handleAccept(newAssignment.orderId); clearAssignment(); }}
//           onReject={() => { handleReject(newAssignment.orderId); clearAssignment(); }}
//           onDismiss={clearAssignment}
//         />
//       )}

//       {/* ── HEADER ── */}
//       <header style={{ background:'linear-gradient(90deg,#052e16,#064e3b)', padding:'14px 24px',
//                        display:'flex', justifyContent:'space-between', alignItems:'center',
//                        boxShadow:'0 4px 24px rgba(0,0,0,0.25)', position:'sticky', top:0, zIndex:100 }}>
//         <div style={{ display:'flex', alignItems:'center', gap:10 }}>
//           <div style={{ width:36, height:36, borderRadius:10, background:'rgba(255,255,255,0.12)',
//                         display:'flex', alignItems:'center', justifyContent:'center', fontSize:20 }}>🌿</div>
//           <div>
//             <div style={{ color:'#fff', fontWeight:900, fontSize:16, letterSpacing:-0.5 }}>FreshCart</div>
//             <div style={{ color:'#6ee7b7', fontSize:9, fontWeight:700, letterSpacing:2 }}>DRIVER PORTAL</div>
//           </div>
//         </div>
//         <div style={{ display:'flex', alignItems:'center', gap:10 }}>
//           <div style={{ display:'flex', alignItems:'center', gap:8, background:'rgba(255,255,255,0.08)',
//                         border:'1px solid rgba(255,255,255,0.12)', borderRadius:20, padding:'6px 14px' }}>
//             <div style={{ position:'relative', width:10, height:10 }}>
//               {connected && <div style={{ position:'absolute', inset:0, borderRadius:'50%',
//                                            background:'#34d399', animation:'ping 1.5s ease-out infinite' }} />}
//               <div style={{ position:'relative', width:10, height:10, borderRadius:'50%',
//                             background: connected ? '#34d399' : '#f87171',
//                             boxShadow: connected ? '0 0 8px #34d399' : 'none' }} />
//             </div>
//             <span style={{ color:'#d1fae5', fontSize:12, fontWeight:700 }}>
//               {connected ? 'Live' : 'Disconnected'}
//             </span>
//           </div>
//           {/* ✅ Profile button */}
//           <button
//             onClick={() => navigate('/driver/profile')}
//             title="View Profile"
//             style={{
//               width:38, height:38, borderRadius:'50%', border:'2px solid rgba(255,255,255,0.25)',
//               background:'linear-gradient(135deg,#065f46,#10b981)',
//               color:'#fff', fontSize:15, fontWeight:900, cursor:'pointer',
//               display:'flex', alignItems:'center', justifyContent:'center',
//               flexShrink:0, transition:'transform 0.15s, box-shadow 0.15s',
//               boxShadow:'0 2px 8px rgba(0,0,0,0.2)',
//             }}
//             onMouseEnter={e => e.currentTarget.style.transform='scale(1.1)'}
//             onMouseLeave={e => e.currentTarget.style.transform='scale(1)'}
//           >
//             {initials}
//           </button>
//         </div>
//       </header>

//       <div style={{ maxWidth:1200, margin:'0 auto', padding:'20px 32px 48px' }}>

//         {/* ── HERO CARD ── */}
//         <div style={{
//           borderRadius:24, padding:'28px 32px 24px', marginBottom:20,
//           position:'relative', overflow:'hidden',
//           background: isOnline
//             ? 'linear-gradient(145deg,#052e16 0%,#065f46 60%,#047857 100%)'
//             : 'linear-gradient(145deg,#111827 0%,#1f2937 60%,#374151 100%)',
//           boxShadow: isOnline
//             ? '0 16px 48px rgba(6,79,58,0.4)'
//             : '0 16px 48px rgba(0,0,0,0.3)',
//           transition:'background 0.6s ease, box-shadow 0.6s ease',
//         }}>
//           {/* Decorative circles */}
//           <div style={{ position:'absolute', top:-60, right:-60, width:200, height:200,
//                         borderRadius:'50%', background:'rgba(255,255,255,0.03)', pointerEvents:'none' }} />
//           <div style={{ position:'absolute', bottom:-40, left:-40, width:140, height:140,
//                         borderRadius:'50%', background:'rgba(255,255,255,0.03)', pointerEvents:'none' }} />

//           {/* Driver info row */}
//           <div style={{ display:'flex', alignItems:'center', gap:14, marginBottom:20, position:'relative', zIndex:1 }}>

//             {/* Avatar */}
//             <div style={{ position:'relative', flexShrink:0 }}>
//               <div style={{ width:64, height:64, borderRadius:'50%',
//                             background:'rgba(255,255,255,0.15)', backdropFilter:'blur(8px)',
//                             border:'2px solid rgba(255,255,255,0.25)',
//                             display:'flex', alignItems:'center', justifyContent:'center',
//                             color:'#fff', fontSize:22, fontWeight:900 }}>
//                 {initials}
//               </div>
//               <div style={{ position:'absolute', bottom:1, right:1, width:16, height:16,
//                             borderRadius:'50%', border:'2.5px solid rgba(255,255,255,0.2)',
//                             background: isOnline ? '#34d399' : '#9ca3af',
//                             boxShadow: isOnline ? '0 0 8px #34d399' : 'none',
//                             transition:'all 0.4s' }} />
//             </div>

//             {/* Name & meta */}
//             <div style={{ flex:1 }}>
//               <h2 style={{ margin:'0 0 3px', fontSize:20, fontWeight:900, color:'#fff', letterSpacing:-0.5 }}>
//                 {driver?.name || 'Driver'}
//               </h2>
//               <p style={{ margin:'0 0 6px', fontSize:12, color:'rgba(255,255,255,0.6)' }}>
//                 🚗 {driver?.vehicleType || 'Car'}{driver?.licensePlate ? ` · ${driver.licensePlate}` : ''}
//               </p>
//               <div style={{ display:'flex', alignItems:'center', gap:2 }}>
//                 {[1,2,3,4,5].map(n => (
//                   <span key={n} style={{ fontSize:12,
//                     color: n <= Math.round(driver?.rating?.average||0) ? '#fbbf24' : 'rgba(255,255,255,0.2)' }}>★</span>
//                 ))}
//                 <span style={{ color:'rgba(255,255,255,0.5)', fontSize:11, marginLeft:5 }}>
//                   {driver?.rating?.average?.toFixed(1)||'0.0'} · {driver?.rating?.count||0} trips
//                 </span>
//               </div>
//             </div>

//             {/* ✅ TOGGLE BUTTON */}
//             <div style={{ textAlign:'center', flexShrink:0 }}>
//               <div style={{ fontSize:9, color:'rgba(255,255,255,0.5)', fontWeight:700,
//                             letterSpacing:1.5, marginBottom:7 }}>AVAILABILITY</div>
//               <button
//                 className="fc-toggle"
//                 onClick={toggleAvailability}
//                 disabled={toggling}
//                 style={{
//                   padding:'11px 20px', borderRadius:14, border:'none',
//                   fontFamily:"'Nunito',sans-serif", fontWeight:800, fontSize:13,
//                   cursor: toggling ? 'not-allowed' : 'pointer',
//                   transition:'all 0.25s ease',
//                   display:'flex', alignItems:'center', justifyContent:'center', gap:7,
//                   minWidth:118, color:'#fff',
//                   background: isOnline
//                     ? 'linear-gradient(135deg,#34d399,#059669)'
//                     : 'rgba(255,255,255,0.1)',
//                   boxShadow: isOnline ? '0 4px 16px rgba(52,211,153,0.35)' : 'none',
//                   outline: isOnline ? 'none' : '1.5px solid rgba(255,255,255,0.2)',
//                   opacity: toggling ? 0.7 : 1,
//                 }}
//               >
//                 {toggling ? (
//                   <>
//                     <div style={{ width:12, height:12, border:'2px solid rgba(255,255,255,0.3)',
//                                   borderTop:'2px solid #fff', borderRadius:'50%',
//                                   animation:'spin 0.6s linear infinite' }} />
//                     Please wait
//                   </>
//                 ) : isOnline ? '● Online' : '○ Go Online'}
//               </button>
//               <div style={{ fontSize:10, fontWeight:600, marginTop:5, transition:'color 0.3s',
//                             color: isOnline ? '#6ee7b7' : 'rgba(255,255,255,0.35)' }}>
//                 {isOnline ? 'Receiving orders' : 'Tap to go live'}
//               </div>
//             </div>
//           </div>

//           {/* Stats row */}
//           <div style={{ display:'flex', background:'rgba(0,0,0,0.2)', borderRadius:14,
//                         overflow:'hidden', position:'relative', zIndex:1 }}>
//             {[
//               { icon:'📦', val:pendingOrders.length, lbl:'Pending',     color:'#fbbf24' },
//               { icon:'🚚', val:currentOrders.length, lbl:'In Progress', color:'#60a5fa' },
//               { icon:'✅', val:driver?.completedOrders?.length||0, lbl:'Completed', color:'#34d399' },
//             ].map(({ icon, val, lbl, color }, i) => (
//               <div key={lbl} style={{ flex:1, display:'flex', flexDirection:'column',
//                                       alignItems:'center', gap:3, padding:'13px 8px',
//                                       borderRight: i<2 ? '1px solid rgba(255,255,255,0.08)' : 'none' }}>
//                 <span style={{ fontSize:18 }}>{icon}</span>
//                 <span style={{ fontSize:24, fontWeight:900, color, lineHeight:1 }}>{val}</span>
//                 <span style={{ fontSize:10, color:'rgba(255,255,255,0.5)', fontWeight:700 }}>{lbl}</span>
//               </div>
//             ))}
//           </div>
//         </div>

//         {/* ── TABS + ORDERS — two column on wide screens ── */}
//         <div style={{ display:'grid', gridTemplateColumns:'1fr 2fr', gap:20, alignItems:'start' }}>

//           {/* Left column — tabs + quick stats */}
//           <div>
//             <div style={{ display:'flex', flexDirection:'column', gap:10, marginBottom:16 }}>
//               {[
//                 { key:'pending', icon:'📥', label:'Pending Orders',  count:pendingOrders.length },
//                 { key:'current', icon:'🚚', label:'Active Deliveries', count:currentOrders.length },
//               ].map(({ key, icon, label, count }) => (
//                 <button key={key} className="fc-tab" onClick={() => setTab(key)} style={{
//                   width:'100%', padding:'16px 20px', borderRadius:16, cursor:'pointer',
//                   fontFamily:"'Nunito',sans-serif", fontWeight:800, fontSize:15,
//                   transition:'all 0.2s ease', textAlign:'left',
//                   border: `2px solid ${tab===key ? '#064e3b' : '#e5e7eb'}`,
//                   background: tab===key ? '#064e3b' : '#fff',
//                   color:      tab===key ? '#fff'    : '#4b5563',
//                   boxShadow:  tab===key ? '0 4px 16px rgba(6,79,58,0.2)' : '0 2px 8px rgba(0,0,0,0.04)',
//                   display:'flex', alignItems:'center', justifyContent:'space-between',
//                 }}>
//                   <span>{icon} {label}</span>
//                   <span style={{
//                     padding:'4px 12px', borderRadius:20, fontSize:14, fontWeight:900,
//                     background: tab===key ? 'rgba(255,255,255,0.18)' : '#f3f4f6',
//                     color:      tab===key ? '#fff' : '#6b7280',
//                   }}>{count}</span>
//                 </button>
//               ))}
//             </div>

//             {/* Quick info card */}
//             <div style={{ background:'#fff', borderRadius:20, padding:20,
//                           boxShadow:'0 4px 20px rgba(0,0,0,0.05)', border:'1.5px solid #d1fae5' }}>
//               <h4 style={{ margin:'0 0 14px', fontSize:13, fontWeight:800,
//                            color:'#064e3b', textTransform:'uppercase', letterSpacing:0.5 }}>
//                 Quick Info
//               </h4>
//               {[
//                 { label:'Vehicle',  value: `${driver?.vehicleType||'—'} ${driver?.licensePlate ? '· '+driver.licensePlate : ''}` },
//                 { label:'Rating',   value: `⭐ ${driver?.rating?.average?.toFixed(1)||'0.0'} (${driver?.rating?.count||0} trips)` },
//                 { label:'Status',   value: isOnline ? '🟢 Online' : '🔴 Offline' },
//                 { label:'Max Load', value: `${driver?.maxCarryWeightKg||20} kg` },
//               ].map(({ label, value }) => (
//                 <div key={label} style={{ display:'flex', justifyContent:'space-between',
//                                           padding:'8px 0', borderBottom:'1px solid #f0fdf4',
//                                           fontSize:13 }}>
//                   <span style={{ color:'#9ca3af', fontWeight:600 }}>{label}</span>
//                   <span style={{ color:'#064e3b', fontWeight:700 }}>{value}</span>
//                 </div>
//               ))}
//             </div>
//           </div>

//           {/* Right column — orders list */}
//           <div>
//             <div style={{ display:'flex', flexDirection:'column', gap:12 }}>
//               {shown.length === 0 ? (
//                 <div style={{ textAlign:'center', padding:'64px 24px', background:'#fff',
//                               borderRadius:20, boxShadow:'0 4px 20px rgba(0,0,0,0.05)',
//                               border:'1.5px solid #d1fae5' }}>
//                   <div style={{ fontSize:56, marginBottom:12 }}>{tab==='pending' ? '📭' : '🏁'}</div>
//                   <h3 style={{ margin:'0 0 6px', fontSize:18, fontWeight:800, color:'#064e3b' }}>
//                     {tab==='pending' ? 'No pending assignments' : 'No active deliveries'}
//                   </h3>
//                   <p style={{ margin:'0 0 20px', fontSize:14, color:'#9ca3af' }}>
//                     {tab==='pending'
//                       ? isOnline ? 'Orders will appear here when assigned' : 'Go online to receive orders'
//                       : 'Accepted orders will appear here'}
//                   </p>
//                   {!isOnline && tab==='pending' && (
//                     <button onClick={toggleAvailability} style={{
//                       padding:'12px 32px', borderRadius:12, border:'none', cursor:'pointer',
//                       background:'linear-gradient(90deg,#065f46,#047857)', color:'#fff',
//                       fontWeight:800, fontSize:14, fontFamily:"'Nunito',sans-serif",
//                       boxShadow:'0 4px 16px rgba(6,95,70,0.3)',
//                     }}>Go Online →</button>
//                   )}
//                 </div>
//               ) : (
//                 shown.map((order, i) => (
//                   <div key={order.orderId || order._id} className="fc-order"
//                        style={{ animationDelay:`${i*0.06}s` }}>
//                     <OrderCard
//                       order={order}
//                       type={tab}
//                       onAccept={() => handleAccept(order.orderId || order._id)}
//                       onReject={() => handleReject(order.orderId || order._id)}
//                       onComplete={() => handleComplete(order.orderId || order._id)}
//                     />
//                   </div>
//                 ))
//               )}
//             </div>
//           </div>

//         </div>
//       </div>
//     </div>
//   );
// }

// function Loading() {
//   return (
//     <div style={{ display:'flex', justifyContent:'center', alignItems:'center',
//                   height:'100vh', background:'#f0fdf4', flexDirection:'column', gap:16,
//                   fontFamily:"'Nunito',sans-serif" }}>
//       <style>{'@keyframes spin { to { transform: rotate(360deg); } }'}</style>
//       <div style={{ position:'relative', width:56, height:56 }}>
//         <div style={{ width:56, height:56, border:'4px solid #d1fae5',
//                       borderTop:'4px solid #047857', borderRadius:'50%',
//                       animation:'spin 0.8s linear infinite' }} />
//         <span style={{ position:'absolute', top:'50%', left:'50%',
//                        transform:'translate(-50%,-50%)', fontSize:20 }}>🌿</span>
//       </div>
//       <p style={{ color:'#047857', fontWeight:800, fontSize:15 }}>Loading dashboard…</p>
//     </div>
//   );
// }

// src/pages/DriverDashboardPage.jsx
import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { driverApi } from '../api/deliveryApi';
import { useSocket } from '../context/SocketContext';
import OrderCard from '../components/OrderCard';
import AssignmentToast from '../components/AssignmentToast';

// ── Mock data (shown when backend has no real orders) ────────────────────────
const MOCK_PENDING = [
  {
    orderId: 'ORD-001',
    _id: 'mock-001',
    restaurantName: 'FreshMart Colombo 03',
    customerAddress: '45/A, Galle Road, Dehiwala',
    totalAmount: 2450,
    items: [{ name: 'Organic Carrots' }, { name: 'Spinach' }, { name: 'Milk 1L' }],
    status: 'ready_for_pickup',
    driverAssignmentStatus: 'pending',
    restaurantLocation: { latitude: 6.9271, longitude: 79.8612 },
    createdAt: new Date(Date.now() - 8 * 60000).toISOString(),
  },
  {
    orderId: 'ORD-002',
    _id: 'mock-002',
    restaurantName: 'Green Basket Nugegoda',
    customerAddress: '12, High Level Road, Maharagama',
    totalAmount: 1875,
    items: [{ name: 'Tomatoes 1kg' }, { name: 'Onions' }],
    status: 'ready_for_pickup',
    driverAssignmentStatus: 'pending',
    restaurantLocation: { latitude: 6.8731, longitude: 79.8882 },
    createdAt: new Date(Date.now() - 15 * 60000).toISOString(),
  },
  {
    orderId: 'ORD-003',
    _id: 'mock-003',
    restaurantName: 'FreshCart Boralesgamuwa',
    customerAddress: '78, Nawala Road, Rajagiriya',
    totalAmount: 3200,
    items: [{ name: 'Chicken 1kg' }, { name: 'Potatoes' }, { name: 'Yogurt' }, { name: 'Eggs 12pc' }],
    status: 'ready_for_pickup',
    driverAssignmentStatus: 'pending',
    restaurantLocation: { latitude: 6.8456, longitude: 79.9012 },
    createdAt: new Date(Date.now() - 22 * 60000).toISOString(),
  },
];

const MOCK_ACTIVE = [
  {
    orderId: 'ORD-004',
    _id: 'mock-004',
    restaurantName: 'SuperMart Kollupitiya',
    customerAddress: '23, Flower Road, Colombo 07',
    totalAmount: 1650,
    items: [{ name: 'Rice 5kg' }, { name: 'Coconut Oil' }],
    status: 'in_transit',
    driverAssignmentStatus: 'accepted',
    createdAt: new Date(Date.now() - 35 * 60000).toISOString(),
  },
];
// ────────────────────────────────────────────────────────────────────────────

export default function DriverDashboardPage({ driverId }) {
  const navigate = useNavigate();
  const [driver, setDriver]               = useState(null);
  const [pendingOrders, setPendingOrders] = useState([]);
  const [currentOrders, setCurrentOrders] = useState([]);
  const [loading, setLoading]             = useState(true);
  const [toggling, setToggling]           = useState(false);
  const [isOnline, setIsOnline]           = useState(false);
  const [tab, setTab]                     = useState('pending');
  const [useMock, setUseMock]             = useState(false);
  const { connected, newAssignment, clearAssignment, goOnline, goOffline } = useSocket();

  const fetchAll = useCallback(async () => {
    if (!driverId) { setLoading(false); return; }
    try {
      const [driverRes, pending, current] = await Promise.all([
        driverApi.getById(driverId),
        driverApi.getPendingAssignments(driverId),
        driverApi.getCurrentOrders(driverId),
      ]);
      const d = driverRes.driver || driverRes;
      setDriver(d);
      setIsOnline(d?.isAvailable || false);
      const realPending = Array.isArray(pending) ? pending : [];
      const realCurrent = Array.isArray(current) ? current : [];
      // Use mock data if no real orders exist
      if (realPending.length === 0 && realCurrent.length === 0) {
        setUseMock(true);
        setPendingOrders(MOCK_PENDING);
        setCurrentOrders(MOCK_ACTIVE);
      } else {
        setUseMock(false);
        setPendingOrders(realPending);
        setCurrentOrders(realCurrent);
      }
    } catch (err) {
      console.error(err);
      setUseMock(true);
      setPendingOrders(MOCK_PENDING);
      setCurrentOrders(MOCK_ACTIVE);
    } finally {
      setLoading(false);
    }
  }, [driverId]);

  useEffect(() => { fetchAll(); }, [fetchAll]);
  useEffect(() => { if (newAssignment) { fetchAll(); } }, [newAssignment, fetchAll]);

  const toggleAvailability = async () => {
    if (!driver || toggling) return;
    setToggling(true);
    const next = !isOnline;
    setIsOnline(next);
    try {
      await driverApi.updateAvailability(driverId, next);
      if (next) goOnline(driverId, driver.currentLocation || { latitude: 6.9271, longitude: 79.8612 });
      else goOffline(driverId);
      setDriver(d => ({ ...d, isAvailable: next }));
    } catch (err) {
      console.error(err);
      setIsOnline(!next);
    } finally { setToggling(false); }
  };

  const handleAccept = async (orderId) => {
    if (useMock) {
      // Move from pending to active in mock mode
      const order = pendingOrders.find(o => (o.orderId||o._id) === orderId);
      if (order) {
        setPendingOrders(p => p.filter(o => (o.orderId||o._id) !== orderId));
        setCurrentOrders(c => [...c, { ...order, status:'in_transit', driverAssignmentStatus:'accepted' }]);
      }
      return;
    }
    try { await driverApi.acceptOrder(driverId, orderId); await fetchAll(); }
    catch (err) { console.error(err); }
  };

  const handleReject = async (orderId) => {
    if (useMock) {
      setPendingOrders(p => p.filter(o => (o.orderId||o._id) !== orderId));
      return;
    }
    try { await driverApi.rejectOrder(driverId, orderId, 'Driver unavailable'); await fetchAll(); }
    catch (err) { console.error(err); }
  };

  const handleComplete = async (orderId) => {
    if (useMock) {
      setCurrentOrders(c => c.filter(o => (o.orderId||o._id) !== orderId));
      return;
    }
    try { await driverApi.completeDelivery(driverId, orderId); await fetchAll(); }
    catch (err) { console.error(err); }
  };

  if (loading) return <Loading />;

  if (!driverId) {
    return (
      <div style={{ minHeight:'100vh', background:'#f0fdf4', display:'flex', alignItems:'center',
                    justifyContent:'center', flexDirection:'column', gap:16, fontFamily:"'Nunito',sans-serif" }}>
        <div style={{ fontSize:56 }}>🚗</div>
        <h2 style={{ margin:0, color:'#064e3b', fontWeight:900 }}>No driver ID found</h2>
        <p style={{ margin:0, color:'#6b7280' }}>Please register as a driver first</p>
        <a href="/driver/register" style={{ padding:'12px 28px', borderRadius:12,
          background:'linear-gradient(90deg,#065f46,#047857)', color:'#fff',
          fontWeight:800, fontSize:14, textDecoration:'none' }}>Register Now →</a>
      </div>
    );
  }

  const shown    = tab === 'pending' ? pendingOrders : currentOrders;
  const initials = driver?.name?.split(' ').map(w => w[0]).join('').toUpperCase().slice(0,2) || '?';

  return (
    <div style={{ minHeight:'100vh', background:'#f0fdf4', fontFamily:"'Nunito',sans-serif" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Nunito:wght@400;600;700;800;900&display=swap');
        @keyframes spin    { to { transform: rotate(360deg); } }
        @keyframes fadeUp  { from{transform:translateY(12px);opacity:0} to{transform:translateY(0);opacity:1} }
        @keyframes ping    { 0%{transform:scale(1);opacity:0.8} 100%{transform:scale(2.5);opacity:0} }
        .fc-order { animation: fadeUp 0.3s ease both; }
        .fc-toggle:hover:not(:disabled) { transform: scale(1.03); }
        .fc-toggle:active:not(:disabled) { transform: scale(0.97); }
        .fc-tab:hover { opacity: 0.88; }
      `}</style>

      {newAssignment && (
        <AssignmentToast
          assignment={newAssignment}
          onAccept={() => { handleAccept(newAssignment.orderId); clearAssignment(); }}
          onReject={() => { handleReject(newAssignment.orderId); clearAssignment(); }}
          onDismiss={clearAssignment}
        />
      )}

      {/* ── HEADER ── */}
      <header style={{ background:'linear-gradient(90deg,#052e16,#064e3b)', padding:'14px 32px',
                       display:'flex', justifyContent:'space-between', alignItems:'center',
                       boxShadow:'0 4px 24px rgba(0,0,0,0.25)', position:'sticky', top:0, zIndex:100 }}>
        <div style={{ display:'flex', alignItems:'center', gap:10 }}>
          <div style={{ width:36, height:36, borderRadius:10, background:'rgba(255,255,255,0.12)',
                        display:'flex', alignItems:'center', justifyContent:'center', fontSize:20 }}>🌿</div>
          <div>
            <div style={{ color:'#fff', fontWeight:900, fontSize:16, letterSpacing:-0.5 }}>FreshCart</div>
            <div style={{ color:'#6ee7b7', fontSize:9, fontWeight:700, letterSpacing:2 }}>DRIVER PORTAL</div>
          </div>
        </div>
        <div style={{ display:'flex', alignItems:'center', gap:10 }}>
          {useMock && (
            <span style={{ fontSize:10, fontWeight:700, padding:'4px 10px', borderRadius:20,
                           background:'rgba(251,191,36,0.2)', color:'#fbbf24', border:'1px solid rgba(251,191,36,0.3)' }}>
              Demo Mode
            </span>
          )}
          <div style={{ display:'flex', alignItems:'center', gap:8, background:'rgba(255,255,255,0.08)',
                        border:'1px solid rgba(255,255,255,0.12)', borderRadius:20, padding:'6px 14px' }}>
            <div style={{ position:'relative', width:10, height:10 }}>
              {connected && <div style={{ position:'absolute', inset:0, borderRadius:'50%',
                                           background:'#34d399', animation:'ping 1.5s ease-out infinite' }} />}
              <div style={{ position:'relative', width:10, height:10, borderRadius:'50%',
                            background: connected ? '#34d399' : '#f87171',
                            boxShadow: connected ? '0 0 8px #34d399' : 'none' }} />
            </div>
            <span style={{ color:'#d1fae5', fontSize:12, fontWeight:700 }}>
              {connected ? 'Live' : 'Disconnected'}
            </span>
          </div>
          <button onClick={() => navigate('/driver/profile')} title="View Profile"
            style={{ width:38, height:38, borderRadius:'50%', border:'2px solid rgba(255,255,255,0.25)',
                     background:'linear-gradient(135deg,#065f46,#10b981)', color:'#fff',
                     fontSize:15, fontWeight:900, cursor:'pointer', display:'flex',
                     alignItems:'center', justifyContent:'center', flexShrink:0,
                     transition:'transform 0.15s', boxShadow:'0 2px 8px rgba(0,0,0,0.2)' }}
            onMouseEnter={e => e.currentTarget.style.transform='scale(1.1)'}
            onMouseLeave={e => e.currentTarget.style.transform='scale(1)'}>
            {initials}
          </button>
        </div>
      </header>

      <div style={{ maxWidth:1200, margin:'0 auto', padding:'20px 32px 48px' }}>

        {/* ── HERO CARD ── */}
        <div style={{ borderRadius:24, padding:'28px 32px 24px', marginBottom:20,
                      position:'relative', overflow:'hidden',
                      background: isOnline
                        ? 'linear-gradient(145deg,#052e16 0%,#065f46 60%,#047857 100%)'
                        : 'linear-gradient(145deg,#111827 0%,#1f2937 60%,#374151 100%)',
                      boxShadow: isOnline ? '0 16px 48px rgba(6,79,58,0.4)' : '0 16px 48px rgba(0,0,0,0.3)',
                      transition:'background 0.6s ease, box-shadow 0.6s ease' }}>
          <div style={{ position:'absolute', top:-60, right:-60, width:200, height:200,
                        borderRadius:'50%', background:'rgba(255,255,255,0.03)', pointerEvents:'none' }} />
          <div style={{ position:'absolute', bottom:-40, left:-40, width:140, height:140,
                        borderRadius:'50%', background:'rgba(255,255,255,0.03)', pointerEvents:'none' }} />

          <div style={{ display:'flex', alignItems:'center', gap:20, marginBottom:20, position:'relative', zIndex:1 }}>
            <div style={{ position:'relative', flexShrink:0 }}>
              <div style={{ width:72, height:72, borderRadius:'50%',
                            background:'rgba(255,255,255,0.15)', backdropFilter:'blur(8px)',
                            border:'2px solid rgba(255,255,255,0.25)',
                            display:'flex', alignItems:'center', justifyContent:'center',
                            color:'#fff', fontSize:26, fontWeight:900 }}>{initials}</div>
              <div style={{ position:'absolute', bottom:1, right:1, width:18, height:18,
                            borderRadius:'50%', border:'2.5px solid rgba(255,255,255,0.2)',
                            background: isOnline ? '#34d399' : '#9ca3af',
                            boxShadow: isOnline ? '0 0 8px #34d399' : 'none', transition:'all 0.4s' }} />
            </div>
            <div style={{ flex:1 }}>
              <h2 style={{ margin:'0 0 4px', fontSize:22, fontWeight:900, color:'#fff', letterSpacing:-0.5 }}>
                {driver?.name || 'Driver'}
              </h2>
              <p style={{ margin:'0 0 6px', fontSize:13, color:'rgba(255,255,255,0.6)' }}>
                🚗 {driver?.vehicleType||'Car'}{driver?.licensePlate ? ` · ${driver.licensePlate}` : ''}
              </p>
              <div style={{ display:'flex', alignItems:'center', gap:2 }}>
                {[1,2,3,4,5].map(n => (
                  <span key={n} style={{ fontSize:13,
                    color: n<=Math.round(driver?.rating?.average||0) ? '#fbbf24' : 'rgba(255,255,255,0.2)' }}>★</span>
                ))}
                <span style={{ color:'rgba(255,255,255,0.5)', fontSize:12, marginLeft:6 }}>
                  {driver?.rating?.average?.toFixed(1)||'0.0'} · {driver?.rating?.count||0} trips
                </span>
              </div>
            </div>
            <div style={{ textAlign:'center', flexShrink:0 }}>
              <div style={{ fontSize:9, color:'rgba(255,255,255,0.5)', fontWeight:700, letterSpacing:1.5, marginBottom:7 }}>AVAILABILITY</div>
              <button className="fc-toggle" onClick={toggleAvailability} disabled={toggling}
                style={{ padding:'12px 24px', borderRadius:14, border:'none',
                         fontFamily:"'Nunito',sans-serif", fontWeight:800, fontSize:14,
                         cursor: toggling ? 'not-allowed' : 'pointer', transition:'all 0.25s ease',
                         display:'flex', alignItems:'center', justifyContent:'center', gap:8,
                         minWidth:130, color:'#fff',
                         background: isOnline ? 'linear-gradient(135deg,#34d399,#059669)' : 'rgba(255,255,255,0.1)',
                         boxShadow: isOnline ? '0 4px 16px rgba(52,211,153,0.35)' : 'none',
                         outline: isOnline ? 'none' : '1.5px solid rgba(255,255,255,0.2)',
                         opacity: toggling ? 0.7 : 1 }}>
                {toggling ? (
                  <><div style={{ width:13, height:13, border:'2px solid rgba(255,255,255,0.3)',
                                  borderTop:'2px solid #fff', borderRadius:'50%',
                                  animation:'spin 0.6s linear infinite' }} />Please wait</>
                ) : isOnline ? '● Online' : '○ Go Online'}
              </button>
              <div style={{ fontSize:10, fontWeight:600, marginTop:6, transition:'color 0.3s',
                            color: isOnline ? '#6ee7b7' : 'rgba(255,255,255,0.35)' }}>
                {isOnline ? 'Receiving orders' : 'Tap to go live'}
              </div>
            </div>
          </div>

          <div style={{ display:'flex', background:'rgba(0,0,0,0.2)', borderRadius:14,
                        overflow:'hidden', position:'relative', zIndex:1 }}>
            {[
              { icon:'📦', val:pendingOrders.length, lbl:'Pending',     color:'#fbbf24' },
              { icon:'🚚', val:currentOrders.length, lbl:'In Progress', color:'#60a5fa' },
              { icon:'✅', val:driver?.completedOrders?.length||0, lbl:'Completed', color:'#34d399' },
            ].map(({ icon, val, lbl, color }, i) => (
              <div key={lbl} style={{ flex:1, display:'flex', flexDirection:'column', alignItems:'center',
                                      gap:3, padding:'14px 8px',
                                      borderRight: i<2 ? '1px solid rgba(255,255,255,0.08)' : 'none' }}>
                <span style={{ fontSize:20 }}>{icon}</span>
                <span style={{ fontSize:26, fontWeight:900, color, lineHeight:1 }}>{val}</span>
                <span style={{ fontSize:10, color:'rgba(255,255,255,0.5)', fontWeight:700 }}>{lbl}</span>
              </div>
            ))}
          </div>
        </div>

        {/* ── TWO COLUMN ── */}
        <div style={{ display:'grid', gridTemplateColumns:'1fr 2fr', gap:20, alignItems:'start' }}>

          {/* Left */}
          <div>
            <div style={{ display:'flex', flexDirection:'column', gap:10, marginBottom:16 }}>
              {[
                { key:'pending', icon:'📥', label:'Pending Orders',    count:pendingOrders.length },
                { key:'current', icon:'🚚', label:'Active Deliveries', count:currentOrders.length },
              ].map(({ key, icon, label, count }) => (
                <button key={key} className="fc-tab" onClick={() => setTab(key)} style={{
                  width:'100%', padding:'16px 20px', borderRadius:16, cursor:'pointer',
                  fontFamily:"'Nunito',sans-serif", fontWeight:800, fontSize:15,
                  transition:'all 0.2s ease', textAlign:'left',
                  border: `2px solid ${tab===key ? '#064e3b' : '#e5e7eb'}`,
                  background: tab===key ? '#064e3b' : '#fff',
                  color:      tab===key ? '#fff'    : '#4b5563',
                  boxShadow:  tab===key ? '0 4px 16px rgba(6,79,58,0.2)' : '0 2px 8px rgba(0,0,0,0.04)',
                  display:'flex', alignItems:'center', justifyContent:'space-between' }}>
                  <span>{icon} {label}</span>
                  <span style={{ padding:'4px 12px', borderRadius:20, fontSize:14, fontWeight:900,
                                 background: tab===key ? 'rgba(255,255,255,0.18)' : '#f3f4f6',
                                 color:      tab===key ? '#fff' : '#6b7280' }}>{count}</span>
                </button>
              ))}
            </div>

            <div style={{ background:'#fff', borderRadius:20, padding:20,
                          boxShadow:'0 4px 20px rgba(0,0,0,0.05)', border:'1.5px solid #d1fae5' }}>
              <h4 style={{ margin:'0 0 14px', fontSize:13, fontWeight:800,
                           color:'#064e3b', textTransform:'uppercase', letterSpacing:0.5 }}>Quick Info</h4>
              {[
                { label:'Vehicle',  value:`${driver?.vehicleType||'—'}${driver?.licensePlate ? ' · '+driver.licensePlate : ''}` },
                { label:'Rating',   value:`⭐ ${driver?.rating?.average?.toFixed(1)||'0.0'} (${driver?.rating?.count||0} trips)` },
                { label:'Status',   value: isOnline ? '🟢 Online' : '🔴 Offline' },
                { label:'Max Load', value:`${driver?.maxCarryWeightKg||20} kg` },
              ].map(({ label, value }) => (
                <div key={label} style={{ display:'flex', justifyContent:'space-between',
                                          padding:'8px 0', borderBottom:'1px solid #f0fdf4', fontSize:13 }}>
                  <span style={{ color:'#9ca3af', fontWeight:600 }}>{label}</span>
                  <span style={{ color:'#064e3b', fontWeight:700 }}>{value}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Right — orders */}
          <div>
            {useMock && (
              <div style={{ background:'rgba(251,191,36,0.1)', border:'1px solid rgba(251,191,36,0.3)',
                            borderRadius:12, padding:'10px 16px', marginBottom:14,
                            display:'flex', alignItems:'center', gap:8 }}>
                <span style={{ fontSize:16 }}>⚠️</span>
                <span style={{ fontSize:13, color:'#b45309', fontWeight:600 }}>
                  Showing demo orders — connect your backend to see real assignments
                </span>
              </div>
            )}
            <div style={{ display:'flex', flexDirection:'column', gap:12 }}>
              {shown.length === 0 ? (
                <div style={{ textAlign:'center', padding:'64px 24px', background:'#fff',
                              borderRadius:20, boxShadow:'0 4px 20px rgba(0,0,0,0.05)',
                              border:'1.5px solid #d1fae5' }}>
                  <div style={{ fontSize:56, marginBottom:12 }}>{tab==='pending' ? '📭' : '🏁'}</div>
                  <h3 style={{ margin:'0 0 6px', fontSize:18, fontWeight:800, color:'#064e3b' }}>
                    {tab==='pending' ? 'No pending assignments' : 'No active deliveries'}
                  </h3>
                  <p style={{ margin:'0 0 20px', fontSize:14, color:'#9ca3af' }}>
                    {tab==='pending'
                      ? isOnline ? 'Orders will appear here when assigned' : 'Go online to receive orders'
                      : 'Accepted orders will appear here'}
                  </p>
                  {!isOnline && tab==='pending' && (
                    <button onClick={toggleAvailability} style={{
                      padding:'12px 32px', borderRadius:12, border:'none', cursor:'pointer',
                      background:'linear-gradient(90deg,#065f46,#047857)', color:'#fff',
                      fontWeight:800, fontSize:14, fontFamily:"'Nunito',sans-serif",
                      boxShadow:'0 4px 16px rgba(6,95,70,0.3)' }}>Go Online →</button>
                  )}
                </div>
              ) : (
                shown.map((order, i) => (
                  <div key={order.orderId || order._id} className="fc-order"
                       style={{ animationDelay:`${i*0.06}s` }}>
                    <OrderCard
                      order={order}
                      type={tab}
                      onAccept={() => handleAccept(order.orderId || order._id)}
                      onReject={() => handleReject(order.orderId || order._id)}
                      onComplete={() => handleComplete(order.orderId || order._id)}
                    />
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function Loading() {
  return (
    <div style={{ display:'flex', justifyContent:'center', alignItems:'center',
                  height:'100vh', background:'#f0fdf4', flexDirection:'column', gap:16,
                  fontFamily:"'Nunito',sans-serif" }}>
      <style>{'@keyframes spin { to { transform: rotate(360deg); } }'}</style>
      <div style={{ position:'relative', width:56, height:56 }}>
        <div style={{ width:56, height:56, border:'4px solid #d1fae5',
                      borderTop:'4px solid #047857', borderRadius:'50%',
                      animation:'spin 0.8s linear infinite' }} />
        <span style={{ position:'absolute', top:'50%', left:'50%',
                       transform:'translate(-50%,-50%)', fontSize:20 }}>🌿</span>
      </div>
      <p style={{ color:'#047857', fontWeight:800, fontSize:15 }}>Loading dashboard…</p>
    </div>
  );
}