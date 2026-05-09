'use client';
import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';
import styles from './san-pham.module.css';
import ScrollCarousel from '@/components/ui/ScrollCarousel';
import ComingSoonPopup from '@/components/ui/ComingSoonPopup';
import { formatProductPrice } from '@/lib/price';

interface Product {
  id: string;
  name: string;
  slug: string;
  description: string;
  price: number;
  original_price: number;
  unit: string;
  min_order: string;
  category_id: string;
  supplier_id: string;
  origin: string;
  rating: number;
  review_count: number;
  sold_count: number;
  tags: string[];
  images: string[];
  specs: { label: string; value: string }[];
  priceTiers: { min: number; max: number | null; price: number }[];
  supplier?: {
    name: string;
    avatar_url: string;
    rating: number;
    product_count: number;
    response_rate: number;
    response_time: string;
  };
}

export default function ProductDetailClient({ slug }: { slug: string }) {
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [qty, setQty] = useState(1);
  const [activeTab, setActiveTab] = useState<'mo-ta' | 'thong-so' | 'danh-gia'>('mo-ta');
  const [activeImg, setActiveImg] = useState(0);
  const [liked, setLiked] = useState(false);
  const [showAllDesc, setShowAllDesc] = useState(false);
  const [relatedProducts, setRelatedProducts] = useState<any[]>([]);
  const [settings, setSettings] = useState<Record<string, any>>({});
  const [comingSoon, setComingSoon] = useState<{ open: boolean; feature: string }>({ open: false, feature: '' });
  const galleryRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    async function loadProduct() {
      try {
        // Fetch settings
        const { data: settingsData } = await supabase.from('site_settings').select('*');
        if (settingsData) {
          const s: Record<string, any> = {};
          settingsData.forEach(item => {
            s[item.key] = item.value?.v;
          });
          setSettings(s);
        }

        // Fetch product by slug
        const { data: p, error: pError } = await supabase
          .from('products')
          .select('*, categories(name), suppliers(*)')
          .eq('slug', slug)
          .single();

        if (pError || !p) {
          console.error('Error fetching product:', pError);
          setLoading(false);
          return;
        }

        // Fetch images
        const { data: imgs } = await supabase
          .from('product_images')
          .select('image_url')
          .eq('product_id', p.id)
          .order('sort_order');

        // Fetch specs
        const { data: sp } = await supabase
          .from('product_specs')
          .select('label, value')
          .eq('product_id', p.id)
          .order('sort_order');

        // Fetch price tiers
        const { data: pt } = await supabase
          .from('price_tiers')
          .select('min_qty, max_qty, price')
          .eq('product_id', p.id)
          .order('min_qty');

        // Fetch related products (same category)
        const { data: rel } = await supabase
          .from('products')
          .select('*, product_images(image_url)')
          .eq('category_id', p.category_id)
          .neq('id', p.id)
          .limit(4);

        const formattedProduct: Product = {
          ...p,
          images: (imgs || []).map(i => i.image_url),
          specs: sp || [],
          priceTiers: (pt || []).map(t => ({ min: t.min_qty, max: t.max_qty, price: t.price })),
          supplier: p.suppliers ? {
            name: p.suppliers.name,
            avatar_url: p.suppliers.avatar_url,
            rating: p.suppliers.rating,
            product_count: p.suppliers.product_count,
            response_rate: p.suppliers.response_rate,
            response_time: p.suppliers.response_time,
          } : undefined
        };

        setProduct(formattedProduct);
        setRelatedProducts((rel || []).map(r => ({
          ...r,
          img: r.product_images?.[0]?.image_url
        })));
        
        // Update min qty based on product.min_order if possible
        const minQtyMatch = p.min_order?.match(/\d+/);
        if (minQtyMatch) setQty(parseInt(minQtyMatch[0]));

      } catch (error) {
        console.error('Error loading product detail:', error);
      } finally {
        setLoading(false);
      }
    }

    if (slug) loadProduct();
  }, [slug]);

  // Gallery swipe
  useEffect(() => {
    const el = galleryRef.current;
    if (!el) return;
    const handleScroll = () => {
      const scrollLeft = el.scrollLeft;
      const width = el.clientWidth;
      if (width > 0) {
        const index = Math.round(scrollLeft / width);
        setActiveImg(index);
      }
    };
    el.addEventListener('scroll', handleScroll, { passive: true });
    return () => el.removeEventListener('scroll', handleScroll);
  }, [product]);

  // Handle native share
  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: product?.name,
          text: `Xem sản phẩm ${product?.name} trên Chợ Đầu Mối`,
          url: window.location.href,
        });
      } catch (error) {
        if ((error as Error).name !== 'AbortError') {
          console.error('Error sharing:', error);
        }
      }
    } else {
      try {
        await navigator.clipboard.writeText(window.location.href);
        alert('Đã sao chép liên kết vào bộ nhớ tạm!');
      } catch (err) {
        console.error('Failed to copy: ', err);
      }
    }
  };

  if (loading) return (
    <div className="admin-loading" style={{ position: 'fixed' }}>
      <div className="loader-nongsan">
        <span className="loader-item">🍎</span>
        <span className="loader-item">🍇</span>
        <span className="loader-item">🍊</span>
      </div>
      <span>Đang kiểm tra chất lượng sản phẩm...</span>
    </div>
  );
  if (!product) return <div style={{ padding: 40, textAlign: 'center' }}>Không tìm thấy sản phẩm</div>;

  // Calculate current tier price
  const currentTier = product.priceTiers.length > 0 
    ? product.priceTiers.find(t => qty >= t.min && (t.max === null || qty <= t.max)) || product.priceTiers[product.priceTiers.length - 1]
    : { price: product.price };
    
  const discount = product.original_price > 0 
    ? Math.round((1 - product.price / product.original_price) * 100)
    : 0;

  return (
    <div className={styles.page}>
      {/* ── Sticky Header ── */}
      <header className={styles.header}>
        <Link href="/" className={styles.backBtn} id="product-back-btn">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="15 18 9 12 15 6" />
          </svg>
        </Link>
        <span className={styles.headerTitle}>Chi tiết sản phẩm</span>
        <div className={styles.headerActions}>
          <button className={styles.iconBtn} id="product-share-btn" aria-label="Chia sẻ" onClick={handleShare}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="18" cy="5" r="3" /><circle cx="6" cy="12" r="3" /><circle cx="18" cy="19" r="3" />
              <line x1="8.59" y1="13.51" x2="15.42" y2="17.49" /><line x1="15.41" y1="6.51" x2="8.59" y2="10.49" />
            </svg>
          </button>
          {/* <Link href="/gio-hang" className={styles.iconBtn} id="product-cart-btn" aria-label="Giỏ hàng">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z" /><line x1="3" y1="6" x2="21" y2="6" />
              <path d="M16 10a4 4 0 01-8 0" />
            </svg>
            <span className={styles.cartBadge}>3</span>
          </Link> */}
        </div>
      </header>

      {/* ── Swipeable Image Gallery ── */}
      <div className={styles.gallery}>
        <div className={styles.galleryTrack} ref={galleryRef}>
          {product.images.length > 0 ? product.images.map((img, i) => (
            <div key={i} className={styles.gallerySlide}>
              <img src={img} alt={`${product.name} ${i + 1}`} className={styles.mainImg} />
            </div>
          )) : (
            <div className={styles.gallerySlide}>
              <span className={styles.mainEmoji}>📦</span>
            </div>
          )}
        </div>
        {discount > 0 && <div className={styles.saleBadge}>-{discount}%</div>}

        {/* Prev / Next Arrows */}
        {activeImg > 0 && (
          <button
            className={`${styles.galleryArrow} ${styles.galleryArrowLeft}`}
            id="gallery-prev"
            aria-label="Ảnh trước"
            onClick={() => {
              const el = galleryRef.current;
              if (el) el.scrollTo({ left: (activeImg - 1) * el.clientWidth, behavior: 'smooth' });
            }}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="15 18 9 12 15 6" />
            </svg>
          </button>
        )}
        {activeImg < product.images.length - 1 && (
          <button
            className={`${styles.galleryArrow} ${styles.galleryArrowRight}`}
            id="gallery-next"
            aria-label="Ảnh tiếp"
            onClick={() => {
              const el = galleryRef.current;
              if (el) el.scrollTo({ left: (activeImg + 1) * el.clientWidth, behavior: 'smooth' });
            }}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="9 18 15 12 9 6" />
            </svg>
          </button>
        )}

        <div className={styles.galleryDots}>
          {product.images.map((_, i) => (
            <span
              key={i}
              className={`${styles.dot} ${activeImg === i ? styles.dotActive : ''}`}
              onClick={() => {
                const el = galleryRef.current;
                if (el) el.scrollTo({ left: i * el.clientWidth, behavior: 'smooth' });
              }}
            />
          ))}
        </div>
        <div className={styles.imgCounter}>{activeImg + 1}/{product.images.length || 1}</div>
      </div>

      {/* ── Price & Info ── */}
      <div className={styles.infoCard}>
        <div className={styles.priceRow}>
          <div>
            <div className={styles.priceMain}>
              {formatProductPrice(currentTier.price, product.unit)}
            </div>
            {product.original_price > product.price && (
              <div className={styles.priceOld}>
                <span className={styles.priceOldValue}>{product.original_price.toLocaleString('vi-VN')}₫/{product.unit}</span>
                <span className={styles.discountBadge}>-{discount}%</span>
              </div>
            )}
          </div>
          <button
            className={`${styles.wishlistBtn} ${liked ? styles.wishlistBtnActive : ''}`}
            id="product-wishlist-btn"
            aria-label="Yêu thích"
            onClick={() => setLiked(!liked)}
          >
            <svg width="22" height="22" viewBox="0 0 24 24" fill={liked ? '#e53935' : 'none'} stroke="#e53935" strokeWidth="2">
              <path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z" />
            </svg>
          </button>
        </div>

        <h1 className={styles.productName}>{product.name}</h1>

        <div className={styles.metaRow}>
          <div className={styles.metaItem}>
            <span className={styles.starIcon}>★</span>
            <span className={styles.metaVal}>{product.rating}</span>
            <span className={styles.metaSep}>({product.review_count})</span>
          </div>
          <div className={styles.metaDivider} />
          <div className={styles.metaItem}>
            <span className={styles.metaSep}>Đã bán</span>
            <span className={styles.metaVal}>{product.sold_count.toLocaleString('vi-VN')}</span>
          </div>
          <div className={styles.metaDivider} />
          <div className={styles.metaItem}>
            <span className={styles.metaIcon}>📍</span>
            <span className={styles.metaSep}>{product.origin}</span>
          </div>
        </div>

        <div className={styles.tags}>
          {(product.tags || []).map((t) => (
            <span key={t} className={styles.tag}>{t}</span>
          ))}
        </div>
      </div>

      {/* ── Wholesale Price Tiers ── */}
      {product.priceTiers.length > 0 && (
        <div className={styles.tiersCard}>
          <div className={styles.tiersTitle}>
            <span className={styles.tiersIcon}>💰</span>
            <span>Giá sỉ theo số lượng</span>
          </div>
          <div className={styles.tiersGrid}>
            {product.priceTiers.map((tier, i) => (
              <div key={i} className={`${styles.tierItem} ${currentTier === tier ? styles.tierActive : ''}`}>
                <div className={styles.tierQty}>
                  {tier.max ? `${tier.min}–${tier.max} ${product.unit}` : `≥${tier.min} ${product.unit}`}
                </div>
                <div className={styles.tierPrice}>
                  {formatProductPrice(tier.price)}
                </div>
                {i > 0 && (
                  <div className={styles.tierSave}>
                    Tiết kiệm {Math.round((1 - tier.price / product.priceTiers[0].price) * 100)}%
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── Supplier Info ── */}
      {product.supplier && (
        <div className={styles.supplierCard}>
          <div className={styles.supplierTop}>
            <div className={styles.supplierAvatar}>
              {product.supplier.avatar_url ? (
                <img src={product.supplier.avatar_url} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '50%' }} />
              ) : '🏪'}
            </div>
            <div className={styles.supplierInfo}>
              <div className={styles.supplierName}>{product.supplier.name}</div>
              <div className={styles.supplierMeta}>
                <span className={styles.starIcon}>★</span>
                <span>{product.supplier.rating}</span>
                <span className={styles.supplierDot}>·</span>
                <span>{product.supplier.product_count} sản phẩm</span>
              </div>
            </div>
            <button className={styles.supplierBtn} id="view-supplier-btn">Xem shop</button>
          </div>
          <div className={styles.supplierStats}>
            <div className={styles.supplierStat}>
              <div className={styles.supplierStatVal}>{product.supplier.product_count}</div>
              <div className={styles.supplierStatLabel}>Sản phẩm</div>
            </div>
            <div className={styles.supplierStatDivider} />
            <div className={styles.supplierStat}>
              <div className={styles.supplierStatVal}>{product.supplier.response_rate}%</div>
              <div className={styles.supplierStatLabel}>Phản hồi</div>
            </div>
            <div className={styles.supplierStatDivider} />
            <div className={styles.supplierStat}>
              <div className={styles.supplierStatVal}>{product.supplier.response_time}</div>
              <div className={styles.supplierStatLabel}>Thời gian</div>
            </div>
          </div>
        </div>
      )}

      {/* ── Tabs (Description, Specs, Reviews) ── */}
      <div className={styles.tabsCard}>
        <div className={styles.tabsHeader}>
          <button className={`${styles.tabBtn} ${activeTab === 'mo-ta' ? styles.tabActive : ''}`} onClick={() => setActiveTab('mo-ta')}>Mô tả</button>
          <button className={`${styles.tabBtn} ${activeTab === 'thong-so' ? styles.tabActive : ''}`} onClick={() => setActiveTab('thong-so')}>Thông số</button>
          <button className={`${styles.tabBtn} ${activeTab === 'danh-gia' ? styles.tabActive : ''}`} onClick={() => setActiveTab('danh-gia')}>Đánh giá ({product.review_count})</button>
        </div>
        <div className={styles.tabContent}>
          {activeTab === 'mo-ta' && (
            <div className={styles.descBox}>
              <div className={`${styles.descText} ${showAllDesc ? styles.descFull : ''}`}>
                {product.description || 'Chưa có mô tả cho sản phẩm này.'}
              </div>
              <button className={styles.showMoreBtn} onClick={() => setShowAllDesc(!showAllDesc)}>
                {showAllDesc ? 'Thu gọn' : 'Xem thêm nội dung'}
              </button>
            </div>
          )}
          {activeTab === 'thong-so' && (
            <div className={styles.specsBox}>
              {product.specs.length > 0 ? product.specs.map((s, i) => (
                <div key={i} className={styles.specItem}>
                  <div className={styles.specLabel}>{s.label}</div>
                  <div className={styles.specVal}>{s.value}</div>
                </div>
              )) : <div style={{ textAlign: 'center', color: '#999', padding: 20 }}>Chưa có thông số chi tiết</div>}
            </div>
          )}
          {activeTab === 'danh-gia' && (
            <div className={styles.reviewsBox}>
               <div style={{ textAlign: 'center', color: '#999', padding: 20 }}>Chưa có đánh giá nào cho sản phẩm này</div>
            </div>
          )}
        </div>
      </div>

      {/* ── Related Products ── */}
      {relatedProducts.length > 0 && (
        <section className={styles.relatedSection}>
          <div className="section-header">
            <span className="section-title">SẢN PHẨM LIÊN QUAN</span>
          </div>
          <ScrollCarousel itemWidth={160} sidePadding={16}>
            {relatedProducts.map((p) => (
              <Link href={`/san-pham/${p.slug}`} key={p.id} className="product-card" style={{ width: 160 }}>
                <div className={styles.relImg}>
                  {p.img ? <img src={p.img} alt={p.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : '📦'}
                </div>
                <div className="product-card-body">
                  <div className="product-card-name">{p.name}</div>
                  <div className="product-card-price">
                    {formatProductPrice(p.price, p.unit)}
                  </div>
                  <div className="product-card-footer">
                    <div className="flex items-center gap-1">
                      <span className="star">★</span>
                      <span className="text-xs text-secondary-txt">{p.rating}</span>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </ScrollCarousel>
        </section>
      )}

      {/* ── Bottom Action Bar ── */}
      <footer className={styles.bottomBar}>
        <div className={styles.barActions}>
          <button className={styles.chatBtn} onClick={() => setComingSoon({ open: true, feature: 'Tính năng Chat' })}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M21 11.5a8.38 8.38 0 01-.9 3.8 8.5 8.5 0 01-7.6 4.7 8.38 8.38 0 01-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 01-.9-3.8 8.5 8.5 0 014.7-7.6 8.38 8.38 0 013.8-.9h.5a8.48 8.48 0 018 8v.5z" />
            </svg>
            <span>Chat</span>
          </button>
        </div>
        <div className={styles.barButtons}>
          <a href={`tel:${settings.site_phone || '19003165'}`} className={styles.buyNowBtn} id="product-contact-btn">
            Liên hệ ngay
          </a>
        </div>
      </footer>

      <ComingSoonPopup 
        isOpen={comingSoon.open} 
        onClose={() => setComingSoon({ ...comingSoon, open: false })} 
        featureName={comingSoon.feature} 
      />
    </div>
  );
}
