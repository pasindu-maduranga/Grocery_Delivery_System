// src/components/AssignmentToast.jsx
// Slides in from top when socket fires 'new_assignment'
import React, { useEffect, useState } from 'react';

export default function AssignmentToast({ assignment, onAccept, onReject, onDismiss }) {
  const [visible, setVisible] = useState(false);
  const [countdown, setCountdown] = useState(30);

  useEffect(() => {
    setVisible(true);
    setCountdown(30);
    const timer = setInterval(() => {
      setCountdown(c => {
        if (c <= 1) { clearInterval(timer); onDismiss?.(); return 0; }
        return c - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [assignment]);

  const progress = (countdown / 30) * 100;

  return (
    <div style={{ ...s.overlay, opacity: visible ? 1 : 0 }}>
      <div style={{ ...s.toast, transform: visible ? 'translateY(0)' : 'translateY(-100%)' }}>
        {/* Progress bar */}
        <div style={s.progressTrack}>
          <div style={{ ...s.progressBar, width: `${progress}%`,
                        background: countdown > 10 ? '#34d399' : '#f87171' }} />
        </div>

        <div style={s.inner}>
          <div style={s.pulse} />
          <div style={s.content}>
            <p style={s.headline}>🛵 New Order Request!</p>
            <p style={s.detail}>
              <strong>{assignment.restaurantName || 'Store'}</strong>
            </p>
            <p style={s.detail}>{assignment.customerAddress || 'Customer location'}</p>
            {assignment.totalAmount && (
              <p style={s.amount}>LKR {assignment.totalAmount?.toLocaleString()}</p>
            )}
          </div>
          <div style={s.timer}>{countdown}s</div>
        </div>

        <div style={s.btns}>
          <button onClick={onReject} style={{ ...s.btn, background: '#374151', color: '#fff' }}>Decline</button>
          <button onClick={onAccept} style={{ ...s.btn, background: 'linear-gradient(90deg,#065f46,#047857)', color: '#fff' }}>
            Accept ✓
          </button>
        </div>
      </div>
    </div>
  );
}

const s = {
  overlay:      { position: 'fixed', top: 0, left: 0, right: 0, zIndex: 1000,
                  display: 'flex', justifyContent: 'center', padding: '16px',
                  transition: 'opacity 0.3s' },
  toast:        { background: '#fff', borderRadius: 20, width: '100%', maxWidth: 480,
                  boxShadow: '0 12px 48px rgba(0,0,0,0.18)',
                  border: '2px solid #065f46', overflow: 'hidden',
                  transition: 'transform 0.4s cubic-bezier(0.34,1.56,0.64,1)' },
  progressTrack:{ height: 4, background: '#f3f4f6' },
  progressBar:  { height: '100%', transition: 'width 1s linear, background 0.5s' },
  inner:        { display: 'flex', alignItems: 'center', gap: 14, padding: '16px 20px 10px' },
  pulse:        { width: 14, height: 14, borderRadius: '50%', background: '#10b981', flexShrink: 0,
                  boxShadow: '0 0 0 0 rgba(16,185,129,0.5)',
                  animation: 'pulse 1.5s ease-out infinite' },
  content:      { flex: 1 },
  headline:     { margin: '0 0 3px', fontWeight: 800, fontSize: 16, color: '#064e3b' },
  detail:       { margin: '2px 0', fontSize: 13, color: '#6b7280' },
  amount:       { margin: '4px 0 0', fontSize: 17, fontWeight: 800, color: '#065f46' },
  timer:        { fontSize: 22, fontWeight: 800, color: '#d1fae5',
                  background: '#064e3b', borderRadius: 12, width: 50, height: 50,
                  display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 },
  btns:         { display: 'flex', gap: 10, padding: '0 20px 16px' },
  btn:          { flex: 1, padding: '11px 0', borderRadius: 12, border: 'none',
                  fontWeight: 700, fontSize: 14, cursor: 'pointer' },
};