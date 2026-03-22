// src/pages/DeliveryTrackingPage.jsx
// Customer-facing live delivery tracker

import React, { useState, useEffect } from 'react';
import { deliveryApi } from '../api/deliveryApi';
import { useSocket } from '../context/SocketContext';

const STATUS_STEPS = [
  { key: 'pending',           label: 'Order Placed',     icon: '📋' },
  { key: 'picking',           label: 'Picking Items',    icon: '🛒' },
  { key: 'ready_for_pickup',  label: 'Ready',            icon: '✅' },
  { key: 'driver_assigned',   label: 'Driver Assigned',  icon: '👤' },
  { key: 'picked_up',         label: 'Picked Up',        icon: '📦' },
  { key: 'in_transit',        label: 'On the Way',       icon: '🚚' },
  { key: 'delivered',         label: 'Delivered',        icon: '🎉' },
];

export default function DeliveryTrackingPage({ deliveryId: propId }) {
  const [deliveryId, setDeliveryId] = useState(propId || '');
  const [delivery, setDelivery]     = useState(null);
  const [loading, setLoading]       = useState(false);
  const [error, setError]           = useState('');
  const { socket }                  = useSocket();

  const fetchDelivery = async (id = deliveryId) => {
    if (!id) return;
    setLoading(true); setError('');
    try {
      const data = await deliveryApi.getById(id);
      setDelivery(data);
    } catch (err) {
      setError('Delivery not found. Check the ID.');
    } finally {
      setLoading(false);
    }
  };

  // Real-time status updates
  useEffect(() => {
    if (!socket || !deliveryId) return;
    socket.emit('join', `delivery:${deliveryId}`);
    socket.on('status-update', ({ status }) => {
      setDelivery(d => d ? { ...d, status } : d);
    });
    socket.on('location-update', ({ driverLocation }) => {
      setDelivery(d => d ? { ...d, driverLocation } : d);
    });
    return () => {
      socket.off('status-update');
      socket.off('location-update');
    };
  }, [socket, deliveryId]);

  const currentStep = STATUS_STEPS.findIndex(s => s.key === delivery?.status);

  return (
    <div style={s.page}>
      <header style={s.header}>
        <span style={{ color: '#6ee7b7' }}>🌿</span>
        <span style={s.brand}>FreshCart</span>
        <span style={s.subBrand}>Track Delivery</span>
      </header>

      <div style={s.body}>
        {/* Search box */}
        <div style={s.searchCard}>
          <p style={s.searchLabel}>Enter Delivery ID</p>
          <div style={s.searchRow}>
            <input
              value={deliveryId}
              onChange={e => setDeliveryId(e.target.value)}
              placeholder="e.g. 64f3c2a1b..."
              style={s.searchInput}
              onKeyDown={e => e.key === 'Enter' && fetchDelivery()}
            />
            <button onClick={() => fetchDelivery()} style={s.searchBtn} disabled={loading}>
              {loading ? '…' : '🔍 Track'}
            </button>
          </div>
          {error && <p style={s.errorText}>{error}</p>}
        </div>

        {delivery && (
          <>
            {/* Status timeline */}
            <div style={s.card}>
              <h3 style={s.cardTitle}>Delivery Status</h3>
              <div style={s.timeline}>
                {STATUS_STEPS.map((step, i) => {
                  const done    = i <= currentStep;
                  const active  = i === currentStep;
                  return (
                    <div key={step.key} style={s.timelineItem}>
                      <div style={s.timelineLeft}>
                        <div style={{ ...s.dot, background: done ? '#065f46' : '#e5e7eb',
                                      border: active ? '3px solid #34d399' : 'none',
                                      transform: active ? 'scale(1.25)' : 'scale(1)' }}>
                          {done && <span style={{ fontSize: 10 }}>✓</span>}
                        </div>
                        {i < STATUS_STEPS.length - 1 && (
                          <div style={{ ...s.line, background: i < currentStep ? '#065f46' : '#e5e7eb' }} />
                        )}
                      </div>
                      <div style={s.timelineContent}>
                        <span style={s.stepIcon}>{step.icon}</span>
                        <span style={{ ...s.stepLabel, color: done ? '#064e3b' : '#9ca3af',
                                       fontWeight: active ? 800 : 500 }}>
                          {step.label}
                        </span>
                        {active && <span style={s.activeBadge}>Now</span>}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Delivery details */}
            <div style={s.card}>
              <h3 style={s.cardTitle}>Details</h3>
              <DetailRow label="Order ID" value={delivery.orderId} />
              <DetailRow label="Store"    value={delivery.storeId} />
              <DetailRow label="Status"   value={delivery.status?.replace(/_/g, ' ')} />
              {delivery.estimatedDeliveryTime && (
                <DetailRow label="Estimated Delivery"
                  value={new Date(delivery.estimatedDeliveryTime).toLocaleTimeString()} />
              )}
              {delivery.driverId && (
                <DetailRow label="Driver" value={typeof delivery.driverId === 'object'
                  ? delivery.driverId.name : delivery.driverId} />
              )}
            </div>

            {/* Rating (if delivered) */}
            {delivery.status === 'delivered' && !delivery.rating && (
              <RateDelivery deliveryId={deliveryId} onRated={(r) => setDelivery(d => ({ ...d, rating: r }))} />
            )}
            {delivery.rating && (
              <div style={{ ...s.card, textAlign: 'center', padding: '20px' }}>
                <p style={{ fontSize: 28 }}>{'★'.repeat(delivery.rating)}</p>
                <p style={{ color: '#065f46', fontWeight: 700 }}>You rated this delivery {delivery.rating}/5</p>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

function DetailRow({ label, value }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0',
                  borderBottom: '1px solid #f0fdf4', fontSize: 14 }}>
      <span style={{ color: '#9ca3af', fontWeight: 600 }}>{label}</span>
      <span style={{ color: '#064e3b', fontWeight: 700, textAlign: 'right', maxWidth: '60%',
                     wordBreak: 'break-all' }}>{value || '—'}</span>
    </div>
  );
}

function RateDelivery({ deliveryId, onRated }) {
  const [rating, setRating]   = useState(0);
  const [hover, setHover]     = useState(0);
  const [loading, setLoading] = useState(false);
  const [done, setDone]       = useState(false);

  const submit = async () => {
    if (!rating) return;
    setLoading(true);
    try {
      await deliveryApi.rate(deliveryId, rating);
      setDone(true);
      onRated(rating);
    } finally { setLoading(false); }
  };

  if (done) return null;

  return (
    <div style={{ ...s.card, textAlign: 'center' }}>
      <h3 style={s.cardTitle}>Rate your delivery</h3>
      <div style={{ display: 'flex', justifyContent: 'center', gap: 8, margin: '12px 0' }}>
        {[1, 2, 3, 4, 5].map(n => (
          <span
            key={n}
            onMouseEnter={() => setHover(n)}
            onMouseLeave={() => setHover(0)}
            onClick={() => setRating(n)}
            style={{ fontSize: 36, cursor: 'pointer', transition: 'transform 0.1s',
                     transform: (hover || rating) >= n ? 'scale(1.15)' : 'scale(1)',
                     filter: (hover || rating) >= n ? 'none' : 'grayscale(1)' }}
          >⭐</span>
        ))}
      </div>
      <button onClick={submit} disabled={!rating || loading}
        style={{ ...s.searchBtn, opacity: !rating ? 0.5 : 1 }}>
        {loading ? '…' : 'Submit Rating'}
      </button>
    </div>
  );
}

const s = {
  page:         { minHeight: '100vh', background: '#f0fdf4', fontFamily: "'Nunito', sans-serif" },
  header:       { background: '#064e3b', padding: '16px 24px', display: 'flex',
                  alignItems: 'center', gap: 10 },
  brand:        { color: '#fff', fontWeight: 800, fontSize: 20 },
  subBrand:     { color: '#6ee7b7', fontSize: 14, fontWeight: 600, marginLeft: 4 },
  body:         { maxWidth: 560, margin: '0 auto', padding: '24px 16px',
                  display: 'flex', flexDirection: 'column', gap: 16 },
  searchCard:   { background: '#fff', borderRadius: 20, padding: 24,
                  boxShadow: '0 4px 20px rgba(0,0,0,0.07)' },
  searchLabel:  { margin: '0 0 10px', fontWeight: 700, color: '#374151', fontSize: 14 },
  searchRow:    { display: 'flex', gap: 10 },
  searchInput:  { flex: 1, padding: '10px 14px', borderRadius: 12, fontSize: 14,
                  border: '1.5px solid #d1fae5', outline: 'none', background: '#f9fafb' },
  searchBtn:    { padding: '10px 20px', borderRadius: 12, border: 'none',
                  background: 'linear-gradient(90deg,#065f46,#047857)',
                  color: '#fff', fontWeight: 700, cursor: 'pointer', fontSize: 14 },
  errorText:    { color: '#b91c1c', fontSize: 13, marginTop: 8 },
  card:         { background: '#fff', borderRadius: 20, padding: 24,
                  boxShadow: '0 4px 20px rgba(0,0,0,0.07)' },
  cardTitle:    { margin: '0 0 16px', fontSize: 16, fontWeight: 800, color: '#064e3b' },
  timeline:     { paddingLeft: 4 },
  timelineItem: { display: 'flex', alignItems: 'flex-start', minHeight: 40 },
  timelineLeft: { display: 'flex', flexDirection: 'column', alignItems: 'center',
                  marginRight: 14, width: 20 },
  dot:          { width: 20, height: 20, borderRadius: '50%', display: 'flex',
                  alignItems: 'center', justifyContent: 'center',
                  color: '#fff', fontSize: 10, transition: 'all 0.3s', flexShrink: 0 },
  line:         { width: 2, flex: 1, minHeight: 16, transition: 'background 0.4s' },
  timelineContent:{ display: 'flex', alignItems: 'center', gap: 8, paddingBottom: 16 },
  stepIcon:     { fontSize: 16 },
  stepLabel:    { fontSize: 14, transition: 'color 0.3s' },
  activeBadge:  { background: '#d1fae5', color: '#065f46', fontSize: 11,
                  fontWeight: 700, padding: '2px 8px', borderRadius: 20 },
};