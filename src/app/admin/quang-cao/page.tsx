'use client';

import { useEffect, useMemo, useState } from 'react';
import { supabase } from '@/lib/supabase';

type ContentType = 'image' | 'video' | 'youtube';
type Promotion = { id: string; title: string; content_type: ContentType; media_url: string; link_url: string; sort_order: number; is_active: boolean; start_date: string | null; end_date: string | null };
const emptyForm = { title: '', content_type: 'image' as ContentType, media_url: '', link_url: '', sort_order: 0, is_active: true, start_date: '', end_date: '' };

function MediaPreview({ type, url, large = false }: { type: ContentType; url: string; large?: boolean }) {
  if (!url) return <div style={{ color: '#999', fontSize: 12 }}>Chưa chọn nội dung</div>;
  if (type === 'youtube') return <a href={url} target="_blank" rel="noreferrer" className="admin-btn admin-btn-secondary" style={{ display: 'inline-flex' }}>▶ Mở video YouTube</a>;
  const style = { width: large ? '100%' : 180, height: large ? 280 : 100, maxWidth: '100%', objectFit: 'contain' as const, borderRadius: 8, background: '#111' };
  return type === 'video' ? <video src={url} controls preload="metadata" style={style}>Trình duyệt không hỗ trợ video.</video> : <img src={url} alt="Preview quảng cáo" style={style} />;
}

export default function PromotionsPage() {
  const [items, setItems] = useState<Promotion[]>([]);
  const [form, setForm] = useState(emptyForm);
  const [file, setFile] = useState<File | null>(null);
  const [editing, setEditing] = useState<string | null>(null);
  const [open, setOpen] = useState(false);
  const [toast, setToast] = useState('');
  const filePreview = useMemo(() => file ? URL.createObjectURL(file) : '', [file]);
  const previewUrl = filePreview || form.media_url;

  useEffect(() => () => { if (filePreview) URL.revokeObjectURL(filePreview); }, [filePreview]);
  const notify = (message: string) => { setToast(message); setTimeout(() => setToast(''), 3000); };
  const load = async () => { const { data, error } = await supabase.from('promotions').select('*').order('sort_order'); if (error) notify('Chưa có bảng promotions: hãy chạy migration mới.'); else setItems(data || []); };
  useEffect(() => { load(); }, []);
  const create = () => { setEditing(null); setFile(null); setForm(emptyForm); setOpen(true); };
  const edit = (item: Promotion) => { setEditing(item.id); setFile(null); setForm({ ...item, start_date: item.start_date?.slice(0, 10) || '', end_date: item.end_date?.slice(0, 10) || '' }); setOpen(true); };

  const save = async () => {
    if (!form.title) return notify('Vui lòng nhập tên quảng cáo');
    let media_url = form.media_url;
    if (form.content_type !== 'youtube' && file) {
      const fd = new FormData(); fd.append('file', file); fd.append('folder', `cloudinary/promotions/${form.content_type === 'video' ? 'videos' : 'images'}`);
      const response = await fetch('/api/upload', { method: 'POST', body: fd }); const result = await response.json();
      if (!response.ok) return notify(result.error || 'Upload thất bại'); media_url = result.url;
    }
    if (!media_url) return notify('Vui lòng chọn tệp hoặc nhập link YouTube');
    const payload = { ...form, media_url, start_date: form.start_date || null, end_date: form.end_date || null };
    const { error } = editing ? await supabase.from('promotions').update(payload).eq('id', editing) : await supabase.from('promotions').insert(payload);
    if (error) return notify(error.message); setOpen(false); notify('Đã lưu quảng cáo'); load();
  };

  return <div>
    <div className="admin-page-header"><div><h1 className="admin-page-title">Quảng cáo popup</h1><p className="admin-page-subtitle">Quản lý nhiều banner, video và YouTube cho trang chủ</p></div><button className="admin-btn admin-btn-primary" onClick={create}>+ Thêm quảng cáo</button></div>
    <div className="admin-card"><table className="admin-table"><thead><tr><th>Preview</th><th>Nội dung</th><th>Loại</th><th>Thứ tự</th><th>Hiển thị</th><th /></tr></thead><tbody>{items.map(item => <tr key={item.id}>
      <td style={{ width: 210 }}><MediaPreview type={item.content_type} url={item.media_url} /></td>
      <td><b>{item.title}</b>{item.link_url && <div style={{ fontSize: 12, color: '#777' }}>Đích: {item.link_url}</div>}</td>
      <td><span className="admin-badge admin-badge-blue">{item.content_type === 'image' ? 'Ảnh' : item.content_type === 'video' ? 'Video' : 'YouTube'}</span></td><td>{item.sort_order}</td>
      <td><button className={`admin-switch ${item.is_active ? 'on' : ''}`} onClick={async () => { await supabase.from('promotions').update({ is_active: !item.is_active }).eq('id', item.id); load(); }} /></td>
      <td><div className="admin-actions"><button className="admin-action-btn" onClick={() => edit(item)}>✏️</button><button className="admin-action-btn delete" onClick={async () => { if (confirm('Xóa quảng cáo này?')) { await supabase.from('promotions').delete().eq('id', item.id); load(); } }}>🗑️</button></div></td>
    </tr>)}</tbody></table>{!items.length && <div className="admin-empty"><div className="admin-empty-text">Chưa có quảng cáo nào</div></div>}</div>

    {open && <div className="admin-modal-overlay" onClick={() => setOpen(false)}><div className="admin-modal" onClick={e => e.stopPropagation()}>
      <div className="admin-modal-header"><span className="admin-modal-title">{editing ? 'Sửa quảng cáo' : 'Thêm quảng cáo'}</span><button className="admin-modal-close" onClick={() => setOpen(false)}>×</button></div>
      <div className="admin-form"><div className="admin-form-grid">
        <div className="admin-field admin-form-full"><label className="admin-label">Tên quảng cáo *</label><input className="admin-input" value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} /></div>
        <div className="admin-field"><label className="admin-label">Loại nội dung</label><select className="admin-select" value={form.content_type} onChange={e => { setFile(null); setForm({ ...form, content_type: e.target.value as ContentType, media_url: '' }); }}><option value="image">Ảnh banner</option><option value="video">Video</option><option value="youtube">YouTube</option></select></div>
        <div className="admin-field"><label className="admin-label">Thứ tự</label><input className="admin-input" type="number" value={form.sort_order} onChange={e => setForm({ ...form, sort_order: Number(e.target.value) })} /></div>
        {form.content_type === 'youtube' ? <div className="admin-field admin-form-full"><label className="admin-label">Link YouTube *</label><input className="admin-input" value={form.media_url} onChange={e => setForm({ ...form, media_url: e.target.value })} placeholder="https://youtube.com/watch?v=..." />{form.media_url && <div style={{ marginTop: 10 }}><MediaPreview type="youtube" url={form.media_url} /></div>}</div> : <div className="admin-field admin-form-full"><label className="admin-label">{form.content_type === 'video' ? 'Video' : 'Ảnh banner'}</label><input type="file" accept={form.content_type === 'video' ? 'video/*' : 'image/*'} onChange={e => setFile(e.target.files?.[0] || null)} /><div style={{ marginTop: 10 }}><MediaPreview type={form.content_type} url={previewUrl} large /></div></div>}
        <div className="admin-field admin-form-full"><label className="admin-label">Link khi click</label><input className="admin-input" value={form.link_url} onChange={e => setForm({ ...form, link_url: e.target.value })} placeholder="/san-pham hoặc https://..." /></div>
        <div className="admin-field"><label className="admin-checkbox"><input type="checkbox" checked={form.is_active} onChange={e => setForm({ ...form, is_active: e.target.checked })} /> Hiển thị</label></div>
      </div></div><div className="admin-form-actions"><button className="admin-btn admin-btn-secondary" onClick={() => setOpen(false)}>Hủy</button><button className="admin-btn admin-btn-primary" onClick={save}>Lưu</button></div>
    </div></div>}
    {toast && <div className="admin-toast">{toast}</div>}
  </div>;
}
