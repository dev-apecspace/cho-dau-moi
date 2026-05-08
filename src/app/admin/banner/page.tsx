'use client';
import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';

interface Banner {
  id: string; title: string; subtitle: string; image_url: string; link_url: string;
  position: string; bg_gradient: string; emoji: string; sort_order: number;
  is_active: boolean; start_date: string | null; end_date: string | null;
}

const POSITIONS = [
  { value: 'hero', label: 'Hero (Trang chủ)' },
  { value: 'flash_sale', label: 'Flash Sale' },
  { value: 'promo', label: 'Khuyến mãi' },
  { value: 'category', label: 'Danh mục' },
];

export default function AdminBanner() {
  const [banners, setBanners] = useState<Banner[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [toast, setToast] = useState<{ msg: string; type: string } | null>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState('');

  const [form, setForm] = useState({
    title: '', subtitle: '', image_url: '', link_url: '', position: 'hero',
    bg_gradient: 'linear-gradient(135deg, #2a7a2a, #4caf50)', emoji: '',
    sort_order: 0, is_active: true, start_date: '', end_date: '',
  });

  async function load() {
    const { data } = await supabase.from('banners').select('*').order('sort_order');
    setBanners(data || []);
    setLoading(false);
  }

  useEffect(() => { load(); }, []);

  function showToast(msg: string, type = 'success') {
    setToast({ msg, type }); setTimeout(() => setToast(null), 3000);
  }

  function openCreate() {
    setEditingId(null); setImageFile(null); setPreviewUrl('');
    setForm({ title: '', subtitle: '', image_url: '', link_url: '', position: 'hero', bg_gradient: 'linear-gradient(135deg, #2a7a2a, #4caf50)', emoji: '', sort_order: 0, is_active: true, start_date: '', end_date: '' });
    setShowModal(true);
  }

  function openEdit(b: Banner) {
    setEditingId(b.id); setImageFile(null); setPreviewUrl(b.image_url || '');
    setForm({ title: b.title, subtitle: b.subtitle, image_url: b.image_url, link_url: b.link_url, position: b.position, bg_gradient: b.bg_gradient, emoji: b.emoji, sort_order: b.sort_order, is_active: b.is_active, start_date: b.start_date?.slice(0, 10) || '', end_date: b.end_date?.slice(0, 10) || '' });
    setShowModal(true);
  }

  async function handleSave() {
    if (!form.title) { showToast('Vui lòng nhập tiêu đề', 'error'); return; }
    let imageUrl = form.image_url;
    if (imageFile) {
      const formData = new FormData();
      formData.append('file', imageFile);
      formData.append('folder', 'banners');
      
      const res = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });
      
      if (!res.ok) {
        const error = await res.json();
        showToast('Lỗi upload: ' + (error.error || 'Unknown'), 'error');
        return;
      }
      
      const data = await res.json();
      imageUrl = data.url;
    }
    const payload = { ...form, image_url: imageUrl, start_date: form.start_date || null, end_date: form.end_date || null };
    if (editingId) {
      await supabase.from('banners').update(payload).eq('id', editingId);
      showToast('Đã cập nhật banner');
    } else {
      await supabase.from('banners').insert(payload);
      showToast('Đã thêm banner mới');
    }
    setShowModal(false); load();
  }

  async function handleDelete(id: string) {
    if (!confirm('Xóa banner này?')) return;
    await supabase.from('banners').delete().eq('id', id);
    showToast('Đã xóa'); load();
  }

  async function toggleActive(b: Banner) {
    await supabase.from('banners').update({ is_active: !b.is_active }).eq('id', b.id);
    load();
  }

  return (
    <div>
      <div className="admin-page-header">
        <div>
          <h1 className="admin-page-title">Quản lý Banner</h1>
          <p className="admin-page-subtitle">{banners.length} banner</p>
        </div>
        <button className="admin-btn admin-btn-primary" onClick={openCreate}>+ Thêm banner</button>
      </div>

      <div className="admin-card">
        {loading ? (
          <div className="admin-loading"><div className="admin-spinner" /><span>Đang tải...</span></div>
        ) : banners.length === 0 ? (
          <div className="admin-empty">
            <div className="admin-empty-icon">🖼️</div>
            <div className="admin-empty-text">Chưa có banner nào</div>
          </div>
        ) : (
          <table className="admin-table">
            <thead><tr><th>Preview</th><th>Tiêu đề</th><th>Vị trí</th><th>Thứ tự</th><th>Trạng thái</th><th>Thao tác</th></tr></thead>
            <tbody>
              {banners.map(b => (
                <tr key={b.id}>
                  <td>
                    <div style={{ width: 120, height: 50, borderRadius: 8, background: b.bg_gradient || '#eee', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
                      {b.image_url ? <img src={b.image_url} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : <span style={{ fontSize: 24 }}>{b.emoji}</span>}
                    </div>
                  </td>
                  <td><div style={{ fontWeight: 600 }}>{b.title}</div><div style={{ fontSize: 11, color: '#999' }}>{b.subtitle}</div></td>
                  <td><span className="admin-badge admin-badge-blue">{POSITIONS.find(p => p.value === b.position)?.label || b.position}</span></td>
                  <td>{b.sort_order}</td>
                  <td><button className={`admin-switch ${b.is_active ? 'on' : ''}`} onClick={() => toggleActive(b)} /></td>
                  <td>
                    <div className="admin-actions">
                      <button className="admin-action-btn" onClick={() => openEdit(b)}>✏️</button>
                      <button className="admin-action-btn delete" onClick={() => handleDelete(b.id)}>🗑️</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {showModal && (
        <div className="admin-modal-overlay" onClick={() => setShowModal(false)}>
          <div className="admin-modal" onClick={e => e.stopPropagation()}>
            <div className="admin-modal-header">
              <span className="admin-modal-title">{editingId ? 'Sửa banner' : 'Thêm banner mới'}</span>
              <button className="admin-modal-close" onClick={() => setShowModal(false)}>✕</button>
            </div>
            <div className="admin-form">
              <div className="admin-form-grid">
                <div className="admin-field admin-form-full">
                  <label className="admin-label">Tiêu đề *</label>
                  <input className="admin-input" value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} />
                </div>
                <div className="admin-field admin-form-full">
                  <label className="admin-label">Phụ đề</label>
                  <input className="admin-input" value={form.subtitle} onChange={e => setForm({ ...form, subtitle: e.target.value })} />
                </div>
                <div className="admin-field">
                  <label className="admin-label">Vị trí</label>
                  <select className="admin-select" value={form.position} onChange={e => setForm({ ...form, position: e.target.value })}>
                    {POSITIONS.map(p => <option key={p.value} value={p.value}>{p.label}</option>)}
                  </select>
                </div>
                <div className="admin-field">
                  <label className="admin-label">Emoji icon</label>
                  <input className="admin-input" value={form.emoji} onChange={e => setForm({ ...form, emoji: e.target.value })} placeholder="🥬" />
                </div>
                <div className="admin-field admin-form-full">
                  <label className="admin-label">Link khi click</label>
                  <input className="admin-input" value={form.link_url} onChange={e => setForm({ ...form, link_url: e.target.value })} placeholder="https://..." />
                </div>
                <div className="admin-field admin-form-full">
                  <label className="admin-label">Background gradient</label>
                  <input className="admin-input" value={form.bg_gradient} onChange={e => setForm({ ...form, bg_gradient: e.target.value })} />
                  <div style={{ height: 30, borderRadius: 6, marginTop: 4, background: form.bg_gradient }} />
                </div>
                <div className="admin-field admin-form-full">
                  <label className="admin-label">Ảnh banner</label>
                  <input type="file" accept="image/*" onChange={e => { const f = e.target.files?.[0]; if (f) { setImageFile(f); setPreviewUrl(URL.createObjectURL(f)); } }} />
                  {previewUrl && <img src={previewUrl} alt="Preview" style={{ maxHeight: 100, borderRadius: 8, marginTop: 8 }} />}
                </div>
                <div className="admin-field">
                  <label className="admin-label">Bắt đầu</label>
                  <input className="admin-input" type="date" value={form.start_date} onChange={e => setForm({ ...form, start_date: e.target.value })} />
                </div>
                <div className="admin-field">
                  <label className="admin-label">Kết thúc</label>
                  <input className="admin-input" type="date" value={form.end_date} onChange={e => setForm({ ...form, end_date: e.target.value })} />
                </div>
                <div className="admin-field">
                  <label className="admin-label">Thứ tự</label>
                  <input className="admin-input" type="number" value={form.sort_order} onChange={e => setForm({ ...form, sort_order: Number(e.target.value) })} />
                </div>
                <div className="admin-field">
                  <label className="admin-checkbox"><input type="checkbox" checked={form.is_active} onChange={e => setForm({ ...form, is_active: e.target.checked })} /> Hiển thị</label>
                </div>
              </div>
            </div>
            <div className="admin-form-actions">
              <button className="admin-btn admin-btn-secondary" onClick={() => setShowModal(false)}>Hủy</button>
              <button className="admin-btn admin-btn-primary" onClick={handleSave}>{editingId ? 'Cập nhật' : 'Thêm mới'}</button>
            </div>
          </div>
        </div>
      )}

      {toast && <div className={`admin-toast ${toast.type}`}>{toast.msg}</div>}
    </div>
  );
}
