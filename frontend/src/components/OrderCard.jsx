// src/components/OrderCard.jsx
// Renders one order — adapts for 'pending' (accept/reject) or 'current' (complete)

import React from 'react';

export default function OrderCard({ order, type, onAccept, onReject, onComplete }) {
  const id = order.orderId || order._id || '—';
  const restaurant = order.restaurantName || order.storeName || 'Store';
  const address = order.customer?.address || order.customerAddress || 'Customer address';
  const amount = order.totalAmount ? `LKR ${order.totalAmount.toLocaleString()}` : '';
  const items = order.items?.length ? `${order.items.length} item${order.items.length !== 1 ? 's' : ''}` : '';
  const status = order.status || order.driverAssignmentStatus || '';

  const statusColors = {
    pending:           '#fef3c7',
    ready_for_pickup:  '#d1fae5',
    driver_assigned:   '#dbeafe',
    picked_up:         '#ede9fe',
    in_transit:        '#ede9fe',
    delivered:         '#d1fae5',
    cancelled:         '#fee2e2',
  };

  return (
    <div style={s.card}>
      {/* Header row */}
      <div style={s.header}>
        <div>
          <span style={s.orderId}>#{id.slice(-6).toUpperCase()}</span>
          {status && (
            <span style={{ ...s.badge, background: statusColors[status] || '#f3f4f6' }}>
              {status.replace(/_/g, ' ')}
            </span>
          )}
        </div>
        {amount && <span style={s.amount}>{amount}</span>}
      </div>

      {/* Route */}
      <div style={s.route}>
        <RoutePoint icon="🏪" label="Pick up from" value={restaurant} color="#065f46" />
        <div style={s.routeLine} />
        <RoutePoint icon="📍" label="Deliver to" value={address} color="#b45309" />
      </div>

      {/* Meta */}
      {items && <p style={s.meta}>{items}</p>}

      {/* Actions */}
      <div style={s.actions}>
        {type === 'pending' && (
          <>
            <button onClick={onReject}  style={{ ...s.btn, ...s.rejectBtn }}>✕ Decline</button>
            <button onClick={onAccept}  style={{ ...s.btn, ...s.acceptBtn }}>✓ Accept</button>
          </>
        )}
        {type === 'current' && (
          <button onClick={onComplete} style={{ ...s.btn, ...s.completeBtn, width: '100%' }}>
            ✓ Mark as Delivered
          </button>
        )}
      </div>
    </div>
  );
}

function RoutePoint({ icon, label, value, color }) {
  return (
    <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10 }}>
      <span style={{ fontSize: 18, lineHeight: 1.3 }}>{icon}</span>
      <div>
        <p style={{ margin: 0, fontSize: 11, color: '#9ca3af', fontWeight: 600, textTransform: 'uppercase' }}>{label}</p>
        <p style={{ margin: '2px 0 0', fontSize: 14, fontWeight: 700, color }}>{value}</p>
      </div>
    </div>
  );
}

const s = {
  card:       { background: '#fff', borderRadius: 18, padding: '18px 20px',
                boxShadow: '0 4px 20px rgba(0,0,0,0.07)',
                border: '1.5px solid #d1fae5', transition: 'transform 0.15s',
                cursor: 'default' },
  header:     { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 },
  orderId:    { fontSize: 13, fontWeight: 800, color: '#065f46', marginRight: 8 },
  badge:      { fontSize: 11, fontWeight: 700, padding: '3px 9px', borderRadius: 20,
                textTransform: 'capitalize', letterSpacing: 0.2 },
  amount:     { fontSize: 17, fontWeight: 800, color: '#064e3b' },
  route:      { marginBottom: 12 },
  routeLine:  { width: 2, height: 18, background: '#d1fae5', marginLeft: 9, margin: '6px 0 6px 9px' },
  meta:       { margin: '0 0 14px', fontSize: 12, color: '#6b7280',
                background: '#f9fafb', borderRadius: 8, padding: '6px 10px', display: 'inline-block' },
  actions:    { display: 'flex', gap: 10, marginTop: 4 },
  btn:        { flex: 1, padding: '11px 0', borderRadius: 12, border: 'none',
                fontWeight: 800, fontSize: 14, cursor: 'pointer', transition: 'opacity 0.2s, transform 0.1s' },
  acceptBtn:  { background: 'linear-gradient(90deg,#065f46,#047857)', color: '#fff' },
  rejectBtn:  { background: '#f9fafb', color: '#6b7280', border: '1.5px solid #e5e7eb' },
  completeBtn:{ background: 'linear-gradient(90deg,#1d4ed8,#2563eb)', color: '#fff' },
};