// src/pages/AdminAssignmentPage.jsx
// Admin panel to control the auto-assignment engine

import React, { useState } from 'react';
import { autoAssignmentApi, assignmentApi } from '../api/deliveryApi';

export default function AdminAssignmentPage() {
  const [autoRunning, setAutoRunning] = useState(false);
  const [logs, setLogs]               = useState([]);
  const [intervalMs, setIntervalMs]   = useState(60000);

  const log = (msg, type = 'info') => {
    setLogs(l => [{ msg, type, time: new Date().toLocaleTimeString() }, ...l.slice(0, 49)]);
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

  return (
    <div style={s.page}>
      <header style={s.header}>
        <span style={{ color: '#6ee7b7', fontSize: 22 }}>🌿</span>
        <span style={s.brand}>FreshCart</span>
        <span style={s.pill}>Admin Panel</span>
      </header>

      <div style={s.body}>
        <h1 style={s.title}>Assignment Engine</h1>

        <div style={s.grid}>
          {/* Auto-Assignment control */}
          <Section title="🤖 Auto Assignment" subtitle="Automatically assigns drivers to ready orders">
            <div style={s.row}>
              <div style={{ flex: 1 }}>
                <label style={s.label}>Interval (ms)</label>
                <input
                  type="number" value={intervalMs} min={5000} step={5000}
                  onChange={e => setIntervalMs(Number(e.target.value))}
                  style={s.input}
                />
              </div>
            </div>
            <div style={s.btnRow}>
              <ActionBtn
                label="▶ Start Auto"
                color="green"
                onClick={async () => {
                  await callApi(() => autoAssignmentApi.start(), 'Start auto assignment');
                  setAutoRunning(true);
                }}
                disabled={autoRunning}
              />
              <ActionBtn
                label="■ Stop Auto"
                color="red"
                onClick={async () => {
                  await callApi(() => autoAssignmentApi.stop(), 'Stop auto assignment');
                  setAutoRunning(false);
                }}
                disabled={!autoRunning}
              />
            </div>
            <ActionBtn
              label="⚡ Trigger Once"
              color="blue"
              onClick={() => callApi(() => autoAssignmentApi.trigger(), 'Manual trigger')}
              fullWidth
            />
            <StatusChip running={autoRunning} />
          </Section>

          {/* Assignment service (legacy) */}
          <Section title="⏱ Assignment Service" subtitle="Interval-based assignment process">
            <div style={s.btnRow}>
              <ActionBtn
                label="▶ Start"
                color="green"
                onClick={() => callApi(() => assignmentApi.start(intervalMs), 'Start assignment service')}
              />
              <ActionBtn
                label="■ Stop"
                color="red"
                onClick={() => callApi(() => assignmentApi.stop(), 'Stop assignment service')}
              />
            </div>
            <ActionBtn
              label="⚡ Run Manual"
              color="blue"
              onClick={() => callApi(() => assignmentApi.manual(), 'Manual assignment')}
              fullWidth
            />
          </Section>
        </div>

        {/* Activity log */}
        <div style={s.logCard}>
          <div style={s.logHeader}>
            <h3 style={s.logTitle}>Activity Log</h3>
            <button onClick={() => setLogs([])} style={s.clearBtn}>Clear</button>
          </div>
          <div style={s.logBody}>
            {logs.length === 0 ? (
              <p style={{ color: '#6b7280', fontSize: 13, padding: '20px 0', textAlign: 'center' }}>
                No activity yet. Use the controls above.
              </p>
            ) : (
              logs.map((l, i) => (
                <div key={i} style={{ ...s.logLine, borderLeft: `3px solid ${
                  l.type === 'success' ? '#34d399' : l.type === 'error' ? '#f87171' : '#93c5fd'
                }` }}>
                  <span style={s.logTime}>{l.time}</span>
                  <span style={{ color: l.type === 'error' ? '#b91c1c' : l.type === 'success' ? '#065f46' : '#374151' }}>
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

function Section({ title, subtitle, children }) {
  return (
    <div style={s.section}>
      <h3 style={{ margin: '0 0 4px', fontSize: 16, fontWeight: 800, color: '#064e3b' }}>{title}</h3>
      <p style={{ margin: '0 0 18px', fontSize: 13, color: '#6b7280' }}>{subtitle}</p>
      {children}
    </div>
  );
}

function ActionBtn({ label, color, onClick, disabled, fullWidth }) {
  const bg = { green: 'linear-gradient(90deg,#065f46,#047857)',
               red:   'linear-gradient(90deg,#b91c1c,#dc2626)',
               blue:  'linear-gradient(90deg,#1d4ed8,#2563eb)' };
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      style={{ flex: fullWidth ? undefined : 1, width: fullWidth ? '100%' : undefined,
               padding: '12px 0', borderRadius: 12, border: 'none',
               background: disabled ? '#e5e7eb' : bg[color],
               color: disabled ? '#9ca3af' : '#fff', fontWeight: 700, fontSize: 14,
               cursor: disabled ? 'not-allowed' : 'pointer', transition: 'opacity 0.2s',
               marginTop: fullWidth ? 10 : 0 }}
    >
      {label}
    </button>
  );
}

function StatusChip({ running }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 14 }}>
      <div style={{ width: 10, height: 10, borderRadius: '50%',
                    background: running ? '#10b981' : '#9ca3af',
                    boxShadow: running ? '0 0 0 3px rgba(16,185,129,0.2)' : 'none' }} />
      <span style={{ fontSize: 13, color: running ? '#065f46' : '#6b7280', fontWeight: 600 }}>
        {running ? 'Auto-assignment is running' : 'Auto-assignment is stopped'}
      </span>
    </div>
  );
}

const s = {
  page:    { minHeight: '100vh', background: '#f0fdf4', fontFamily: "'Nunito', sans-serif" },
  header:  { background: '#064e3b', padding: '14px 24px', display: 'flex',
             alignItems: 'center', gap: 10 },
  brand:   { color: '#fff', fontWeight: 800, fontSize: 18 },
  pill:    { background: '#065f46', color: '#6ee7b7', fontSize: 11,
             fontWeight: 700, padding: '3px 10px', borderRadius: 20, marginLeft: 4 },
  body:    { maxWidth: 860, margin: '0 auto', padding: '28px 16px' },
  title:   { margin: '0 0 24px', fontSize: 28, fontWeight: 900, color: '#064e3b' },
  grid:    { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
             gap: 16, marginBottom: 20 },
  section: { background: '#fff', borderRadius: 20, padding: 24,
             boxShadow: '0 4px 20px rgba(0,0,0,0.07)' },
  row:     { marginBottom: 12 },
  label:   { display: 'block', fontSize: 12, fontWeight: 700, color: '#374151',
             marginBottom: 4, textTransform: 'uppercase', letterSpacing: 0.5 },
  input:   { width: '100%', padding: '10px 14px', borderRadius: 10, fontSize: 14,
             border: '1.5px solid #d1fae5', outline: 'none', background: '#f9fafb',
             boxSizing: 'border-box' },
  btnRow:  { display: 'flex', gap: 10, marginBottom: 0 },
  logCard: { background: '#fff', borderRadius: 20, overflow: 'hidden',
             boxShadow: '0 4px 20px rgba(0,0,0,0.07)' },
  logHeader:{ display: 'flex', justifyContent: 'space-between', alignItems: 'center',
              padding: '16px 20px', borderBottom: '1px solid #f0fdf4' },
  logTitle:{ margin: 0, fontSize: 16, fontWeight: 800, color: '#064e3b' },
  clearBtn:{ background: 'none', border: '1px solid #d1fae5', borderRadius: 8,
             padding: '4px 12px', fontSize: 12, cursor: 'pointer', color: '#6b7280' },
  logBody: { padding: '8px 0', maxHeight: 320, overflowY: 'auto' },
  logLine: { display: 'flex', gap: 12, padding: '8px 20px', alignItems: 'center',
             fontSize: 13, borderBottom: '1px solid #f9fafb' },
  logTime: { color: '#9ca3af', flexShrink: 0, fontSize: 11, fontWeight: 600 },
};