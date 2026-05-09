-- ============================================
-- CẬP NHẬT CẤU HÌNH HERO BANNER
-- ============================================

-- 1. Thêm các khóa cấu hình mới (nếu chưa có)
INSERT INTO site_settings (key, value) VALUES
('hero_features_subs', '{"v": "Nguồn gốc rõ ràng|Nhanh chóng tiện lợi|Hỗ trợ 24/7"}'::jsonb),
('hero_features_icons', '{"v": "✅|🚚|🔄"}'::jsonb),
('hero_features_icons_urls', '{"v": "||"}'::jsonb),
('hero_bottom_badges', '{"v": "🛡️ Cam kết chất lượng|📦 Giao hàng nhanh|💬 Hỗ trợ 24/7"}'::jsonb),
('hero_bottom_icons_urls', '{"v": "||"}'::jsonb),
('hero_price_label', '{"v": "GIÁ SỈ"}'::jsonb),
('hero_price_value', '{"v": "TẬN GỐC"}'::jsonb),
('hero_price_badge_img', '{"v": ""}'::jsonb)
ON CONFLICT (key) DO NOTHING;

-- 2. Cập nhật các giá trị mặc định cho các khóa đã tồn tại
UPDATE site_settings SET value = '{"v": "NGUỒN HÀNG TẬN GỐC"}'::jsonb WHERE key = 'hero_title';
UPDATE site_settings SET value = '{"v": "GIÁ SỈ TỐT NHẤT"}'::jsonb WHERE key = 'hero_subtitle';
UPDATE site_settings SET value = '{"v": "Hàng tận gốc|Giao hàng toàn quốc|Đổi trả dễ dàng"}'::jsonb WHERE key = 'hero_features';
