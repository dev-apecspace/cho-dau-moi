'use client';
import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';

interface Deal {
  id: string; tag: string; title: string; description: string; emoji: string;
  bg_gradient: string; btn_text: string; link_url: string; sort_order: number;
  is_active: boolean; expires_at: string | null;
}

export default function AdminUuDai() {
  const [items, setItems] = useState<Deal[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [toast, setToast] = useState<{ msg: string; type: string } | null>(null);
  const [form, setForm] = useState({ tag: '', title: '', description: '', emoji: '', bg_gradient: 'linear-gradient(135deg, #2a7a2a, #4caf50)', btn_text: 'XEM NGAY', link_url: '', sort_order: 0, is_active: true, expires_at: '' });

  async function load() {
    const { data } = await supabase.from('deals').select('*').order('sort_order');
    setItems(data || []); setLoading(false);
  }
  useEffect(() => { load(); }, []);

  function showToast(msg: string, type = 'success') { setToast({ msg, type }); setTimeout(() => setToast(null), 3000); }

  function openCreate() {
    setEditingId(null);
    setForm({ tag: '', title: '', description: '', emoji: '', bg_gradient: 'linear-gradient(135deg, #2a7a2a, #4caf50)', btn_text: 'XEM NGAY', link_url: '', sort_order: 0, is_active: true, expires_at: '' });
    setShowModal(true);
  }

  function openEdit(d: Deal) {
    setEditingId(d.id);
    setForm({ tag: d.tag, title: d.title, description: d.description, emoji: d.emoji, bg_gradient: d.bg_gradient, btn_text: d.btn_text, link_url: d.link_url, sort_order: d.sort_order, is_active: d.is_active, expires_at: d.expires_at?.slice(0, 10) || '' });
    setShowModal(true);
  }

  async function handleSave() {
    if (!form.title) { showToast('Nhập tiêu đề', 'error'); return; }
    const payload = { ...form, expires_at: form.expires_at || null };
    if (editingId) {
      await supabase.from('deals').update(payload).eq('id', editingId);
      showToast('Đã cập nhật');
    } else {
      await supabase.from('deals').insert(payload);
      showToast('Đã thêm ưu đãi mới');
    }
    setShowModal(false); load();
  }

  async function handleDelete(id: string) {
    if (!confirm('Xóa ưu đãi này?')) return;
    await supabase.from('deals').delete().eq('id', id);
    showToast('Đã xóa'); load();
  }

  return (
    <div>
      <div className="admin-page-header">
        <div><h1 className="admin-page-title">Quản lý Ưu đãi</h1><p className="admin-page-subtitle">{items.length} ưu đãi</p></div>
        <button className="admin-btn admin-btn-primary" onClick={openCreate}>+ Thêm ưu đãi</button>
      </div>
      <div className="admin-card">
        {loading ? <div className="admin-loading"><div className="admin-spinner" /><span>Đang tải...</span></div> : items.length === 0 ? (
          <div className="admin-empty"><div className="admin-empty-icon">⭐</div><div className="admin-empty-text">Chưa có ưu đãi</div></div>
        ) : (
          <table className="admin-table">
            <thead><tr><th>Preview</th><th>Tag</th><th>Tiêu đề</th><th>Nút</th><th>Thứ tự</th><th>Trạng thái</th><th>Thao tác</th></tr></thead>
            <tbody>
              {items.map(d => (
                <tr key={d.id}>
                  <td>
                    <div style={{ width: 100, height: 44, borderRadius: 8, background: d.bg_gradient, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <span style={{ fontSize: 20 }}>{d.emoji}</span>
                    </div>
                  </td>
                  <td><span className="admin-badge admin-badge-orange">{d.tag}</span></td>
                  <td style={{ fontWeight: 600 }}>{d.title}</td>
                  <td>{d.btn_text}</td>
                  <td>{d.sort_order}</td>
                  <td><button className={`admin-switch ${d.is_active ? 'on' : ''}`} onClick={async () => { await supabase.from('deals').update({ is_active: !d.is_active }).eq('id', d.id); load(); }} /></td>
                  <td><div className="admin-actions">
                    <button className="admin-action-btn" onClick={() => openEdit(d)}>✏️</button>
                    <button className="admin-action-btn delete" onClick={() => handleDelete(d.id)}>🗑️</button>
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
            <div className="admin-modal-header"><span className="admin-modal-title">{editingId ? 'Sửa ưu đãi' : 'Thêm ưu đãi mới'}</span><button className="admin-modal-close" onClick={() => setShowModal(false)}>✕</button></div>
            <div className="admin-form"><div className="admin-form-grid">
              <div className="admin-field"><label className="admin-label">Tag</label><input className="admin-input" value={form.tag} onChange={e => setForm({ ...form, tag: e.target.value })} placeholder="VD: FLASH SALE" /></div>
              <div className="admin-field"><label className="admin-label">Emoji</label><input className="admin-input" value={form.emoji} onChange={e => setForm({ ...form, emoji: e.target.value })} placeholder="🥬" /></div>
              <div className="admin-field admin-form-full"><label className="admin-label">Tiêu đề *</label><input className="admin-input" value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} /></div>
              <div className="admin-field admin-form-full"><label className="admin-label">Mô tả</label><input className="admin-input" value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} /></div>
              <div className="admin-field admin-form-full"><label className="admin-label">Background gradient</label><input className="admin-input" value={form.bg_gradient} onChange={e => setForm({ ...form, bg_gradient: e.target.value })} />
                <div style={{ height: 30, borderRadius: 6, marginTop: 4, background: form.bg_gradient }} />
              </div>
              <div className="admin-field"><label className="admin-label">Text nút CTA</label><input className="admin-input" value={form.btn_text} onChange={e => setForm({ ...form, btn_text: e.target.value })} /></div>
              <div className="admin-field"><label className="admin-label">Link</label><input className="admin-input" value={form.link_url} onChange={e => setForm({ ...form, link_url: e.target.value })} placeholder="https://..." /></div>
              <div className="admin-field"><label className="admin-label">Hết hạn</label><input className="admin-input" type="date" value={form.expires_at} onChange={e => setForm({ ...form, expires_at: e.target.value })} /></div>
              <div className="admin-field"><label className="admin-label">Thứ tự</label><input className="admin-input" type="number" value={form.sort_order} onChange={e => setForm({ ...form, sort_order: Number(e.target.value) })} /></div>
              <div className="admin-field"><label className="admin-checkbox"><input type="checkbox" checked={form.is_active} onChange={e => setForm({ ...form, is_active: e.target.checked })} /> Hiển thị</label></div>
            </div></div>
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
