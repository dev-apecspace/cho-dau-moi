'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';
import styles from './uu-dai.module.css';

interface Deal {
  id: string;
  tag: string;
  title: string;
  description: string;
  bg_gradient: string;
  emoji: string;
  btn_text: string;
  expires_at: string | null;
}

export default function UuDaiPage() {
  const [deals, setDeals] = useState<Deal[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadDeals() {
      const { data } = await supabase
        .from('deals')
        .select('*')
        .eq('is_active', true)
        .order('sort_order');
      
      if (data) setDeals(data);
      setLoading(false);
    }
    loadDeals();
  }, []);

  if (loading) return (
    <div className="admin-loading">
      <div className="loader-nongsan">
        <span className="loader-item">⚡</span>
        <span className="loader-item">🎁</span>
        <span className="loader-item">💰</span>
      </div>
      <span>Đang thu thập ưu đãi hot...</span>
    </div>
  );

  return (
    <div className={styles.page}>
      <header className="page-header">
        <Link href="/" className="back-btn">←</Link>
        <span className="page-header-title">Ưu đãi</span>
        <div style={{ width: 36 }} />
      </header>

      <div className={styles.dealsList}>
        {deals.length > 0 ? deals.map((deal) => (
          <div key={deal.id} className={styles.dealCard} id={`uu-dai-${deal.id}`} style={{ background: deal.bg_gradient }}>
            <div className={styles.dealTop}>
              <div>
                <div className={styles.dealTag}>{deal.tag}</div>
                <div className={styles.dealTitle}>{deal.title}</div>
                <div className={styles.dealDesc}>{deal.description}</div>
              </div>
              <div className={styles.dealEmoji}>{deal.emoji}</div>
            </div>
            <div className={styles.dealBottom}>
              <span className={styles.dealExpires}>
                {deal.expires_at ? `Hết hạn: ${new Date(deal.expires_at).toLocaleDateString('vi-VN')}` : 'Không giới hạn'}
              </span>
              <button className={styles.dealBtn} id={`uu-dai-btn-${deal.id}`}>{deal.btn_text || 'XEM NGAY'} ›</button>
            </div>
          </div>
        )) : (
          <div style={{ padding: 40, textAlign: 'center', color: '#999' }}>Chưa có ưu đãi nào</div>
        )}
      </div>
    </div>
  );
}
