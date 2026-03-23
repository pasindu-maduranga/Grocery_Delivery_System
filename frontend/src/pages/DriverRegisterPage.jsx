// src/pages/DriverRegisterPage.jsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { driverApi } from '../api/deliveryApi';

const VEHICLE_TYPES = ['Car', 'Motorcycle', 'Van', 'Scooter'];

export default function DriverRegisterPage({ onRegistered }) {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    userId: '', name: '', email: '', phone: '',
    vehicleType: 'Car', licensePlate: '', maxCarryWeightKg: 20,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState('');
  const [success, setSuccess] = useState(false);

  const handle = (e) => setForm(f => ({ ...f, [e.target.name]: e.target.value }));

  const submit = async (e) => {
    e.preventDefault();
    setLoading(true); setError('');
    try {
      const res = await driverApi.register(form);
      const driver = res.driver || res;

      // ✅ Save driver ID to localStorage
      localStorage.setItem('fc_driver_id', driver._id);

      setSuccess(true);

      // ✅ Call parent callback if provided
      onRegistered?.(driver);

      // ✅ Navigate to driver dashboard after 1.5s
      setTimeout(() => {
        navigate('/driver/dashboard');
      }, 1500);

    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.page}>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      {/* Left panel - branding */}
      <div style={styles.hero}>
        <div style={styles.leaf}>🌿</div>
        <h1 style={styles.brand}>FreshCart</h1>
        <p style={styles.tagline}>
          Deliver fresh groceries to<br />thousands of happy homes
        </p>
        <div style={styles.stats}>
          {[['500+', 'Active Drivers'], ['98%', 'On-Time Rate'], ['4.9★', 'Avg Rating']].map(([val, lbl]) => (
            <div key={lbl} style={styles.stat}>
              <span style={styles.statVal}>{val}</span>
              <span style={styles.statLbl}>{lbl}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Right panel - form */}
      <div style={styles.formPanel}>
        <div style={styles.card}>
          <h2 style={styles.title}>Become a Driver</h2>
          <p style={styles.sub}>Fill in your details to start delivering</p>

          {success ? (
            <div style={styles.successBanner}>
              <span style={{ fontSize: 48 }}>✅</span>
              <p style={{ margin: '12px 0 4px', color: '#065f46', fontWeight: 800, fontSize: 18 }}>
                Registered Successfully!
              </p>
              <p style={{ margin: 0, color: '#6b7280', fontSize: 14 }}>
                Redirecting to your dashboard…
              </p>
              <div style={{ marginTop: 16, width: 40, height: 40, border: '4px solid #d1fae5',
                            borderTop: '4px solid #047857', borderRadius: '50%',
                            animation: 'spin 0.8s linear infinite', margin: '16px auto 0' }} />
            </div>
          ) : (
            <form onSubmit={submit} style={styles.form}>
              {error && <div style={styles.errorBanner}>{error}</div>}

              <Row>
                <Field label="Full Name" name="name" value={form.name} onChange={handle} required />
                <Field label="User ID" name="userId" value={form.userId} onChange={handle} required />
              </Row>
              <Row>
                <Field label="Email" name="email" type="email" value={form.email} onChange={handle} required />
                <Field label="Phone" name="phone" type="tel" value={form.phone} onChange={handle} required />
              </Row>
              <Row>
                <div style={{ flex: 1 }}>
                  <label style={styles.label}>Vehicle Type</label>
                  <select name="vehicleType" value={form.vehicleType} onChange={handle} style={styles.select}>
                    {VEHICLE_TYPES.map(v => <option key={v}>{v}</option>)}
                  </select>
                </div>
                <Field label="License Plate" name="licensePlate" value={form.licensePlate} onChange={handle} />
              </Row>
              <Field
                label="Max Carry Weight (kg)"
                name="maxCarryWeightKg"
                type="number"
                value={form.maxCarryWeightKg}
                onChange={handle}
                min={1} max={200}
              />

              <button type="submit" style={{ ...styles.btn, opacity: loading ? 0.7 : 1 }} disabled={loading}>
                {loading ? 'Registering…' : 'Register as Driver →'}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}

function Row({ children }) {
  return <div style={{ display: 'flex', gap: 12 }}>{children}</div>;
}

function Field({ label, ...props }) {
  return (
    <div style={{ flex: 1, marginBottom: 14 }}>
      <label style={styles.label}>{label}</label>
      <input {...props} style={styles.input} />
    </div>
  );
}

const styles = {
  page:       { display: 'flex', minHeight: '100vh', fontFamily: "'Nunito', sans-serif" },
  hero:       { flex: 1, background: 'linear-gradient(160deg, #064e3b 0%, #065f46 60%, #047857 100%)',
                display: 'flex', flexDirection: 'column', justifyContent: 'center',
                alignItems: 'center', padding: 40, color: '#fff' },
  leaf:       { fontSize: 56, marginBottom: 8 },
  brand:      { fontSize: 42, fontWeight: 800, margin: '0 0 8px', letterSpacing: -1 },
  tagline:    { fontSize: 18, opacity: 0.85, textAlign: 'center', lineHeight: 1.6, margin: '0 0 40px' },
  stats:      { display: 'flex', gap: 32 },
  stat:       { textAlign: 'center' },
  statVal:    { display: 'block', fontSize: 28, fontWeight: 800, color: '#6ee7b7' },
  statLbl:    { display: 'block', fontSize: 12, opacity: 0.75, marginTop: 2 },
  formPanel:  { flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center',
                background: '#f0fdf4', padding: 40 },
  card:       { background: '#fff', borderRadius: 20, padding: '40px 36px',
                boxShadow: '0 8px 40px rgba(0,0,0,0.09)', width: '100%', maxWidth: 520 },
  title:      { fontSize: 28, fontWeight: 800, margin: '0 0 4px', color: '#064e3b' },
  sub:        { fontSize: 14, color: '#6b7280', margin: '0 0 24px' },
  form:       { display: 'flex', flexDirection: 'column' },
  label:      { display: 'block', fontSize: 12, fontWeight: 700, color: '#374151',
                marginBottom: 4, textTransform: 'uppercase', letterSpacing: 0.5 },
  input:      { width: '100%', padding: '10px 14px', borderRadius: 10, fontSize: 14,
                border: '1.5px solid #d1fae5', outline: 'none', boxSizing: 'border-box',
                transition: 'border-color 0.2s', background: '#f9fafb' },
  select:     { width: '100%', padding: '10px 14px', borderRadius: 10, fontSize: 14,
                border: '1.5px solid #d1fae5', outline: 'none', background: '#f9fafb' },
  btn:        { marginTop: 8, padding: '14px 0', borderRadius: 12, border: 'none',
                background: 'linear-gradient(90deg, #065f46, #047857)',
                color: '#fff', fontSize: 16, fontWeight: 700, cursor: 'pointer',
                letterSpacing: 0.3, transition: 'transform 0.15s, box-shadow 0.15s',
                boxShadow: '0 4px 16px rgba(6,95,70,0.3)' },
  errorBanner:{ background: '#fef2f2', border: '1px solid #fca5a5', borderRadius: 10,
                padding: '10px 14px', color: '#b91c1c', fontSize: 14, marginBottom: 16 },
  successBanner:{ textAlign: 'center', padding: 32 },
};