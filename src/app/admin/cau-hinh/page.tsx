'use client';
import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';

const DEFAULT_SETTINGS = {
  site_name: 'Chợ Đầu Mới Nông Sản',
  site_subtitle: 'Nguồn hàng tận gốc - Giá sỉ tốt nhất',
  site_phone: '0900 000 000',
  site_email: 'lienhe@chodaumoi.vn',
  site_address: 'TP. Hồ Chí Minh',
  site_logo: '',
  site_logo_emoji: '🏪',
  shipping_free_min: 500000,
  shipping_note: 'Giao hàng toàn quốc',
  hero_title: 'NGUỒN HÀNG TẬN GỐC',
  hero_subtitle: 'GIÁ SỈ TỐT NHẤT',
  hero_features: 'Hàng tận gốc|Giao hàng toàn quốc|Đổi trả dễ dàng',
  hero_features_subs: 'Nguồn gốc rõ ràng|Nhanh chóng tiện lợi|Hỗ trợ 24/7',
  hero_features_icons: '✅|🚚|🔄',
  hero_features_icons_urls: '||',
  hero_bottom_badges: '🛡️ Cam kết chất lượng|📦 Giao hàng nhanh|💬 Hỗ trợ 24/7',
  hero_bottom_icons_urls: '||',
  hero_price_label: 'GIÁ SỈ',
  hero_price_value: 'TẬN GỐC',
  hero_price_badge_img: '',
  hero_floating_icons: '🥬|🥕|🍅|🧅',
  hero_floating_urls: '|||',
  delivery_location: 'TP. Hồ Chí Minh 1',
  feat_grid_labels: 'Đặt hàng|Giá tận gốc|Mua đầy|Dành cho',
  feat_grid_subs: 'Mọi lúc|Tốt nhất|Tiện lợi|Tiểu thương',
  feat_grid_icons_urls: '|||',
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
  
  async function uploadImage(file: File): Promise<string> {
    if (file.size > 2 * 1024 * 1024) throw new Error('File quá lớn (tối đa 2MB)');
    const formData = new FormData();
    formData.append('file', file);
    formData.append('folder', 'settings');
    const res = await fetch('/api/upload', { method: 'POST', body: formData });
    if (!res.ok) throw new Error('Upload failed');
    const data = await res.json();
    return data.url;
  }

  async function handleIconUpload(e: React.ChangeEvent<HTMLInputElement>, key: string, index: number) {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      showToast('Đang tải lên...', 'info');
      const url = await uploadImage(file);
      setSettings(prev => {
        const currentUrls = ((prev as any)[key] || '||').split('|');
        currentUrls[index] = url;
        return { ...prev, [key]: currentUrls.join('|') };
      });
      showToast('Đã tải lên ảnh');
    } catch (err: any) {
      showToast(err.message || 'Lỗi upload', 'error');
    }
  }

  async function handleSingleImageUpload(e: React.ChangeEvent<HTMLInputElement>, key: string) {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      showToast('Đang tải lên...', 'info');
      const url = await uploadImage(file);
      setSettings(prev => ({ ...prev, [key]: url }));
      showToast('Đã tải lên ảnh');
    } catch (err: any) {
      showToast(err.message || 'Lỗi upload', 'error');
    }
  }

  function handlePartChange(key: string, index: number, newValue: string) {
    setSettings(prev => {
      const parts = ((prev as any)[key] || '||').split('|');
      parts[index] = newValue;
      return { ...prev, [key]: parts.join('|') };
    });
  }

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
          <div className="admin-field admin-form-full">
            <label className="admin-label">Logo chính - Hình ảnh (Bắt buộc)</label>
            <div className="admin-image-upload-mini">
              {settings.site_logo ? <img src={settings.site_logo} alt="" style={{ width: 44, height: 44, objectFit: 'contain' }} /> : <div className="admin-image-placeholder">Upload Logo</div>}
              <input type="file" onChange={e => handleSingleImageUpload(e, 'site_logo')} accept="image/*" />
            </div>
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
            <label className="admin-label">Tính năng - Tiêu đề</label>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12 }}>
              {[0, 1, 2].map(i => (
                <input key={i} className="admin-input" value={settings.hero_features.split('|')[i] || ''} onChange={e => handlePartChange('hero_features', i, e.target.value)} placeholder={`Tiêu đề ${i+1}`} />
              ))}
            </div>
          </div>
          <div className="admin-field admin-form-full">
            <label className="admin-label">Tính năng - Mô tả phụ</label>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12 }}>
              {[0, 1, 2].map(i => (
                <input key={i} className="admin-input" value={settings.hero_features_subs.split('|')[i] || ''} onChange={e => handlePartChange('hero_features_subs', i, e.target.value)} placeholder={`Mô tả ${i+1}`} />
              ))}
            </div>
          </div>
          <div className="admin-field admin-form-full">
            <label className="admin-label">Tính năng - Icon Hình ảnh (Tải lên để thay thế Emoji)</label>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12, marginTop: 8 }}>
              {[0, 1, 2].map(i => {
                const urls = settings.hero_features_icons_urls.split('|');
                return (
                  <div key={i} className="admin-image-upload-mini">
                    {urls[i] ? <img src={urls[i]} alt="" style={{ width: 40, height: 40, objectFit: 'contain' }} /> : <div className="admin-image-placeholder">Icon {i+1}</div>}
                    <input type="file" onChange={e => handleIconUpload(e, 'hero_features_icons_urls', i)} accept="image/*" />
                  </div>
                );
              })}
            </div>
          </div>
          <div className="admin-field admin-form-full">
            <label className="admin-label">Dòng cam kết dưới banner</label>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12 }}>
              {[0, 1, 2].map(i => (
                <input key={i} className="admin-input" value={settings.hero_bottom_badges.split('|')[i] || ''} onChange={e => handlePartChange('hero_bottom_badges', i, e.target.value)} placeholder={`Cam kết ${i+1}`} />
              ))}
            </div>
          </div>
          <div className="admin-field admin-form-full">
            <label className="admin-label">Dòng cam kết - Icon Hình ảnh</label>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12, marginTop: 8 }}>
              {[0, 1, 2].map(i => {
                const urls = settings.hero_bottom_icons_urls.split('|');
                return (
                  <div key={i} className="admin-image-upload-mini">
                    {urls[i] ? <img src={urls[i]} alt="" style={{ width: 40, height: 40, objectFit: 'contain' }} /> : <div className="admin-image-placeholder">Badge {i+1}</div>}
                    <input type="file" onChange={e => handleIconUpload(e, 'hero_bottom_icons_urls', i)} accept="image/*" />
                  </div>
                );
              })}
            </div>
          </div>
          <div className="admin-field">
            <label className="admin-label">Badge Giá - Dòng 1</label>
            <input className="admin-input" value={settings.hero_price_label} onChange={e => setSettings({ ...settings, hero_price_label: e.target.value })} />
          </div>
          <div className="admin-field">
            <label className="admin-label">Badge Giá - Dòng 2</label>
            <input className="admin-input" value={settings.hero_price_value} onChange={e => setSettings({ ...settings, hero_price_value: e.target.value })} />
          </div>
          <div className="admin-field">
            <label className="admin-label">Badge Giá - Hình nền (Tùy chọn)</label>
            <div className="admin-image-upload-mini">
              {settings.hero_price_badge_img ? <img src={settings.hero_price_badge_img} alt="" style={{ width: 60, height: 60, objectFit: 'contain' }} /> : <div className="admin-image-placeholder">Upload</div>}
              <input type="file" onChange={e => handleSingleImageUpload(e, 'hero_price_badge_img')} accept="image/*" />
            </div>
          </div>
          <div className="admin-field admin-form-full">
            <label className="admin-label">4 Hình ảnh trôi nổi (Bắt buộc)</label>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12, marginTop: 8 }}>
              {[0, 1, 2, 3].map(i => {
                const urls = settings.hero_floating_urls.split('|');
                return (
                  <div key={i} style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                    <div className="admin-image-upload-mini">
                      {urls[i] ? <img src={urls[i]} alt="" style={{ width: 40, height: 40, objectFit: 'contain' }} /> : <div className="admin-image-placeholder">Ảnh {i+1}</div>}
                      <input type="file" onChange={e => handleIconUpload(e, 'hero_floating_urls', i)} accept="image/*" />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div></div>
      </div>

      {/* Features Grid & Delivery */}
      <div className="admin-card" style={{ marginBottom: 16 }}>
        <div className="admin-card-header"><span className="admin-card-title">Tính năng & Địa điểm (Trang chủ)</span></div>
        <div className="admin-form"><div className="admin-form-grid">
          <div className="admin-field admin-form-full">
            <label className="admin-label">Địa điểm giao hàng mặc định</label>
            <input className="admin-input" value={settings.delivery_location} onChange={e => setSettings({ ...settings, delivery_location: e.target.value })} />
          </div>
          <div className="admin-field admin-form-full">
            <label className="admin-label">4 Tính năng chính - Tiêu đề</label>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12 }}>
              {[0, 1, 2, 3].map(i => (
                <input key={i} className="admin-input" value={settings.feat_grid_labels.split('|')[i] || ''} onChange={e => handlePartChange('feat_grid_labels', i, e.target.value)} placeholder={`Label ${i+1}`} />
              ))}
            </div>
          </div>
          <div className="admin-field admin-form-full">
            <label className="admin-label">4 Tính năng chính - Mô tả phụ</label>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12 }}>
              {[0, 1, 2, 3].map(i => (
                <input key={i} className="admin-input" value={settings.feat_grid_subs.split('|')[i] || ''} onChange={e => handlePartChange('feat_grid_subs', i, e.target.value)} placeholder={`Sub ${i+1}`} />
              ))}
            </div>
          </div>
          <div className="admin-field admin-form-full">
            <label className="admin-label">4 Tính năng chính - Icon Hình ảnh</label>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12, marginTop: 8 }}>
              {[0, 1, 2, 3].map(i => {
                const urls = settings.feat_grid_icons_urls.split('|');
                return (
                  <div key={i} className="admin-image-upload-mini">
                    {urls[i] ? <img src={urls[i]} alt="" style={{ width: 40, height: 40, objectFit: 'contain' }} /> : <div className="admin-image-placeholder">Icon {i+1}</div>}
                    <input type="file" onChange={e => handleIconUpload(e, 'feat_grid_icons_urls', i)} accept="image/*" />
                  </div>
                );
              })}
            </div>
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
