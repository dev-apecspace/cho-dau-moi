'use client';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import './admin.css';

const menuItems = [
  { href: '/admin', label: 'Dashboard', icon: '📊' },
  { href: '/admin/san-pham', label: 'Sản phẩm', icon: '📦' },
  { href: '/admin/danh-muc', label: 'Danh mục', icon: '🗂️' },
  { href: '/admin/banner', label: 'Banner', icon: '🖼️' },
  { href: '/admin/nha-cung-cap', label: 'Nhà cung cấp', icon: '🏪' },
  { href: '/admin/voucher', label: 'Voucher', icon: '🎫' },
  { href: '/admin/uu-dai', label: 'Ưu đãi', icon: '⭐' },
  { href: '/admin/cau-hinh', label: 'Cấu hình', icon: '⚙️' },
];

interface AdminUser {
  id: string;
  email: string;
  name: string;
  role: string;
}

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [user, setUser] = useState<AdminUser | null>(null);
  const [checking, setChecking] = useState(true);

  // Login page doesn't need auth check
  const isLoginPage = pathname === '/admin/login';

  useEffect(() => {
    if (isLoginPage) {
      setChecking(false);
      return;
    }

    const session = localStorage.getItem('admin_session');
    if (!session) {
      router.replace('/admin/login');
      return;
    }

    try {
      const parsed = JSON.parse(session);
      setUser(parsed);
    } catch {
      localStorage.removeItem('admin_session');
      router.replace('/admin/login');
    }
    setChecking(false);
  }, [isLoginPage, router]);

  function handleLogout() {
    localStorage.removeItem('admin_session');
    router.replace('/admin/login');
  }

  // Login page: render without sidebar
  if (isLoginPage) {
    return <>{children}</>;
  }

  // Still checking auth
  if (checking) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f0f2f5' }}>
        <div className="admin-loading"><div className="admin-spinner" /><span>Đang kiểm tra đăng nhập...</span></div>
      </div>
    );
  }

  // Not logged in
  if (!user) return null;

  return (
    <div className="admin-shell">
      {/* Sidebar */}
      <aside className="admin-sidebar">
        <div className="admin-sidebar-header">
          <div className="admin-logo">
            <span className="admin-logo-icon">🏪</span>
            <div>
              <div className="admin-logo-name">CHỢ ĐẦU MỚI</div>
              <div className="admin-logo-sub">Quản trị hệ thống</div>
            </div>
          </div>
        </div>
        <nav className="admin-nav">
          {menuItems.map((item) => {
            const isActive = pathname === item.href || (item.href !== '/admin' && pathname.startsWith(item.href));
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`admin-nav-item ${isActive ? 'active' : ''}`}
              >
                <span className="admin-nav-icon">{item.icon}</span>
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>
        <div className="admin-sidebar-footer">
          {/* User info */}
          <div style={{ padding: '8px 14px', marginBottom: 4 }}>
            <div style={{ fontSize: 13, fontWeight: 600, color: 'rgba(255,255,255,0.85)' }}>{user.name}</div>
            <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.45)' }}>{user.email}</div>
          </div>
          <Link href="/" className="admin-nav-item" target="_blank">
            <span className="admin-nav-icon">🌐</span>
            <span>Xem website</span>
          </Link>
          <button className="admin-nav-item" onClick={handleLogout} style={{ color: '#ff6b6b' }}>
            <span className="admin-nav-icon">🚪</span>
            <span>Đăng xuất</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="admin-main">
        {children}
      </main>
    </div>
  );
}
