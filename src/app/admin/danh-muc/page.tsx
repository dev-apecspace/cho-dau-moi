'use client';
import React, { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';

interface Category {
  id: string;
  name: string;
  icon: string;
  parent_id: string | null;
  sort_order: number;
  is_active: boolean;
}

export default function AdminDanhMuc() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState({ name: '', icon: '', parent_id: '', sort_order: 0, is_active: true });
  const [iconFile, setIconFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState('');
  const [toast, setToast] = useState<{ msg: string; type: string } | null>(null);
  const [saving, setSaving] = useState(false);
  const [expanded, setExpanded] = useState<Set<string>>(new Set());

  async function load() {
    const { data } = await supabase.from('categories').select('*').order('sort_order');
    setCategories(data || []);
    setLoading(false);
  }

  useEffect(() => { load(); }, []);

  function toggleExpand(id: string) {
    const newExpanded = new Set(expanded);
    if (newExpanded.has(id)) newExpanded.delete(id);
    else newExpanded.add(id);
    setExpanded(newExpanded);
  }

  function showToast(msg: string, type = 'success') {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  }

  function openCreate() {
    setEditingId(null);
    setIconFile(null); setPreviewUrl('');
    setForm({ name: '', icon: '', parent_id: '', sort_order: 0, is_active: true });
    setShowModal(true);
  }

  function openEdit(cat: Category) {
    setEditingId(cat.id);
    setIconFile(null); setPreviewUrl(cat.icon || '');
    setForm({ name: cat.name, icon: cat.icon, parent_id: cat.parent_id || '', sort_order: cat.sort_order, is_active: cat.is_active });
    setShowModal(true);
  }

  async function handleSave() {
    if (!form.name) { showToast('Vui lòng nhập tên danh mục', 'error'); return; }
    setSaving(true);
    try {
      let iconUrl = form.icon;

      if (iconFile) {
        const formData = new FormData();
        formData.append('file', iconFile);
        formData.append('folder', 'categories');
        
        const res = await fetch('/api/upload', {
          method: 'POST',
          body: formData,
        });
        
        if (!res.ok) {
          const error = await res.json();
          throw new Error(error.error || 'Upload icon failed');
        }
        
        const data = await res.json();
        iconUrl = data.url;
      }

      const payload = {
        name: form.name,
        icon: iconUrl,
        parent_id: form.parent_id || null,
        sort_order: form.sort_order,
        is_active: form.is_active,
      };

      if (editingId) {
        const { error } = await supabase.from('categories').update(payload).eq('id', editingId);
        if (error) throw error;
        showToast('Đã cập nhật danh mục');
      } else {
        const { error } = await supabase.from('categories').insert(payload);
        if (error) throw error;
        showToast('Đã thêm danh mục mới');
      }
      setShowModal(false);
      load();
    } catch (err: any) {
      showToast('Lỗi: ' + err.message, 'error');
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(id: string) {
    if (!confirm('Bạn có chắc muốn xóa danh mục này?')) return;
    const { error } = await supabase.from('categories').delete().eq('id', id);
    if (error) { showToast('Lỗi: ' + error.message, 'error'); return; }
    showToast('Đã xóa danh mục');
    load();
  }

  async function toggleActive(cat: Category) {
    await supabase.from('categories').update({ is_active: !cat.is_active }).eq('id', cat.id);
    load();
  }

  const parentCategories = categories.filter(c => !c.parent_id);

  return (
    <div>
      <div className="admin-page-header">
        <div>
          <h1 className="admin-page-title">Quản lý Danh mục</h1>
          <p className="admin-page-subtitle">{categories.length} danh mục</p>
        </div>
        <button className="admin-btn admin-btn-primary" onClick={openCreate}>+ Thêm danh mục</button>
      </div>

      <div className="admin-card">
        {loading ? (
          <div className="admin-loading"><div className="admin-spinner" /><span>Đang tải...</span></div>
        ) : categories.length === 0 ? (
          <div className="admin-empty">
            <div className="admin-empty-icon">🗂️</div>
            <div className="admin-empty-text">Chưa có danh mục nào</div>
            <div className="admin-empty-sub">Nhấn &quot;Thêm danh mục&quot; để bắt đầu</div>
          </div>
        ) : (
          <table className="admin-table">
            <thead>
              <tr>
                <th style={{ width: 40 }}></th>
                <th>Icon</th>
                <th>Tên danh mục</th>
                <th>Danh mục cha</th>
                <th>Thứ tự</th>
                <th>Trạng thái</th>
                <th>Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {categories.filter(c => !c.parent_id).map((parent) => {
                const children = categories.filter(c => c.parent_id === parent.id);
                const isExpanded = expanded.has(parent.id);
                
                return (
                  <React.Fragment key={parent.id}>
                    <tr>
                      <td style={{ textAlign: 'center' }}>
                        {children.length > 0 && (
                          <button 
                            onClick={() => toggleExpand(parent.id)}
                            style={{ 
                              background: 'none', 
                              border: 'none', 
                              cursor: 'pointer',
                              padding: 4,
                              display: 'inline-flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              transform: isExpanded ? 'rotate(90deg)' : 'rotate(0deg)',
                              transition: 'transform 0.2s',
                              color: '#666',
                              fontSize: 12
                            }}
                          >
                            ▶
                          </button>
                        )}
                      </td>
                      <td>
                        <div className="admin-table-img">
                          {parent.icon && parent.icon.startsWith('http') ? (
                            <img src={parent.icon} alt={parent.name} style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
                          ) : parent.icon}
                        </div>
                      </td>
                      <td style={{ fontWeight: 600 }}>{parent.name}</td>
                      <td>—</td>
                      <td>{parent.sort_order}</td>
                      <td>
                        <button className={`admin-switch ${parent.is_active ? 'on' : ''}`} onClick={() => toggleActive(parent)} />
                      </td>
                      <td>
                        <div className="admin-actions">
                          <button className="admin-action-btn" onClick={() => openEdit(parent)} title="Sửa">✏️</button>
                          <button className="admin-action-btn delete" onClick={() => handleDelete(parent.id)} title="Xóa">🗑️</button>
                        </div>
                      </td>
                    </tr>
                    
                    {isExpanded && children.map(child => (
                      <tr key={child.id} style={{ background: '#fcfcfc' }}>
                        <td></td>
                        <td>
                          <div className="admin-table-img" style={{ marginLeft: 12 }}>
                            {child.icon && child.icon.startsWith('http') ? (
                              <img src={child.icon} alt={child.name} style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
                            ) : child.icon}
                          </div>
                        </td>
                        <td style={{ paddingLeft: 20 }}>
                          <span style={{ color: '#ccc', marginRight: 4 }}>∟</span>
                          {child.name}
                        </td>
                        <td style={{ fontSize: 12, color: '#888' }}>{parent.name}</td>
                        <td>{child.sort_order}</td>
                        <td>
                          <button className={`admin-switch ${child.is_active ? 'on' : ''}`} onClick={() => toggleActive(child)} />
                        </td>
                        <td>
                          <div className="admin-actions">
                            <button className="admin-action-btn" onClick={() => openEdit(child)} title="Sửa">✏️</button>
                            <button className="admin-action-btn delete" onClick={() => handleDelete(child.id)} title="Xóa">🗑️</button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </React.Fragment>
                );
              })}
            </tbody>
          </table>
        )}
      </div>

      {/* Modal */}
      {showModal && (
        <div className="admin-modal-overlay" onClick={() => setShowModal(false)}>
          <div className="admin-modal" onClick={e => e.stopPropagation()}>
            <div className="admin-modal-header">
              <span className="admin-modal-title">{editingId ? 'Sửa danh mục' : 'Thêm danh mục mới'}</span>
              <button className="admin-modal-close" onClick={() => setShowModal(false)}>✕</button>
            </div>
            <div className="admin-form">
              <div className="admin-form-grid">
                <div className="admin-field admin-form-full">
                  <label className="admin-label">Ảnh danh mục</label>
                  <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
                    <div style={{ width: 100, height: 100, borderRadius: 12, border: '2px dashed #ddd', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden', background: '#f9f9f9', flexShrink: 0 }}>
                      {previewUrl ? (
                        previewUrl.startsWith('http') || previewUrl.startsWith('blob') ? (
                          <img src={previewUrl} alt="Preview" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                        ) : <span style={{ fontSize: 32 }}>{previewUrl}</span>
                      ) : <span style={{ fontSize: 32, color: '#ccc' }}>🖼️</span>}
                    </div>
                    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 8 }}>
                      <input type="file" accept="image/*" onChange={e => { const f = e.target.files?.[0]; if (f) { setIconFile(f); setPreviewUrl(URL.createObjectURL(f)); } }} />
                      <p style={{ fontSize: 11, color: '#888' }}>Khuyên dùng ảnh vuông, kích thước 200x200px</p>
                    </div>
                  </div>
                </div>
                <div className="admin-field admin-form-full">
                  <label className="admin-label">Tên danh mục *</label>
                  <input className="admin-input" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} placeholder="VD: Rau lá xanh" />
                </div>
                <div className="admin-field">
                  <label className="admin-label">Danh mục cha</label>
                  <select className="admin-select" value={form.parent_id} onChange={e => setForm({ ...form, parent_id: e.target.value })}>
                    <option value="">— Không (danh mục gốc) —</option>
                    {parentCategories.map(c => (
                      <option key={c.id} value={c.id}>{c.icon && !c.icon.startsWith('http') ? c.icon : ''} {c.name}</option>
                    ))}
                  </select>
                </div>
                <div className="admin-field">
                  <label className="admin-label">Thứ tự</label>
                  <input className="admin-input" type="number" value={form.sort_order} onChange={e => setForm({ ...form, sort_order: Number(e.target.value) })} />
                </div>
                <div className="admin-field">
                  <label className="admin-checkbox">
                    <input type="checkbox" checked={form.is_active} onChange={e => setForm({ ...form, is_active: e.target.checked })} />
                    Hiển thị trên website
                  </label>
                </div>
              </div>
            </div>
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
