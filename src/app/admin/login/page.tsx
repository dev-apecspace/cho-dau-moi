'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';

export default function AdminLogin() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const { data, error: err } = await supabase
        .from('admin_users')
        .select('*')
        .eq('email', email)
        .eq('password_hash', password)
        .eq('is_active', true)
        .single();

      if (err || !data) {
        setError('Email hoặc mật khẩu không đúng');
        setLoading(false);
        return;
      }

      // Update last login
      await supabase.from('admin_users').update({ last_login: new Date().toISOString() }).eq('id', data.id);

      // Store session in localStorage
      localStorage.setItem('admin_session', JSON.stringify({
        id: data.id,
        email: data.email,
        name: data.name,
        role: data.role,
        loginAt: new Date().toISOString(),
      }));

      router.push('/admin');
    } catch {
      setError('Đã có lỗi xảy ra');
    }
    setLoading(false);
  }

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)',
      padding: 20,
    }}>
      <div style={{
        background: 'white',
        borderRadius: 20,
        padding: '40px 36px',
        width: '100%',
        maxWidth: 420,
        boxShadow: '0 20px 60px rgba(0,0,0,0.3)',
      }}>
        {/* Logo */}
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <div style={{
            width: 64, height: 64, borderRadius: 16,
            background: 'linear-gradient(135deg, #2a7a2a, #388e3c)',
            display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 32, marginBottom: 12,
            boxShadow: '0 8px 24px rgba(42,122,42,0.3)',
          }}>🏪</div>
          <h1 style={{ fontSize: 22, fontWeight: 800, color: '#1a1a2e', marginBottom: 4 }}>
            CHỢ ĐẦU MỚI
          </h1>
          <p style={{ fontSize: 13, color: '#888' }}>Đăng nhập quản trị hệ thống</p>
        </div>

        {/* Error */}
        {error && (
          <div style={{
            background: '#fff5f5', border: '1px solid #ffcdd2', borderRadius: 10,
            padding: '10px 14px', marginBottom: 16, color: '#e53935',
            fontSize: 13, fontWeight: 500, display: 'flex', alignItems: 'center', gap: 8,
          }}>
            <span>⚠️</span> {error}
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleLogin}>
          <div style={{ marginBottom: 16 }}>
            <label style={{ fontSize: 13, fontWeight: 600, color: '#333', display: 'block', marginBottom: 6 }}>
              Email
            </label>
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="abc@gmail.com"
              required
              style={{
                width: '100%', padding: '12px 14px', border: '1.5px solid #e0e0e0',
                borderRadius: 10, fontSize: 14, fontFamily: 'inherit',
                transition: 'all 0.2s', outline: 'none', boxSizing: 'border-box',
              }}
              onFocus={e => e.target.style.borderColor = '#2a7a2a'}
              onBlur={e => e.target.style.borderColor = '#e0e0e0'}
            />
          </div>

          <div style={{ marginBottom: 24 }}>
            <label style={{ fontSize: 13, fontWeight: 600, color: '#333', display: 'block', marginBottom: 6 }}>
              Mật khẩu
            </label>
            <input
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              placeholder="••••••••"
              required
              style={{
                width: '100%', padding: '12px 14px', border: '1.5px solid #e0e0e0',
                borderRadius: 10, fontSize: 14, fontFamily: 'inherit',
                transition: 'all 0.2s', outline: 'none', boxSizing: 'border-box',
              }}
              onFocus={e => e.target.style.borderColor = '#2a7a2a'}
              onBlur={e => e.target.style.borderColor = '#e0e0e0'}
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            style={{
              width: '100%', padding: '13px', border: 'none', borderRadius: 10,
              background: loading ? '#aaa' : 'linear-gradient(135deg, #2a7a2a, #388e3c)',
              color: 'white', fontSize: 15, fontWeight: 700, cursor: loading ? 'wait' : 'pointer',
              fontFamily: 'inherit', transition: 'all 0.2s',
              boxShadow: loading ? 'none' : '0 4px 12px rgba(42,122,42,0.3)',
            }}
          >
            {loading ? '⏳ Đang đăng nhập...' : '🔐 Đăng nhập'}
          </button>
        </form>

      </div>
    </div>
  );
}
