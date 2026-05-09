'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import styles from './products.module.css';
import LoadingNongSan from '@/components/ui/LoadingNongSan';
import { formatProductPrice } from '@/lib/price';

interface Product {
  id: string;
  name: string;
  slug: string;
  price: number;
  unit: string;
  min_order: string;
  rating: number;
  image_url?: string;
}

export default function AllProductsPage() {
  const searchParams = useSearchParams();
  const type = searchParams.get('type'); // 'daily', 'best', 'featured'
  const queryParam = searchParams.get('q'); // search query
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [title, setTitle] = useState('Tất cả sản phẩm');

  useEffect(() => {
    async function loadProducts() {
      try {
        setLoading(true);
        let query = supabase
          .from('products')
          .select('*, product_images(image_url)')
          .eq('is_active', true);

        if (queryParam) {
          query = query.ilike('name', `%${queryParam}%`);
          setTitle(`Kết quả cho "${queryParam}"`);
        } else if (type === 'daily') {
          query = query.eq('is_daily', true);
          setTitle('Sản phẩm hàng ngày');
        } else if (type === 'best') {
          query = query.eq('is_best_seller', true);
          setTitle('Sản phẩm bán chạy');
        } else if (type === 'featured') {
          query = query.eq('is_featured', true);
          setTitle('Sản phẩm tiêu biểu');
        } else {
          setTitle('Tất cả sản phẩm');
        }

        const { data, error } = await query.order('sort_order');

        if (error) throw error;

        if (data) {
          setProducts(data.map((p: any) => ({
            ...p,
            image_url: p.product_images?.[0]?.image_url
          })));
        }
      } catch (error) {
        console.error('Error loading products:', error);
      } finally {
        setLoading(false);
      }
    }
    loadProducts();
  }, [type, queryParam]);

  if (loading) return <LoadingNongSan text="Đang tải sản phẩm..." items={["🥬", "🥕", "🍅"]} />;

  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <Link href="/" className={styles.backBtn}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="15 18 9 12 15 6" />
          </svg>
        </Link>
        <h1 className={styles.headerTitle}>{title}</h1>
      </header>

      <div className={styles.productGrid}>
        {products.length > 0 ? products.map((p) => (
          <Link href={`/san-pham/${p.slug}`} key={p.id} className={styles.productCard}>
            <div className={styles.imgWrap}>
              {p.image_url ? (
                <img src={p.image_url} alt={p.name} />
              ) : (
                <span className={styles.emojiPlaceholder}>📦</span>
              )}
            </div>
            <div className={styles.body}>
              <div className={styles.name}>{p.name}</div>
              <div className={styles.unit}>{p.min_order}</div>
              <div className={styles.bottom}>
                <div className={styles.price}>
                  {formatProductPrice(p.price, p.unit)}
                </div>
                <div className={styles.meta}>
                  <span className="star">★</span>
                  <span>{p.rating}</span>
                </div>
              </div>
            </div>
          </Link>
        )) : (
          <div className={styles.emptyState}>
            <div className={styles.emptyEmoji}>📦</div>
            <div className={styles.emptyText}>Hiện chưa có sản phẩm nào</div>
            <Link href="/" className={styles.emptyBtn}>Quay lại trang chủ</Link>
          </div>
        )}
      </div>
    </div>
  );
}
