'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';

interface Product {
  id: string;
  name: string;
  price: number;
  unit: string;
  category_id: string;
  is_active: boolean;
  is_featured: boolean;
  is_best_seller: boolean;
  is_daily: boolean;
  rating: number;
  sold_count: number;
  created_at: string;
  categories?: { name: string };
  product_images?: { image_url: string; is_primary: boolean }[];
}

export default function AdminSanPham() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [toast, setToast] = useState<{ msg: string; type: string } | null>(null);

  async function load() {
    const { data } = await supabase
      .from('products')
      .select('*, categories(name), product_images(image_url, is_primary)')
      .order('created_at', { ascending: false });
    setProducts((data as Product[]) || []);
    setLoading(false);
  }

  useEffect(() => { load(); }, []);

  function showToast(msg: string, type = 'success') {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  }

  async function handleDelete(id: string) {
    if (!confirm('Bạn có chắc muốn xóa sản phẩm này?')) return;
    await supabase.from('products').delete().eq('id', id);
    showToast('Đã xóa sản phẩm');
    load();
  }

  async function toggleActive(p: Product) {
    await supabase.from('products').update({ is_active: !p.is_active }).eq('id', p.id);
    load();
  }

  const filtered = products.filter(p =>
    p.name.toLowerCase().includes(search.toLowerCase())
  );

  function getPrimaryImage(p: Product) {
    const primary = p.product_images?.find(i => i.is_primary);
    return primary?.image_url || p.product_images?.[0]?.image_url || null;
  }

  return (
    <div>
      <div className="admin-page-header">
        <div>
          <h1 className="admin-page-title">Quản lý Sản phẩm</h1>
          <p className="admin-page-subtitle">{products.length} sản phẩm</p>
        </div>
        <Link href="/admin/san-pham/tao-moi" className="admin-btn admin-btn-primary">+ Thêm sản phẩm</Link>
      </div>

      <div className="admin-card">
        <div className="admin-card-header">
          <div className="admin-search">
            <span>🔍</span>
            <input placeholder="Tìm sản phẩm..." value={search} onChange={e => setSearch(e.target.value)} />
          </div>
        </div>

        {loading ? (
          <div className="admin-loading"><div className="admin-spinner" /><span>Đang tải...</span></div>
        ) : filtered.length === 0 ? (
          <div className="admin-empty">
            <div className="admin-empty-icon">📦</div>
            <div className="admin-empty-text">{search ? 'Không tìm thấy sản phẩm' : 'Chưa có sản phẩm nào'}</div>
            <div className="admin-empty-sub">Nhấn &quot;Thêm sản phẩm&quot; để bắt đầu</div>
          </div>
        ) : (
          <table className="admin-table">
            <thead>
              <tr>
                <th>Ảnh</th>
                <th>Tên sản phẩm</th>
                <th>Danh mục</th>
                <th>Giá</th>
                <th>Đã bán</th>
                <th>Tags</th>
                <th>Trạng thái</th>
                <th>Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((p) => {
                const img = getPrimaryImage(p);
                return (
                  <tr key={p.id}>
                    <td>
                      <div className="admin-table-img">
                        {img ? <img src={img} alt={p.name} /> : '📦'}
                      </div>
                    </td>
                    <td>
                      <div style={{ fontWeight: 600 }}>{p.name}</div>
                      <div style={{ fontSize: 11, color: '#999' }}>/{p.unit}</div>
                    </td>
                    <td>{p.categories?.name || '—'}</td>
                    <td style={{ fontWeight: 700, color: '#e53935' }}>
                      {p.price > 0 ? `${p.price.toLocaleString('vi-VN')}₫` : 'Liên hệ'}
                    </td>
                    <td>{p.sold_count}</td>
                    <td>
                      <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
                        {p.is_featured && <span className="admin-badge admin-badge-blue">Nổi bật</span>}
                        {p.is_best_seller && <span className="admin-badge admin-badge-orange">Bán chạy</span>}
                        {p.is_daily && <span className="admin-badge admin-badge-green">Hàng ngày</span>}
                      </div>
                    </td>
                    <td>
                      <button className={`admin-switch ${p.is_active ? 'on' : ''}`} onClick={() => toggleActive(p)} />
                    </td>
                    <td>
                      <div className="admin-actions">
                        <Link href={`/admin/san-pham/${p.id}`} className="admin-action-btn" title="Sửa">✏️</Link>
                        <button className="admin-action-btn delete" onClick={() => handleDelete(p.id)} title="Xóa">🗑️</button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>

      {toast && <div className={`admin-toast ${toast.type}`}>{toast.msg}</div>}
    </div>
  );
}
