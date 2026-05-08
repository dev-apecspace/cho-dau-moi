import React from 'react';

interface LoadingProps {
  text?: string;
  items?: string[];
}

export default function LoadingNongSan({ 
  text = "Đang chuẩn bị hàng tươi ngon...", 
  items = ["🥬", "🥕", "🍅"] 
}: LoadingProps) {
  return (
    <div className="admin-loading" style={{ background: '#fff', zIndex: 9999, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
      <div className="loader-nongsan" style={{ display: 'flex', gap: '10px' }}>
        {items.map((item, i) => (
          <span key={i} className="loader-item" style={{ fontSize: '32px' }}>{item}</span>
        ))}
      </div>
      <span style={{ color: '#2a7a2a', fontWeight: 'bold', marginTop: '16px', fontSize: '14px' }}>
        {text.toUpperCase()}
      </span>
    </div>
  );
}
