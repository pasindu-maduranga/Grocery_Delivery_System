// src/pages/DriverProfilePage.jsx
import React, { useState, useEffect, useRef } from 'react';
import { driverApi } from '../api/deliveryApi';

const VEHICLE_TYPES = ['Car', 'Motorcycle', 'Van', 'Scooter'];

const VEHICLE_ICONS = {
  Car:        '🚗',
  Motorcycle: '🏍️',
  Van:        '🚐',
  Scooter:    '🛵',
};

export default function DriverProfilePage({ driverId }) {
  const id = driverId || localStorage.getItem('fc_driver_id') || '';

  const [driver,   setDriver]   = useState(null);
  const [stats,    setStats]    = useState(null);
  const [loading,  setLoading]  = useState(true);
  const [editing,  setEditing]  = useState(false);
  const [saving,   setSaving]   = useState(false);
  const [error,    setError]    = useState('');
  const [success,  setSuccess]  = useState('');
  const [form,     setForm]     = useState({});
  const [tab,      setTab]      = useState('profile'); // 'profile' | 'stats' | 'location'
  const [locating, setLocating] = useState(false);
  const successTimer = useRef(null);

  // ── Fetch profile + stats ─────────────────────────────────────────────────
  useEffect(() => {
    if (!id) return;
    fetchAll();
  }, [id]);

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
        name:             profileRes.driver.name,
        email:            profileRes.driver.email,
        phone:            profileRes.driver.phone,
        vehicleType:      profileRes.driver.vehicleType,
        licensePlate:     profileRes.driver.licensePlate || '',
        maxCarryWeightKg: profileRes.driver.maxCarryWeightKg,
      });
    } catch (err) {
      setError('Failed to load profile. Make sure the backend is running.');
    } finally {
      setLoading(false);
    }
  };

  // ── Save profile edits ────────────────────────────────────────────────────
  const handleSave = async () => {
    setSaving(true); setError(''); setSuccess('');
    try {
      const res = await driverApi.updateProfile(id, form);
      setDriver(res.driver);
      setEditing(false);
      showSuccess('Profile updated successfully!');
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  // ── Toggle active status ──────────────────────────────────────────────────
  const handleToggleActive = async () => {
    try {
      const res = await driverApi.toggleActiveStatus(id);
      setDriver(res.driver);
      showSuccess(res.message);
    } catch (err) {
      setError(err.message);
    }
  };

  // ── Auto-detect GPS location ──────────────────────────────────────────────
  const handleDetectLocation = () => {
    if (!navigator.geolocation) {
      setError('Geolocation not supported by your browser');
      return;
    }
    setLocating(true); setError('');
    navigator.geolocation.getCurrentPosition(
      async ({ coords }) => {
        try {
          await driverApi.updateProfileLocation(id, coords.latitude, coords.longitude);
          setDriver(d => ({
            ...d,
            currentLocation: {
              latitude:    coords.latitude,
              longitude:   coords.longitude,
              lastUpdated: new Date().toISOString(),
            },
          }));
          showSuccess(`Location updated: ${coords.latitude.toFixed(4)}, ${coords.longitude.toFixed(4)}`);
        } catch (err) {
          setError(err.message);
        } finally {
          setLocating(false);
        }
      },
      () => { setError('Could not get location. Please allow location access.'); setLocating(false); }
    );
  };

  const showSuccess = (msg) => {
    setSuccess(msg);
    clearTimeout(successTimer.current);
    successTimer.current = setTimeout(() => setSuccess(''), 3000);
  };

  const handle = (e) => setForm(f => ({ ...f, [e.target.name]: e.target.value }));

  // ── Render ────────────────────────────────────────────────────────────────
  if (!id) return <NoDriver />;
  if (loading) return <LoadingScreen />;

  return (
    <div style={s.page}>
      {/* Header */}
      <header style={s.header}>
        <div style={s.headerLeft}>
          <span style={{ fontSize: 22 }}>🌿</span>
          <span style={s.brand}>FreshCart</span>
          <span style={s.headerSub}>Driver Profile</span>
        </div>
        <div style={s.headerRight}>
          <StatusBadge isActive={driver?.isActive} isAvailable={driver?.isAvailable} />
        </div>
      </header>

      <div style={s.body}>
        {/* Alerts */}
        {error   && <Alert type="error"   msg={error}   onClose={() => setError('')} />}
        {success && <Alert type="success" msg={success} onClose={() => setSuccess('')} />}

        {/* Hero card */}
        <div style={s.heroCard}>
          <div style={s.avatarWrap}>
            <div style={s.avatar}>{driver?.name?.[0]?.toUpperCase() || '?'}</div>
            <div style={{ ...s.onlineDot,
              background: driver?.isAvailable ? '#10b981' : '#9ca3af' }} />
          </div>
          <div style={s.heroInfo}>
            <h1 style={s.heroName}>{driver?.name}</h1>
            <p style={s.heroMeta}>
              {VEHICLE_ICONS[driver?.vehicleType]} {driver?.vehicleType}
              {driver?.licensePlate && ` · ${driver?.licensePlate}`}
            </p>
            <p style={s.heroMeta}>📧 {driver?.email} · 📞 {driver?.phone}</p>
            <div style={s.heroRating}>
              {'★'.repeat(Math.round(driver?.rating?.average || 0))}
              {'☆'.repeat(5 - Math.round(driver?.rating?.average || 0))}
              <span style={s.ratingText}>
                {driver?.rating?.average?.toFixed(1) || '0.0'} ({driver?.rating?.count || 0} ratings)
              </span>
            </div>
          </div>
          <div style={s.heroActions}>
            <button
              onClick={() => { setEditing(true); setTab('profile'); }}
              style={s.editBtn}
            >
              ✏️ Edit Profile
            </button>
            <button
              onClick={handleToggleActive}
              style={{ ...s.toggleBtn,
                background: driver?.isActive
                  ? 'linear-gradient(90deg,#b91c1c,#dc2626)'
                  : 'linear-gradient(90deg,#065f46,#047857)' }}
            >
              {driver?.isActive ? '⏸ Deactivate' : '▶ Activate'}
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div style={s.tabs}>
          {[
            { key: 'profile',  label: '👤 Profile'  },
            { key: 'stats',    label: '📊 Stats'    },
            { key: 'location', label: '📍 Location' },
          ].map(t => (
            <button
              key={t.key}
              onClick={() => setTab(t.key)}
              style={{ ...s.tab, ...(tab === t.key ? s.tabActive : {}) }}
            >
              {t.label}
            </button>
          ))}
        </div>

        {/* ── PROFILE TAB ─────────────────────────────────────────────────── */}
        {tab === 'profile' && (
          <div style={s.card}>
            <div style={s.cardHeader}>
              <h3 style={s.cardTitle}>Personal Information</h3>
              {!editing && (
                <button onClick={() => setEditing(true)} style={s.smallEditBtn}>Edit</button>
              )}
            </div>

            {editing ? (
              <div style={s.form}>
                <FormRow>
                  <Field label="Full Name"     name="name"         value={form.name}         onChange={handle} />
                  <Field label="Email"         name="email"        value={form.email}        onChange={handle} type="email" />
                </FormRow>
                <FormRow>
                  <Field label="Phone"         name="phone"        value={form.phone}        onChange={handle} type="tel" />
                  <Field label="License Plate" name="licensePlate" value={form.licensePlate} onChange={handle} />
                </FormRow>
                <FormRow>
                  <div style={{ flex: 1 }}>
                    <label style={s.label}>Vehicle Type</label>
                    <select name="vehicleType" value={form.vehicleType} onChange={handle} style={s.select}>
                      {VEHICLE_TYPES.map(v => <option key={v}>{v}</option>)}
                    </select>
                  </div>
                  <Field
                    label="Max Carry Weight (kg)"
                    name="maxCarryWeightKg"
                    value={form.maxCarryWeightKg}
                    onChange={handle}
                    type="number" min={1} max={500}
                  />
                </FormRow>
                <div style={s.formActions}>
                  <button onClick={() => setEditing(false)} style={s.cancelBtn}>Cancel</button>
                  <button onClick={handleSave} disabled={saving} style={s.saveBtn}>
                    {saving ? 'Saving…' : '✓ Save Changes'}
                  </button>
                </div>
              </div>
            ) : (
              <div style={s.infoGrid}>
                <InfoRow icon="👤" label="Full Name"    value={driver?.name} />
                <InfoRow icon="📧" label="Email"        value={driver?.email} />
                <InfoRow icon="📞" label="Phone"        value={driver?.phone} />
                <InfoRow icon="🚗" label="Vehicle"      value={`${driver?.vehicleType} ${driver?.licensePlate ? '· ' + driver?.licensePlate : ''}`} />
                <InfoRow icon="⚖️" label="Max Weight"   value={`${driver?.maxCarryWeightKg} kg`} />
                <InfoRow icon="🆔" label="User ID"      value={driver?.userId} />
                <InfoRow icon="📅" label="Member Since" value={new Date(driver?.createdAt).toLocaleDateString('en-LK', { year: 'numeric', month: 'long', day: 'numeric' })} />
              </div>
            )}
          </div>
        )}

        {/* ── STATS TAB ───────────────────────────────────────────────────── */}
        {tab === 'stats' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            <div style={s.statsGrid}>
              <StatCard icon="✅" label="Completed Orders" value={stats?.totalCompleted || 0} color="#065f46" bg="#d1fae5" />
              <StatCard icon="🚚" label="Active Orders"    value={stats?.totalCurrent   || 0} color="#1d4ed8" bg="#dbeafe" />
              <StatCard icon="📥" label="Pending Orders"   value={stats?.totalPending   || 0} color="#b45309" bg="#fef3c7" />
              <StatCard icon="⭐" label="Average Rating"
                value={stats?.averageRating ? stats.averageRating.toFixed(1) : '—'}
                color="#7c3aed" bg="#ede9fe"
              />
            </div>
            <div style={s.card}>
              <h3 style={s.cardTitle}>Rating Breakdown</h3>
              <div style={{ padding: '8px 0' }}>
                <div style={s.ratingBig}>
                  {stats?.averageRating?.toFixed(1) || '0.0'}
                  <span style={s.ratingStars}>
                    {'★'.repeat(Math.round(stats?.averageRating || 0))}
                    {'☆'.repeat(5 - Math.round(stats?.averageRating || 0))}
                  </span>
                </div>
                <p style={{ color: '#6b7280', fontSize: 14, marginTop: 4 }}>
                  Based on {stats?.ratingCount || 0} completed deliveries
                </p>
              </div>
            </div>
            <div style={s.card}>
              <h3 style={s.cardTitle}>Account Status</h3>
              <div style={s.infoGrid}>
                <InfoRow icon="🟢" label="Active"    value={driver?.isActive    ? 'Yes' : 'No'} />
                <InfoRow icon="📡" label="Available" value={driver?.isAvailable ? 'Online' : 'Offline'} />
                <InfoRow icon="📅" label="Joined"
                  value={stats?.memberSince
                    ? new Date(stats.memberSince).toLocaleDateString('en-LK', { year: 'numeric', month: 'long' })
                    : '—'}
                />
              </div>
            </div>
          </div>
        )}

        {/* ── LOCATION TAB ────────────────────────────────────────────────── */}
        {tab === 'location' && (
          <div style={s.card}>
            <h3 style={s.cardTitle}>Current Location</h3>

            {driver?.currentLocation?.latitude ? (
              <div style={s.infoGrid}>
                <InfoRow icon="🌐" label="Latitude"     value={driver.currentLocation.latitude.toFixed(6)} />
                <InfoRow icon="🌐" label="Longitude"    value={driver.currentLocation.longitude.toFixed(6)} />
                <InfoRow icon="🕐" label="Last Updated"
                  value={driver.currentLocation.lastUpdated
                    ? new Date(driver.currentLocation.lastUpdated).toLocaleString()
                    : '—'}
                />
              </div>
            ) : (
              <div style={s.noLocation}>
                <span style={{ fontSize: 40 }}>📍</span>
                <p style={{ color: '#6b7280', marginTop: 10 }}>No location recorded yet</p>
              </div>
            )}

            <button
              onClick={handleDetectLocation}
              disabled={locating}
              style={{ ...s.saveBtn, marginTop: 20, opacity: locating ? 0.7 : 1 }}
            >
              {locating ? '📡 Detecting…' : '📍 Update My Location'}
            </button>

            <p style={s.locationNote}>
              This will use your browser's GPS to update your location in the system.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

// ── Sub-components ────────────────────────────────────────────────────────────

function StatusBadge({ isActive, isAvailable }) {
  if (!isActive) return <span style={{ ...badge, background: '#fee2e2', color: '#b91c1c' }}>⏸ Inactive</span>;
  if (isAvailable) return <span style={{ ...badge, background: '#d1fae5', color: '#065f46' }}>● Online</span>;
  return <span style={{ ...badge, background: '#f3f4f6', color: '#6b7280' }}>○ Offline</span>;
}

const badge = { fontSize: 13, fontWeight: 700, padding: '5px 14px', borderRadius: 20 };

function Alert({ type, msg, onClose }) {
  const isErr = type === 'error';
  return (
    <div style={{ background: isErr ? '#fef2f2' : '#f0fdf4',
                  border: `1px solid ${isErr ? '#fca5a5' : '#86efac'}`,
                  borderRadius: 12, padding: '12px 16px', marginBottom: 14,
                  display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
      <span style={{ color: isErr ? '#b91c1c' : '#065f46', fontSize: 14, fontWeight: 600 }}>{msg}</span>
      <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer',
                                         color: '#9ca3af', fontSize: 18, lineHeight: 1 }}>×</button>
    </div>
  );
}

function FormRow({ children }) {
  return <div style={{ display: 'flex', gap: 12, marginBottom: 14 }}>{children}</div>;
}

function Field({ label, ...props }) {
  return (
    <div style={{ flex: 1 }}>
      <label style={s.label}>{label}</label>
      <input {...props} style={s.input} />
    </div>
  );
}

function InfoRow({ icon, label, value }) {
  return (
    <div style={s.infoRow}>
      <span style={s.infoIcon}>{icon}</span>
      <span style={s.infoLabel}>{label}</span>
      <span style={s.infoValue}>{value || '—'}</span>
    </div>
  );
}

function StatCard({ icon, label, value, color, bg }) {
  return (
    <div style={{ ...s.statCard, background: bg }}>
      <span style={{ fontSize: 28 }}>{icon}</span>
      <span style={{ fontSize: 32, fontWeight: 900, color }}>{value}</span>
      <span style={{ fontSize: 12, color, fontWeight: 600, textAlign: 'center' }}>{label}</span>
    </div>
  );
}

function LoadingScreen() {
  return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center',
                  height: '100vh', background: '#f0fdf4', flexDirection: 'column', gap: 16 }}>
      <div style={{ width: 40, height: 40, border: '4px solid #d1fae5',
                    borderTop: '4px solid #047857', borderRadius: '50%',
                    animation: 'spin 0.8s linear infinite' }} />
      <p style={{ color: '#047857', fontWeight: 600, fontFamily: 'Nunito, sans-serif' }}>Loading profile…</p>
    </div>
  );
}

function NoDriver() {
  return (
    <div style={{ textAlign: 'center', padding: 60, fontFamily: 'Nunito, sans-serif' }}>
      <p style={{ fontSize: 40 }}>🚫</p>
      <p style={{ color: '#374151', marginTop: 12, fontWeight: 600 }}>No driver ID found.</p>
      <p style={{ color: '#6b7280', fontSize: 14 }}>Please register as a driver first.</p>
      <a href="/driver/register" style={{ display: 'inline-block', marginTop: 16,
        padding: '10px 24px', background: '#065f46', color: '#fff',
        borderRadius: 12, textDecoration: 'none', fontWeight: 700 }}>
        Register Now →
      </a>
    </div>
  );
}

// ── Styles ────────────────────────────────────────────────────────────────────
const s = {
  page:         { minHeight: '100vh', background: '#f0fdf4', fontFamily: "'Nunito', sans-serif" },
  header:       { background: '#064e3b', padding: '14px 24px', display: 'flex',
                  justifyContent: 'space-between', alignItems: 'center',
                  position: 'sticky', top: 0, zIndex: 10,
                  boxShadow: '0 2px 12px rgba(0,0,0,0.15)' },
  headerLeft:   { display: 'flex', alignItems: 'center', gap: 10 },
  brand:        { color: '#fff', fontWeight: 800, fontSize: 18 },
  headerSub:    { color: '#6ee7b7', fontSize: 13, fontWeight: 600 },
  headerRight:  { display: 'flex', alignItems: 'center', gap: 10 },
  body:         { maxWidth: 720, margin: '0 auto', padding: '24px 16px' },

  heroCard:     { background: '#fff', borderRadius: 20, padding: '24px',
                  display: 'flex', alignItems: 'flex-start', gap: 20, flexWrap: 'wrap',
                  boxShadow: '0 4px 24px rgba(0,0,0,0.07)', marginBottom: 16,
                  border: '1.5px solid #d1fae5' },
  avatarWrap:   { position: 'relative', flexShrink: 0 },
  avatar:       { width: 72, height: 72, borderRadius: '50%',
                  background: 'linear-gradient(135deg,#064e3b,#10b981)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  color: '#fff', fontSize: 30, fontWeight: 900 },
  onlineDot:    { position: 'absolute', bottom: 4, right: 4,
                  width: 14, height: 14, borderRadius: '50%',
                  border: '2px solid #fff', transition: 'background 0.3s' },
  heroInfo:     { flex: 1 },
  heroName:     { margin: '0 0 4px', fontSize: 22, fontWeight: 900, color: '#064e3b' },
  heroMeta:     { margin: '0 0 4px', fontSize: 13, color: '#6b7280' },
  heroRating:   { fontSize: 18, color: '#f59e0b', marginTop: 4 },
  ratingText:   { fontSize: 13, color: '#6b7280', marginLeft: 8, fontWeight: 600 },
  heroActions:  { display: 'flex', flexDirection: 'column', gap: 8, flexShrink: 0 },
  editBtn:      { padding: '10px 20px', borderRadius: 12, border: '1.5px solid #d1fae5',
                  background: '#fff', fontWeight: 700, fontSize: 13, cursor: 'pointer',
                  color: '#065f46', whiteSpace: 'nowrap' },
  toggleBtn:    { padding: '10px 20px', borderRadius: 12, border: 'none',
                  color: '#fff', fontWeight: 700, fontSize: 13, cursor: 'pointer',
                  whiteSpace: 'nowrap' },

  tabs:         { display: 'flex', gap: 8, marginBottom: 16 },
  tab:          { flex: 1, padding: '10px 0', borderRadius: 12,
                  border: '1.5px solid #d1fae5', background: '#fff',
                  fontWeight: 700, fontSize: 14, cursor: 'pointer',
                  color: '#374151', transition: 'all 0.2s', fontFamily: 'Nunito, sans-serif' },
  tabActive:    { background: '#064e3b', color: '#fff', borderColor: '#064e3b' },

  card:         { background: '#fff', borderRadius: 20, padding: 24,
                  boxShadow: '0 4px 20px rgba(0,0,0,0.07)', border: '1.5px solid #d1fae5' },
  cardHeader:   { display: 'flex', justifyContent: 'space-between',
                  alignItems: 'center', marginBottom: 20 },
  cardTitle:    { margin: 0, fontSize: 16, fontWeight: 800, color: '#064e3b' },
  smallEditBtn: { background: '#f0fdf4', border: '1px solid #d1fae5', borderRadius: 8,
                  padding: '5px 14px', fontSize: 13, fontWeight: 700,
                  cursor: 'pointer', color: '#065f46' },

  form:         { display: 'flex', flexDirection: 'column' },
  label:        { display: 'block', fontSize: 11, fontWeight: 700, color: '#374151',
                  marginBottom: 4, textTransform: 'uppercase', letterSpacing: 0.5 },
  input:        { width: '100%', padding: '10px 14px', borderRadius: 10, fontSize: 14,
                  border: '1.5px solid #d1fae5', outline: 'none',
                  background: '#f9fafb', boxSizing: 'border-box',
                  fontFamily: 'Nunito, sans-serif' },
  select:       { width: '100%', padding: '10px 14px', borderRadius: 10, fontSize: 14,
                  border: '1.5px solid #d1fae5', outline: 'none',
                  background: '#f9fafb', fontFamily: 'Nunito, sans-serif' },
  formActions:  { display: 'flex', gap: 10, justifyContent: 'flex-end', marginTop: 4 },
  cancelBtn:    { padding: '10px 24px', borderRadius: 12, border: '1.5px solid #e5e7eb',
                  background: '#fff', fontWeight: 700, fontSize: 14,
                  cursor: 'pointer', color: '#6b7280', fontFamily: 'Nunito, sans-serif' },
  saveBtn:      { padding: '10px 28px', borderRadius: 12, border: 'none',
                  background: 'linear-gradient(90deg,#065f46,#047857)',
                  color: '#fff', fontWeight: 700, fontSize: 14,
                  cursor: 'pointer', fontFamily: 'Nunito, sans-serif' },

  infoGrid:     { display: 'flex', flexDirection: 'column', gap: 0 },
  infoRow:      { display: 'flex', alignItems: 'center', gap: 12, padding: '12px 0',
                  borderBottom: '1px solid #f0fdf4' },
  infoIcon:     { fontSize: 18, width: 24, textAlign: 'center', flexShrink: 0 },
  infoLabel:    { fontSize: 13, color: '#9ca3af', fontWeight: 600, width: 140, flexShrink: 0 },
  infoValue:    { fontSize: 14, color: '#064e3b', fontWeight: 700, flex: 1, wordBreak: 'break-all' },

  statsGrid:    { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px,1fr))', gap: 12 },
  statCard:     { borderRadius: 18, padding: '20px 16px', display: 'flex',
                  flexDirection: 'column', alignItems: 'center', gap: 6 },
  ratingBig:    { fontSize: 48, fontWeight: 900, color: '#064e3b', display: 'flex',
                  alignItems: 'center', gap: 12 },
  ratingStars:  { fontSize: 24, color: '#f59e0b' },

  noLocation:   { textAlign: 'center', padding: '32px 0' },
  locationNote: { fontSize: 12, color: '#9ca3af', marginTop: 10, textAlign: 'center' },
};