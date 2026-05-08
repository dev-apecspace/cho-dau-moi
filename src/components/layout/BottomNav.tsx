'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

const navItems = [
  { href: '/', label: 'Trang chủ', external: false },
  { href: '/danh-muc', label: 'Danh mục', external: false },
  { href: 'https://tongkho.ecoop.vn/', label: 'Tổng Kho', external: true },
  { href: '/uu-dai', label: 'Ưu đãi', external: false },
  { href: 'https://sieuthe.apecglobal.net/', label: 'Thẻ Apec', external: true },
];

export default function BottomNav() {
  const pathname = usePathname();

  // Hide BottomNav on Product Detail Page and Admin
  if (pathname.startsWith('/san-pham/') || pathname.startsWith('/admin')) return null;

  return (
    <nav className="bottom-nav">
      {navItems.map((item) => {
        const isActive = !item.external && pathname === item.href;

        if (item.external) {
          return (
            <a
              key={item.label}
              href={item.href}
              target="_blank"
              rel="noopener noreferrer"
              id={`nav-${item.label.toLowerCase().replace(/\s/g, '-')}`}
              className="nav-item"
              style={{ textDecoration: 'none' }}
            >
              <NavIcon name={item.label} active={false} />
              <span className="nav-label">{item.label}</span>
            </a>
          );
        }

        return (
          <Link
            key={item.href}
            href={item.href}
            id={`nav-${item.label.toLowerCase().replace(/\s/g, '-')}`}
            className={`nav-item ${isActive ? 'active' : ''}`}
          >
            <NavIcon name={item.label} active={isActive} />
            <span className="nav-label">{item.label}</span>
          </Link>
        );
      })}
    </nav>
  );
}

function NavIcon({ name, active }: { name: string; active: boolean }) {
  const color = active ? '#2a7a2a' : '#999999';
  const strokeWidth = active ? 2.2 : 1.7;
  const size = 22;

  switch (name) {
    case 'Trang chủ':
      return (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round">
          <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z" />
          <polyline points="9 22 9 12 15 12 15 22" />
        </svg>
      );
    case 'Danh mục':
      return (
        <svg width={size} height={size} viewBox="0 0 24 24" fill={active ? color : 'none'} stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round">
          <rect x="3" y="3" width="7" height="7" rx="1" />
          <rect x="14" y="3" width="7" height="7" rx="1" />
          <rect x="3" y="14" width="7" height="7" rx="1" />
          <rect x="14" y="14" width="7" height="7" rx="1" />
        </svg>
      );
    case 'Tổng Kho':
      return (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round">
          <path d="M22 12h-6l-2 3h-4l-2-3H2" />
          <path d="M5.45 5.11L2 12v6a2 2 0 002 2h16a2 2 0 002-2v-6l-3.45-6.89A2 2 0 0016.76 4H7.24a2 2 0 00-1.79 1.11z" />
        </svg>
      );
    case 'Ưu đãi':
      return (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round">
          <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
        </svg>
      );
    case 'Thẻ Apec':
      return (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round">
          <rect x="1" y="4" width="22" height="16" rx="2" ry="2" />
          <line x1="1" y1="10" x2="23" y2="10" />
        </svg>
      );
    default:
      return null;
  }
}
