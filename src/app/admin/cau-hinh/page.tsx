'use client';
import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';

const DEFAULT_SETTINGS = {
  site_name: 'Chợ Đầu Mới Nông Sản',
  site_subtitle: 'Nguồn hàng tận gốc - Giá sỉ tốt nhất',
  site_phone: '0900 000 000',
  site_email: 'lienhe@chodaumoi.vn',
  site_address: 'TP. Hồ Chí Minh',
  shipping_free_min: 500000,
  shipping_note: 'Giao hàng toàn quốc',
  hero_title: 'NGUỒN HÀNG TẬN GỐC',
  hero_subtitle: 'GIÁ SỈ TỐT NHẤT',
  hero_features: 'Hàng tận gốc|Giao hàng toàn quốc|Đổi trả dễ dàng',
  promo_tag: 'MUA CÀNG NHIỀU',
  promo_title: 'GIÁ CÀNG RẺ',
  promo_desc: 'Chiết khấu đến 15%\ncho đơn từ',
  promo_price: '3.000.000₫',
  promo_link: '/',
};

export default function AdminCauHinh() {
  const [settings, setSettings] = useState(DEFAULT_SETTINGS);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState<{ msg: string; type: string } | null>(null);

  useEffect(() => {
    async function load() {
      const { data } = await supabase.from('site_settings').select('*');
      if (data) {
        const merged = { ...DEFAULT_SETTINGS };
        data.forEach(row => {
          if (row.key in merged) {
            (merged as Record<string, unknown>)[row.key] = row.value?.v ?? (merged as Record<string, unknown>)[row.key];
          }
        });
        setSettings(merged);
      }
      setLoading(false);
    }
    load();
  }, []);

  function showToast(msg: string, type = 'success') { setToast({ msg, type }); setTimeout(() => setToast(null), 3000); }

  async function handleSave() {
    setSaving(true);
    try {
      const entries = Object.entries(settings);
      for (const [key, value] of entries) {
        await supabase.from('site_settings').upsert({ key, value: { v: value }, updated_at: new Date().toISOString() });
      }
      showToast('Đã lưu cấu hình');
    } catch {
      showToast('Lỗi khi lưu', 'error');
    }
    setSaving(false);
  }

  if (loading) return <div className="admin-loading"><div className="admin-spinner" /><span>Đang tải...</span></div>;

  return (
    <div>
      <div className="admin-page-header">
        <div><h1 className="admin-page-title">Cấu hình Website</h1><p className="admin-page-subtitle">Thông tin chung của website</p></div>
        <button className="admin-btn admin-btn-primary" onClick={handleSave} disabled={saving}>
          {saving ? 'Đang lưu...' : '💾 Lưu cấu hình'}
        </button>
      </div>

      {/* Site Info */}
      <div className="admin-card" style={{ marginBottom: 16 }}>
        <div className="admin-card-header"><span className="admin-card-title">Thông tin website</span></div>
        <div className="admin-form"><div className="admin-form-grid">
          <div className="admin-field">
            <label className="admin-label">Tên website</label>
            <input className="admin-input" value={settings.site_name} onChange={e => setSettings({ ...settings, site_name: e.target.value })} />
          </div>
          <div className="admin-field">
            <label className="admin-label">Slogan</label>
            <input className="admin-input" value={settings.site_subtitle} onChange={e => setSettings({ ...settings, site_subtitle: e.target.value })} />
          </div>
          <div className="admin-field">
            <label className="admin-label">Số điện thoại</label>
            <input className="admin-input" value={settings.site_phone} onChange={e => setSettings({ ...settings, site_phone: e.target.value })} />
          </div>
          <div className="admin-field">
            <label className="admin-label">Email</label>
            <input className="admin-input" value={settings.site_email} onChange={e => setSettings({ ...settings, site_email: e.target.value })} />
          </div>
          <div className="admin-field admin-form-full">
            <label className="admin-label">Địa chỉ</label>
            <input className="admin-input" value={settings.site_address} onChange={e => setSettings({ ...settings, site_address: e.target.value })} />
          </div>
        </div></div>
      </div>

      {/* Shipping */}
      <div className="admin-card" style={{ marginBottom: 16 }}>
        <div className="admin-card-header"><span className="admin-card-title">Vận chuyển</span></div>
        <div className="admin-form"><div className="admin-form-grid">
          <div className="admin-field">
            <label className="admin-label">Miễn phí ship từ (₫)</label>
            <input className="admin-input" type="number" value={settings.shipping_free_min} onChange={e => setSettings({ ...settings, shipping_free_min: Number(e.target.value) })} />
          </div>
          <div className="admin-field">
            <label className="admin-label">Ghi chú vận chuyển</label>
            <input className="admin-input" value={settings.shipping_note} onChange={e => setSettings({ ...settings, shipping_note: e.target.value })} />
          </div>
        </div></div>
      </div>

      {/* Hero Section */}
      <div className="admin-card" style={{ marginBottom: 16 }}>
        <div className="admin-card-header"><span className="admin-card-title">Hero Banner (Trang chủ)</span></div>
        <div className="admin-form"><div className="admin-form-grid">
          <div className="admin-field">
            <label className="admin-label">Tiêu đề chính</label>
            <input className="admin-input" value={settings.hero_title} onChange={e => setSettings({ ...settings, hero_title: e.target.value })} />
          </div>
          <div className="admin-field">
            <label className="admin-label">Tiêu đề phụ</label>
            <input className="admin-input" value={settings.hero_subtitle} onChange={e => setSettings({ ...settings, hero_subtitle: e.target.value })} />
          </div>
          <div className="admin-field admin-form-full">
            <label className="admin-label">Tính năng (ngăn cách bởi &quot;|&quot;)</label>
            <input className="admin-input" value={settings.hero_features} onChange={e => setSettings({ ...settings, hero_features: e.target.value })} placeholder="Hàng tận gốc|Giao hàng toàn quốc|Đổi trả dễ dàng" />
          </div>
        </div></div>
      </div>

      {/* Promo Banner (Danh mục) */}
      <div className="admin-card" style={{ marginBottom: 16 }}>
        <div className="admin-card-header"><span className="admin-card-title">Promo Banner (Danh mục)</span></div>
        <div className="admin-form"><div className="admin-form-grid">
          <div className="admin-field">
            <label className="admin-label">Nhãn (Tag)</label>
            <input className="admin-input" value={settings.promo_tag} onChange={e => setSettings({ ...settings, promo_tag: e.target.value })} />
          </div>
          <div className="admin-field">
            <label className="admin-label">Tiêu đề</label>
            <input className="admin-input" value={settings.promo_title} onChange={e => setSettings({ ...settings, promo_title: e.target.value })} />
          </div>
          <div className="admin-field">
            <label className="admin-label">Mô tả (Dùng \n để xuống dòng)</label>
            <textarea className="admin-input" rows={2} value={settings.promo_desc} onChange={e => setSettings({ ...settings, promo_desc: e.target.value })} />
          </div>
          <div className="admin-field">
            <label className="admin-label">Giá/Mức ưu đãi</label>
            <input className="admin-input" value={settings.promo_price} onChange={e => setSettings({ ...settings, promo_price: e.target.value })} />
          </div>
          <div className="admin-field admin-form-full">
            <label className="admin-label">Đường dẫn (Link)</label>
            <input className="admin-input" value={settings.promo_link} onChange={e => setSettings({ ...settings, promo_link: e.target.value })} />
          </div>
        </div></div>
      </div>

      {toast && <div className={`admin-toast ${toast.type}`}>{toast.msg}</div>}
    </div>
  );
}
