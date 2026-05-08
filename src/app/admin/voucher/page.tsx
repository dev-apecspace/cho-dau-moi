'use client';
import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';

interface Voucher {
  id: string; code: string; description: string; min_order: number;
  discount_value: number; discount_type: string; is_active: boolean; expires_at: string | null;
}

export default function AdminVoucher() {
  const [items, setItems] = useState<Voucher[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [toast, setToast] = useState<{ msg: string; type: string } | null>(null);
  const [form, setForm] = useState({ code: '', description: '', min_order: 0, discount_value: 0, discount_type: 'fixed', is_active: true, expires_at: '' });

  async function load() {
    const { data } = await supabase.from('vouchers').select('*').order('created_at', { ascending: false });
    setItems(data || []); setLoading(false);
  }
  useEffect(() => { load(); }, []);

  function showToast(msg: string, type = 'success') { setToast({ msg, type }); setTimeout(() => setToast(null), 3000); }

  function openCreate() {
    setEditingId(null);
    setForm({ code: '', description: '', min_order: 0, discount_value: 0, discount_type: 'fixed', is_active: true, expires_at: '' });
    setShowModal(true);
  }

  function openEdit(v: Voucher) {
    setEditingId(v.id);
    setForm({ code: v.code, description: v.description, min_order: v.min_order, discount_value: v.discount_value, discount_type: v.discount_type, is_active: v.is_active, expires_at: v.expires_at?.slice(0, 10) || '' });
    setShowModal(true);
  }

  async function handleSave() {
    if (!form.code) { showToast('Nhập mã voucher', 'error'); return; }
    const payload = { ...form, expires_at: form.expires_at || null };
    if (editingId) {
      const { error } = await supabase.from('vouchers').update(payload).eq('id', editingId);
      if (error) { showToast('Lỗi: ' + error.message, 'error'); return; }
      showToast('Đã cập nhật');
    } else {
      const { error } = await supabase.from('vouchers').insert(payload);
      if (error) { showToast('Lỗi: ' + error.message, 'error'); return; }
      showToast('Đã thêm voucher mới');
    }
    setShowModal(false); load();
  }

  async function handleDelete(id: string) {
    if (!confirm('Xóa voucher này?')) return;
    await supabase.from('vouchers').delete().eq('id', id);
    showToast('Đã xóa'); load();
  }

  return (
    <div>
      <div className="admin-page-header">
        <div><h1 className="admin-page-title">Quản lý Voucher</h1><p className="admin-page-subtitle">{items.length} voucher</p></div>
        <button className="admin-btn admin-btn-primary" onClick={openCreate}>+ Thêm voucher</button>
      </div>
      <div className="admin-card">
        {loading ? <div className="admin-loading"><div className="admin-spinner" /><span>Đang tải...</span></div> : items.length === 0 ? (
          <div className="admin-empty"><div className="admin-empty-icon">🎫</div><div className="admin-empty-text">Chưa có voucher</div></div>
        ) : (
          <table className="admin-table">
            <thead><tr><th>Mã</th><th>Mô tả</th><th>Giảm</th><th>Đơn tối thiểu</th><th>Hết hạn</th><th>Trạng thái</th><th>Thao tác</th></tr></thead>
            <tbody>
              {items.map(v => (
                <tr key={v.id}>
                  <td><span className="admin-badge admin-badge-green" style={{ fontFamily: 'monospace', fontSize: 13 }}>{v.code}</span></td>
                  <td>{v.description || '—'}</td>
                  <td style={{ fontWeight: 700, color: '#e53935' }}>{v.discount_type === 'percent' ? `${v.discount_value}%` : `${v.discount_value.toLocaleString('vi-VN')}₫`}</td>
                  <td>{v.min_order > 0 ? `${v.min_order.toLocaleString('vi-VN')}₫` : '—'}</td>
                  <td>{v.expires_at ? new Date(v.expires_at).toLocaleDateString('vi-VN') : 'Không giới hạn'}</td>
                  <td><button className={`admin-switch ${v.is_active ? 'on' : ''}`} onClick={async () => { await supabase.from('vouchers').update({ is_active: !v.is_active }).eq('id', v.id); load(); }} /></td>
                  <td><div className="admin-actions">
                    <button className="admin-action-btn" onClick={() => openEdit(v)}>✏️</button>
                    <button className="admin-action-btn delete" onClick={() => handleDelete(v.id)}>🗑️</button>
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
            <div className="admin-modal-header"><span className="admin-modal-title">{editingId ? 'Sửa voucher' : 'Thêm voucher mới'}</span><button className="admin-modal-close" onClick={() => setShowModal(false)}>✕</button></div>
            <div className="admin-form"><div className="admin-form-grid">
              <div className="admin-field"><label className="admin-label">Mã voucher *</label><input className="admin-input" value={form.code} onChange={e => setForm({ ...form, code: e.target.value.toUpperCase() })} placeholder="VD: GIAM10" /></div>
              <div className="admin-field"><label className="admin-label">Loại giảm</label>
                <select className="admin-select" value={form.discount_type} onChange={e => setForm({ ...form, discount_type: e.target.value })}>
                  <option value="fixed">Cố định (₫)</option>
                  <option value="percent">Phần trăm (%)</option>
                </select>
              </div>
              <div className="admin-field"><label className="admin-label">Giá trị giảm</label><input className="admin-input" type="number" value={form.discount_value} onChange={e => setForm({ ...form, discount_value: Number(e.target.value) })} /></div>
              <div className="admin-field"><label className="admin-label">Đơn tối thiểu (₫)</label><input className="admin-input" type="number" value={form.min_order} onChange={e => setForm({ ...form, min_order: Number(e.target.value) })} /></div>
              <div className="admin-field admin-form-full"><label className="admin-label">Mô tả</label><input className="admin-input" value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} /></div>
              <div className="admin-field"><label className="admin-label">Hết hạn</label><input className="admin-input" type="date" value={form.expires_at} onChange={e => setForm({ ...form, expires_at: e.target.value })} /></div>
              <div className="admin-field"><label className="admin-checkbox"><input type="checkbox" checked={form.is_active} onChange={e => setForm({ ...form, is_active: e.target.checked })} /> Kích hoạt</label></div>
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
