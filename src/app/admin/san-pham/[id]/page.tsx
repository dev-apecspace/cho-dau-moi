'use client';
import { useEffect, useState, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { isImageUrl } from '@/lib/upload-paths';

interface Category { id: string; name: string; icon: string; parent_id: string | null; }
interface Supplier { id: string; name: string; }

export default function AdminProductForm() {
  const params = useParams();
  const router = useRouter();
  const isNew = params.id === 'tao-moi';
  const productId = isNew ? null : params.id as string;

  const [categories, setCategories] = useState<Category[]>([]);
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState<{ msg: string; type: string } | null>(null);
  const [images, setImages] = useState<{ id?: string; url: string; file?: File }[]>([]);
  const [specs, setSpecs] = useState<{ label: string; value: string }[]>([]);
  const [tiers, setTiers] = useState<{ min_qty: number; max_qty: number | null; price: number }[]>([]);
  const [catOpen, setCatOpen] = useState(false);
  const catRef = useRef<HTMLDivElement>(null);

  const [form, setForm] = useState({
    name: '', slug: '', description: '', price: 0, original_price: 0,
    unit: 'kg', min_order: '', category_id: '', supplier_id: '', origin: '',
    rating: 0, review_count: 0, sold_count: 0, tags: '',
    is_active: true, is_featured: false, is_best_seller: false, is_daily: false, sort_order: 0,
  });

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (catRef.current && !catRef.current.contains(event.target as Node)) {
        setCatOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    async function init() {
      const [catRes, supRes] = await Promise.all([
        supabase.from('categories').select('id, name, icon, parent_id').order('sort_order'),
        supabase.from('suppliers').select('id, name').order('name'),
      ]);
      setCategories(catRes.data || []);
      setSuppliers(supRes.data || []);

      if (productId) {
        const { data: p } = await supabase.from('products').select('*').eq('id', productId).single();
        if (p) {
          setForm({
            name: p.name || '', slug: p.slug || '', description: p.description || '',
            price: p.price || 0, original_price: p.original_price || 0,
            unit: p.unit || 'kg', min_order: p.min_order || '',
            category_id: p.category_id || '', supplier_id: p.supplier_id || '',
            origin: p.origin || '', rating: p.rating || 0,
            review_count: p.review_count || 0, sold_count: p.sold_count || 0,
            tags: (p.tags || []).join(', '),
            is_active: p.is_active ?? true, is_featured: p.is_featured ?? false,
            is_best_seller: p.is_best_seller ?? false, is_daily: p.is_daily ?? false,
            sort_order: p.sort_order || 0,
          });
        }
        const { data: imgs } = await supabase.from('product_images').select('*').eq('product_id', productId).order('sort_order');
        setImages((imgs || []).map(i => ({ id: i.id, url: i.image_url })));

        const { data: sp } = await supabase.from('product_specs').select('*').eq('product_id', productId).order('sort_order');
        setSpecs((sp || []).map(s => ({ label: s.label, value: s.value })));

        const { data: pt } = await supabase.from('price_tiers').select('*').eq('product_id', productId).order('min_qty');
        setTiers((pt || []).map(t => ({ min_qty: t.min_qty, max_qty: t.max_qty, price: t.price })));
      }
      setLoading(false);
    }
    init();
  }, [productId]);

  function showToast(msg: string, type = 'success') {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  }

  function generateSlug(name: string) {
    return name.toLowerCase()
      .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
      .replace(/đ/g, 'd').replace(/Đ/g, 'D')
      .replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
  }

  async function uploadImage(file: File): Promise<string> {
    if (file.size > 5 * 1024 * 1024) {
      throw new Error(`File ${file.name} quá lớn (tối đa 5MB)`);
    }
    
    const formData = new FormData();
    formData.append('file', file);
    formData.append('folder', 'products');
    
    const res = await fetch('/api/upload', {
      method: 'POST',
      body: formData,
    });
    
    if (!res.ok) {
      let errorMessage = 'Upload failed';
      try {
        const error = await res.json();
        errorMessage = error.error || errorMessage;
      } catch (e) {}
      throw new Error(errorMessage);
    }
    
    const data = await res.json();
    return data.url;
  }

  function handleFileSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files || []);
    files.forEach(file => {
      const url = URL.createObjectURL(file);
      setImages(prev => [...prev, { url, file }]);
    });
    e.target.value = '';
  }

  function removeImage(idx: number) {
    setImages(prev => prev.filter((_, i) => i !== idx));
  }

  async function handleSave() {
    if (!form.name) { showToast('Vui lòng nhập tên sản phẩm', 'error'); return; }
    setSaving(true);

    try {
      const slug = form.slug || generateSlug(form.name);
      const tags = form.tags.split(',').map(t => t.trim()).filter(Boolean);

      const payload = {
        name: form.name, slug, description: form.description,
        price: form.price, original_price: form.original_price,
        unit: form.unit, min_order: form.min_order,
        category_id: form.category_id || null, supplier_id: form.supplier_id || null,
        origin: form.origin, rating: form.rating,
        review_count: form.review_count, sold_count: form.sold_count, tags,
        is_active: form.is_active, is_featured: form.is_featured,
        is_best_seller: form.is_best_seller, is_daily: form.is_daily,
        sort_order: form.sort_order,
      };

      let pid = productId;

      if (isNew) {
        const { data, error } = await supabase.from('products').insert(payload).select('id').single();
        if (error) {
          console.error('Insert product error:', error);
          throw error;
        }
        pid = data.id;
      } else {
        const { error } = await supabase.from('products').update(payload).eq('id', pid);
        if (error) {
          console.error('Update product error:', error);
          throw error;
        }
      }

      if (!pid) throw new Error('Không lấy được ID sản phẩm');

      // Upload new images
      console.log('Starting image uploads for product:', pid);
      const uploadedUrls: string[] = [];
      for (const img of images) {
        if (img.file) {
          console.log('Uploading new file:', img.file.name);
          const url = await uploadImage(img.file);
          console.log('Uploaded URL:', url);
          uploadedUrls.push(url);
        } else {
          uploadedUrls.push(img.url);
        }
      }

      console.log('Final image URLs:', uploadedUrls);

      // Replace images
      const { error: delError } = await supabase.from('product_images').delete().eq('product_id', pid!);
      if (delError) {
        console.error('Delete existing images error:', delError);
        throw delError;
      }

      if (uploadedUrls.length > 0) {
        const insertData = uploadedUrls.map((url, i) => ({ 
          product_id: pid!, 
          image_url: url, 
          sort_order: i, 
          is_primary: i === 0 
        }));
        console.log('Inserting images data:', insertData);
        const { error: insError } = await supabase.from('product_images').insert(insertData);
        if (insError) {
          console.error('Insert new images error:', insError);
          throw insError;
        }
      }

      // Replace specs
      const { error: specDelError } = await supabase.from('product_specs').delete().eq('product_id', pid!);
      if (specDelError) throw specDelError;

      const validSpecs = specs.filter(s => s.label && s.value);
      if (validSpecs.length > 0) {
        const { error: specInsError } = await supabase.from('product_specs').insert(
          validSpecs.map((s, i) => ({ product_id: pid!, label: s.label, value: s.value, sort_order: i }))
        );
        if (specInsError) throw specInsError;
      }

      // Replace tiers
      const { error: tierDelError } = await supabase.from('price_tiers').delete().eq('product_id', pid!);
      if (tierDelError) throw tierDelError;

      const validTiers = tiers.filter(t => t.min_qty > 0 && t.price > 0);
      if (validTiers.length > 0) {
        const { error: tierInsError } = await supabase.from('price_tiers').insert(
          validTiers.map(t => ({ product_id: pid!, min_qty: t.min_qty, max_qty: t.max_qty, price: t.price }))
        );
        if (tierInsError) throw tierInsError;
      }

      showToast(isNew ? 'Đã tạo sản phẩm mới' : 'Đã cập nhật sản phẩm');
      if (isNew) router.push('/admin/san-pham');
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Unknown error';
      showToast('Lỗi: ' + message, 'error');
    } finally {
      setSaving(false);
    }
  }

  if (loading) return <div className="admin-loading"><div className="admin-spinner" /><span>Đang tải...</span></div>;

  return (
    <div>
      <div className="admin-page-header">
        <div>
          <h1 className="admin-page-title">{isNew ? 'Thêm sản phẩm mới' : 'Sửa sản phẩm'}</h1>
          <p className="admin-page-subtitle">{isNew ? 'Điền thông tin sản phẩm' : form.name}</p>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <button className="admin-btn admin-btn-secondary" onClick={() => router.push('/admin/san-pham')}>← Quay lại</button>
          <button className="admin-btn admin-btn-primary" onClick={handleSave} disabled={saving}>
            {saving ? 'Đang lưu...' : (isNew ? 'Tạo sản phẩm' : 'Lưu thay đổi')}
          </button>
        </div>
      </div>

      {/* Basic Info */}
      <div className="admin-card" style={{ marginBottom: 16 }}>
        <div className="admin-card-header"><span className="admin-card-title">Thông tin cơ bản</span></div>
        <div className="admin-form">
          <div className="admin-form-grid">
            <div className="admin-field admin-form-full">
              <label className="admin-label">Tên sản phẩm *</label>
              <input className="admin-input" value={form.name} onChange={e => setForm({ ...form, name: e.target.value, slug: generateSlug(e.target.value) })} placeholder="VD: Cà chua Đà Lạt loại 1" />
            </div>
            <div className="admin-field">
              <label className="admin-label">Slug (URL)</label>
              <input className="admin-input" value={form.slug} onChange={e => setForm({ ...form, slug: e.target.value })} placeholder="ca-chua-da-lat" />
            </div>
            <div className="admin-field">
              <label className="admin-label">Xuất xứ</label>
              <input className="admin-input" value={form.origin} onChange={e => setForm({ ...form, origin: e.target.value })} placeholder="VD: Đà Lạt, Lâm Đồng" />
            </div>
            <div className="admin-field">
              <label className="admin-label">Danh mục</label>
              <div className="admin-custom-select" ref={catRef}>
                <div className="admin-custom-select-trigger" onClick={() => setCatOpen(!catOpen)}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    {form.category_id ? (
                      (() => {
                        const cat = categories.find(c => c.id === form.category_id);
                        if (!cat) return '— Chọn danh mục —';
                        return (
                          <>
                            {isImageUrl(cat.icon) ? (
                              <img src={cat.icon} alt="" className="admin-custom-select-img" />
                            ) : (
                              <span className="admin-custom-select-icon">{cat.icon || '📦'}</span>
                            )}
                            {cat.name}
                          </>
                        );
                      })()
                    ) : '— Chọn danh mục —'}
                  </div>
                  <span>{catOpen ? '▲' : '▼'}</span>
                </div>
                {catOpen && (
                  <div className="admin-custom-select-options">
                    <div 
                      className={`admin-custom-select-option ${!form.category_id ? 'selected' : ''}`}
                      onClick={() => { setForm({ ...form, category_id: '' }); setCatOpen(false); }}
                    >
                      — Chọn danh mục —
                    </div>
                    {categories.filter(c => c.parent_id !== null).map(c => (
                      <div 
                        key={c.id} 
                        className={`admin-custom-select-option ${form.category_id === c.id ? 'selected' : ''}`}
                        onClick={() => { setForm({ ...form, category_id: c.id }); setCatOpen(false); }}
                      >
                        {isImageUrl(c.icon) ? (
                          <img src={c.icon} alt="" className="admin-custom-select-img" />
                        ) : (
                          <span className="admin-custom-select-icon">{c.icon || '📦'}</span>
                        )}
                        {c.name}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
            <div className="admin-field">
              <label className="admin-label">Nhà cung cấp</label>
              <select className="admin-select" value={form.supplier_id} onChange={e => setForm({ ...form, supplier_id: e.target.value })}>
                <option value="">— Chọn NCC —</option>
                {suppliers.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
              </select>
            </div>
            <div className="admin-field admin-form-full">
              <label className="admin-label">Mô tả</label>
              <textarea className="admin-textarea" value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} placeholder="Mô tả chi tiết sản phẩm..." />
            </div>
          </div>
        </div>
      </div>

      {/* Price */}
      <div className="admin-card" style={{ marginBottom: 16 }}>
        <div className="admin-card-header"><span className="admin-card-title">Giá & Đơn vị</span></div>
        <div className="admin-form">
          <div className="admin-form-grid">
            <div className="admin-field">
              <label className="admin-label">Giá bán (₫) *</label>
              <input className="admin-input" type="number" value={form.price} onChange={e => setForm({ ...form, price: Number(e.target.value) })} />
            </div>
            <div className="admin-field">
              <label className="admin-label">Giá gốc (₫)</label>
              <input className="admin-input" type="number" value={form.original_price} onChange={e => setForm({ ...form, original_price: Number(e.target.value) })} />
            </div>
            <div className="admin-field">
              <label className="admin-label">Đơn vị</label>
              <input className="admin-input" value={form.unit} onChange={e => setForm({ ...form, unit: e.target.value })} placeholder="kg, bó, hộp..." />
            </div>
            <div className="admin-field">
              <label className="admin-label">Đặt hàng tối thiểu</label>
              <input className="admin-input" value={form.min_order} onChange={e => setForm({ ...form, min_order: e.target.value })} placeholder="VD: 5kg trở lên" />
            </div>
          </div>

          {/* Price Tiers */}
          <div style={{ marginTop: 16 }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
              <label className="admin-label">Bảng giá sỉ</label>
              <button className="admin-btn admin-btn-secondary admin-btn-sm" onClick={() => setTiers([...tiers, { min_qty: 0, max_qty: null, price: 0 }])}>+ Thêm mức giá</button>
            </div>
            {tiers.map((t, i) => (
              <div key={i} style={{ display: 'flex', gap: 8, marginBottom: 8, alignItems: 'center' }}>
                <input className="admin-input" type="number" placeholder="Từ (SL)" value={t.min_qty} onChange={e => { const n = [...tiers]; n[i].min_qty = Number(e.target.value); setTiers(n); }} style={{ width: 100 }} />
                <span style={{ color: '#999' }}>—</span>
                <input className="admin-input" type="number" placeholder="Đến" value={t.max_qty || ''} onChange={e => { const n = [...tiers]; n[i].max_qty = e.target.value ? Number(e.target.value) : null; setTiers(n); }} style={{ width: 100 }} />
                <input className="admin-input" type="number" placeholder="Giá (₫)" value={t.price} onChange={e => { const n = [...tiers]; n[i].price = Number(e.target.value); setTiers(n); }} style={{ width: 140 }} />
                <button className="admin-action-btn delete" onClick={() => setTiers(tiers.filter((_, j) => j !== i))}>🗑️</button>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Images */}
      <div className="admin-card" style={{ marginBottom: 16 }}>
        <div className="admin-card-header"><span className="admin-card-title">Hình ảnh sản phẩm</span></div>
        <div className="admin-form">
          <label className="admin-upload-zone">
            <input type="file" accept="image/*" multiple onChange={handleFileSelect} style={{ display: 'none' }} />
            <div className="admin-upload-icon">📸</div>
            <div className="admin-upload-text">Nhấn để chọn ảnh hoặc kéo thả vào đây</div>
            <div className="admin-upload-hint">Hỗ trợ JPG, PNG, WebP. Tối đa 5MB/ảnh</div>
          </label>
          {images.length > 0 && (
            <div className="admin-image-grid">
              {images.map((img, i) => (
                <div key={i} className="admin-image-item">
                  <img src={img.url} alt={`Ảnh ${i + 1}`} />
                  <button className="admin-image-remove" onClick={() => removeImage(i)}>✕</button>
                  {i === 0 && <div style={{ position: 'absolute', bottom: 4, left: 4, background: '#2a7a2a', color: 'white', fontSize: 9, padding: '1px 5px', borderRadius: 4, fontWeight: 700 }}>CHÍNH</div>}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Specs */}
      <div className="admin-card" style={{ marginBottom: 16 }}>
        <div className="admin-card-header">
          <span className="admin-card-title">Thông số sản phẩm</span>
          <button className="admin-btn admin-btn-secondary admin-btn-sm" onClick={() => setSpecs([...specs, { label: '', value: '' }])}>+ Thêm</button>
        </div>
        <div className="admin-form">
          {specs.length === 0 ? (
            <div style={{ color: '#999', fontSize: 13, textAlign: 'center', padding: 20 }}>Chưa có thông số. Nhấn &quot;+ Thêm&quot; để thêm.</div>
          ) : specs.map((s, i) => (
            <div key={i} style={{ display: 'flex', gap: 8, marginBottom: 8, alignItems: 'center' }}>
              <input className="admin-input" placeholder="Tên (VD: Trọng lượng)" value={s.label} onChange={e => { const n = [...specs]; n[i].label = e.target.value; setSpecs(n); }} style={{ flex: 1 }} />
              <input className="admin-input" placeholder="Giá trị (VD: 500g)" value={s.value} onChange={e => { const n = [...specs]; n[i].value = e.target.value; setSpecs(n); }} style={{ flex: 1 }} />
              <button className="admin-action-btn delete" onClick={() => setSpecs(specs.filter((_, j) => j !== i))}>🗑️</button>
            </div>
          ))}
        </div>
      </div>

      {/* Flags */}
      <div className="admin-card" style={{ marginBottom: 16 }}>
        <div className="admin-card-header"><span className="admin-card-title">Hiển thị & Tags</span></div>
        <div className="admin-form">
          <div className="admin-form-grid">
            <div className="admin-field">
              <label className="admin-label">Tags (cách nhau dấu phẩy)</label>
              <input className="admin-input" value={form.tags} onChange={e => setForm({ ...form, tags: e.target.value })} placeholder="VD: VietGAP, Đà Lạt, Hữu cơ" />
            </div>
            <div className="admin-field">
              <label className="admin-label">Thứ tự hiển thị</label>
              <input className="admin-input" type="number" value={form.sort_order} onChange={e => setForm({ ...form, sort_order: Number(e.target.value) })} />
            </div>
          </div>
          <div style={{ display: 'flex', gap: 24, marginTop: 16, flexWrap: 'wrap' }}>
            <label className="admin-checkbox"><input type="checkbox" checked={form.is_active} onChange={e => setForm({ ...form, is_active: e.target.checked })} /> Hiển thị</label>
            <label className="admin-checkbox"><input type="checkbox" checked={form.is_featured} onChange={e => setForm({ ...form, is_featured: e.target.checked })} /> Nổi bật</label>
            <label className="admin-checkbox"><input type="checkbox" checked={form.is_best_seller} onChange={e => setForm({ ...form, is_best_seller: e.target.checked })} /> Bán chạy</label>
            <label className="admin-checkbox"><input type="checkbox" checked={form.is_daily} onChange={e => setForm({ ...form, is_daily: e.target.checked })} /> Sản phẩm hàng ngày</label>
          </div>
        </div>
      </div>

      {toast && <div className={`admin-toast ${toast.type}`}>{toast.msg}</div>}
    </div>
  );
}
