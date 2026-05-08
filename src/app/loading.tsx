import React from 'react';

export default function Loading() {
  return (
    <div className="admin-loading" style={{ position: 'fixed', inset: 0, zIndex: 9999 }}>
      <div className="loader-nongsan">
        <span className="loader-item">🥬</span>
        <span className="loader-item">🥕</span>
        <span className="loader-item">🍅</span>
      </div>
      <span style={{ marginTop: '16px', color: '#2a7a2a', fontWeight: 600 }}>
        Đang chuẩn bị hàng tươi ngon...
      </span>
    </div>
  );
}
