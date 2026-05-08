'use client';
import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';

export default function AdminDashboard() {
  const [stats, setStats] = useState({ products: 0, categories: 0, banners: 0, suppliers: 0, vouchers: 0, deals: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadStats() {
      const [products, categories, banners, suppliers, vouchers, deals] = await Promise.all([
        supabase.from('products').select('id', { count: 'exact', head: true }),
        supabase.from('categories').select('id', { count: 'exact', head: true }),
        supabase.from('banners').select('id', { count: 'exact', head: true }),
        supabase.from('suppliers').select('id', { count: 'exact', head: true }),
        supabase.from('vouchers').select('id', { count: 'exact', head: true }),
        supabase.from('deals').select('id', { count: 'exact', head: true }),
      ]);
      setStats({
        products: products.count || 0,
        categories: categories.count || 0,
        banners: banners.count || 0,
        suppliers: suppliers.count || 0,
        vouchers: vouchers.count || 0,
        deals: deals.count || 0,
      });
      setLoading(false);
    }
    loadStats();
  }, []);

  const statCards = [
    { label: 'Sản phẩm', value: stats.products, icon: '📦', bg: '#e8f5e9', color: '#2a7a2a' },
    { label: 'Danh mục', value: stats.categories, icon: '🗂️', bg: '#e3f2fd', color: '#1565c0' },
    { label: 'Banner', value: stats.banners, icon: '🖼️', bg: '#fff3e0', color: '#ef6c00' },
    { label: 'Nhà cung cấp', value: stats.suppliers, icon: '🏪', bg: '#f3e5f5', color: '#7b1fa2' },
    { label: 'Voucher', value: stats.vouchers, icon: '🎫', bg: '#fce4ec', color: '#c62828' },
    { label: 'Ưu đãi', value: stats.deals, icon: '⭐', bg: '#fffde7', color: '#f9a825' },
  ];

  return (
    <div>
      <div className="admin-page-header">
        <div>
          <h1 className="admin-page-title">Dashboard</h1>
          <p className="admin-page-subtitle">Tổng quan hệ thống Chợ Đầu Mới</p>
        </div>
      </div>

      {loading ? (
        <div className="admin-loading">
          <div className="admin-spinner" />
          <span>Đang tải dữ liệu...</span>
        </div>
      ) : (
        <>
          <div className="admin-stats">
            {statCards.map((s) => (
              <div key={s.label} className="admin-stat-card">
                <div className="admin-stat-icon" style={{ background: s.bg }}>
                  {s.icon}
                </div>
                <div>
                  <div className="admin-stat-value" style={{ color: s.color }}>{s.value}</div>
                  <div className="admin-stat-label">{s.label}</div>
                </div>
              </div>
            ))}
          </div>

          <div className="admin-card">
            <div className="admin-card-header">
              <span className="admin-card-title">Hướng dẫn nhanh</span>
            </div>
            <div style={{ padding: 20 }}>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: 16 }}>
                <div style={{ padding: 16, background: '#f8fffe', borderRadius: 12, border: '1px solid #e8f5e9' }}>
                  <div style={{ fontSize: 24, marginBottom: 8 }}>1️⃣</div>
                  <div style={{ fontWeight: 700, fontSize: 14, marginBottom: 4 }}>Tạo Danh mục</div>
                  <div style={{ fontSize: 13, color: '#666' }}>Bắt đầu bằng việc tạo danh mục sản phẩm (Rau, Củ, Quả...)</div>
                </div>
                <div style={{ padding: 16, background: '#f8fffe', borderRadius: 12, border: '1px solid #e8f5e9' }}>
                  <div style={{ fontSize: 24, marginBottom: 8 }}>2️⃣</div>
                  <div style={{ fontWeight: 700, fontSize: 14, marginBottom: 4 }}>Thêm Nhà cung cấp</div>
                  <div style={{ fontSize: 13, color: '#666' }}>Tạo thông tin nhà cung cấp nông sản</div>
                </div>
                <div style={{ padding: 16, background: '#f8fffe', borderRadius: 12, border: '1px solid #e8f5e9' }}>
                  <div style={{ fontSize: 24, marginBottom: 8 }}>3️⃣</div>
                  <div style={{ fontWeight: 700, fontSize: 14, marginBottom: 4 }}>Thêm Sản phẩm</div>
                  <div style={{ fontSize: 13, color: '#666' }}>Thêm sản phẩm với ảnh, giá, thông số chi tiết</div>
                </div>
                <div style={{ padding: 16, background: '#f8fffe', borderRadius: 12, border: '1px solid #e8f5e9' }}>
                  <div style={{ fontSize: 24, marginBottom: 8 }}>4️⃣</div>
                  <div style={{ fontWeight: 700, fontSize: 14, marginBottom: 4 }}>Cấu hình Banner</div>
                  <div style={{ fontSize: 13, color: '#666' }}>Thiết lập banner quảng cáo cho trang chủ</div>
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
