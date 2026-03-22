// src/pages/DriverProfilePage.jsx
import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { driverApi } from '../api/deliveryApi';

const VEHICLE_TYPES = ['Car', 'Motorcycle', 'Van', 'Scooter'];
const VEHICLE_ICONS = { Car:'🚗', Motorcycle:'🏍️', Van:'🚐', Scooter:'🛵' };

export default function DriverProfilePage({ driverId }) {
  const navigate = useNavigate();
  const id = driverId || localStorage.getItem('fc_driver_id') || '';

  const [driver,   setDriver]   = useState(null);
  const [stats,    setStats]    = useState(null);
  const [loading,  setLoading]  = useState(true);
  const [editing,  setEditing]  = useState(false);
  const [saving,   setSaving]   = useState(false);
  const [error,    setError]    = useState('');
  const [success,  setSuccess]  = useState('');
  const [form,     setForm]     = useState({});
  const [tab,      setTab]      = useState('profile');
  const [locating, setLocating] = useState(false);
  const successTimer = useRef(null);

  useEffect(() => { if (!id) return; fetchAll(); }, [id]);

  const fetchAll = async () => {
    setLoading(true);
    try {
      const [profileRes, statsRes] = await Promise.all([
        driverApi.getProfile(id),
        driverApi.getStats(id),
      ]);
      setDriver(profileRes.driver);
      setStats(statsRes.stats);
      setForm({
        name: profileRes.driver.name, email: profileRes.driver.email,
        phone: profileRes.driver.phone, vehicleType: profileRes.driver.vehicleType,
        licensePlate: profileRes.driver.licensePlate || '',
        maxCarryWeightKg: profileRes.driver.maxCarryWeightKg,
      });
    } catch (err) {
      setError('Failed to load profile. Make sure the backend is running.');
    } finally { setLoading(false); }
  };

  const handleSave = async () => {
    setSaving(true); setError(''); setSuccess('');
    try {
      const res = await driverApi.updateProfile(id, form);
      setDriver(res.driver); setEditing(false);
      showSuccess('Profile updated successfully!');
    } catch (err) { setError(err.message); }
    finally { setSaving(false); }
  };

  const handleToggleActive = async () => {
    try {
      const res = await driverApi.toggleActiveStatus(id);
      setDriver(res.driver); showSuccess(res.message);
    } catch (err) { setError(err.message); }
  };

  const handleDetectLocation = () => {
    if (!navigator.geolocation) { setError('Geolocation not supported'); return; }
    setLocating(true); setError('');
    navigator.geolocation.getCurrentPosition(
      async ({ coords }) => {
        try {
          await driverApi.updateProfileLocation(id, coords.latitude, coords.longitude);
          setDriver(d => ({ ...d, currentLocation: {
            latitude: coords.latitude, longitude: coords.longitude,
            lastUpdated: new Date().toISOString(),
          }}));
          showSuccess(`Location updated: ${coords.latitude.toFixed(4)}, ${coords.longitude.toFixed(4)}`);
        } catch (err) { setError(err.message); }
        finally { setLocating(false); }
      },
      () => { setError('Could not get location. Allow location access.'); setLocating(false); }
    );
  };

  const showSuccess = (msg) => {
    setSuccess(msg);
    clearTimeout(successTimer.current);
    successTimer.current = setTimeout(() => setSuccess(''), 3000);
  };

  const handle = (e) => setForm(f => ({ ...f, [e.target.name]: e.target.value }));

  if (!id) return <NoDriver />;
  if (loading) return <LoadingScreen />;

  const initials = driver?.name?.split(' ').map(w => w[0]).join('').toUpperCase().slice(0,2) || '?';

  return (
    <div style={{ minHeight:'100vh', background:'#f0fdf4', fontFamily:"'Nunito',sans-serif" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Nunito:wght@400;600;700;800;900&display=swap');
        @keyframes spin { to { transform: rotate(360deg); } }
        @keyframes fadeUp { from{transform:translateY(10px);opacity:0} to{transform:translateY(0);opacity:1} }
        .pf-tab:hover { opacity: 0.85; }
        .pf-btn:hover { transform: translateY(-1px); box-shadow: 0 6px 20px rgba(0,0,0,0.15) !important; }
      `}</style>

      {/* ── HEADER ── */}
      <header style={{ background:'linear-gradient(90deg,#052e16,#064e3b)', padding:'14px 32px',
                       display:'flex', justifyContent:'space-between', alignItems:'center',
                       boxShadow:'0 4px 24px rgba(0,0,0,0.25)', position:'sticky', top:0, zIndex:100 }}>
        <div style={{ display:'flex', alignItems:'center', gap:12 }}>
          <button onClick={() => navigate('/driver/dashboard')}
            style={{ background:'rgba(255,255,255,0.1)', border:'1px solid rgba(255,255,255,0.2)',
                     borderRadius:10, padding:'6px 14px', color:'#6ee7b7', fontSize:13,
                     fontWeight:700, cursor:'pointer', fontFamily:"'Nunito',sans-serif" }}>
            ← Dashboard
          </button>
          <div style={{ width:1, height:24, background:'rgba(255,255,255,0.15)' }} />
          <div style={{ width:32, height:32, borderRadius:8, background:'rgba(255,255,255,0.12)',
                        display:'flex', alignItems:'center', justifyContent:'center', fontSize:18 }}>🌿</div>
          <div>
            <div style={{ color:'#fff', fontWeight:900, fontSize:16, letterSpacing:-0.5 }}>FreshCart</div>
            <div style={{ color:'#6ee7b7', fontSize:9, fontWeight:700, letterSpacing:2 }}>DRIVER PROFILE</div>
          </div>
        </div>
        <div style={{ display:'flex', alignItems:'center', gap:10 }}>
          {!driver?.isActive
            ? <span style={{ fontSize:12, fontWeight:700, padding:'5px 14px', borderRadius:20, background:'#fee2e2', color:'#b91c1c' }}>⏸ Inactive</span>
            : driver?.isAvailable
              ? <span style={{ fontSize:12, fontWeight:700, padding:'5px 14px', borderRadius:20, background:'rgba(16,185,129,0.2)', color:'#6ee7b7' }}>● Online</span>
              : <span style={{ fontSize:12, fontWeight:700, padding:'5px 14px', borderRadius:20, background:'rgba(255,255,255,0.1)', color:'rgba(255,255,255,0.5)' }}>○ Offline</span>
          }
        </div>
      </header>

      <div style={{ maxWidth:1200, margin:'0 auto', padding:'28px 32px 48px' }}>

        {/* Alerts */}
        {error   && <Alert type="error"   msg={error}   onClose={() => setError('')}   />}
        {success && <Alert type="success" msg={success} onClose={() => setSuccess('')} />}

        {/* ── HERO CARD ── */}
        <div style={{ borderRadius:24, overflow:'hidden', marginBottom:20,
                      boxShadow:'0 16px 48px rgba(0,0,0,0.12)', border:'1.5px solid #d1fae5' }}>
          {/* Green banner */}
          <div style={{ background:'linear-gradient(135deg,#052e16,#065f46,#047857)',
                        padding:'32px 36px', position:'relative', overflow:'hidden' }}>
            <div style={{ position:'absolute', top:-40, right:-40, width:160, height:160,
                          borderRadius:'50%', background:'rgba(255,255,255,0.04)' }} />
            <div style={{ position:'absolute', bottom:-20, left:'40%', width:100, height:100,
                          borderRadius:'50%', background:'rgba(255,255,255,0.03)' }} />
            <div style={{ display:'flex', alignItems:'center', gap:20, position:'relative', zIndex:1 }}>
              {/* Avatar */}
              <div style={{ position:'relative', flexShrink:0 }}>
                <div style={{ width:88, height:88, borderRadius:'50%',
                              background:'rgba(255,255,255,0.15)', backdropFilter:'blur(8px)',
                              border:'3px solid rgba(255,255,255,0.3)',
                              display:'flex', alignItems:'center', justifyContent:'center',
                              color:'#fff', fontSize:32, fontWeight:900 }}>
                  {initials}
                </div>
                <div style={{ position:'absolute', bottom:4, right:4, width:18, height:18,
                              borderRadius:'50%', border:'3px solid rgba(255,255,255,0.3)',
                              background: driver?.isAvailable ? '#34d399' : '#9ca3af',
                              boxShadow: driver?.isAvailable ? '0 0 8px #34d399' : 'none' }} />
              </div>
              {/* Info */}
              <div style={{ flex:1 }}>
                <h1 style={{ margin:'0 0 4px', fontSize:28, fontWeight:900, color:'#fff', letterSpacing:-0.5 }}>
                  {driver?.name}
                </h1>
                <p style={{ margin:'0 0 4px', fontSize:14, color:'rgba(255,255,255,0.7)' }}>
                  {VEHICLE_ICONS[driver?.vehicleType]} {driver?.vehicleType}
                  {driver?.licensePlate && ` · ${driver?.licensePlate}`}
                </p>
                <p style={{ margin:'0 0 8px', fontSize:13, color:'rgba(255,255,255,0.6)' }}>
                  📧 {driver?.email} · 📞 {driver?.phone}
                </p>
                <div style={{ display:'flex', alignItems:'center', gap:4 }}>
                  {[1,2,3,4,5].map(n => (
                    <span key={n} style={{ fontSize:16,
                      color: n <= Math.round(driver?.rating?.average||0) ? '#fbbf24' : 'rgba(255,255,255,0.2)' }}>★</span>
                  ))}
                  <span style={{ color:'rgba(255,255,255,0.6)', fontSize:13, marginLeft:6 }}>
                    {driver?.rating?.average?.toFixed(1)||'0.0'} ({driver?.rating?.count||0} ratings)
                  </span>
                </div>
              </div>
              {/* Actions */}
              <div style={{ display:'flex', flexDirection:'column', gap:10, flexShrink:0 }}>
                <button className="pf-btn" onClick={() => { setEditing(true); setTab('profile'); }}
                  style={{ padding:'11px 24px', borderRadius:12, border:'1.5px solid rgba(255,255,255,0.3)',
                           background:'rgba(255,255,255,0.1)', color:'#fff', fontWeight:700,
                           fontSize:14, cursor:'pointer', fontFamily:"'Nunito',sans-serif",
                           backdropFilter:'blur(8px)', transition:'all 0.2s', whiteSpace:'nowrap' }}>
                  ✏️ Edit Profile
                </button>
                <button className="pf-btn" onClick={handleToggleActive}
                  style={{ padding:'11px 24px', borderRadius:12, border:'none',
                           background: driver?.isActive
                             ? 'linear-gradient(90deg,#b91c1c,#dc2626)'
                             : 'linear-gradient(90deg,#065f46,#10b981)',
                           color:'#fff', fontWeight:700, fontSize:14,
                           cursor:'pointer', fontFamily:"'Nunito',sans-serif",
                           transition:'all 0.2s', whiteSpace:'nowrap' }}>
                  {driver?.isActive ? '⏸ Deactivate' : '▶ Activate'}
                </button>
              </div>
            </div>
          </div>

          {/* Stats strip */}
          <div style={{ background:'#fff', display:'flex', borderTop:'1.5px solid #d1fae5' }}>
            {[
              { icon:'✅', val: stats?.totalCompleted||driver?.completedOrders?.length||0, lbl:'Completed', color:'#065f46', bg:'#d1fae5' },
              { icon:'🚚', val: stats?.totalCurrent||driver?.currentOrders?.length||0,    lbl:'Active',    color:'#1d4ed8', bg:'#dbeafe' },
              { icon:'📥', val: stats?.totalPending||driver?.pendingAssignments?.length||0,lbl:'Pending',   color:'#b45309', bg:'#fef3c7' },
              { icon:'⭐', val: stats?.averageRating?.toFixed(1)||driver?.rating?.average?.toFixed(1)||'0.0', lbl:'Avg Rating', color:'#7c3aed', bg:'#ede9fe' },
              { icon:'⚖️', val: `${driver?.maxCarryWeightKg||20}kg`, lbl:'Max Load', color:'#0891b2', bg:'#cffafe' },
            ].map(({ icon, val, lbl, color, bg }, i) => (
              <div key={lbl} style={{ flex:1, display:'flex', flexDirection:'column', alignItems:'center',
                                      gap:4, padding:'18px 12px',
                                      borderRight: i<4 ? '1px solid #f0fdf4' : 'none' }}>
                <div style={{ width:40, height:40, borderRadius:12, background:bg,
                              display:'flex', alignItems:'center', justifyContent:'center', fontSize:20 }}>
                  {icon}
                </div>
                <span style={{ fontSize:20, fontWeight:900, color }}>{val}</span>
                <span style={{ fontSize:11, color:'#9ca3af', fontWeight:700 }}>{lbl}</span>
              </div>
            ))}
          </div>
        </div>

        {/* ── TWO COLUMN LAYOUT ── */}
        <div style={{ display:'grid', gridTemplateColumns:'260px 1fr', gap:20, alignItems:'start' }}>

          {/* Left — vertical tabs */}
          <div style={{ display:'flex', flexDirection:'column', gap:8 }}>
            {[
              { key:'profile',  icon:'👤', label:'Personal Info'   },
              { key:'stats',    icon:'📊', label:'Performance'     },
              { key:'location', icon:'📍', label:'Location'        },
            ].map(t => (
              <button key={t.key} className="pf-tab" onClick={() => setTab(t.key)} style={{
                width:'100%', padding:'14px 18px', borderRadius:14, cursor:'pointer',
                fontFamily:"'Nunito',sans-serif", fontWeight:700, fontSize:14,
                transition:'all 0.2s', textAlign:'left',
                display:'flex', alignItems:'center', gap:10,
                border: `2px solid ${tab===t.key ? '#064e3b' : '#e5e7eb'}`,
                background: tab===t.key ? '#064e3b' : '#fff',
                color:      tab===t.key ? '#fff'    : '#4b5563',
                boxShadow:  tab===t.key ? '0 4px 16px rgba(6,79,58,0.2)' : '0 2px 8px rgba(0,0,0,0.04)',
              }}>
                <span style={{ fontSize:18 }}>{t.icon}</span>
                {t.label}
                {tab===t.key && <span style={{ marginLeft:'auto', fontSize:16 }}>›</span>}
              </button>
            ))}

            {/* Back to dashboard */}
            <button onClick={() => navigate('/driver/dashboard')}
              style={{ marginTop:8, width:'100%', padding:'12px 18px', borderRadius:14,
                       border:'1.5px solid #d1fae5', background:'#f0fdf4',
                       color:'#065f46', fontWeight:700, fontSize:13, cursor:'pointer',
                       fontFamily:"'Nunito',sans-serif", display:'flex', alignItems:'center', gap:8 }}>
              ← Back to Dashboard
            </button>
          </div>

          {/* Right — content */}
          <div style={{ animation:'fadeUp 0.3s ease' }}>

            {/* ── PROFILE TAB ── */}
            {tab === 'profile' && (
              <div style={s.card}>
                <div style={s.cardHeader}>
                  <h3 style={s.cardTitle}>Personal Information</h3>
                  {!editing && (
                    <button onClick={() => setEditing(true)} style={s.smallEditBtn}>✏️ Edit</button>
                  )}
                </div>
                {editing ? (
                  <div style={{ display:'flex', flexDirection:'column' }}>
                    <FormRow>
                      <Field label="Full Name"     name="name"         value={form.name}         onChange={handle} />
                      <Field label="Email"         name="email"        value={form.email}        onChange={handle} type="email" />
                    </FormRow>
                    <FormRow>
                      <Field label="Phone"         name="phone"        value={form.phone}        onChange={handle} type="tel" />
                      <Field label="License Plate" name="licensePlate" value={form.licensePlate} onChange={handle} />
                    </FormRow>
                    <FormRow>
                      <div style={{ flex:1 }}>
                        <label style={s.label}>Vehicle Type</label>
                        <select name="vehicleType" value={form.vehicleType} onChange={handle} style={s.select}>
                          {VEHICLE_TYPES.map(v => <option key={v}>{v}</option>)}
                        </select>
                      </div>
                      <Field label="Max Carry Weight (kg)" name="maxCarryWeightKg"
                        value={form.maxCarryWeightKg} onChange={handle} type="number" min={1} max={500} />
                    </FormRow>
                    <div style={{ display:'flex', gap:10, justifyContent:'flex-end', marginTop:4 }}>
                      <button onClick={() => setEditing(false)} style={s.cancelBtn}>Cancel</button>
                      <button onClick={handleSave} disabled={saving} style={s.saveBtn}>
                        {saving ? 'Saving…' : '✓ Save Changes'}
                      </button>
                    </div>
                  </div>
                ) : (
                  <div style={{ display:'flex', flexDirection:'column' }}>
                    {[
                      { icon:'👤', label:'Full Name',    value: driver?.name },
                      { icon:'📧', label:'Email',        value: driver?.email },
                      { icon:'📞', label:'Phone',        value: driver?.phone },
                      { icon:'🚗', label:'Vehicle',      value: `${driver?.vehicleType} ${driver?.licensePlate ? '· '+driver?.licensePlate : ''}` },
                      { icon:'⚖️', label:'Max Weight',   value: `${driver?.maxCarryWeightKg} kg` },
                      { icon:'🆔', label:'User ID',      value: driver?.userId },
                      { icon:'📅', label:'Member Since', value: driver?.createdAt ? new Date(driver?.createdAt).toLocaleDateString('en-LK', { year:'numeric', month:'long', day:'numeric' }) : '—' },
                    ].map(({ icon, label, value }) => (
                      <div key={label} style={{ display:'flex', alignItems:'center', gap:14,
                                                padding:'13px 0', borderBottom:'1px solid #f0fdf4' }}>
                        <span style={{ fontSize:20, width:28, textAlign:'center', flexShrink:0 }}>{icon}</span>
                        <span style={{ fontSize:13, color:'#9ca3af', fontWeight:600, width:150, flexShrink:0 }}>{label}</span>
                        <span style={{ fontSize:14, color:'#064e3b', fontWeight:700, flex:1, wordBreak:'break-all' }}>{value||'—'}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* ── STATS TAB ── */}
            {tab === 'stats' && (
              <div style={{ display:'flex', flexDirection:'column', gap:16 }}>
                <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(160px,1fr))', gap:14 }}>
                  {[
                    { icon:'✅', label:'Completed Orders', value: stats?.totalCompleted||0,  color:'#065f46', bg:'#d1fae5' },
                    { icon:'🚚', label:'Active Orders',    value: stats?.totalCurrent||0,    color:'#1d4ed8', bg:'#dbeafe' },
                    { icon:'📥', label:'Pending Orders',   value: stats?.totalPending||0,    color:'#b45309', bg:'#fef3c7' },
                    { icon:'⭐', label:'Average Rating',   value: stats?.averageRating?.toFixed(1)||'—', color:'#7c3aed', bg:'#ede9fe' },
                  ].map(({ icon, label, value, color, bg }) => (
                    <div key={label} style={{ borderRadius:18, padding:'24px 20px', background:bg,
                                              display:'flex', flexDirection:'column', alignItems:'center', gap:8 }}>
                      <span style={{ fontSize:32 }}>{icon}</span>
                      <span style={{ fontSize:36, fontWeight:900, color }}>{value}</span>
                      <span style={{ fontSize:12, color, fontWeight:700, textAlign:'center' }}>{label}</span>
                    </div>
                  ))}
                </div>
                <div style={s.card}>
                  <h3 style={s.cardTitle}>Rating Breakdown</h3>
                  <div style={{ display:'flex', alignItems:'center', gap:20, padding:'16px 0' }}>
                    <div style={{ fontSize:56, fontWeight:900, color:'#064e3b' }}>
                      {stats?.averageRating?.toFixed(1)||'0.0'}
                    </div>
                    <div>
                      <div style={{ fontSize:24, color:'#f59e0b' }}>
                        {'★'.repeat(Math.round(stats?.averageRating||0))}
                        {'☆'.repeat(5-Math.round(stats?.averageRating||0))}
                      </div>
                      <p style={{ margin:'4px 0 0', color:'#6b7280', fontSize:14 }}>
                        Based on {stats?.ratingCount||0} completed deliveries
                      </p>
                    </div>
                  </div>
                </div>
                <div style={s.card}>
                  <h3 style={s.cardTitle}>Account Status</h3>
                  {[
                    { icon:'🟢', label:'Active',    value: driver?.isActive    ? 'Yes' : 'No' },
                    { icon:'📡', label:'Available', value: driver?.isAvailable ? 'Online' : 'Offline' },
                    { icon:'📅', label:'Joined',    value: stats?.memberSince ? new Date(stats.memberSince).toLocaleDateString('en-LK',{year:'numeric',month:'long'}) : '—' },
                  ].map(({ icon, label, value }) => (
                    <div key={label} style={{ display:'flex', alignItems:'center', gap:14,
                                              padding:'13px 0', borderBottom:'1px solid #f0fdf4' }}>
                      <span style={{ fontSize:18, width:24, textAlign:'center' }}>{icon}</span>
                      <span style={{ fontSize:13, color:'#9ca3af', fontWeight:600, width:140 }}>{label}</span>
                      <span style={{ fontSize:14, color:'#064e3b', fontWeight:700 }}>{value}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* ── LOCATION TAB ── */}
            {tab === 'location' && (
              <div style={s.card}>
                <h3 style={s.cardTitle}>Current Location</h3>
                {driver?.currentLocation?.latitude ? (
                  <>
                    <div style={{ display:'flex', flexDirection:'column' }}>
                      {[
                        { icon:'🌐', label:'Latitude',     value: driver.currentLocation.latitude.toFixed(6)  },
                        { icon:'🌐', label:'Longitude',    value: driver.currentLocation.longitude.toFixed(6) },
                        { icon:'🕐', label:'Last Updated', value: driver.currentLocation.lastUpdated ? new Date(driver.currentLocation.lastUpdated).toLocaleString() : '—' },
                      ].map(({ icon, label, value }) => (
                        <div key={label} style={{ display:'flex', alignItems:'center', gap:14,
                                                  padding:'13px 0', borderBottom:'1px solid #f0fdf4' }}>
                          <span style={{ fontSize:18, width:24 }}>{icon}</span>
                          <span style={{ fontSize:13, color:'#9ca3af', fontWeight:600, width:150 }}>{label}</span>
                          <span style={{ fontSize:14, color:'#064e3b', fontWeight:700 }}>{value}</span>
                        </div>
                      ))}
                    </div>
                    {/* Map preview placeholder */}
                    <div style={{ marginTop:20, borderRadius:16, overflow:'hidden', height:200,
                                  background:'linear-gradient(135deg,#d1fae5,#a7f3d0)',
                                  display:'flex', alignItems:'center', justifyContent:'center',
                                  flexDirection:'column', gap:8, border:'1.5px solid #6ee7b7' }}>
                      <span style={{ fontSize:40 }}>📍</span>
                      <p style={{ margin:0, color:'#065f46', fontWeight:700, fontSize:14 }}>
                        {driver.currentLocation.latitude.toFixed(4)}, {driver.currentLocation.longitude.toFixed(4)}
                      </p>
                    </div>
                  </>
                ) : (
                  <div style={{ textAlign:'center', padding:'48px 0' }}>
                    <span style={{ fontSize:48 }}>📍</span>
                    <p style={{ color:'#6b7280', marginTop:12, fontSize:14 }}>No location recorded yet</p>
                  </div>
                )}
                <button onClick={handleDetectLocation} disabled={locating}
                  style={{ ...s.saveBtn, marginTop:20, width:'100%', opacity: locating ? 0.7 : 1,
                           display:'flex', alignItems:'center', justifyContent:'center', gap:8 }}>
                  {locating ? (
                    <><div style={{ width:14, height:14, border:'2px solid rgba(255,255,255,0.4)',
                                    borderTop:'2px solid #fff', borderRadius:'50%',
                                    animation:'spin 0.6s linear infinite' }} /> Detecting…</>
                  ) : '📍 Update My Location'}
                </button>
                <p style={{ fontSize:12, color:'#9ca3af', marginTop:10, textAlign:'center' }}>
                  Uses your browser GPS to update location in the system.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function Alert({ type, msg, onClose }) {
  const isErr = type === 'error';
  return (
    <div style={{ background: isErr ? '#fef2f2' : '#f0fdf4',
                  border: `1px solid ${isErr ? '#fca5a5' : '#86efac'}`,
                  borderRadius:12, padding:'12px 16px', marginBottom:16,
                  display:'flex', justifyContent:'space-between', alignItems:'center' }}>
      <span style={{ color: isErr ? '#b91c1c' : '#065f46', fontSize:14, fontWeight:600 }}>{msg}</span>
      <button onClick={onClose} style={{ background:'none', border:'none', cursor:'pointer',
                                         color:'#9ca3af', fontSize:20, lineHeight:1 }}>×</button>
    </div>
  );
}

function FormRow({ children }) {
  return <div style={{ display:'flex', gap:12, marginBottom:14 }}>{children}</div>;
}

function Field({ label, ...props }) {
  return (
    <div style={{ flex:1 }}>
      <label style={s.label}>{label}</label>
      <input {...props} style={s.input} />
    </div>
  );
}

function LoadingScreen() {
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
      <p style={{ color:'#047857', fontWeight:800, fontSize:15 }}>Loading profile…</p>
    </div>
  );
}

function NoDriver() {
  return (
    <div style={{ textAlign:'center', padding:60, fontFamily:"'Nunito',sans-serif" }}>
      <p style={{ fontSize:48 }}>🚫</p>
      <p style={{ color:'#374151', marginTop:12, fontWeight:700, fontSize:18 }}>No driver ID found.</p>
      <p style={{ color:'#6b7280', fontSize:14 }}>Please register as a driver first.</p>
      <a href="/driver/register" style={{ display:'inline-block', marginTop:20,
        padding:'12px 28px', background:'linear-gradient(90deg,#065f46,#047857)',
        color:'#fff', borderRadius:12, textDecoration:'none', fontWeight:800, fontSize:14 }}>
        Register Now →
      </a>
    </div>
  );
}

const s = {
  card:        { background:'#fff', borderRadius:20, padding:28,
                 boxShadow:'0 4px 20px rgba(0,0,0,0.07)', border:'1.5px solid #d1fae5' },
  cardHeader:  { display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:20 },
  cardTitle:   { margin:0, fontSize:17, fontWeight:800, color:'#064e3b' },
  smallEditBtn:{ background:'#f0fdf4', border:'1px solid #d1fae5', borderRadius:10,
                 padding:'7px 16px', fontSize:13, fontWeight:700, cursor:'pointer', color:'#065f46' },
  label:       { display:'block', fontSize:11, fontWeight:700, color:'#374151',
                 marginBottom:4, textTransform:'uppercase', letterSpacing:0.5 },
  input:       { width:'100%', padding:'11px 14px', borderRadius:10, fontSize:14,
                 border:'1.5px solid #d1fae5', outline:'none', background:'#f9fafb',
                 boxSizing:'border-box', fontFamily:"'Nunito',sans-serif" },
  select:      { width:'100%', padding:'11px 14px', borderRadius:10, fontSize:14,
                 border:'1.5px solid #d1fae5', outline:'none', background:'#f9fafb',
                 fontFamily:"'Nunito',sans-serif" },
  cancelBtn:   { padding:'10px 24px', borderRadius:12, border:'1.5px solid #e5e7eb',
                 background:'#fff', fontWeight:700, fontSize:14, cursor:'pointer',
                 color:'#6b7280', fontFamily:"'Nunito',sans-serif" },
  saveBtn:     { padding:'11px 28px', borderRadius:12, border:'none',
                 background:'linear-gradient(90deg,#065f46,#047857)',
                 color:'#fff', fontWeight:800, fontSize:14, cursor:'pointer',
                 fontFamily:"'Nunito',sans-serif", transition:'all 0.2s' },
};