// src/pages/DriverDashboardPage.jsx
import React, { useState, useEffect, useCallback } from 'react';
import { driverApi } from '../api/deliveryApi';
import { useSocket } from '../context/SocketContext';
import OrderCard from '../components/OrderCard';
import AssignmentToast from '../components/AssignmentToast';

export default function DriverDashboardPage({ driverId }) {
  const [driver, setDriver]               = useState(null);
  const [pendingOrders, setPendingOrders] = useState([]);
  const [currentOrders, setCurrentOrders] = useState([]);
  const [loading, setLoading]             = useState(true);
  const [toggling, setToggling]           = useState(false);
  const [tab, setTab]                     = useState('pending'); // 'pending' | 'current'
  const { connected, newAssignment, clearAssignment, goOnline, goOffline } = useSocket();

  const fetchAll = useCallback(async () => {
    try {
      const [driverRes, pending, current] = await Promise.all([
        driverApi.getById(driverId),
        driverApi.getPendingAssignments(driverId),
        driverApi.getCurrentOrders(driverId),
      ]);
      setDriver(driverRes.driver || driverRes);
      setPendingOrders(Array.isArray(pending) ? pending : []);
      setCurrentOrders(Array.isArray(current) ? current : []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [driverId]);

  useEffect(() => { fetchAll(); }, [fetchAll]);

  // Refresh when a new assignment arrives via socket
  useEffect(() => {
    if (newAssignment) { fetchAll(); }
  }, [newAssignment, fetchAll]);

  const toggleAvailability = async () => {
    if (!driver) return;
    setToggling(true);
    try {
      const next = !driver.isAvailable;
      await driverApi.updateAvailability(driverId, next);
      if (next) {
        goOnline(driverId, driver.currentLocation || { latitude: 6.9271, longitude: 79.8612 });
      } else {
        goOffline(driverId);
      }
      setDriver(d => ({ ...d, isAvailable: next }));
    } catch (err) { console.error(err); }
    finally { setToggling(false); }
  };

  const handleAccept = async (orderId) => {
    try {
      await driverApi.acceptOrder(driverId, orderId);
      await fetchAll();
    } catch (err) { console.error(err); }
  };

  const handleReject = async (orderId) => {
    try {
      await driverApi.rejectOrder(driverId, orderId, 'Driver unavailable');
      await fetchAll();
    } catch (err) { console.error(err); }
  };

  const handleComplete = async (orderId) => {
    try {
      await driverApi.completeDelivery(driverId, orderId);
      await fetchAll();
    } catch (err) { console.error(err); }
  };

  if (loading) return <Loading />;

  const isOnline = driver?.isAvailable;
  const shown = tab === 'pending' ? pendingOrders : currentOrders;

  return (
    <div style={s.page}>
      {/* New assignment toast */}
      {newAssignment && (
        <AssignmentToast
          assignment={newAssignment}
          onAccept={() => { handleAccept(newAssignment.orderId); clearAssignment(); }}
          onReject={() => { handleReject(newAssignment.orderId); clearAssignment(); }}
          onDismiss={clearAssignment}
        />
      )}

      {/* Header */}
      <header style={s.header}>
        <div style={s.logo}><span style={{ color: '#6ee7b7' }}>🌿</span> FreshCart Driver</div>
        <div style={s.headerRight}>
          <div style={{ ...s.socketDot, background: connected ? '#34d399' : '#f87171' }} />
          <span style={s.socketLabel}>{connected ? 'Live' : 'Offline'}</span>
        </div>
      </header>

      <div style={s.body}>
        {/* Driver card */}
        <div style={s.driverCard}>
          <div style={s.avatar}>{driver?.name?.[0] || '?'}</div>
          <div style={s.driverInfo}>
            <h2 style={s.driverName}>{driver?.name}</h2>
            <p style={s.driverMeta}>{driver?.vehicleType} · {driver?.licensePlate || 'No plate'}</p>
            <div style={s.rating}>
              {'★'.repeat(Math.round(driver?.rating?.average || 0))}
              <span style={{ color: '#9ca3af', marginLeft: 6 }}>
                {driver?.rating?.average?.toFixed(1) || '0.0'} ({driver?.rating?.count || 0} trips)
              </span>
            </div>
          </div>
          <div style={s.toggleSection}>
            <p style={{ margin: '0 0 6px', fontSize: 12, color: '#6b7280', fontWeight: 600 }}>AVAILABILITY</p>
            <button
              onClick={toggleAvailability}
              disabled={toggling}
              style={{ ...s.toggleBtn, background: isOnline
                ? 'linear-gradient(90deg,#065f46,#047857)'
                : 'linear-gradient(90deg,#374151,#4b5563)' }}
            >
              {toggling ? '…' : isOnline ? '● Online' : '○ Go Online'}
            </button>
          </div>
        </div>

        {/* Stats strip */}
        <div style={s.statsStrip}>
          {[
            ['📦', pendingOrders.length, 'Pending'],
            ['🚚', currentOrders.length, 'In Progress'],
            ['✅', driver?.completedOrders?.length || 0, 'Completed'],
          ].map(([icon, val, lbl]) => (
            <div key={lbl} style={s.statBox}>
              <span style={s.statIcon}>{icon}</span>
              <span style={s.statNum}>{val}</span>
              <span style={s.statLabel}>{lbl}</span>
            </div>
          ))}
        </div>

        {/* Tabs */}
        <div style={s.tabs}>
          {['pending', 'current'].map(t => (
            <button
              key={t}
              onClick={() => setTab(t)}
              style={{ ...s.tab, ...(tab === t ? s.tabActive : {}) }}
            >
              {t === 'pending' ? `📥 Pending (${pendingOrders.length})` : `🚚 Active (${currentOrders.length})`}
            </button>
          ))}
        </div>

        {/* Orders list */}
        <div style={s.orders}>
          {shown.length === 0 ? (
            <div style={s.empty}>
              <div style={{ fontSize: 48 }}>{tab === 'pending' ? '📭' : '🏁'}</div>
              <p style={{ color: '#6b7280', marginTop: 12 }}>
                {tab === 'pending' ? 'No pending assignments right now' : 'No active deliveries'}
              </p>
            </div>
          ) : (
            shown.map(order => (
              <OrderCard
                key={order.orderId || order._id}
                order={order}
                type={tab}
                onAccept={() => handleAccept(order.orderId || order._id)}
                onReject={() => handleReject(order.orderId || order._id)}
                onComplete={() => handleComplete(order.orderId || order._id)}
              />
            ))
          )}
        </div>
      </div>
    </div>
  );
}

function Loading() {
  return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center',
                  height: '100vh', background: '#f0fdf4', flexDirection: 'column', gap: 16 }}>
      <div style={{ width: 40, height: 40, border: '4px solid #d1fae5',
                    borderTop: '4px solid #047857', borderRadius: '50%',
                    animation: 'spin 0.8s linear infinite' }} />
      <p style={{ color: '#047857', fontWeight: 600 }}>Loading dashboard…</p>
    </div>
  );
}

const s = {
  page:        { minHeight: '100vh', background: '#f0fdf4', fontFamily: "'Nunito', sans-serif" },
  header:      { background: '#064e3b', padding: '14px 24px', display: 'flex',
                 justifyContent: 'space-between', alignItems: 'center',
                 boxShadow: '0 2px 12px rgba(0,0,0,0.15)', position: 'sticky', top: 0, zIndex: 10 },
  logo:        { color: '#fff', fontWeight: 800, fontSize: 18, letterSpacing: -0.3 },
  headerRight: { display: 'flex', alignItems: 'center', gap: 8 },
  socketDot:   { width: 10, height: 10, borderRadius: '50%', transition: 'background 0.5s' },
  socketLabel: { color: '#d1fae5', fontSize: 13, fontWeight: 600 },
  body:        { maxWidth: 680, margin: '0 auto', padding: '20px 16px' },
  driverCard:  { background: '#fff', borderRadius: 20, padding: 24,
                 display: 'flex', alignItems: 'center', gap: 16,
                 boxShadow: '0 4px 24px rgba(0,0,0,0.07)', marginBottom: 16 },
  avatar:      { width: 60, height: 60, borderRadius: '50%',
                 background: 'linear-gradient(135deg,#065f46,#10b981)',
                 display: 'flex', alignItems: 'center', justifyContent: 'center',
                 color: '#fff', fontSize: 26, fontWeight: 800, flexShrink: 0 },
  driverInfo:  { flex: 1 },
  driverName:  { margin: '0 0 2px', fontSize: 18, fontWeight: 800, color: '#064e3b' },
  driverMeta:  { margin: '0 0 4px', fontSize: 13, color: '#6b7280' },
  rating:      { fontSize: 14, color: '#f59e0b' },
  toggleSection:{ flexShrink: 0, textAlign: 'right' },
  toggleBtn:   { padding: '10px 20px', borderRadius: 12, border: 'none', color: '#fff',
                 fontWeight: 700, fontSize: 14, cursor: 'pointer', transition: 'opacity 0.2s' },
  statsStrip:  { display: 'flex', gap: 12, marginBottom: 16 },
  statBox:     { flex: 1, background: '#fff', borderRadius: 16, padding: '16px 12px',
                 textAlign: 'center', boxShadow: '0 2px 12px rgba(0,0,0,0.05)' },
  statIcon:    { display: 'block', fontSize: 22, marginBottom: 6 },
  statNum:     { display: 'block', fontSize: 26, fontWeight: 800, color: '#064e3b' },
  statLabel:   { display: 'block', fontSize: 11, color: '#6b7280', marginTop: 2, fontWeight: 600 },
  tabs:        { display: 'flex', gap: 8, marginBottom: 14 },
  tab:         { flex: 1, padding: '10px 0', borderRadius: 12, border: '2px solid #d1fae5',
                 background: '#fff', fontWeight: 700, fontSize: 14, cursor: 'pointer',
                 color: '#374151', transition: 'all 0.2s' },
  tabActive:   { background: '#064e3b', color: '#fff', borderColor: '#064e3b' },
  orders:      { display: 'flex', flexDirection: 'column', gap: 12 },
  empty:       { textAlign: 'center', padding: '60px 0' },
};