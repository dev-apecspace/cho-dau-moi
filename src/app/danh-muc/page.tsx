'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';
import styles from './danh-muc.module.css';

interface Category {
  id: string;
  name: string;
  icon: string;
  parent_id: string | null;
}

export default function DanhMucPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [bestProducts, setBestProducts] = useState<any[]>([]);
  const [settings, setSettings] = useState<Record<string, any>>({});
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      // Load Settings
      const { data: settingsData } = await supabase.from('site_settings').select('*');
      if (settingsData) {
        const s: Record<string, any> = {};
        settingsData.forEach(item => {
          s[item.key] = item.value?.v;
        });
        setSettings(s);
      }

      // Load Categories
      const { data: catData } = await supabase
        .from('categories')
        .select('*')
        .eq('is_active', true)
        .order('sort_order');
      
      if (catData) {
        setCategories(catData);
        const firstParent = catData.find(c => !c.parent_id);
        if (firstParent) setActiveCategory(firstParent.id);
      }

      // Load Best Sellers
      const { data: prodData } = await supabase
        .from('products')
        .select('*, product_images(image_url)')
        .eq('is_best_seller', true)
        .eq('is_active', true)
        .limit(4);
      
      if (prodData) {
        setBestProducts(prodData.map(p => ({
          ...p,
          img: p.product_images?.[0]?.image_url
        })));
      }

      setLoading(false);
    }
    loadData();
  }, []);

  const leftCategories = categories.filter(c => !c.parent_id);
  const subCategories = categories.filter(c => c.parent_id === activeCategory);

  if (loading) return (
    <div className="admin-loading">
      <div className="loader-nongsan">
        <span className="loader-item">🌽</span>
        <span className="loader-item">🥦</span>
        <span className="loader-item">🍄</span>
      </div>
      <span>Đang phân loại sản phẩm...</span>
    </div>
  );

  return (
    <div className={styles.page}>
      {/* Header */}
      <header className="page-header">
        <Link href="/" className="back-btn">←</Link>
        <span className="page-header-title">Danh mục</span>
        <button className={styles.gridBtn} id="danh-muc-grid-btn">⊞</button>
      </header>

      {/* Search */}
      <div style={{ padding: '12px 16px', background: 'white' }}>
        <div className="search-bar">
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#999" strokeWidth="2">
            <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
          </svg>
          <input type="text" placeholder="Tìm kiếm danh mục..." id="danh-muc-search" />
        </div>
      </div>

      {/* Main Content: Sidebar + Right */}
      <div className={styles.content}>
        {/* Left Sidebar */}
        <nav className={styles.sidebar}>
          {leftCategories.map((cat) => (
            <button
              key={cat.id}
              id={`cat-sidebar-${cat.id}`}
              className={`${styles.sidebarItem} ${activeCategory === cat.id ? styles.sidebarItemActive : ''}`}
              onClick={() => setActiveCategory(cat.id)}
            >
              {activeCategory === cat.id && <div className={styles.activeBar} />}
              <span>{cat.name}</span>
            </button>
          ))}
        </nav>

        {/* Right Panel */}
        <div className={styles.rightPanel}>
          {/* Subcategories */}
          <div className={styles.subCatList}>
            {subCategories.length > 0 ? subCategories.map((sub) => (
              <div key={sub.id} className={styles.subCatItem} id={`subcat-${sub.id}`}>
                <div className={styles.subCatImg}>
                  {sub.icon && (sub.icon.startsWith('http') || sub.icon.startsWith('/')) ? (
                    <img src={sub.icon} alt={sub.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  ) : (
                    <div style={{ fontSize: 12, color: '#ccc', textAlign: 'center', lineHeight: 1.2, padding: 4 }}>No Image</div>
                  )}
                </div>
                <div className={styles.subCatInfo}>
                  <div className={styles.subCatName}>{sub.name}</div>
                  <div className={styles.subCatCount}>Xem sản phẩm</div>
                </div>
                <span className="chevron">›</span>
              </div>
            )) : (
              <div style={{ padding: 20, textAlign: 'center', color: '#999', fontSize: 13 }}>
                Chưa có danh mục con
              </div>
            )}
          </div>

          {/* Promo Banner */}
          <div className={styles.promoBanner}>
            <div className={styles.promoLeft}>
              <div className={styles.promoTag}>{settings.promo_tag || 'MUA CÀNG NHIỀU'}</div>
              <div className={styles.promoTitle}>{settings.promo_title || 'GIÁ CÀNG RẺ'}</div>
              <div className={styles.promoDesc}>{settings.promo_desc || 'Chiết khấu đến 15%\ncho đơn từ'}</div>
              <div className={styles.promoPrice}>{settings.promo_price || '3.000.000₫'}</div>
              <Link href={settings.promo_link || '/'} className={styles.promoBtn} id="promo-banner-btn">MUA NGAY ›</Link>
            </div>
            <div className={styles.promoRight}>
              <div className={styles.promoBoxes}>
                <span className={styles.promoBox1}>📦</span>
                <span className={styles.promoBox2}>📦</span>
                <span className={styles.promoPercent}>%</span>
              </div>
            </div>
          </div>

          {/* Best Sellers */}
          <div className={styles.bestSection}>
            <div className={styles.bestHeader}>
              <span className={styles.bestTitle}>SẢN PHẨM BÁN CHẠY</span>
              <span className="section-more">Xem tất cả ›</span>
            </div>
            <div className={styles.bestGrid}>
              {bestProducts.length > 0 ? bestProducts.map((p) => (
                <div key={p.id} className={styles.bestCard} id={`danh-muc-product-${p.id}`}>
                  <div className={styles.bestImg}>
                    {p.img ? (
                      <img src={p.img} alt={p.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    ) : '📦'}
                  </div>
                  <div className={styles.bestInfo}>
                    <div className={styles.bestName}>{p.name}</div>
                    <div className={styles.bestPrice}>{p.price.toLocaleString('vi-VN')}₫<span className={styles.bestUnit}>/{p.unit}</span></div>
                    <div className={styles.bestMeta}>
                      <div className="flex items-center gap-1">
                        <span className="star">★</span>
                        <span className="text-xs text-secondary-txt">{p.rating}</span>
                      </div>
                      <button className="add-cart-btn" id={`danh-muc-add-${p.id}`}>+</button>
                    </div>
                  </div>
                </div>
              )) : (
                <div style={{ padding: 20, textAlign: 'center', color: '#999', fontSize: 12 }}>
                  Chưa có sản phẩm bán chạy
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
