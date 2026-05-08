'use client';
import React, { useState, useEffect } from 'react';

export default function ComingSoonPopup({ 
  isOpen, 
  onClose, 
  featureName = "Tính năng này" 
}: { 
  isOpen: boolean; 
  onClose: () => void; 
  featureName?: string 
}) {
  if (!isOpen) return null;

  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 10000,
      padding: '20px',
      backdropFilter: 'blur(4px)'
    }} onClick={onClose}>
      <div style={{
        backgroundColor: 'white',
        padding: '30px 20px',
        borderRadius: '20px',
        textAlign: 'center',
        maxWidth: '300px',
        width: '100%',
        boxShadow: '0 10px 25px rgba(0,0,0,0.1)',
        animation: 'popIn 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275)'
      }} onClick={e => e.stopPropagation()}>
        <div style={{ fontSize: '50px', marginBottom: '15px' }}>🚀</div>
        <h3 style={{ color: '#1a1a1a', marginBottom: '10px', fontSize: '18px', fontWeight: '800' }}>Sắp ra mắt!</h3>
        <p style={{ color: '#666', fontSize: '14px', lineHeight: '1.5', marginBottom: '20px' }}>
          {featureName} đang được hoàn thiện và sẽ sớm ra mắt quý khách.
        </p>
        <button 
          onClick={onClose}
          style={{
            backgroundColor: '#2a7a2a',
            color: 'white',
            border: 'none',
            padding: '12px 30px',
            borderRadius: '12px',
            fontWeight: '700',
            cursor: 'pointer',
            width: '100%'
          }}
        >
          Đã hiểu
        </button>
      </div>
      <style jsx>{`
        @keyframes popIn {
          from { transform: scale(0.8); opacity: 0; }
          to { transform: scale(1); opacity: 1; }
        }
      `}</style>
    </div>
  );
}
