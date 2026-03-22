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
import React, { useState, useEffect } from 'react';
import { autoAssignmentApi, assignmentApi } from '../api/deliveryApi';

// ── Mock data ────────────────────────────────────────────────────────────────
const MOCK_ORDERS = [
  { id:'ORD-001', store:'FreshMart Colombo 03', customer:'Amal Perera',    area:'Dehiwala',      amount:'LKR 2,450', status:'ready_for_pickup', wait:'8 min' },
  { id:'ORD-002', store:'Green Basket Nugegoda', customer:'Nimali Fernando', area:'Maharagama',    amount:'LKR 1,875', status:'ready_for_pickup', wait:'15 min' },
  { id:'ORD-003', store:'FreshCart Boralesgamuwa', customer:'Tharindu Silva', area:'Rajagiriya',  amount:'LKR 3,200', status:'ready_for_pickup', wait:'22 min' },
  { id:'ORD-004', store:'SuperMart Kollupitiya', customer:'Dilini Jayawardena', area:'Colombo 07', amount:'LKR 1,650', status:'pending',          wait:'5 min' },
  { id:'ORD-005', store:'FreshMart Pettah',     customer:'Chamara Bandara', area:'Kirulapona',    amount:'LKR 4,100', status:'ready_for_pickup', wait:'31 min' },
];

const MOCK_DRIVERS = [
  { name:'Kasun Siriwardena',  vehicle:'Motorcycle', status:'online',  orders:2, rating:4.9, location:'Colombo 03' },
  { name:'Ruwan Madusanka',    vehicle:'Car',         status:'online',  orders:1, rating:4.7, location:'Nugegoda'   },
  { name:'Saman Kumara',       vehicle:'Scooter',     status:'online',  orders:0, rating:4.8, location:'Dehiwala'   },
  { name:'Pradeep Jayasena',   vehicle:'Motorcycle',  status:'online',  orders:0, rating:4.6, location:'Maharagama' },
  { name:'Nuwan Rathnayake',   vehicle:'Car',         status:'offline', orders:0, rating:4.5, location:'Boralesgamuwa' },
];

const MOCK_ASSIGNMENTS = [
  { order:'ORD-006', driver:'Kasun Siriwardena', time:'2 min ago',  status:'accepted' },
  { order:'ORD-007', driver:'Ruwan Madusanka',   time:'8 min ago',  status:'accepted' },
  { order:'ORD-008', driver:'Saman Kumara',      time:'15 min ago', status:'rejected' },
  { order:'ORD-009', driver:'Pradeep Jayasena',  time:'22 min ago', status:'accepted' },
];
// ─────────────────────────────────────────────────────────────────────────────

const STATUS_COLORS = {
  ready_for_pickup: { bg:'#d1fae5', color:'#065f46' },
  pending:          { bg:'#fef3c7', color:'#b45309' },
  accepted:         { bg:'#d1fae5', color:'#065f46' },
  rejected:         { bg:'#fee2e2', color:'#b91c1c' },
};

export default function AdminAssignmentPage() {
  const [autoRunning,    setAutoRunning]    = useState(false);
  const [legacyRunning,  setLegacyRunning]  = useState(false);
  const [logs,           setLogs]           = useState([]);
  const [intervalMs,     setIntervalMs]     = useState(60000);
  const [activeTab,      setActiveTab]      = useState('orders'); // orders | drivers | history
  const [mockOrders,     setMockOrders]     = useState(MOCK_ORDERS);
  const [assignments,    setAssignments]    = useState(MOCK_ASSIGNMENTS);
  const [assigning,      setAssigning]      = useState(null);

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

  // Simulate assigning a driver to a mock order
  const handleMockAssign = (orderId) => {
    setAssigning(orderId);
    const availableDrivers = MOCK_DRIVERS.filter(d => d.status === 'online' && d.orders < 3);
    const driver = availableDrivers[Math.floor(Math.random() * availableDrivers.length)];
    setTimeout(() => {
      if (driver) {
        setMockOrders(o => o.filter(x => x.id !== orderId));
        const order = MOCK_ORDERS.find(o => o.id === orderId);
        setAssignments(a => [
          { order: orderId, driver: driver.name, time: 'Just now', status: 'accepted' },
          ...a.slice(0, 9)
        ]);
        log(`✓ ${orderId} assigned to ${driver.name}`, 'success');
      } else {
        log(`✕ No available drivers for ${orderId}`, 'error');
      }
      setAssigning(null);
    }, 1200);
  };

  const handleAssignAll = () => {
    mockOrders.forEach((order, i) => {
      setTimeout(() => handleMockAssign(order.id), i * 800);
    });
  };

  const stats = [
    { icon:'🤖', label:'Auto Engine',    value: autoRunning   ? 'Running' : 'Stopped', color: autoRunning   ? '#065f46' : '#6b7280', bg: autoRunning   ? '#d1fae5' : '#f3f4f6' },
    { icon:'⏱',  label:'Legacy Service', value: legacyRunning ? 'Running' : 'Stopped', color: legacyRunning ? '#065f46' : '#6b7280', bg: legacyRunning ? '#d1fae5' : '#f3f4f6' },
    { icon:'📦',  label:'Pending Orders', value: mockOrders.length, color:'#b45309', bg:'#fef3c7' },
    { icon:'🚗',  label:'Online Drivers', value: MOCK_DRIVERS.filter(d=>d.status==='online').length, color:'#065f46', bg:'#d1fae5' },
  ];

  return (
    <div style={{ minHeight:'100vh', background:'#f0fdf4', fontFamily:"'Nunito',sans-serif" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Nunito:wght@400;600;700;800;900&display=swap');
        @keyframes ping   { 0%{transform:scale(1);opacity:0.8} 100%{transform:scale(2.2);opacity:0} }
        @keyframes fadeUp { from{transform:translateY(8px);opacity:0} to{transform:translateY(0);opacity:1} }
        @keyframes spin   { to { transform: rotate(360deg); } }
        .adm-btn:hover:not(:disabled) { opacity:0.88; transform:translateY(-1px); }
        .adm-btn:active:not(:disabled) { transform:translateY(0); }
        .row-hover:hover { background:#f0fdf4 !important; }
      `}</style>

      {/* ── HEADER ── */}
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
                         border:'1px solid rgba(110,231,183,0.3)' }}>Assignment Engine</span>
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

        {/* ── STATS ── */}
        <div style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:16, marginBottom:24 }}>
          {stats.map(({ icon, label, value, color, bg }) => (
            <div key={label} style={{ background:'#fff', borderRadius:18, padding:'20px 24px',
                                      boxShadow:'0 4px 16px rgba(0,0,0,0.06)',
                                      border:'1.5px solid #d1fae5', display:'flex', alignItems:'center', gap:14 }}>
              <div style={{ width:44, height:44, borderRadius:14, background:bg, flexShrink:0,
                            display:'flex', alignItems:'center', justifyContent:'center', fontSize:20 }}>{icon}</div>
              <div>
                <div style={{ fontSize:22, fontWeight:900, color }}>{value}</div>
                <div style={{ fontSize:12, color:'#9ca3af', fontWeight:600 }}>{label}</div>
              </div>
            </div>
          ))}
        </div>

        {/* ── MAIN GRID ── */}
        <div style={{ display:'grid', gridTemplateColumns:'320px 1fr', gap:24, alignItems:'start' }}>

          {/* LEFT — controls */}
          <div style={{ display:'flex', flexDirection:'column', gap:16 }}>

            {/* Auto Assignment */}
            <div style={{ background:'#fff', borderRadius:20, padding:24,
                          boxShadow:'0 4px 20px rgba(0,0,0,0.07)', border:'1.5px solid #d1fae5' }}>
              <div style={{ display:'flex', alignItems:'center', gap:10, marginBottom:16 }}>
                <div style={{ width:34, height:34, borderRadius:10, background:'#d1fae5',
                              display:'flex', alignItems:'center', justifyContent:'center', fontSize:16 }}>🤖</div>
                <div>
                  <h3 style={{ margin:0, fontSize:14, fontWeight:800, color:'#064e3b' }}>Auto Assignment</h3>
                  <p style={{ margin:0, fontSize:11, color:'#6b7280' }}>Assign drivers automatically</p>
                </div>
              </div>
              <label style={{ display:'block', fontSize:10, fontWeight:700, color:'#374151',
                              marginBottom:5, textTransform:'uppercase', letterSpacing:0.5 }}>Interval (ms)</label>
              <input type="number" value={intervalMs} min={5000} step={5000}
                onChange={e => setIntervalMs(Number(e.target.value))}
                style={{ width:'100%', padding:'9px 12px', borderRadius:10, fontSize:14,
                         border:'1.5px solid #d1fae5', outline:'none', background:'#f9fafb',
                         boxSizing:'border-box', fontFamily:"'Nunito',sans-serif", marginBottom:12 }} />
              <div style={{ display:'flex', gap:8, marginBottom:8 }}>
                <ActionBtn label="▶ Start" color="green" disabled={autoRunning}
                  onClick={async () => { await callApi(() => autoAssignmentApi.start(), 'Start auto'); setAutoRunning(true); }} />
                <ActionBtn label="■ Stop" color="red" disabled={!autoRunning}
                  onClick={async () => { await callApi(() => autoAssignmentApi.stop(), 'Stop auto'); setAutoRunning(false); }} />
              </div>
              <ActionBtn label="⚡ Trigger Once" color="blue" fullWidth
                onClick={() => callApi(() => autoAssignmentApi.trigger(), 'Trigger auto')} />
              <StatusPill running={autoRunning} label={autoRunning ? 'Running' : 'Stopped'} />
            </div>

            {/* Legacy */}
            <div style={{ background:'#fff', borderRadius:20, padding:24,
                          boxShadow:'0 4px 20px rgba(0,0,0,0.07)', border:'1.5px solid #d1fae5' }}>
              <div style={{ display:'flex', alignItems:'center', gap:10, marginBottom:16 }}>
                <div style={{ width:34, height:34, borderRadius:10, background:'#ede9fe',
                              display:'flex', alignItems:'center', justifyContent:'center', fontSize:16 }}>⏱</div>
                <div>
                  <h3 style={{ margin:0, fontSize:14, fontWeight:800, color:'#064e3b' }}>Assignment Service</h3>
                  <p style={{ margin:0, fontSize:11, color:'#6b7280' }}>Interval-based process</p>
                </div>
              </div>
              <div style={{ display:'flex', gap:8, marginBottom:8 }}>
                <ActionBtn label="▶ Start" color="green" disabled={legacyRunning}
                  onClick={async () => { await callApi(() => assignmentApi.start(intervalMs), 'Start legacy'); setLegacyRunning(true); }} />
                <ActionBtn label="■ Stop" color="red" disabled={!legacyRunning}
                  onClick={async () => { await callApi(() => assignmentApi.stop(), 'Stop legacy'); setLegacyRunning(false); }} />
              </div>
              <ActionBtn label="⚡ Run Manual" color="blue" fullWidth
                onClick={() => callApi(() => assignmentApi.manual(), 'Manual assignment')} />
              <StatusPill running={legacyRunning} label={legacyRunning ? 'Running' : 'Stopped'} />
            </div>

            {/* Quick actions */}
            <div style={{ background:'#fff', borderRadius:20, padding:24,
                          boxShadow:'0 4px 20px rgba(0,0,0,0.07)', border:'1.5px solid #d1fae5' }}>
              <h4 style={{ margin:'0 0 14px', fontSize:13, fontWeight:800, color:'#064e3b',
                           textTransform:'uppercase', letterSpacing:0.5 }}>⚡ Quick Actions</h4>
              <div style={{ display:'flex', flexDirection:'column', gap:8 }}>
                <ActionBtn label="🔄 Assign All Pending (Demo)" color="blue" fullWidth onClick={handleAssignAll} />
                <ActionBtn label="⏹ Stop All Services" color="red" fullWidth
                  onClick={async () => {
                    await callApi(() => autoAssignmentApi.stop(), 'Stop auto');
                    await callApi(() => assignmentApi.stop(), 'Stop legacy');
                    setAutoRunning(false); setLegacyRunning(false);
                  }} />
              </div>
              <div style={{ marginTop:14, padding:'12px 14px', background:'#f0fdf4',
                            borderRadius:12, border:'1px solid #d1fae5' }}>
                <p style={{ margin:'0 0 3px', fontSize:11, fontWeight:800, color:'#065f46' }}>💡 How it works</p>
                <p style={{ margin:0, fontSize:11, color:'#6b7280', lineHeight:1.5 }}>
                  Auto-assignment fetches ready orders and assigns the nearest available driver on a timer.
                </p>
              </div>
            </div>
          </div>

          {/* RIGHT — data panels */}
          <div style={{ display:'flex', flexDirection:'column', gap:16 }}>

            {/* Tabs */}
            <div style={{ display:'flex', gap:8 }}>
              {[
                { key:'orders',  label:`📦 Pending Orders (${mockOrders.length})` },
                { key:'drivers', label:`🚗 Drivers (${MOCK_DRIVERS.length})` },
                { key:'history', label:`📋 Assignment History` },
              ].map(t => (
                <button key={t.key} onClick={() => setActiveTab(t.key)}
                  style={{ flex:1, padding:'11px 0', borderRadius:14, cursor:'pointer',
                           fontFamily:"'Nunito',sans-serif", fontWeight:800, fontSize:13,
                           border:`2px solid ${activeTab===t.key ? '#064e3b' : '#e5e7eb'}`,
                           background: activeTab===t.key ? '#064e3b' : '#fff',
                           color:      activeTab===t.key ? '#fff'    : '#4b5563',
                           boxShadow:  activeTab===t.key ? '0 4px 16px rgba(6,79,58,0.2)' : 'none',
                           transition:'all 0.2s' }}>
                  {t.label}
                </button>
              ))}
            </div>

            {/* ── PENDING ORDERS TAB ── */}
            {activeTab === 'orders' && (
              <div style={{ background:'#fff', borderRadius:20, overflow:'hidden',
                            boxShadow:'0 4px 20px rgba(0,0,0,0.07)', border:'1.5px solid #d1fae5' }}>
                <div style={{ padding:'16px 24px', borderBottom:'1.5px solid #f0fdf4',
                              display:'flex', justifyContent:'space-between', alignItems:'center',
                              background:'linear-gradient(90deg,#f0fdf4,#fff)' }}>
                  <h3 style={{ margin:0, fontSize:15, fontWeight:800, color:'#064e3b' }}>
                    Orders Awaiting Driver
                  </h3>
                  <button onClick={handleAssignAll}
                    style={{ padding:'7px 18px', borderRadius:10, border:'none',
                             background:'linear-gradient(90deg,#065f46,#047857)',
                             color:'#fff', fontWeight:700, fontSize:12, cursor:'pointer',
                             fontFamily:"'Nunito',sans-serif" }}>
                    ⚡ Assign All
                  </button>
                </div>
                {mockOrders.length === 0 ? (
                  <div style={{ textAlign:'center', padding:'48px 0' }}>
                    <p style={{ fontSize:36, margin:'0 0 8px' }}>✅</p>
                    <p style={{ color:'#065f46', fontWeight:700, fontSize:14 }}>All orders assigned!</p>
                  </div>
                ) : (
                  mockOrders.map((order, i) => {
                    const sc = STATUS_COLORS[order.status] || { bg:'#f3f4f6', color:'#6b7280' };
                    return (
                      <div key={order.id} className="row-hover"
                        style={{ display:'flex', alignItems:'center', gap:14, padding:'14px 24px',
                                 borderBottom: i < mockOrders.length-1 ? '1px solid #f0fdf4' : 'none',
                                 background:'#fff', transition:'background 0.15s',
                                 animation:'fadeUp 0.3s ease both', animationDelay:`${i*0.05}s` }}>
                        <div style={{ width:40, height:40, borderRadius:'50%', flexShrink:0,
                                      background:'linear-gradient(135deg,#065f46,#10b981)',
                                      display:'flex', alignItems:'center', justifyContent:'center',
                                      color:'#fff', fontSize:14, fontWeight:800 }}>
                          {order.id.slice(-1)}
                        </div>
                        <div style={{ flex:1, minWidth:0 }}>
                          <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:2 }}>
                            <span style={{ fontSize:13, fontWeight:800, color:'#064e3b' }}>{order.id}</span>
                            <span style={{ fontSize:10, fontWeight:700, padding:'2px 8px', borderRadius:20,
                                           background:sc.bg, color:sc.color }}>
                              {order.status.replace(/_/g,' ')}
                            </span>
                            <span style={{ fontSize:11, color:'#9ca3af' }}>⏱ {order.wait}</span>
                          </div>
                          <div style={{ fontSize:12, color:'#6b7280' }}>
                            🏪 {order.store} → 📍 {order.area}
                          </div>
                        </div>
                        <div style={{ textAlign:'right', flexShrink:0 }}>
                          <div style={{ fontSize:14, fontWeight:800, color:'#064e3b', marginBottom:6 }}>
                            {order.amount}
                          </div>
                          <button onClick={() => handleMockAssign(order.id)}
                            disabled={assigning === order.id}
                            style={{ padding:'6px 14px', borderRadius:10, border:'none',
                                     background: assigning===order.id ? '#e5e7eb' : 'linear-gradient(90deg,#065f46,#047857)',
                                     color: assigning===order.id ? '#9ca3af' : '#fff',
                                     fontWeight:700, fontSize:12, cursor: assigning===order.id ? 'not-allowed' : 'pointer',
                                     fontFamily:"'Nunito',sans-serif", display:'flex', alignItems:'center', gap:6 }}>
                            {assigning === order.id ? (
                              <><div style={{ width:10, height:10, border:'2px solid #9ca3af',
                                             borderTop:'2px solid #fff', borderRadius:'50%',
                                             animation:'spin 0.6s linear infinite' }} />Assigning</>
                            ) : '👤 Assign'}
                          </button>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            )}

            {/* ── DRIVERS TAB ── */}
            {activeTab === 'drivers' && (
              <div style={{ background:'#fff', borderRadius:20, overflow:'hidden',
                            boxShadow:'0 4px 20px rgba(0,0,0,0.07)', border:'1.5px solid #d1fae5' }}>
                <div style={{ padding:'16px 24px', borderBottom:'1.5px solid #f0fdf4',
                              background:'linear-gradient(90deg,#f0fdf4,#fff)' }}>
                  <h3 style={{ margin:0, fontSize:15, fontWeight:800, color:'#064e3b' }}>Driver Status</h3>
                </div>
                {MOCK_DRIVERS.map((driver, i) => (
                  <div key={driver.name} className="row-hover"
                    style={{ display:'flex', alignItems:'center', gap:14, padding:'14px 24px',
                             borderBottom: i < MOCK_DRIVERS.length-1 ? '1px solid #f0fdf4' : 'none',
                             background:'#fff', transition:'background 0.15s',
                             opacity: driver.status === 'offline' ? 0.6 : 1 }}>
                    <div style={{ position:'relative', flexShrink:0 }}>
                      <div style={{ width:44, height:44, borderRadius:'50%',
                                    background: driver.status==='online'
                                      ? 'linear-gradient(135deg,#065f46,#10b981)'
                                      : 'linear-gradient(135deg,#9ca3af,#6b7280)',
                                    display:'flex', alignItems:'center', justifyContent:'center',
                                    color:'#fff', fontSize:16, fontWeight:900 }}>
                        {driver.name[0]}
                      </div>
                      <div style={{ position:'absolute', bottom:0, right:0, width:12, height:12,
                                    borderRadius:'50%', border:'2px solid #fff',
                                    background: driver.status==='online' ? '#22c55e' : '#9ca3af' }} />
                    </div>
                    <div style={{ flex:1 }}>
                      <div style={{ fontSize:14, fontWeight:800, color:'#064e3b', marginBottom:2 }}>
                        {driver.name}
                      </div>
                      <div style={{ fontSize:12, color:'#6b7280' }}>
                        {driver.vehicle} · ⭐ {driver.rating} · 📍 {driver.location}
                      </div>
                    </div>
                    <div style={{ textAlign:'right', flexShrink:0 }}>
                      <div style={{ fontSize:14, fontWeight:800,
                                    color: driver.orders > 0 ? '#065f46' : '#9ca3af', marginBottom:4 }}>
                        {driver.orders} {driver.orders===1?'order':'orders'}
                      </div>
                      <span style={{ fontSize:11, fontWeight:700, padding:'3px 10px', borderRadius:20,
                                     background: driver.status==='online' ? '#d1fae5' : '#f3f4f6',
                                     color:      driver.status==='online' ? '#065f46' : '#6b7280' }}>
                        {driver.status==='online' ? '● Online' : '○ Offline'}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* ── HISTORY TAB ── */}
            {activeTab === 'history' && (
              <div style={{ background:'#fff', borderRadius:20, overflow:'hidden',
                            boxShadow:'0 4px 20px rgba(0,0,0,0.07)', border:'1.5px solid #d1fae5' }}>
                <div style={{ padding:'16px 24px', borderBottom:'1.5px solid #f0fdf4',
                              background:'linear-gradient(90deg,#f0fdf4,#fff)',
                              display:'flex', justifyContent:'space-between', alignItems:'center' }}>
                  <h3 style={{ margin:0, fontSize:15, fontWeight:800, color:'#064e3b' }}>Recent Assignments</h3>
                  <span style={{ fontSize:11, fontWeight:700, padding:'3px 10px', borderRadius:20,
                                 background:'#d1fae5', color:'#065f46' }}>{assignments.length} records</span>
                </div>
                {assignments.map((a, i) => {
                  const sc = STATUS_COLORS[a.status] || { bg:'#f3f4f6', color:'#6b7280' };
                  return (
                    <div key={i} className="row-hover"
                      style={{ display:'flex', alignItems:'center', gap:14, padding:'14px 24px',
                               borderBottom: i < assignments.length-1 ? '1px solid #f0fdf4' : 'none',
                               background:'#fff', transition:'background 0.15s',
                               animation:'fadeUp 0.3s ease both', animationDelay:`${i*0.05}s` }}>
                      <div style={{ width:36, height:36, borderRadius:10, flexShrink:0,
                                    background: a.status==='accepted' ? '#d1fae5' : '#fee2e2',
                                    display:'flex', alignItems:'center', justifyContent:'center', fontSize:16 }}>
                        {a.status==='accepted' ? '✅' : '❌'}
                      </div>
                      <div style={{ flex:1 }}>
                        <div style={{ fontSize:13, fontWeight:800, color:'#064e3b', marginBottom:2 }}>
                          {a.order} → {a.driver}
                        </div>
                        <div style={{ fontSize:11, color:'#9ca3af' }}>{a.time}</div>
                      </div>
                      <span style={{ fontSize:11, fontWeight:700, padding:'4px 12px', borderRadius:20,
                                     background:sc.bg, color:sc.color, textTransform:'capitalize' }}>
                        {a.status}
                      </span>
                    </div>
                  );
                })}
              </div>
            )}

            {/* Activity Log */}
            <div style={{ background:'#fff', borderRadius:20, overflow:'hidden',
                          boxShadow:'0 4px 20px rgba(0,0,0,0.07)', border:'1.5px solid #d1fae5' }}>
              <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center',
                            padding:'14px 24px', borderBottom:'1.5px solid #f0fdf4',
                            background:'linear-gradient(90deg,#f0fdf4,#fff)' }}>
                <div style={{ display:'flex', alignItems:'center', gap:8 }}>
                  <span style={{ fontSize:16 }}>📋</span>
                  <h3 style={{ margin:0, fontSize:14, fontWeight:800, color:'#064e3b' }}>Activity Log</h3>
                  {logs.length > 0 && (
                    <span style={{ background:'#d1fae5', color:'#065f46', fontSize:10,
                                   fontWeight:700, padding:'2px 8px', borderRadius:20 }}>{logs.length}</span>
                  )}
                </div>
                <button onClick={() => setLogs([])}
                  style={{ background:'none', border:'1px solid #d1fae5', borderRadius:8,
                           padding:'4px 12px', fontSize:12, cursor:'pointer', color:'#6b7280',
                           fontFamily:"'Nunito',sans-serif", fontWeight:600 }}>Clear</button>
              </div>
              <div style={{ maxHeight:200, overflowY:'auto', padding:'4px 0' }}>
                {logs.length === 0 ? (
                  <p style={{ textAlign:'center', color:'#9ca3af', fontSize:13, padding:'24px 0', margin:0 }}>
                    No activity yet
                  </p>
                ) : (
                  logs.map((l, i) => (
                    <div key={i} style={{ display:'flex', gap:12, padding:'8px 24px', alignItems:'center',
                                          fontSize:12, borderBottom:'1px solid #f9fafb',
                                          borderLeft:`3px solid ${l.type==='success'?'#34d399':l.type==='error'?'#f87171':'#93c5fd'}`,
                                          animation: i===0 ? 'fadeUp 0.2s ease' : 'none' }}>
                      <span style={{ color:'#9ca3af', flexShrink:0, fontSize:10, fontWeight:700, minWidth:60 }}>{l.time}</span>
                      <span style={{ color: l.type==='error'?'#b91c1c':l.type==='success'?'#065f46':'#374151',
                                     fontWeight: l.type==='error'?700:500 }}>{l.msg}</span>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function ActionBtn({ label, color, onClick, disabled, fullWidth }) {
  const bg = { green:'linear-gradient(90deg,#065f46,#047857)', red:'linear-gradient(90deg,#b91c1c,#dc2626)', blue:'linear-gradient(90deg,#1d4ed8,#2563eb)' };
  return (
    <button className="adm-btn" onClick={onClick} disabled={disabled}
      style={{ flex: fullWidth?undefined:1, width: fullWidth?'100%':undefined,
               padding:'11px 0', borderRadius:12, border:'none',
               background: disabled?'#e5e7eb':bg[color],
               color: disabled?'#9ca3af':'#fff', fontWeight:800, fontSize:13,
               cursor: disabled?'not-allowed':'pointer', transition:'all 0.2s',
               fontFamily:"'Nunito',sans-serif",
               boxShadow: disabled?'none':'0 2px 8px rgba(0,0,0,0.15)' }}>
      {label}
    </button>
  );
}

function StatusPill({ running, label }) {
  return (
    <div style={{ display:'flex', alignItems:'center', gap:7, marginTop:12,
                  padding:'8px 12px', borderRadius:10,
                  background: running?'#f0fdf4':'#f9fafb',
                  border:`1px solid ${running?'#d1fae5':'#e5e7eb'}` }}>
      <div style={{ position:'relative', width:8, height:8, flexShrink:0 }}>
        {running && <div style={{ position:'absolute', inset:0, borderRadius:'50%',
                                   background:'#34d399', animation:'ping 1.5s ease-out infinite' }} />}
        <div style={{ position:'relative', width:8, height:8, borderRadius:'50%',
                      background: running?'#10b981':'#9ca3af' }} />
      </div>
      <span style={{ fontSize:11, color: running?'#065f46':'#6b7280', fontWeight:700 }}>{label}</span>
    </div>
  );
}