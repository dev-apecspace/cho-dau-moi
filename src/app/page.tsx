'use client';
import { useEffect, useState, useRef, useCallback, Fragment } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import styles from './home.module.css';
import ScrollCarousel from '@/components/ui/ScrollCarousel';
import LoadingNongSan from '@/components/ui/LoadingNongSan';
import ComingSoonPopup from '@/components/ui/ComingSoonPopup';
import { formatProductPrice } from '@/lib/price';

interface Banner { id: string; title: string; subtitle: string; image_url: string; link_url: string; bg_gradient: string; emoji: string; }
interface Category { id: string; icon: string; name: string; }
interface Supplier { id: string; name: string; avatar_url: string; rating: number; product_count: number; }
interface Product { id: string; name: string; slug: string; price: number; image_url?: string; rating: number; unit: string; min_order: string; }
interface Deal { id: string; tag: string; emoji: string; bg_gradient: string; title: string; }

export default function HomePage() {
  const router = useRouter();
  const [banners, setBanners] = useState<Banner[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [wholesalers, setWholesalers] = useState<Supplier[]>([]);
  const [dailyProducts, setDailyProducts] = useState<Product[]>([]);
  const [hotDeals, setHotDeals] = useState<Deal[]>([]);
  const [bestSellers, setBestSellers] = useState<Product[]>([]);
  const [flashBanners, setFlashBanners] = useState<Banner[]>([]);
  const [vouchers, setVouchers] = useState<any[]>([]);
  const [settings, setSettings] = useState<Record<string, any>>({});
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [comingSoon, setComingSoon] = useState<{ open: boolean; feature: string }>({ open: false, feature: '' });
  const flashScrollRef = useRef<HTMLDivElement>(null);
  const [flashIndex, setFlashIndex] = useState(0);

  const scrollFlash = useCallback((dir: 'prev' | 'next') => {
    const el = flashScrollRef.current;
    if (!el) return;
    const cardW = el.querySelector('a')?.offsetWidth || el.offsetWidth * 0.92;
    const gap = 10;
    el.scrollBy({ left: dir === 'next' ? cardW + gap : -(cardW + gap), behavior: 'smooth' });
  }, []);

  const onFlashScroll = useCallback(() => {
    const el = flashScrollRef.current;
    if (!el) return;
    const cardW = el.querySelector('a')?.offsetWidth || el.offsetWidth * 0.92;
    const idx = Math.round(el.scrollLeft / (cardW + 10));
    setFlashIndex(idx);
  }, []);

  const openComingSoon = (feature: string) => setComingSoon({ open: true, feature });

  const handleSearch = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && searchQuery.trim()) {
      router.push(`/san-pham?q=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  const handleSearchClick = () => {
    if (searchQuery.trim()) {
      router.push(`/san-pham?q=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  useEffect(() => {
    async function loadData() {
      try {
        const [
          { data: bannersData },
          { data: flashData },
          { data: catsData },
          { data: supsData },
          { data: dailyData },
          { data: dealsData },
          { data: bestData },
          { data: settingsData },
          { data: vouchersData }
        ] = await Promise.all([
          supabase.from('banners').select('*').eq('position', 'hero').eq('is_active', true).order('sort_order'),
          supabase.from('banners').select('*').eq('position', 'flash_sale').eq('is_active', true).order('sort_order').limit(3),
          supabase.from('categories').select('*').eq('is_active', true).order('sort_order'),
          supabase.from('suppliers').select('*').eq('is_active', true).limit(10),
          supabase.from('products').select('*, product_images(image_url)').eq('is_daily', true).eq('is_active', true).order('sort_order').limit(8),
          supabase.from('deals').select('*').eq('is_active', true).order('sort_order').limit(10),
          supabase.from('products').select('*, product_images(image_url)').eq('is_best_seller', true).eq('is_active', true).order('sort_order').limit(8),
          supabase.from('site_settings').select('*'),
          supabase.from('vouchers').select('*').eq('is_active', true).limit(5)
        ]);

        if (settingsData) {
          const s: Record<string, any> = {};
          settingsData.forEach(item => {
            s[item.key] = item.value?.v;
          });
          setSettings(s);
        }

        setBanners(bannersData || []);
        setFlashBanners(flashData || []);
        setVouchers(vouchersData || []);
        setCategories(catsData || []);
        setWholesalers(supsData || []);
        
        setDailyProducts((dailyData || []).map((p: any) => ({
          ...p,
          image_url: p.product_images?.[0]?.image_url
        })));

        setHotDeals((dealsData || []).map((d: any) => ({
          id: d.id,
          title: d.title,
          tag: d.tag,
          emoji: d.emoji,
          bg_gradient: d.bg_gradient
        })));

        setBestSellers((bestData || []).map((p: any) => ({
          ...p,
          image_url: p.product_images?.[0]?.image_url
        })));

      } catch (error) {
        console.error('Error loading home data:', error);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  if (loading) return <LoadingNongSan text="Hàng tươi đang đến..." items={["🥬", "🥕", "🍅"]} />;

  const activeBanner = banners[0];

  return (
    <div className={styles.page}>
      {/* ── Header ── */}
      <header className={styles.header}>
        <div className={styles.headerTop}>
          <div className={styles.logo}>
            <div className={styles.logoIcon}>
              {settings.site_logo ? (
                <img src={settings.site_logo} alt="Logo" />
              ) : (
                settings.site_logo_emoji || '🏪'
              )}
            </div>
            <div>
              <div className={styles.logoName}>{settings.site_name || 'CHỢ ĐẦU MỚI'}</div>
              <div className={styles.logoSub}>{settings.site_subtitle || 'Nguồn hàng tận gốc · Giá sỉ mỗi ngày'}</div>
            </div>
          </div>
          <div className={styles.headerActions}>
            <button className={styles.iconBtn} onClick={() => openComingSoon('Tính năng thông báo')}>🔔</button>
          </div>
        </div>
        <div className={styles.headerSearch}>
          <div className="search-bar">
            <svg 
              width="16" 
              height="16" 
              viewBox="0 0 24 24" 
              fill="none" 
              stroke="#999" 
              strokeWidth="2"
              onClick={handleSearchClick}
              style={{ cursor: 'pointer' }}
            >
              <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
            </svg>
            <input 
              type="text" 
              placeholder="Tìm kiếm sản phẩm..." 
              id="home-search-input"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              onKeyDown={handleSearch}
              autoComplete="off"
            />
          </div>
        </div>
      </header>

      {/* ── Hero Banner ── */}
      <section className={styles.heroBanner} style={{ background: activeBanner?.bg_gradient || undefined }}>
        <div className={styles.heroContent}>
          <div className={styles.heroLeft}>
            <div className={styles.heroTag}>{settings.hero_title || 'NGUỒN HÀNG TẬN GỐC'}</div>
            <h1 className={styles.heroTitle}>
              {activeBanner?.title || settings.hero_subtitle || 'GIÁ SỈ'}<br />
              <span>{activeBanner?.subtitle || 'TỐT NHẤT'}</span>
            </h1>
            <div className={styles.heroFeatures}>
              {(settings.hero_features || 'Hàng tận gốc|Giao hàng toàn quốc|Đổi trả dễ dàng').split('|').map((feat: string, i: number) => {
                const icons = (settings.hero_features_icons || '✅|🚚|🔄').split('|');
                const subs = (settings.hero_features_subs || 'Nguồn gốc rõ ràng|Nhanh chóng tiện lợi|Hỗ trợ 24/7').split('|');
                const iconUrls = (settings.hero_features_icons_urls || '||').split('|');
                return (
                  <div className={styles.heroFeatureItem} key={i}>
                    <div className={styles.heroFeatIconWrap}>
                      {iconUrls[i] ? (
                        <img src={iconUrls[i]} alt="" />
                      ) : (
                        icons[i] || '•'
                      )}
                    </div>
                    <div>
                      <div className={styles.heroFeatTitle}>{feat}</div>
                      <div className={styles.heroFeatSub}>{subs[i] || ''}</div>
                    </div>
                  </div>
                );
              })}
            </div>
            {activeBanner?.link_url && (
              <Link href={activeBanner.link_url} className={styles.heroCta} id="home-shop-now-btn">🛒 MUA HÀNG NGAY</Link>
            )}
          </div>
          <div className={styles.heroRight}>
            <div className={styles.heroImgStack}>
              {[0, 1, 2, 3].map(i => {
                const urls = (settings.hero_floating_urls || '|||').split('|');
                const icons = (settings.hero_floating_icons || '🥬|🥕|🍅|🧅').split('|');
                const className = (styles as any)[`heroEmoji${i + 1}`];
                return (
                  <span key={i} className={className}>
                    {urls[i] ? (
                      <img src={urls[i]} alt="" className={styles.heroFloatingImg} />
                    ) : (
                      icons[i] || ''
                    )}
                  </span>
                );
              })}
              <div 
                className={styles.heroPriceBadge}
                style={settings.hero_price_badge_img ? { 
                  backgroundImage: `url(${settings.hero_price_badge_img})`,
                  backgroundSize: 'cover',
                  backgroundPosition: 'center',
                  backgroundColor: 'transparent'
                } : {}}
              >
                {!settings.hero_price_badge_img && (
                  <>
                    <div>{settings.hero_price_label || 'GIÁ SỈ'}</div>
                    <div className={styles.heroPriceBadgeMain}>{settings.hero_price_value || 'TẬN GỐC'}</div>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
        <div className={styles.heroBadges}>
          {(settings.hero_bottom_badges || '🛡️ Cam kết chất lượng|📦 Giao hàng nhanh|💬 Hỗ trợ 24/7').split('|').map((badge: string, i: number, arr: string[]) => {
            const bottomUrls = (settings.hero_bottom_icons_urls || '||').split('|');
            return (
              <Fragment key={i}>
                <div className={styles.heroBadgeItem}>
                  {bottomUrls[i] ? (
                    <div className={styles.heroBadgeIcon}>
                      <img src={bottomUrls[i]} alt="" />
                    </div>
                  ) : (
                    // Nếu không có ảnh thì kiểm tra xem có emoji ở đầu không (dành cho dữ liệu mặc định)
                    badge.match(/^\p{Emoji}/u) && (
                      <div className={styles.heroBadgeIcon}>{badge.split(' ')[0]}</div>
                    )
                  )}
                  <span>{bottomUrls[i] ? badge : (badge.match(/^\p{Emoji}/u) ? badge.split(' ').slice(1).join(' ') : badge)}</span>
                </div>
                {i < arr.length - 1 && <div className={styles.heroBadgeDot}/>}
              </Fragment>
            );
          })}
        </div>
      </section>

      {/* ── Feature Icons ── */}
      <section className="page-section-padded">
        <div className={styles.featGrid}>
          {[
            { icon: '📦', label: 'Đặt hàng', sub: 'Mọi lúc' },
            { icon: '💰', label: 'Giá tận gốc', sub: 'Tốt nhất' },
            { icon: '🛒', label: 'Mua đầy', sub: 'Tiện lợi' },
            { icon: '👥', label: 'Dành cho', sub: 'Tiểu thương' },
          ].map((f) => (
            <div className={styles.featItem} key={f.label}>
              <div className={styles.featIcon}>{f.icon}</div>
              <div className={styles.featLabel}>{f.label}</div>
              <div className={styles.featSub}>{f.sub}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ── Categories ── */}
      <section className="page-section">
        <div className="section-header">
          <span className="section-title">DANH MỤC SẢN PHẨM</span>
          <Link href="/danh-muc" className="section-more">Xem tất cả &rsaquo;</Link>
        </div>
        <div className={styles.categoryGrid}>
          {categories.map((c) => (
            <Link href={`/danh-muc/${c.id}`} key={c.id} className={styles.categoryItem} id={`category-${c.id}`}>
              <div className={styles.categoryIcon}>
                {c.icon && c.icon.startsWith('http') ? (
                  <img src={c.icon} alt={c.name} />
                ) : c.icon}
              </div>
              <div className={styles.categoryName}>{c.name}</div>
            </Link>
          ))}
        </div>
      </section>

      {/* ── Wholesalers ── */}
      <section className="page-section">
        <div className="section-header">
          <span className="section-title">TIỂU THƯƠNG BÁN SỈ</span>
          <span className="section-more">Xem tất cả &rsaquo;</span>
        </div>
        <ScrollCarousel itemWidth={120} sidePadding={16} showDots>
          {wholesalers.map((w) => (
            <div key={w.id} className={styles.wholesalerCard} id={`wholesaler-${w.id}`}>
              <div className={styles.wholesalerImg}>
                {w.avatar_url ? <img src={w.avatar_url} alt={w.name} /> : '🏪'}
              </div>
              <div className={styles.wholesalerName}>{w.name}</div>
              <div className={styles.wholesalerMeta}>
                <span className="star">★</span>
                <span>{w.rating}</span>
                <span className={styles.metaDot}>·</span>
                <span className="text-secondary-txt">{w.product_count} SP</span>
              </div>
            </div>
          ))}
        </ScrollCarousel>
      </section>

      {/* ── Daily Products (2-col grid) ── */}
      <section className="page-section">
        <div className="section-header">
          <span className="section-title">SẢN PHẨM HÀNG NGÀY</span>
          <Link href="/san-pham?type=daily" className="section-more">Xem tất cả &rsaquo;</Link>
        </div>
        <div className={styles.dailyGrid}>
          {dailyProducts.map((p) => (
            <Link href={`/san-pham/${p.slug}`} key={p.id} className={styles.dailyCard} id={`daily-product-${p.id}`}>
              <div className={styles.dailyImgWrap}>
                <div className={styles.dailyEmoji}>
                  {p.image_url ? <img src={p.image_url} alt={p.name} /> : '📦'}
                </div>
              </div>
              <div className={styles.dailyBody}>
                <div className={styles.dailyName}>{p.name}</div>
                <div className={styles.dailyUnit}>{p.min_order}</div>
                <div className={styles.dailyBottom}>
                  <div className={styles.dailyPrice}>
                  {formatProductPrice(p.price, p.unit)}
                  </div>
                  <div className={styles.dailyMeta}>
                    <span className="star">★</span>
                    <span>{p.rating}</span>
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* ── Flash Sale Banners ── */}
      <section className="page-section">
        <div className="section-header">
          <span className="section-title">🔥 KHUYẾN MÃI NỔI BẬT</span>
          <Link href="/uu-dai" className="section-more">Xem tất cả ›</Link>
        </div>
        {(() => {
          const bannerList = flashBanners.length > 0 ? flashBanners : [
            { id: 'default-1', title: 'Rau Củ Tươi Mỗi Ngày', subtitle: 'Giảm sốc rau củ tươi từ nông trại', image_url: '', bg_gradient: 'linear-gradient(135deg, #1b8a2e 0%, #43a047 50%, #66bb6a 100%)', emoji: '🥬', link_url: '/uu-dai' },
            { id: 'default-2', title: 'Flash Sale ⚡', subtitle: 'Giảm đến 50% cho đơn hàng hôm nay', image_url: '', bg_gradient: 'linear-gradient(135deg, #c62828 0%, #ef5350 50%, #ff8a80 100%)', emoji: '🔥', link_url: '/uu-dai' },
            { id: 'default-3', title: 'Trái Cây Nhập Khẩu', subtitle: 'Hàng tươi ngon từ nông trại', image_url: '', bg_gradient: 'linear-gradient(135deg, #e65100 0%, #ff9800 50%, #ffb74d 100%)', emoji: '🍅', link_url: '/uu-dai' },
          ] as Banner[];
          return (
            <div className={styles.flashWrapper}>
              {bannerList.length > 1 && (
                <button className={`${styles.flashArrow} ${styles.flashArrowPrev}`} onClick={() => scrollFlash('prev')} aria-label="Previous" id="flash-prev">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6"/></svg>
                </button>
              )}
              <div className={styles.flashScroll} ref={flashScrollRef} onScroll={onFlashScroll}>
                {bannerList.map((fb, idx) => (
                  <Link href={fb.link_url || '/uu-dai'} key={fb.id} className={styles.flashCard} id={`flash-${idx + 1}`}>
                    {fb.image_url ? (
                      <img src={fb.image_url} alt={fb.title} className={styles.flashImg} />
                    ) : (
                      <div className={styles.flashImgFallback} style={{ background: fb.bg_gradient }}>
                        <div className={styles.flashFallbackDeco1} />
                        <div className={styles.flashFallbackDeco2} />
                        <div className={styles.flashFallbackDeco3} />
                        <span className={styles.flashFallbackEmoji}>{fb.emoji}</span>
                      </div>
                    )}
                    <div className={styles.flashOverlay}>
                      <div className={styles.flashTag}>{fb.title}</div>
                      <div className={styles.flashDesc}>{fb.subtitle}</div>
                    </div>
                  </Link>
                ))}
              </div>
              {bannerList.length > 1 && (
                <button className={`${styles.flashArrow} ${styles.flashArrowNext}`} onClick={() => scrollFlash('next')} aria-label="Next" id="flash-next">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 18 15 12 9 6"/></svg>
                </button>
              )}
              {bannerList.length > 1 && (
                <div className={styles.flashDots}>
                  {bannerList.map((_, i) => (
                    <span key={i} className={`${styles.flashDot} ${i === flashIndex ? styles.flashDotActive : ''}`} />
                  ))}
                </div>
              )}
            </div>
          );
        })()}
      </section>

      {/* ── Voucher Section ── */}
      {vouchers.length > 0 && (
        <section className="page-section">
          <div className="section-header">
            <span className="section-title">MÃ GIẢM GIÁ</span>
            <Link href="/uu-dai" className="section-more">Xem tất cả &rsaquo;</Link>
          </div>
          <ScrollCarousel itemWidth={260} sidePadding={16}>
            {vouchers.map((v) => (
              <div key={v.id} className={styles.voucherCard}>
                <div className={styles.voucherLeft}>
                  <div className={styles.voucherCircle1} />
                  <div className={styles.voucherCircle2} />
                  <div className={styles.voucherLabel}>GIẢM</div>
                  <div className={styles.voucherValue}>
                    {v.discount_type === 'percent' ? `${v.discount_value}%` : `${(v.discount_value / 1000).toLocaleString()}k`}
                  </div>
                </div>
                <div className={styles.voucherRight}>
                  <div className={styles.voucherTitle}>Đơn tối thiểu {v.min_order.toLocaleString('vi-VN')}₫</div>
                  <div className={styles.voucherCode}>{v.code}</div>
                </div>
              </div>
            ))}
          </ScrollCarousel>
        </section>
      )}

      {/* ── Hot Deals ── */}
      <section className="page-section">
        <div className="section-header">
          <span className="section-title">ƯU ĐÃI HOT</span>
          <Link href="/uu-dai" className="section-more">Xem tất cả &rsaquo;</Link>
        </div>
        <ScrollCarousel itemWidth={150} sidePadding={16} showDots>
          {hotDeals.map((deal) => (
            <div key={deal.id} className={styles.dealCard} style={{ background: deal.bg_gradient }} id={`deal-${deal.id}`}>
              <div className={styles.dealTag}>{deal.tag}</div>
              <div className={styles.dealImg}>{deal.emoji}</div>
              <div className={styles.dealName}>{deal.title}</div>
              <button className={styles.dealBtn} id={`deal-btn-${deal.id}`}>XEM NGAY &rsaquo;</button>
            </div>
          ))}
        </ScrollCarousel>
      </section>

      {/* ── Best Sellers ── */}
      <section className="page-section">
        <div className="section-header">
          <span className="section-title">SẢN PHẨM BÁN CHẠY</span>
          <Link href="/san-pham?type=best" className="section-more">Xem tất cả &rsaquo;</Link>
        </div>
        <ScrollCarousel itemWidth={140} sidePadding={16} showDots>
          {bestSellers.map((p) => (
            <Link href={`/san-pham/${p.slug}`} key={p.id} className="product-card" style={{ width: 140, textDecoration: 'none', display: 'block' }} id={`best-seller-${p.id}`}>
              <div className={styles.productImgWrap}>
                <div className={styles.productEmoji}>
                  {p.image_url ? <img src={p.image_url} alt={p.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : '📦'}
                </div>
              </div>
              <div className="product-card-body">
                <div className="product-card-name">{p.name}</div>
                <div className={styles.productUnitNote}>{p.min_order}</div>
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

      {/* ── Footer Features ── */}
      <section className="page-section-padded">
        <div className={styles.footerFeats}>
          {[
            { icon: '⚡', title: 'Giao hàng siêu tốc', sub: 'Nội thành 2 giờ' },
            { icon: '✅', title: 'Cam kết chất lượng', sub: 'Tươi ngon mỗi ngày' },
            { icon: '🎧', title: 'Hỗ trợ 24/7', sub: 'Luôn sẵn sàng hỗ trợ' },
          ].map((f) => (
            <div className={styles.footerFeat} key={f.title}>
              <div className={styles.footerFeatIcon}>{f.icon}</div>
              <div>
                <div className={styles.footerFeatTitle}>{f.title}</div>
                <div className={styles.footerFeatSub}>{f.sub}</div>
              </div>
            </div>
          ))}
        </div>
      </section>

      <ComingSoonPopup 
        isOpen={comingSoon.open} 
        onClose={() => setComingSoon({ ...comingSoon, open: false })} 
        featureName={comingSoon.feature} 
      />
    </div>
  );
}
