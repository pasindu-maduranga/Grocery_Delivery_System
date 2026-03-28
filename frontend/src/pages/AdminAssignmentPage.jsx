// // src/pages/AdminAssignmentPage.jsx
// import React, { useState } from 'react';
// import { autoAssignmentApi, assignmentApi } from '../api/deliveryApi';

// export default function AdminAssignmentPage() {
//   const [autoRunning, setAutoRunning] = useState(false);
//   const [legacyRunning, setLegacyRunning] = useState(false);
//   const [logs, setLogs]               = useState([]);
//   const [intervalMs, setIntervalMs]   = useState(60000);

//   const log = (msg, type = 'info') => {
//     setLogs(l => [{ msg, type, time: new Date().toLocaleTimeString() }, ...l.slice(0, 99)]);
//   };

//   const callApi = async (fn, label) => {
//     try {
//       log(`→ ${label}…`, 'info');
//       await fn();
//       log(`✓ ${label} succeeded`, 'success');
//     } catch (err) {
//       log(`✕ ${label} failed: ${err.message}`, 'error');
//     }
//   };

//   const stats = [
//     { icon:'🤖', label:'Auto Engine',    value: autoRunning   ? 'Running' : 'Stopped', color: autoRunning   ? '#065f46' : '#6b7280', bg: autoRunning   ? '#d1fae5' : '#f3f4f6' },
//     { icon:'⏱',  label:'Legacy Service', value: legacyRunning ? 'Running' : 'Stopped', color: legacyRunning ? '#065f46' : '#6b7280', bg: legacyRunning ? '#d1fae5' : '#f3f4f6' },
//     { icon:'📋',  label:'Log Entries',   value: logs.length,   color: '#1d4ed8', bg: '#dbeafe' },
//     { icon:'⚡',  label:'Interval',      value: `${intervalMs/1000}s`,  color: '#7c3aed', bg: '#ede9fe' },
//   ];

//   return (
//     <div style={{ minHeight:'100vh', background:'#f0fdf4', fontFamily:"'Nunito',sans-serif" }}>
//       <style>{`
//         @import url('https://fonts.googleapis.com/css2?family=Nunito:wght@400;600;700;800;900&display=swap');
//         @keyframes ping  { 0%{transform:scale(1);opacity:0.8} 100%{transform:scale(2.2);opacity:0} }
//         @keyframes fadeUp{ from{transform:translateY(8px);opacity:0} to{transform:translateY(0);opacity:1} }
//         .adm-btn:hover:not(:disabled) { opacity:0.88; transform:translateY(-1px); }
//         .adm-btn:active:not(:disabled) { transform:translateY(0); }
//       `}</style>

//       {/* ── HEADER ── */}
//       <header style={{ background:'linear-gradient(90deg,#052e16,#064e3b)', padding:'14px 32px',
//                        display:'flex', alignItems:'center', justifyContent:'space-between',
//                        boxShadow:'0 4px 24px rgba(0,0,0,0.25)', position:'sticky', top:0, zIndex:100 }}>
//         <div style={{ display:'flex', alignItems:'center', gap:12 }}>
//           <div style={{ width:34, height:34, borderRadius:9, background:'rgba(255,255,255,0.12)',
//                         display:'flex', alignItems:'center', justifyContent:'center', fontSize:18 }}>🌿</div>
//           <div>
//             <div style={{ color:'#fff', fontWeight:900, fontSize:16, letterSpacing:-0.5 }}>FreshCart</div>
//             <div style={{ color:'#6ee7b7', fontSize:9, fontWeight:700, letterSpacing:2 }}>ADMIN PANEL</div>
//           </div>
//           <span style={{ background:'rgba(110,231,183,0.15)', color:'#6ee7b7', fontSize:11,
//                          fontWeight:700, padding:'4px 12px', borderRadius:20, marginLeft:4,
//                          border:'1px solid rgba(110,231,183,0.3)' }}>
//             Assignment Engine
//           </span>
//         </div>
//         <div style={{ display:'flex', alignItems:'center', gap:8 }}>
//           <div style={{ width:8, height:8, borderRadius:'50%',
//                         background: autoRunning||legacyRunning ? '#34d399' : '#9ca3af',
//                         boxShadow: autoRunning||legacyRunning ? '0 0 8px #34d399' : 'none' }} />
//           <span style={{ color:'#d1fae5', fontSize:13, fontWeight:700 }}>
//             {autoRunning||legacyRunning ? 'Engine Active' : 'Engine Idle'}
//           </span>
//         </div>
//       </header>

//       <div style={{ maxWidth:1200, margin:'0 auto', padding:'28px 32px 48px' }}>

//         {/* ── STATS STRIP ── */}
//         <div style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:16, marginBottom:24 }}>
//           {stats.map(({ icon, label, value, color, bg }) => (
//             <div key={label} style={{ background:'#fff', borderRadius:18, padding:'20px 24px',
//                                       boxShadow:'0 4px 16px rgba(0,0,0,0.06)',
//                                       border:'1.5px solid #d1fae5', display:'flex',
//                                       alignItems:'center', gap:14 }}>
//               <div style={{ width:44, height:44, borderRadius:14, background:bg, flexShrink:0,
//                             display:'flex', alignItems:'center', justifyContent:'center', fontSize:20 }}>
//                 {icon}
//               </div>
//               <div>
//                 <div style={{ fontSize:22, fontWeight:900, color }}>{value}</div>
//                 <div style={{ fontSize:12, color:'#9ca3af', fontWeight:600 }}>{label}</div>
//               </div>
//             </div>
//           ))}
//         </div>

//         {/* ── MAIN GRID ── */}
//         <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr 1fr', gap:20, marginBottom:24 }}>

//           {/* Auto Assignment */}
//           <div style={{ background:'#fff', borderRadius:20, padding:28,
//                         boxShadow:'0 4px 20px rgba(0,0,0,0.07)', border:'1.5px solid #d1fae5' }}>
//             <div style={{ display:'flex', alignItems:'center', gap:10, marginBottom:6 }}>
//               <div style={{ width:36, height:36, borderRadius:10, background:'#d1fae5',
//                             display:'flex', alignItems:'center', justifyContent:'center', fontSize:18 }}>🤖</div>
//               <div>
//                 <h3 style={{ margin:0, fontSize:15, fontWeight:800, color:'#064e3b' }}>Auto Assignment</h3>
//                 <p style={{ margin:0, fontSize:12, color:'#6b7280' }}>Assign drivers automatically</p>
//               </div>
//             </div>

//             <div style={{ margin:'20px 0 16px' }}>
//               <label style={{ display:'block', fontSize:11, fontWeight:700, color:'#374151',
//                               marginBottom:6, textTransform:'uppercase', letterSpacing:0.5 }}>
//                 Interval (ms)
//               </label>
//               <input type="number" value={intervalMs} min={5000} step={5000}
//                 onChange={e => setIntervalMs(Number(e.target.value))}
//                 style={{ width:'100%', padding:'10px 14px', borderRadius:10, fontSize:14,
//                          border:'1.5px solid #d1fae5', outline:'none', background:'#f9fafb',
//                          boxSizing:'border-box', fontFamily:"'Nunito',sans-serif" }} />
//             </div>

//             <div style={{ display:'flex', gap:10, marginBottom:10 }}>
//               <ActionBtn label="▶ Start" color="green" disabled={autoRunning}
//                 onClick={async () => {
//                   await callApi(() => autoAssignmentApi.start(), 'Start auto assignment');
//                   setAutoRunning(true);
//                 }} />
//               <ActionBtn label="■ Stop" color="red" disabled={!autoRunning}
//                 onClick={async () => {
//                   await callApi(() => autoAssignmentApi.stop(), 'Stop auto assignment');
//                   setAutoRunning(false);
//                 }} />
//             </div>
//             <ActionBtn label="⚡ Trigger Once" color="blue" fullWidth
//               onClick={() => callApi(() => autoAssignmentApi.trigger(), 'Manual trigger')} />

//             <div style={{ display:'flex', alignItems:'center', gap:8, marginTop:16,
//                           padding:'10px 14px', borderRadius:12,
//                           background: autoRunning ? '#f0fdf4' : '#f9fafb',
//                           border: `1px solid ${autoRunning ? '#d1fae5' : '#e5e7eb'}` }}>
//               <div style={{ position:'relative', width:10, height:10, flexShrink:0 }}>
//                 {autoRunning && <div style={{ position:'absolute', inset:0, borderRadius:'50%',
//                                                background:'#34d399', animation:'ping 1.5s ease-out infinite' }} />}
//                 <div style={{ position:'relative', width:10, height:10, borderRadius:'50%',
//                               background: autoRunning ? '#10b981' : '#9ca3af' }} />
//               </div>
//               <span style={{ fontSize:12, color: autoRunning ? '#065f46' : '#6b7280', fontWeight:700 }}>
//                 {autoRunning ? 'Auto-assignment is running' : 'Auto-assignment is stopped'}
//               </span>
//             </div>
//           </div>

//           {/* Legacy Assignment Service */}
//           <div style={{ background:'#fff', borderRadius:20, padding:28,
//                         boxShadow:'0 4px 20px rgba(0,0,0,0.07)', border:'1.5px solid #d1fae5' }}>
//             <div style={{ display:'flex', alignItems:'center', gap:10, marginBottom:6 }}>
//               <div style={{ width:36, height:36, borderRadius:10, background:'#ede9fe',
//                             display:'flex', alignItems:'center', justifyContent:'center', fontSize:18 }}>⏱</div>
//               <div>
//                 <h3 style={{ margin:0, fontSize:15, fontWeight:800, color:'#064e3b' }}>Assignment Service</h3>
//                 <p style={{ margin:0, fontSize:12, color:'#6b7280' }}>Interval-based process</p>
//               </div>
//             </div>

//             <div style={{ margin:'20px 0 16px', padding:'14px 16px', background:'#fef3c7',
//                           borderRadius:12, border:'1px solid #fcd34d' }}>
//               <p style={{ margin:0, fontSize:12, color:'#b45309', fontWeight:600 }}>
//                 ⚠️ Uses the same interval value set above
//               </p>
//             </div>

//             <div style={{ display:'flex', gap:10, marginBottom:10 }}>
//               <ActionBtn label="▶ Start" color="green" disabled={legacyRunning}
//                 onClick={async () => {
//                   await callApi(() => assignmentApi.start(intervalMs), 'Start assignment service');
//                   setLegacyRunning(true);
//                 }} />
//               <ActionBtn label="■ Stop" color="red" disabled={!legacyRunning}
//                 onClick={async () => {
//                   await callApi(() => assignmentApi.stop(), 'Stop assignment service');
//                   setLegacyRunning(false);
//                 }} />
//             </div>
//             <ActionBtn label="⚡ Run Manual" color="blue" fullWidth
//               onClick={() => callApi(() => assignmentApi.manual(), 'Manual assignment')} />

//             <div style={{ display:'flex', alignItems:'center', gap:8, marginTop:16,
//                           padding:'10px 14px', borderRadius:12,
//                           background: legacyRunning ? '#f0fdf4' : '#f9fafb',
//                           border: `1px solid ${legacyRunning ? '#d1fae5' : '#e5e7eb'}` }}>
//               <div style={{ position:'relative', width:10, height:10, flexShrink:0 }}>
//                 {legacyRunning && <div style={{ position:'absolute', inset:0, borderRadius:'50%',
//                                                 background:'#34d399', animation:'ping 1.5s ease-out infinite' }} />}
//                 <div style={{ position:'relative', width:10, height:10, borderRadius:'50%',
//                               background: legacyRunning ? '#10b981' : '#9ca3af' }} />
//               </div>
//               <span style={{ fontSize:12, color: legacyRunning ? '#065f46' : '#6b7280', fontWeight:700 }}>
//                 {legacyRunning ? 'Service is running' : 'Service is stopped'}
//               </span>
//             </div>
//           </div>

//           {/* Quick Actions */}
//           <div style={{ background:'#fff', borderRadius:20, padding:28,
//                         boxShadow:'0 4px 20px rgba(0,0,0,0.07)', border:'1.5px solid #d1fae5' }}>
//             <div style={{ display:'flex', alignItems:'center', gap:10, marginBottom:20 }}>
//               <div style={{ width:36, height:36, borderRadius:10, background:'#dbeafe',
//                             display:'flex', alignItems:'center', justifyContent:'center', fontSize:18 }}>⚡</div>
//               <div>
//                 <h3 style={{ margin:0, fontSize:15, fontWeight:800, color:'#064e3b' }}>Quick Actions</h3>
//                 <p style={{ margin:0, fontSize:12, color:'#6b7280' }}>One-click operations</p>
//               </div>
//             </div>

//             <div style={{ display:'flex', flexDirection:'column', gap:10 }}>
//               {[
//                 { label:'🔄 Trigger Auto Assignment', color:'blue',
//                   fn: () => callApi(() => autoAssignmentApi.trigger(), 'Trigger auto') },
//                 { label:'📋 Run Manual Assignment', color:'green',
//                   fn: () => callApi(() => assignmentApi.manual(), 'Manual assignment') },
//                 { label:'⏹ Stop All Services', color:'red',
//                   fn: async () => {
//                     await callApi(() => autoAssignmentApi.stop(), 'Stop auto');
//                     await callApi(() => assignmentApi.stop(), 'Stop legacy');
//                     setAutoRunning(false); setLegacyRunning(false);
//                   }},
//               ].map(({ label, color, fn }) => (
//                 <ActionBtn key={label} label={label} color={color} fullWidth onClick={fn} />
//               ))}
//             </div>

//             <div style={{ marginTop:20, padding:'14px 16px', background:'#f0fdf4',
//                           borderRadius:12, border:'1px solid #d1fae5' }}>
//               <p style={{ margin:'0 0 4px', fontSize:12, fontWeight:800, color:'#065f46' }}>
//                 💡 How it works
//               </p>
//               <p style={{ margin:0, fontSize:11, color:'#6b7280', lineHeight:1.5 }}>
//                 Auto-assignment fetches ready orders and assigns the nearest available driver automatically on a timer.
//               </p>
//             </div>
//           </div>
//         </div>

//         {/* ── ACTIVITY LOG ── */}
//         <div style={{ background:'#fff', borderRadius:20, overflow:'hidden',
//                       boxShadow:'0 4px 20px rgba(0,0,0,0.07)', border:'1.5px solid #d1fae5' }}>
//           <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center',
//                         padding:'18px 28px', borderBottom:'1.5px solid #f0fdf4',
//                         background:'linear-gradient(90deg,#f0fdf4,#fff)' }}>
//             <div style={{ display:'flex', alignItems:'center', gap:10 }}>
//               <span style={{ fontSize:18 }}>📋</span>
//               <h3 style={{ margin:0, fontSize:16, fontWeight:800, color:'#064e3b' }}>Activity Log</h3>
//               {logs.length > 0 && (
//                 <span style={{ background:'#d1fae5', color:'#065f46', fontSize:11, fontWeight:700,
//                                padding:'2px 10px', borderRadius:20 }}>{logs.length} entries</span>
//               )}
//             </div>
//             <button onClick={() => setLogs([])}
//               style={{ background:'none', border:'1.5px solid #d1fae5', borderRadius:10,
//                        padding:'6px 16px', fontSize:13, cursor:'pointer', color:'#6b7280',
//                        fontFamily:"'Nunito',sans-serif", fontWeight:600 }}>
//               Clear Log
//             </button>
//           </div>

//           <div style={{ padding:'8px 0', maxHeight:380, overflowY:'auto' }}>
//             {logs.length === 0 ? (
//               <div style={{ textAlign:'center', padding:'48px 0' }}>
//                 <p style={{ fontSize:36, margin:'0 0 10px' }}>📭</p>
//                 <p style={{ color:'#9ca3af', fontSize:14, fontWeight:600 }}>
//                   No activity yet — use the controls above
//                 </p>
//               </div>
//             ) : (
//               logs.map((l, i) => (
//                 <div key={i} style={{ display:'flex', gap:14, padding:'10px 28px',
//                                       alignItems:'center', fontSize:13,
//                                       borderBottom:'1px solid #f9fafb',
//                                       borderLeft:`4px solid ${
//                                         l.type==='success' ? '#34d399' :
//                                         l.type==='error'   ? '#f87171' : '#93c5fd'}`,
//                                       background: i===0 ? '#fafffe' : 'transparent',
//                                       animation: i===0 ? 'fadeUp 0.2s ease' : 'none' }}>
//                   <span style={{ color:'#9ca3af', flexShrink:0, fontSize:11,
//                                  fontWeight:700, minWidth:70 }}>{l.time}</span>
//                   <span style={{ width:8, height:8, borderRadius:'50%', flexShrink:0,
//                                  background: l.type==='success' ? '#34d399' :
//                                              l.type==='error'   ? '#f87171' : '#93c5fd' }} />
//                   <span style={{ color: l.type==='error'   ? '#b91c1c' :
//                                         l.type==='success' ? '#065f46' : '#374151',
//                                  fontWeight: l.type==='error' ? 700 : 500 }}>
//                     {l.msg}
//                   </span>
//                 </div>
//               ))
//             )}
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// }

// function ActionBtn({ label, color, onClick, disabled, fullWidth }) {
//   const bg = {
//     green: 'linear-gradient(90deg,#065f46,#047857)',
//     red:   'linear-gradient(90deg,#b91c1c,#dc2626)',
//     blue:  'linear-gradient(90deg,#1d4ed8,#2563eb)',
//   };
//   return (
//     <button className="adm-btn" onClick={onClick} disabled={disabled}
//       style={{ flex: fullWidth ? undefined : 1, width: fullWidth ? '100%' : undefined,
//                padding:'12px 0', borderRadius:12, border:'none',
//                background: disabled ? '#e5e7eb' : bg[color],
//                color: disabled ? '#9ca3af' : '#fff', fontWeight:800, fontSize:14,
//                cursor: disabled ? 'not-allowed' : 'pointer',
//                transition:'all 0.2s', marginTop: fullWidth ? 0 : 0,
//                fontFamily:"'Nunito',sans-serif",
//                boxShadow: disabled ? 'none' : '0 2px 8px rgba(0,0,0,0.15)' }}>
//       {label}
//     </button>
//   );
// }

// src/pages/AdminAssignmentPage.jsx
import React, { useState, useEffect, useCallback } from 'react'; // CHANGE 1: added useEffect, useCallback
import { autoAssignmentApi, assignmentApi } from '../api/deliveryApi';

// ── CHANGE 2: Import the token helper so we can hit the order service ─────────
// Replace '/api' with whatever your order-service base URL env var is.
const ORDER_API = import.meta.env.VITE_ORDER_API_URL || 'http://localhost:5004/api';
const DELIVERY_API = import.meta.env.VITE_DELIVERY_API_URL || 'http://localhost:5005/api';

const authHeaders = () => ({
  'Content-Type': 'application/json',
  Authorization: `Bearer ${localStorage.getItem('token')}`,
});

// Fetch orders that are status='ready' (ready for driver pickup)
const fetchReadyOrders = () =>
  fetch(`${ORDER_API}/orders/ready`, { headers: authHeaders() })
    .then(r => r.json()).then(d => d.data || []);

// Fetch drivers that are currently available/online
const fetchAvailableDrivers = () =>
  fetch(`${DELIVERY_API}/drivers/available`, { headers: authHeaders() })
    .then(r => r.json())
    .then(d => d.data || []);

    

// Assign a driver to an order (updates status to out_for_delivery)
const assignDriverToOrder = (orderId, driverId) =>
  fetch(`${DELIVERY_API}/drivers/assign-order`, {
    method: 'POST',
    headers: authHeaders(),
    body: JSON.stringify({ orderId, driverId }),
  }).then(r => r.json());
// ─────────────────────────────────────────────────────────────────────────────

export default function AdminAssignmentPage() {
  const [autoRunning, setAutoRunning] = useState(false);
  const [legacyRunning, setLegacyRunning] = useState(false);
  const [logs, setLogs]               = useState([]);
  const [intervalMs, setIntervalMs]   = useState(60000);

  // ── CHANGE 3: New state for the delivery assignment section ───────────────
  const [readyOrders,  setReadyOrders]  = useState([]);
  const [drivers,      setDrivers]      = useState([]);
  const [loadingOrders, setLoadingOrders] = useState(false);
  const [selected,     setSelected]     = useState({}); // { [orderId]: driverId }
  const [assigning,    setAssigning]    = useState({}); // { [orderId]: true/false }
  const [assignTab,    setAssignTab]    = useState(true); // show/hide the panel
  // ─────────────────────────────────────────────────────────────────────────

  const log = (msg, type = 'info') => {
    setLogs(l => [{ msg, type, time: new Date().toLocaleTimeString() }, ...l.slice(0, 99)]);
  };

  const callApi = async (fn, label) => {
    try {
      log(`→ ${label}…`, 'info');
      await fn();
      log(`✓ ${label} succeeded`, 'success');
    } catch (err) {
      log(`✕ ${label} failed: ${err.message}`, 'error');
    }
  };

  // ── CHANGE 4: Load ready orders + available drivers on mount ──────────────
  const loadAssignmentData = useCallback(async () => {
    setLoadingOrders(true);
    try {
      const [orders, driverList] = await Promise.all([
        fetchReadyOrders(),
        fetchAvailableDrivers(),
      ]);
      setReadyOrders(orders);
      setDrivers(driverList);
    } catch (err) {
      log(`✕ Failed to load assignment data: ${err.message}`, 'error');
    } finally {
      setLoadingOrders(false);
    }
  }, []);

  useEffect(() => { loadAssignmentData(); }, [loadAssignmentData]);
  // ─────────────────────────────────────────────────────────────────────────

  // ── CHANGE 5: Handle manual driver assignment ─────────────────────────────
  const handleAssign = async (orderId) => {
    const driverId = selected[orderId];
    if (!driverId) { log('✕ Please select a driver first', 'error'); return; }
    setAssigning(a => ({ ...a, [orderId]: true }));
    try {
      log(`→ Assigning driver to order ${orderId.slice(-6).toUpperCase()}…`, 'info');
      await assignDriverToOrder(orderId, driverId);
      log(`✓ Driver assigned successfully`, 'success');
      // Remove order from list; remove driver from dropdown (they're now busy)
      setReadyOrders(prev => prev.filter(o => (o._id || o.id) !== orderId));
      setDrivers(prev => prev.filter(d => (d._id || d.id) !== driverId));
      setSelected(s => { const n = { ...s }; delete n[orderId]; return n; });
    } catch (err) {
      log(`✕ Assignment failed: ${err.message}`, 'error');
    } finally {
      setAssigning(a => ({ ...a, [orderId]: false }));
    }
  };
  // ─────────────────────────────────────────────────────────────────────────

  const stats = [
    { icon:'🤖', label:'Auto Engine',    value: autoRunning   ? 'Running' : 'Stopped', color: autoRunning   ? '#065f46' : '#6b7280', bg: autoRunning   ? '#d1fae5' : '#f3f4f6' },
    { icon:'⏱',  label:'Legacy Service', value: legacyRunning ? 'Running' : 'Stopped', color: legacyRunning ? '#065f46' : '#6b7280', bg: legacyRunning ? '#d1fae5' : '#f3f4f6' },
    { icon:'📋',  label:'Log Entries',   value: logs.length,   color: '#1d4ed8', bg: '#dbeafe' },
    { icon:'⚡',  label:'Interval',      value: `${intervalMs/1000}s`,  color: '#7c3aed', bg: '#ede9fe' },
    // ── CHANGE 6: Added a 5th stat card showing how many orders need a driver
    { icon:'🚚',  label:'Awaiting Driver', value: readyOrders.length, color: readyOrders.length > 0 ? '#b45309' : '#6b7280', bg: readyOrders.length > 0 ? '#fef3c7' : '#f3f4f6' },
    // ─────────────────────────────────────────────────────────────────────
  ];

  return (
    <div style={{ minHeight:'100vh', background:'#f0fdf4', fontFamily:"'Nunito',sans-serif" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Nunito:wght@400;600;700;800;900&display=swap');
        @keyframes ping  { 0%{transform:scale(1);opacity:0.8} 100%{transform:scale(2.2);opacity:0} }
        @keyframes fadeUp{ from{transform:translateY(8px);opacity:0} to{transform:translateY(0);opacity:1} }
        .adm-btn:hover:not(:disabled) { opacity:0.88; transform:translateY(-1px); }
        .adm-btn:active:not(:disabled) { transform:translateY(0); }
        .order-row:hover { background:#f0fdf4 !important; }
      `}</style>

      {/* ── HEADER (unchanged) ── */}
      <header style={{ background:'linear-gradient(90deg,#052e16,#064e3b)', padding:'14px 32px',
                       display:'flex', alignItems:'center', justifyContent:'space-between',
                       boxShadow:'0 4px 24px rgba(0,0,0,0.25)', position:'sticky', top:0, zIndex:100 }}>
        <div style={{ display:'flex', alignItems:'center', gap:12 }}>
          <div style={{ width:34, height:34, borderRadius:9, background:'rgba(255,255,255,0.12)',
                        display:'flex', alignItems:'center', justifyContent:'center', fontSize:18 }}>🌿</div>
          <div>
            <div style={{ color:'#fff', fontWeight:900, fontSize:16, letterSpacing:-0.5 }}>FreshCart</div>
            <div style={{ color:'#6ee7b7', fontSize:9, fontWeight:700, letterSpacing:2 }}>ADMIN PANEL</div>
          </div>
          <span style={{ background:'rgba(110,231,183,0.15)', color:'#6ee7b7', fontSize:11,
                         fontWeight:700, padding:'4px 12px', borderRadius:20, marginLeft:4,
                         border:'1px solid rgba(110,231,183,0.3)' }}>
            Assignment Engine
          </span>
        </div>
        <div style={{ display:'flex', alignItems:'center', gap:8 }}>
          <div style={{ width:8, height:8, borderRadius:'50%',
                        background: autoRunning||legacyRunning ? '#34d399' : '#9ca3af',
                        boxShadow: autoRunning||legacyRunning ? '0 0 8px #34d399' : 'none' }} />
          <span style={{ color:'#d1fae5', fontSize:13, fontWeight:700 }}>
            {autoRunning||legacyRunning ? 'Engine Active' : 'Engine Idle'}
          </span>
        </div>
      </header>

      <div style={{ maxWidth:1200, margin:'0 auto', padding:'28px 32px 48px' }}>

        {/* ── STATS STRIP — now 5 cards ── */}
        {/* CHANGE 7: grid changed from repeat(4,1fr) → repeat(5,1fr) for the new card */}
        <div style={{ display:'grid', gridTemplateColumns:'repeat(5,1fr)', gap:16, marginBottom:24 }}>
          {stats.map(({ icon, label, value, color, bg }) => (
            <div key={label} style={{ background:'#fff', borderRadius:18, padding:'20px 24px',
                                      boxShadow:'0 4px 16px rgba(0,0,0,0.06)',
                                      border:'1.5px solid #d1fae5', display:'flex',
                                      alignItems:'center', gap:14 }}>
              <div style={{ width:44, height:44, borderRadius:14, background:bg, flexShrink:0,
                            display:'flex', alignItems:'center', justifyContent:'center', fontSize:20 }}>
                {icon}
              </div>
              <div>
                <div style={{ fontSize:22, fontWeight:900, color }}>{value}</div>
                <div style={{ fontSize:12, color:'#9ca3af', fontWeight:600 }}>{label}</div>
              </div>
            </div>
          ))}
        </div>

        {/* ── MAIN GRID (unchanged auto-assignment + legacy panels) ── */}
        <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr 1fr', gap:20, marginBottom:24 }}>

          {/* Auto Assignment (unchanged) */}
          <div style={{ background:'#fff', borderRadius:20, padding:28,
                        boxShadow:'0 4px 20px rgba(0,0,0,0.07)', border:'1.5px solid #d1fae5' }}>
            <div style={{ display:'flex', alignItems:'center', gap:10, marginBottom:6 }}>
              <div style={{ width:36, height:36, borderRadius:10, background:'#d1fae5',
                            display:'flex', alignItems:'center', justifyContent:'center', fontSize:18 }}>🤖</div>
              <div>
                <h3 style={{ margin:0, fontSize:15, fontWeight:800, color:'#064e3b' }}>Auto Assignment</h3>
                <p style={{ margin:0, fontSize:12, color:'#6b7280' }}>Assign drivers automatically</p>
              </div>
            </div>

            <div style={{ margin:'20px 0 16px' }}>
              <label style={{ display:'block', fontSize:11, fontWeight:700, color:'#374151',
                              marginBottom:6, textTransform:'uppercase', letterSpacing:0.5 }}>
                Interval (ms)
              </label>
              <input type="number" value={intervalMs} min={5000} step={5000}
                onChange={e => setIntervalMs(Number(e.target.value))}
                style={{ width:'100%', padding:'10px 14px', borderRadius:10, fontSize:14,
                         border:'1.5px solid #d1fae5', outline:'none', background:'#f9fafb',
                         boxSizing:'border-box', fontFamily:"'Nunito',sans-serif" }} />
            </div>

            <div style={{ display:'flex', gap:10, marginBottom:10 }}>
              <ActionBtn label="▶ Start" color="green" disabled={autoRunning}
                onClick={async () => {
                  await callApi(() => autoAssignmentApi.start(), 'Start auto assignment');
                  setAutoRunning(true);
                }} />
              <ActionBtn label="■ Stop" color="red" disabled={!autoRunning}
                onClick={async () => {
                  await callApi(() => autoAssignmentApi.stop(), 'Stop auto assignment');
                  setAutoRunning(false);
                }} />
            </div>
            <ActionBtn label="⚡ Trigger Once" color="blue" fullWidth
              onClick={() => callApi(() => autoAssignmentApi.trigger(), 'Manual trigger')} />

            <div style={{ display:'flex', alignItems:'center', gap:8, marginTop:16,
                          padding:'10px 14px', borderRadius:12,
                          background: autoRunning ? '#f0fdf4' : '#f9fafb',
                          border: `1px solid ${autoRunning ? '#d1fae5' : '#e5e7eb'}` }}>
              <div style={{ position:'relative', width:10, height:10, flexShrink:0 }}>
                {autoRunning && <div style={{ position:'absolute', inset:0, borderRadius:'50%',
                                               background:'#34d399', animation:'ping 1.5s ease-out infinite' }} />}
                <div style={{ position:'relative', width:10, height:10, borderRadius:'50%',
                              background: autoRunning ? '#10b981' : '#9ca3af' }} />
              </div>
              <span style={{ fontSize:12, color: autoRunning ? '#065f46' : '#6b7280', fontWeight:700 }}>
                {autoRunning ? 'Auto-assignment is running' : 'Auto-assignment is stopped'}
              </span>
            </div>
          </div>

          {/* Legacy Assignment Service (unchanged) */}
          <div style={{ background:'#fff', borderRadius:20, padding:28,
                        boxShadow:'0 4px 20px rgba(0,0,0,0.07)', border:'1.5px solid #d1fae5' }}>
            <div style={{ display:'flex', alignItems:'center', gap:10, marginBottom:6 }}>
              <div style={{ width:36, height:36, borderRadius:10, background:'#ede9fe',
                            display:'flex', alignItems:'center', justifyContent:'center', fontSize:18 }}>⏱</div>
              <div>
                <h3 style={{ margin:0, fontSize:15, fontWeight:800, color:'#064e3b' }}>Assignment Service</h3>
                <p style={{ margin:0, fontSize:12, color:'#6b7280' }}>Interval-based process</p>
              </div>
            </div>

            <div style={{ margin:'20px 0 16px', padding:'14px 16px', background:'#fef3c7',
                          borderRadius:12, border:'1px solid #fcd34d' }}>
              <p style={{ margin:0, fontSize:12, color:'#b45309', fontWeight:600 }}>
                ⚠️ Uses the same interval value set above
              </p>
            </div>

            <div style={{ display:'flex', gap:10, marginBottom:10 }}>
              <ActionBtn label="▶ Start" color="green" disabled={legacyRunning}
                onClick={async () => {
                  await callApi(() => assignmentApi.start(intervalMs), 'Start assignment service');
                  setLegacyRunning(true);
                }} />
              <ActionBtn label="■ Stop" color="red" disabled={!legacyRunning}
                onClick={async () => {
                  await callApi(() => assignmentApi.stop(), 'Stop assignment service');
                  setLegacyRunning(false);
                }} />
            </div>
            <ActionBtn label="⚡ Run Manual" color="blue" fullWidth
              onClick={() => callApi(() => assignmentApi.manual(), 'Manual assignment')} />

            <div style={{ display:'flex', alignItems:'center', gap:8, marginTop:16,
                          padding:'10px 14px', borderRadius:12,
                          background: legacyRunning ? '#f0fdf4' : '#f9fafb',
                          border: `1px solid ${legacyRunning ? '#d1fae5' : '#e5e7eb'}` }}>
              <div style={{ position:'relative', width:10, height:10, flexShrink:0 }}>
                {legacyRunning && <div style={{ position:'absolute', inset:0, borderRadius:'50%',
                                                background:'#34d399', animation:'ping 1.5s ease-out infinite' }} />}
                <div style={{ position:'relative', width:10, height:10, borderRadius:'50%',
                              background: legacyRunning ? '#10b981' : '#9ca3af' }} />
              </div>
              <span style={{ fontSize:12, color: legacyRunning ? '#065f46' : '#6b7280', fontWeight:700 }}>
                {legacyRunning ? 'Service is running' : 'Service is stopped'}
              </span>
            </div>
          </div>

          {/* Quick Actions (unchanged) */}
          <div style={{ background:'#fff', borderRadius:20, padding:28,
                        boxShadow:'0 4px 20px rgba(0,0,0,0.07)', border:'1.5px solid #d1fae5' }}>
            <div style={{ display:'flex', alignItems:'center', gap:10, marginBottom:20 }}>
              <div style={{ width:36, height:36, borderRadius:10, background:'#dbeafe',
                            display:'flex', alignItems:'center', justifyContent:'center', fontSize:18 }}>⚡</div>
              <div>
                <h3 style={{ margin:0, fontSize:15, fontWeight:800, color:'#064e3b' }}>Quick Actions</h3>
                <p style={{ margin:0, fontSize:12, color:'#6b7280' }}>One-click operations</p>
              </div>
            </div>

            <div style={{ display:'flex', flexDirection:'column', gap:10 }}>
              {[
                { label:'🔄 Trigger Auto Assignment', color:'blue',
                  fn: () => callApi(() => autoAssignmentApi.trigger(), 'Trigger auto') },
                { label:'📋 Run Manual Assignment', color:'green',
                  fn: () => callApi(() => assignmentApi.manual(), 'Manual assignment') },
                { label:'⏹ Stop All Services', color:'red',
                  fn: async () => {
                    await callApi(() => autoAssignmentApi.stop(), 'Stop auto');
                    await callApi(() => assignmentApi.stop(), 'Stop legacy');
                    setAutoRunning(false); setLegacyRunning(false);
                  }},
                // ── CHANGE 8: Refresh button reloads the ready-orders panel ──
                { label:'🔃 Refresh Ready Orders', color:'blue',
                  fn: () => loadAssignmentData() },
                // ──────────────────────────────────────────────────────────────
              ].map(({ label, color, fn }) => (
                <ActionBtn key={label} label={label} color={color} fullWidth onClick={fn} />
              ))}
            </div>

            <div style={{ marginTop:20, padding:'14px 16px', background:'#f0fdf4',
                          borderRadius:12, border:'1px solid #d1fae5' }}>
              <p style={{ margin:'0 0 4px', fontSize:12, fontWeight:800, color:'#065f46' }}>
                💡 How it works
              </p>
              <p style={{ margin:0, fontSize:11, color:'#6b7280', lineHeight:1.5 }}>
                Auto-assignment fetches ready orders and assigns the nearest available driver automatically on a timer.
              </p>
            </div>
          </div>
        </div>

        {/* ════════════════════════════════════════════════════════════════════
            CHANGE 9 — ENTIRE NEW SECTION: Manual Driver Assignment Panel
            This whole block is new. Nothing above this line was removed.
            ════════════════════════════════════════════════════════════════════ */}
        <div style={{ background:'#fff', borderRadius:20, overflow:'hidden',
                      boxShadow:'0 4px 20px rgba(0,0,0,0.07)', border:'1.5px solid #d1fae5', marginBottom:24 }}>

          {/* Panel header with collapse toggle */}
          <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center',
                        padding:'18px 28px', borderBottom:'1.5px solid #f0fdf4',
                        background:'linear-gradient(90deg,#f0fdf4,#fff)' }}>
            <div style={{ display:'flex', alignItems:'center', gap:10 }}>
              <span style={{ fontSize:18 }}>🚚</span>
              <h3 style={{ margin:0, fontSize:16, fontWeight:800, color:'#064e3b' }}>
                Manual Driver Assignment
              </h3>
              {readyOrders.length > 0 && (
                <span style={{ background:'#fef3c7', color:'#b45309', fontSize:11, fontWeight:700,
                               padding:'2px 10px', borderRadius:20, border:'1px solid #fcd34d' }}>
                  {readyOrders.length} order{readyOrders.length !== 1 ? 's' : ''} waiting
                </span>
              )}
            </div>
            <div style={{ display:'flex', gap:10, alignItems:'center' }}>
              <button onClick={loadAssignmentData} disabled={loadingOrders}
                style={{ background:'none', border:'1.5px solid #d1fae5', borderRadius:10,
                         padding:'6px 16px', fontSize:13, cursor:'pointer', color:'#065f46',
                         fontFamily:"'Nunito',sans-serif", fontWeight:700,
                         opacity: loadingOrders ? 0.6 : 1 }}>
                {loadingOrders ? '…' : '🔃 Refresh'}
              </button>
              <button onClick={() => setAssignTab(t => !t)}
                style={{ background:'none', border:'1.5px solid #d1fae5', borderRadius:10,
                         padding:'6px 16px', fontSize:13, cursor:'pointer', color:'#6b7280',
                         fontFamily:"'Nunito',sans-serif", fontWeight:600 }}>
                {assignTab ? 'Collapse ▲' : 'Expand ▼'}
              </button>
            </div>
          </div>

          {assignTab && (
            <div style={{ padding:'8px 0' }}>
              {loadingOrders ? (
                <div style={{ textAlign:'center', padding:'48px 0' }}>
                  <p style={{ fontSize:14, color:'#9ca3af', fontWeight:600 }}>Loading orders…</p>
                </div>
              ) : readyOrders.length === 0 ? (
                <div style={{ textAlign:'center', padding:'48px 0' }}>
                  <p style={{ fontSize:36, margin:'0 0 10px' }}>✅</p>
                  <p style={{ color:'#9ca3af', fontSize:14, fontWeight:600 }}>
                    No orders waiting for a driver right now
                  </p>
                </div>
              ) : (
                <>
                  {/* Driver availability warning */}
                  {drivers.length === 0 && (
                    <div style={{ margin:'12px 28px', padding:'12px 16px', background:'#fef2f2',
                                  border:'1px solid #fca5a5', borderRadius:12,
                                  fontSize:13, color:'#b91c1c', fontWeight:600 }}>
                      ⚠️ No drivers are currently available. Ask drivers to go online in their app.
                    </div>
                  )}

                  {/* Column headers */}
                  <div style={{ display:'grid', gridTemplateColumns:'2fr 1fr 1fr 1.8fr auto',
                                gap:16, padding:'10px 28px', borderBottom:'1px solid #f0fdf4',
                                fontSize:11, fontWeight:700, color:'#9ca3af',
                                textTransform:'uppercase', letterSpacing:0.5 }}>
                    <span>Order</span>
                    <span>Items / Total</span>
                    <span>Placed at</span>
                    <span>Assign Driver</span>
                    <span>Action</span>
                  </div>

                  {readyOrders.map((order, i) => {
                    const oid      = order._id || order.id;
                    const shortId  = (order.orderId || oid).toString().slice(-8).toUpperCase();
                    const placedAt = new Date(order.createdAt).toLocaleTimeString('en-US', {
                      hour: '2-digit', minute: '2-digit',
                    });
                    const total = order.totalAmount?.toFixed(2) || '—';
                    const isBusy = !!assigning[oid];

                    return (
                      <div key={oid} className="order-row"
                        style={{ display:'grid', gridTemplateColumns:'2fr 1fr 1fr 1.8fr auto',
                                  gap:16, padding:'14px 28px', alignItems:'center',
                                  borderBottom:'1px solid #f9fafb',
                                  background: i % 2 === 0 ? 'transparent' : '#fafffe',
                                  transition:'background 0.15s', fontSize:13 }}>

                        {/* Order ID + customer */}
                        <div>
                          <span style={{ fontWeight:900, color:'#064e3b', fontSize:14 }}>
                            #{shortId}
                          </span>
                          <br />
                          <span style={{ color:'#9ca3af', fontSize:12 }}>
                            {order.customerName || order.customerId}
                          </span>
                        </div>

                        {/* Items + total */}
                        <div>
                          <span style={{ fontWeight:700, color:'#374151' }}>
                            {order.items?.length || 0} items
                          </span>
                          <br />
                          <span style={{ color:'#065f46', fontWeight:800, fontSize:12 }}>
                            LKR {total}
                          </span>
                        </div>

                        {/* Placed at */}
                        <span style={{ color:'#6b7280' }}>{placedAt}</span>

                        {/* Driver dropdown */}
                        <select
                          value={selected[oid] || ''}
                          onChange={e => setSelected(s => ({ ...s, [oid]: e.target.value }))}
                          disabled={isBusy || drivers.length === 0}
                          style={{ width:'100%', padding:'8px 12px', borderRadius:10, fontSize:13,
                                   border:'1.5px solid #d1fae5', outline:'none', background:'#f9fafb',
                                   fontFamily:"'Nunito',sans-serif", color:'#374151', cursor:'pointer',
                                   opacity: drivers.length === 0 ? 0.5 : 1 }}>
                          <option value="">— Select driver —</option>
                          {drivers.map(d => (
                            <option key={d._id || d.id} value={d._id || d.id}>
                              {d.name} · {d.vehicleType}
                              {d.rating?.average ? ` · ⭐${d.rating.average.toFixed(1)}` : ''}
                            </option>
                          ))}
                        </select>

                        {/* Assign button */}
                        <button
                          className="adm-btn"
                          onClick={() => handleAssign(oid)}
                          disabled={!selected[oid] || isBusy}
                          style={{ padding:'9px 20px', borderRadius:10, border:'none',
                                   background: selected[oid] && !isBusy
                                     ? 'linear-gradient(90deg,#065f46,#047857)'
                                     : '#e5e7eb',
                                   color: selected[oid] && !isBusy ? '#fff' : '#9ca3af',
                                   fontWeight:800, fontSize:13, whiteSpace:'nowrap',
                                   cursor: selected[oid] && !isBusy ? 'pointer' : 'not-allowed',
                                   fontFamily:"'Nunito',sans-serif",
                                   boxShadow: selected[oid] ? '0 2px 8px rgba(6,95,70,0.25)' : 'none',
                                   transition:'all 0.2s' }}>
                          {isBusy ? '…' : '🚗 Assign'}
                        </button>
                      </div>
                    );
                  })}
                </>
              )}
            </div>
          )}
        </div>
        {/* ════════════════════════════════════════════════════════════════════
            END CHANGE 9
            ════════════════════════════════════════════════════════════════════ */}

        {/* ── ACTIVITY LOG (unchanged) ── */}
        <div style={{ background:'#fff', borderRadius:20, overflow:'hidden',
                      boxShadow:'0 4px 20px rgba(0,0,0,0.07)', border:'1.5px solid #d1fae5' }}>
          <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center',
                        padding:'18px 28px', borderBottom:'1.5px solid #f0fdf4',
                        background:'linear-gradient(90deg,#f0fdf4,#fff)' }}>
            <div style={{ display:'flex', alignItems:'center', gap:10 }}>
              <span style={{ fontSize:18 }}>📋</span>
              <h3 style={{ margin:0, fontSize:16, fontWeight:800, color:'#064e3b' }}>Activity Log</h3>
              {logs.length > 0 && (
                <span style={{ background:'#d1fae5', color:'#065f46', fontSize:11, fontWeight:700,
                               padding:'2px 10px', borderRadius:20 }}>{logs.length} entries</span>
              )}
            </div>
            <button onClick={() => setLogs([])}
              style={{ background:'none', border:'1.5px solid #d1fae5', borderRadius:10,
                       padding:'6px 16px', fontSize:13, cursor:'pointer', color:'#6b7280',
                       fontFamily:"'Nunito',sans-serif", fontWeight:600 }}>
              Clear Log
            </button>
          </div>

          <div style={{ padding:'8px 0', maxHeight:380, overflowY:'auto' }}>
            {logs.length === 0 ? (
              <div style={{ textAlign:'center', padding:'48px 0' }}>
                <p style={{ fontSize:36, margin:'0 0 10px' }}>📭</p>
                <p style={{ color:'#9ca3af', fontSize:14, fontWeight:600 }}>
                  No activity yet — use the controls above
                </p>
              </div>
            ) : (
              logs.map((l, i) => (
                <div key={i} style={{ display:'flex', gap:14, padding:'10px 28px',
                                      alignItems:'center', fontSize:13,
                                      borderBottom:'1px solid #f9fafb',
                                      borderLeft:`4px solid ${
                                        l.type==='success' ? '#34d399' :
                                        l.type==='error'   ? '#f87171' : '#93c5fd'}`,
                                      background: i===0 ? '#fafffe' : 'transparent',
                                      animation: i===0 ? 'fadeUp 0.2s ease' : 'none' }}>
                  <span style={{ color:'#9ca3af', flexShrink:0, fontSize:11,
                                 fontWeight:700, minWidth:70 }}>{l.time}</span>
                  <span style={{ width:8, height:8, borderRadius:'50%', flexShrink:0,
                                 background: l.type==='success' ? '#34d399' :
                                             l.type==='error'   ? '#f87171' : '#93c5fd' }} />
                  <span style={{ color: l.type==='error'   ? '#b91c1c' :
                                        l.type==='success' ? '#065f46' : '#374151',
                                 fontWeight: l.type==='error' ? 700 : 500 }}>
                    {l.msg}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function ActionBtn({ label, color, onClick, disabled, fullWidth }) {
  const bg = {
    green: 'linear-gradient(90deg,#065f46,#047857)',
    red:   'linear-gradient(90deg,#b91c1c,#dc2626)',
    blue:  'linear-gradient(90deg,#1d4ed8,#2563eb)',
  };
  return (
    <button className="adm-btn" onClick={onClick} disabled={disabled}
      style={{ flex: fullWidth ? undefined : 1, width: fullWidth ? '100%' : undefined,
               padding:'12px 0', borderRadius:12, border:'none',
               background: disabled ? '#e5e7eb' : bg[color],
               color: disabled ? '#9ca3af' : '#fff', fontWeight:800, fontSize:14,
               cursor: disabled ? 'not-allowed' : 'pointer',
               transition:'all 0.2s', marginTop: fullWidth ? 0 : 0,
               fontFamily:"'Nunito',sans-serif",
               boxShadow: disabled ? 'none' : '0 2px 8px rgba(0,0,0,0.15)' }}>
      {label}
    </button>
  );
}