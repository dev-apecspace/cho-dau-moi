'use client';
import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';

interface Supplier {
  id: string; name: string; avatar_url: string; rating: number;
  product_count: number; response_rate: number; response_time: string; is_active: boolean;
}

export default function AdminNhaCungCap() {
  const [items, setItems] = useState<Supplier[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [toast, setToast] = useState<{ msg: string; type: string } | null>(null);
  const [form, setForm] = useState({ name: '', avatar_url: '', rating: 0, product_count: 0, response_rate: 0, response_time: '', is_active: true });
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState('');
  const [saving, setSaving] = useState(false);

  async function load() {
    const { data } = await supabase.from('suppliers').select('*').order('name');
    setItems(data || []); setLoading(false);
  }
  useEffect(() => { load(); }, []);

  function showToast(msg: string, type = 'success') { setToast({ msg, type }); setTimeout(() => setToast(null), 3000); }

  function openCreate() {
    setEditingId(null);
    setAvatarFile(null); setPreviewUrl('');
    setForm({ name: '', avatar_url: '', rating: 0, product_count: 0, response_rate: 0, response_time: '', is_active: true });
    setShowModal(true);
  }

  function openEdit(s: Supplier) {
    setEditingId(s.id);
    setAvatarFile(null); setPreviewUrl(s.avatar_url || '');
    setForm({ name: s.name, avatar_url: s.avatar_url, rating: s.rating, product_count: s.product_count, response_rate: s.response_rate, response_time: s.response_time, is_active: s.is_active });
    setShowModal(true);
  }

  async function handleSave() {
    if (!form.name) { showToast('Nhập tên NCC', 'error'); return; }
    setSaving(true);
    try {
      let avatarUrl = form.avatar_url;
      if (avatarFile) {
        const formData = new FormData();
        formData.append('file', avatarFile);
        formData.append('folder', 'suppliers');
        const res = await fetch('/api/upload', { method: 'POST', body: formData });
        if (!res.ok) throw new Error('Upload failed');
        const data = await res.json();
        avatarUrl = data.url;
      }

      const payload = { ...form, avatar_url: avatarUrl };
      if (editingId) {
        await supabase.from('suppliers').update(payload).eq('id', editingId);
        showToast('Đã cập nhật');
      } else {
        await supabase.from('suppliers').insert(payload);
        showToast('Đã thêm NCC mới');
      }
      setShowModal(false); load();
    } catch (err: any) {
      showToast('Lỗi: ' + err.message, 'error');
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(id: string) {
    if (!confirm('Xóa nhà cung cấp này?')) return;
    await supabase.from('suppliers').delete().eq('id', id);
    showToast('Đã xóa'); load();
  }

  return (
    <div>
      <div className="admin-page-header">
        <div><h1 className="admin-page-title">Quản lý Nhà cung cấp</h1><p className="admin-page-subtitle">{items.length} nhà cung cấp</p></div>
        <button className="admin-btn admin-btn-primary" onClick={openCreate}>+ Thêm NCC</button>
      </div>
      <div className="admin-card">
        {loading ? <div className="admin-loading"><div className="admin-spinner" /><span>Đang tải...</span></div> : items.length === 0 ? (
          <div className="admin-empty"><div className="admin-empty-icon">🏪</div><div className="admin-empty-text">Chưa có nhà cung cấp</div></div>
        ) : (
          <table className="admin-table">
            <thead><tr><th>Logo</th><th>Tên</th><th>Đánh giá</th><th>Số SP</th><th>Tỉ lệ PH</th><th>Thời gian PH</th><th>Trạng thái</th><th>Thao tác</th></tr></thead>
            <tbody>
              {items.map(s => (
                <tr key={s.id}>
                  <td>
                    <div className="admin-table-img">
                      {s.avatar_url ? <img src={s.avatar_url} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : '🏪'}
                    </div>
                  </td>
                  <td style={{ fontWeight: 600 }}>{s.name}</td>
                  <td>⭐ {s.rating}</td>
                  <td>{s.product_count}</td>
                  <td>{s.response_rate}%</td>
                  <td>{s.response_time}</td>
                  <td><button className={`admin-switch ${s.is_active ? 'on' : ''}`} onClick={async () => { await supabase.from('suppliers').update({ is_active: !s.is_active }).eq('id', s.id); load(); }} /></td>
                  <td><div className="admin-actions">
                    <button className="admin-action-btn" onClick={() => openEdit(s)}>✏️</button>
                    <button className="admin-action-btn delete" onClick={() => handleDelete(s.id)}>🗑️</button>
                  </div></td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {showModal && (
        <div className="admin-modal-overlay" onClick={() => setShowModal(false)}>
          <div className="admin-modal" onClick={e => e.stopPropagation()}>
            <div className="admin-modal-header"><span className="admin-modal-title">{editingId ? 'Sửa NCC' : 'Thêm NCC mới'}</span><button className="admin-modal-close" onClick={() => setShowModal(false)}>✕</button></div>
            <div className="admin-form"><div className="admin-form-grid">
              <div className="admin-field admin-form-full"><label className="admin-label">Tên *</label><input className="admin-input" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} /></div>
              <div className="admin-field admin-form-full">
                <label className="admin-label">Logo / Avatar</label>
                <input type="file" accept="image/*" onChange={e => { const f = e.target.files?.[0]; if (f) { setAvatarFile(f); setPreviewUrl(URL.createObjectURL(f)); } }} />
                {previewUrl && <img src={previewUrl} alt="Preview" style={{ width: 60, height: 60, borderRadius: 8, marginTop: 8, objectFit: 'cover' }} />}
              </div>
              <div className="admin-field"><label className="admin-label">Đánh giá</label><input className="admin-input" type="number" step="0.1" value={form.rating} onChange={e => setForm({ ...form, rating: Number(e.target.value) })} /></div>
              <div className="admin-field"><label className="admin-label">Số sản phẩm</label><input className="admin-input" type="number" value={form.product_count} onChange={e => setForm({ ...form, product_count: Number(e.target.value) })} /></div>
              <div className="admin-field"><label className="admin-label">Tỉ lệ phản hồi (%)</label><input className="admin-input" type="number" value={form.response_rate} onChange={e => setForm({ ...form, response_rate: Number(e.target.value) })} /></div>
              <div className="admin-field"><label className="admin-label">Thời gian phản hồi</label><input className="admin-input" value={form.response_time} onChange={e => setForm({ ...form, response_time: e.target.value })} placeholder="VD: Trong 1h" /></div>
              <div className="admin-field"><label className="admin-checkbox"><input type="checkbox" checked={form.is_active} onChange={e => setForm({ ...form, is_active: e.target.checked })} /> Hiển thị</label></div>
            </div></div>
            <div className="admin-form-actions">
              <button className="admin-btn admin-btn-secondary" onClick={() => setShowModal(false)} disabled={saving}>Hủy</button>
              <button className="admin-btn admin-btn-primary" onClick={handleSave} disabled={saving}>
                {saving ? 'Đang lưu...' : (editingId ? 'Cập nhật' : 'Thêm mới')}
              </button>
            </div>
          </div>
        </div>
      )}
      {toast && <div className={`admin-toast ${toast.type}`}>{toast.msg}</div>}
    </div>
  );
}
