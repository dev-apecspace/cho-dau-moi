'use client';
import { useState, useEffect, useMemo, useRef } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import styles from './category-list.module.css';
import LoadingNongSan from '@/components/ui/LoadingNongSan';

interface Product {
  id: string;
  name: string;
  slug: string;
  price: number;
  original_price: number;
  unit: string;
  min_order: string;
  rating: number;
  review_count: number;
  sold_count: number;
  origin: string;
  is_best_seller: boolean;
  is_daily: boolean;
  image_url?: string;
  created_at: string;
}

interface Category {
  id: string;
  name: string;
  icon: string;
}

type SortKey = 'popular' | 'price_asc' | 'price_desc' | 'rating' | 'newest';
type PriceFilter = 'all' | 'under50' | '50to100' | '100to200' | 'over200';

const SORT_OPTIONS: { key: SortKey; label: string; icon: string }[] = [
  { key: 'popular', label: 'Phổ biến nhất', icon: '🔥' },
  { key: 'price_asc', label: 'Giá thấp → cao', icon: '📈' },
  { key: 'price_desc', label: 'Giá cao → thấp', icon: '📉' },
  { key: 'rating', label: 'Đánh giá cao nhất', icon: '⭐' },
  { key: 'newest', label: 'Mới nhất', icon: '🆕' },
];

const PRICE_FILTERS: { key: PriceFilter; label: string; icon?: string }[] = [
  { key: 'all', label: 'Tất cả' },
  { key: 'under50', label: 'Dưới 50k', icon: '💰' },
  { key: '50to100', label: '50k - 100k', icon: '💵' },
  { key: '100to200', label: '100k - 200k', icon: '💎' },
  { key: 'over200', label: 'Trên 200k', icon: '👑' },
];

export default function CategoryProductsPage() {
  const { id } = useParams();
  const [products, setProducts] = useState<Product[]>([]);
  const [category, setCategory] = useState<Category | null>(null);
  const [loading, setLoading] = useState(true);

  // UI states
  const [searchQuery, setSearchQuery] = useState('');
  const [sortKey, setSortKey] = useState<SortKey>('popular');
  const [showSortDropdown, setShowSortDropdown] = useState(false);
  const [priceFilter, setPriceFilter] = useState<PriceFilter>('all');
  const [ratingFilter, setRatingFilter] = useState(false);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  
  const searchInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    async function loadData() {
      try {
        // Fetch category info
        const { data: catData } = await supabase
          .from('categories')
          .select('*')
          .eq('id', id)
          .single();
        
        if (catData) setCategory(catData);

        // Fetch ALL active products in this category (không giới hạn is_daily, is_best_seller)
        const { data: prodData } = await supabase
          .from('products')
          .select('*, product_images(image_url)')
          .eq('category_id', id)
          .eq('is_active', true)
          .order('sort_order');
        
        if (prodData) {
          setProducts(prodData.map((p: any) => ({
            ...p,
            image_url: p.product_images?.[0]?.image_url
          })));
        }
      } catch (error) {
        console.error('Error loading category products:', error);
      } finally {
        setLoading(false);
      }
    }
    if (id) loadData();
  }, [id]);

  // Filtered & Sorted products
  const filteredProducts = useMemo(() => {
    let result = [...products];

    // Search filter
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      result = result.filter(p =>
        p.name.toLowerCase().includes(q) ||
        p.origin?.toLowerCase().includes(q)
      );
    }

    // Price filter
    switch (priceFilter) {
      case 'under50':
        result = result.filter(p => p.price < 50000);
        break;
      case '50to100':
        result = result.filter(p => p.price >= 50000 && p.price <= 100000);
        break;
      case '100to200':
        result = result.filter(p => p.price >= 100000 && p.price <= 200000);
        break;
      case 'over200':
        result = result.filter(p => p.price > 200000);
        break;
    }

    // Rating filter
    if (ratingFilter) {
      result = result.filter(p => p.rating >= 4);
    }

    // Sort
    switch (sortKey) {
      case 'popular':
        result.sort((a, b) => (b.sold_count || 0) - (a.sold_count || 0));
        break;
      case 'price_asc':
        result.sort((a, b) => a.price - b.price);
        break;
      case 'price_desc':
        result.sort((a, b) => b.price - a.price);
        break;
      case 'rating':
        result.sort((a, b) => (b.rating || 0) - (a.rating || 0));
        break;
      case 'newest':
        result.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
        break;
    }

    return result;
  }, [products, searchQuery, priceFilter, ratingFilter, sortKey]);

  const hasActiveFilters = priceFilter !== 'all' || ratingFilter || searchQuery.trim() !== '';

  const clearAllFilters = () => {
    setSearchQuery('');
    setPriceFilter('all');
    setRatingFilter(false);
    setSortKey('popular');
  };

  const getDiscountPercent = (p: Product) => {
    if (p.original_price && p.original_price > p.price) {
      return Math.round(((p.original_price - p.price) / p.original_price) * 100);
    }
    return 0;
  };

  const renderRatingStars = (rating: number) => {
    const stars = [];
    for (let i = 1; i <= 5; i++) {
      stars.push(
        <span key={i} className={i <= Math.round(rating) ? styles.ratingStar : styles.ratingStarEmpty}>★</span>
      );
    }
    return <div className={styles.ratingStars}>{stars}</div>;
  };

  if (loading) return <LoadingNongSan text="Đang tải sản phẩm..." items={["🥬", "🥕", "🍅"]} />;

  return (
    <div className={styles.page}>
      {/* ── Hero Header ── */}
      <header className={styles.header}>
        <div className={styles.headerBg} />
        <div className={styles.headerContent}>
          {/* Top row: back + breadcrumb */}
          <div className={styles.headerTopRow}>
            <Link href="/danh-muc" className={styles.backBtn} id="cat-back-btn">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="15 18 9 12 15 6" />
              </svg>
            </Link>
            <nav className={styles.breadcrumb}>
              <Link href="/" className={styles.breadcrumbLink}>Trang chủ</Link>
              <span className={styles.breadcrumbSep}>›</span>
              <Link href="/danh-muc" className={styles.breadcrumbLink}>Danh mục</Link>
              <span className={styles.breadcrumbSep}>›</span>
              <span className={styles.breadcrumbCurrent}>{category?.name || 'Sản phẩm'}</span>
            </nav>
          </div>

          {/* Category info */}
          <div className={styles.headerMain}>
            <div className={styles.categoryIconWrap}>
              <span className={styles.categoryIcon}>
                {category?.icon && (category.icon.startsWith('http') || category.icon.startsWith('/')) ? (
                  <img src={category.icon} alt="" style={{ width: 32, height: 32, objectFit: 'contain' }} />
                ) : (
                  category?.icon || '📦'
                )}
              </span>
            </div>
            <div className={styles.headerTitleGroup}>
              <h1 className={styles.headerTitle}>{category?.name || 'Sản phẩm'}</h1>
              <span className={styles.headerCount}>
                <span className={styles.headerCountNum}>{filteredProducts.length}</span> sản phẩm
              </span>
            </div>
          </div>

          {/* Integrated search */}
          <div className={styles.searchBar}>
            <svg className={styles.searchIcon} width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
            <input
              ref={searchInputRef}
              type="text"
              className={styles.searchInput}
              placeholder={`Tìm kiếm trong ${category?.name || 'danh mục'}...`}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              id="cat-search-input"
            />
            {searchQuery && (
              <button className={styles.clearBtn} onClick={() => { setSearchQuery(''); searchInputRef.current?.focus(); }} id="cat-search-clear">
                ✕
              </button>
            )}
          </div>
        </div>
      </header>

      {/* ── Toolbar: Sort + View Toggle ── */}
      <div className={styles.toolbar}>
        <div className={styles.sortWrapper}>
          <button
            className={`${styles.sortBtn} ${sortKey !== 'popular' ? styles.sortBtnActive : ''}`}
            onClick={() => setShowSortDropdown(!showSortDropdown)}
            id="cat-sort-btn"
          >
            {SORT_OPTIONS.find(o => o.key === sortKey)?.icon}{' '}
            {SORT_OPTIONS.find(o => o.key === sortKey)?.label}
            <span className={`${styles.sortArrow} ${showSortDropdown ? styles.sortArrowOpen : ''}`}>▼</span>
          </button>

          {showSortDropdown && (
            <>
              <div className={styles.sortOverlay} onClick={() => setShowSortDropdown(false)} />
              <div className={styles.sortDropdown}>
                {SORT_OPTIONS.map((option) => (
                  <button
                    key={option.key}
                    className={`${styles.sortOption} ${sortKey === option.key ? styles.sortOptionActive : ''}`}
                    onClick={() => { setSortKey(option.key); setShowSortDropdown(false); }}
                    id={`sort-${option.key}`}
                  >
                    <span className={styles.sortOptionIcon}>{option.icon}</span>
                    {option.label}
                    {sortKey === option.key && <span className={styles.sortOptionCheck}>✓</span>}
                  </button>
                ))}
              </div>
            </>
          )}
        </div>

        <div className={styles.viewToggle}>
          <button
            className={`${styles.viewBtn} ${viewMode === 'grid' ? styles.viewBtnActive : ''}`}
            onClick={() => setViewMode('grid')}
            id="view-grid-btn"
            title="Xem dạng lưới"
          >
            <svg width="14" height="14" viewBox="0 0 16 16" fill="currentColor">
              <rect x="0" y="0" width="7" height="7" rx="1.5" />
              <rect x="9" y="0" width="7" height="7" rx="1.5" />
              <rect x="0" y="9" width="7" height="7" rx="1.5" />
              <rect x="9" y="9" width="7" height="7" rx="1.5" />
            </svg>
          </button>
          <button
            className={`${styles.viewBtn} ${viewMode === 'list' ? styles.viewBtnActive : ''}`}
            onClick={() => setViewMode('list')}
            id="view-list-btn"
            title="Xem dạng danh sách"
          >
            <svg width="14" height="14" viewBox="0 0 16 16" fill="currentColor">
              <rect x="0" y="1" width="16" height="3.5" rx="1" />
              <rect x="0" y="6.25" width="16" height="3.5" rx="1" />
              <rect x="0" y="11.5" width="16" height="3.5" rx="1" />
            </svg>
          </button>
        </div>
      </div>

      {/* ── Filter Chips ── */}
      <div className={styles.filterSection}>
        <div className={styles.filterScroll}>
          {PRICE_FILTERS.map((f) => (
            <button
              key={f.key}
              className={`${styles.filterChip} ${priceFilter === f.key ? styles.filterChipActive : ''}`}
              onClick={() => setPriceFilter(priceFilter === f.key && f.key !== 'all' ? 'all' : f.key)}
              id={`filter-${f.key}`}
            >
              {f.icon && <span className={styles.filterChipIcon}>{f.icon}</span>}
              {f.label}
            </button>
          ))}
          <button
            className={`${styles.filterChip} ${ratingFilter ? styles.filterChipActive : ''}`}
            onClick={() => setRatingFilter(!ratingFilter)}
            id="filter-rating"
          >
            <span className={styles.filterChipIcon}>⭐</span>
            Từ 4★ trở lên
          </button>
        </div>
      </div>

      {/* ── Result Info ── */}
      {hasActiveFilters && (
        <div className={styles.resultBar}>
          <span className={styles.resultCount}>
            Tìm thấy <span className={styles.resultCountNum}>{filteredProducts.length}</span> sản phẩm
          </span>
          <button className={styles.clearFilters} onClick={clearAllFilters} id="clear-all-filters">
            Xóa bộ lọc ✕
          </button>
        </div>
      )}

      {/* ── Product Grid / List ── */}
      {viewMode === 'grid' ? (
        <div className={styles.productGrid}>
          {filteredProducts.length > 0 ? filteredProducts.map((p) => {
            const discount = getDiscountPercent(p);
            return (
              <Link href={`/san-pham/${p.slug}`} key={p.id} className={styles.productCard} id={`product-${p.id}`}>
                <div className={styles.imgWrap}>
                  {p.image_url ? (
                    <img src={p.image_url} alt={p.name} />
                  ) : (
                    <span className={styles.emojiPlaceholder}>📦</span>
                  )}
                  {p.is_best_seller && (
                    <span className={`${styles.imgBadge} ${styles.imgBadgeBest}`}>BÁN CHẠY</span>
                  )}
                  {discount > 0 && (
                    <span className={styles.discountBadge}>-{discount}%</span>
                  )}
                </div>
                <div className={styles.body}>
                  <div className={styles.name}>{p.name}</div>
                  {p.origin && (
                    <span className={styles.originTag}>📍 {p.origin}</span>
                  )}
                  {p.min_order && (
                    <span className={styles.unit}>{p.min_order}</span>
                  )}
                  <div className={styles.bottom}>
                    <div>
                      <div className={styles.price}>
                        {p.price.toLocaleString('vi-VN')}₫
                        <span className={styles.priceUnit}>/{p.unit}</span>
                      </div>
                      {p.original_price > 0 && p.original_price > p.price && (
                        <div className={styles.originalPrice}>{p.original_price.toLocaleString('vi-VN')}₫</div>
                      )}
                    </div>
                    <div className={styles.meta}>
                      <span className="star">★</span>
                      <span>{p.rating || 0}</span>
                    </div>
                  </div>
                </div>
              </Link>
            );
          }) : (
            <div className={styles.emptyState}>
              <div className={styles.emptyEmoji}>🔍</div>
              <div className={styles.emptyTitle}>Không tìm thấy sản phẩm</div>
              <div className={styles.emptyText}>
                {searchQuery ? `Không có sản phẩm nào phù hợp với "${searchQuery}"` : 'Không có sản phẩm nào trong khoảng giá này'}
              </div>
              {hasActiveFilters ? (
                <button className={styles.emptyBtn} onClick={clearAllFilters} style={{ border: 'none', cursor: 'pointer', fontFamily: 'inherit' }}>
                  Xóa bộ lọc
                </button>
              ) : (
                <Link href="/danh-muc" className={styles.emptyBtn}>Quay lại danh mục</Link>
              )}
            </div>
          )}
        </div>
      ) : (
        <div className={styles.productList}>
          {filteredProducts.length > 0 ? filteredProducts.map((p) => {
            const discount = getDiscountPercent(p);
            return (
              <Link href={`/san-pham/${p.slug}`} key={p.id} className={styles.productCardList} id={`product-list-${p.id}`}>
                <div className={styles.listImgWrap}>
                  {p.image_url ? (
                    <img src={p.image_url} alt={p.name} />
                  ) : (
                    <span className={styles.emojiPlaceholder}>📦</span>
                  )}
                  {p.is_best_seller && (
                    <span className={`${styles.imgBadge} ${styles.imgBadgeBest}`}>BÁN CHẠY</span>
                  )}
                  {discount > 0 && (
                    <span className={styles.discountBadge}>-{discount}%</span>
                  )}
                </div>
                <div className={styles.listBody}>
                  <div className={styles.listName}>{p.name}</div>
                  <div className={styles.listMeta}>
                    {p.origin && <span className={styles.originTag}>📍 {p.origin}</span>}
                    {p.min_order && <span className={styles.unit}>{p.min_order}</span>}
                  </div>
                  <div>{renderRatingStars(p.rating || 0)} </div>
                  <div className={styles.listBottom}>
                    <div>
                      <span className={styles.listPrice}>
                        {p.price.toLocaleString('vi-VN')}₫
                        <span className={styles.listPriceUnit}>/{p.unit}</span>
                      </span>
                      {p.original_price > 0 && p.original_price > p.price && (
                        <div className={styles.originalPrice}>{p.original_price.toLocaleString('vi-VN')}₫</div>
                      )}
                    </div>
                    <button className={styles.addCartBtn} onClick={(e) => { e.preventDefault(); }} title="Thêm vào giỏ">
                      +
                    </button>
                  </div>
                </div>
              </Link>
            );
          }) : (
            <div className={styles.emptyState} style={{ padding: '60px 20px' }}>
              <div className={styles.emptyEmoji}>🔍</div>
              <div className={styles.emptyTitle}>Không tìm thấy sản phẩm</div>
              <div className={styles.emptyText}>
                {searchQuery ? `Không có sản phẩm nào phù hợp với "${searchQuery}"` : 'Không có sản phẩm nào trong khoảng giá này'}
              </div>
              {hasActiveFilters ? (
                <button className={styles.emptyBtn} onClick={clearAllFilters} style={{ border: 'none', cursor: 'pointer', fontFamily: 'inherit' }}>
                  Xóa bộ lọc
                </button>
              ) : (
                <Link href="/danh-muc" className={styles.emptyBtn}>Quay lại danh mục</Link>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
