import React from 'react';

export default function ProgressBar({ completed, total }) {
  const pct = total === 0 ? 0 : Math.round((completed / total) * 100);
  return (
    <div>
      <div style={{ width: 300, height: 20, background: '#eee', borderRadius: 8 }}>
        <div style={{ width: `${pct}%`, height: '100%', background: '#4caf50', borderRadius: 8 }} />
      </div>
      <p>{pct}% complete</p>
    </div>
  );
}
