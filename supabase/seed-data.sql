-- ============================================
-- CHỢ ĐẦU MỚI - Seed Data Bổ Sung
-- Chạy file này SAU migration.sql
-- ============================================

-- ============================================
-- PRODUCTS (Sản phẩm)
-- ============================================
INSERT INTO products (name, slug, price, original_price, unit, min_order, origin, rating, review_count, sold_count, is_active, is_daily, is_best_seller, is_featured, sort_order, description, tags) VALUES
('Cải thảo Đà Lạt', 'cai-thao-da-lat', 12500, 15000, 'kg', '2kg trở lên', 'Đà Lạt, Lâm Đồng', 4.5, 128, 1520, true, true, false, true, 1,
 'Cải thảo Đà Lạt tươi ngon, trồng theo tiêu chuẩn VietGAP. Lá xanh mướt, giòn ngọt tự nhiên. Thích hợp nấu canh, xào, làm kim chi.',
 ARRAY['VietGAP', 'Đà Lạt', 'Rau tươi']),

('Khoai tây Đà Lạt', 'khoai-tay-da-lat', 15000, 18000, 'kg', '5kg trở lên', 'Đà Lạt, Lâm Đồng', 4.3, 95, 2100, true, true, true, false, 2,
 'Khoai tây Đà Lạt loại 1, vỏ vàng ruột vàng, bở ngon. Không sử dụng thuốc trừ sâu. Phù hợp chiên, xào, nấu canh.',
 ARRAY['Đà Lạt', 'Loại 1']),

('Cà chua Đà Lạt loại 1', 'ca-chua-da-lat-loai-1', 18000, 22000, 'kg', '3kg trở lên', 'Đà Lạt, Lâm Đồng', 4.7, 210, 3200, true, true, true, true, 3,
 'Cà chua Đà Lạt chín tự nhiên, đỏ mọng, vị chua ngọt đặc trưng. Trồng trong nhà kính theo quy trình VietGAP. Lý tưởng cho nấu sốt, salad.',
 ARRAY['VietGAP', 'Đà Lạt', 'Chín tự nhiên']),

('Dưa leo Đà Lạt', 'dua-leo-da-lat', 10000, 12000, 'kg', '2kg trở lên', 'Đà Lạt, Lâm Đồng', 4.4, 78, 980, true, true, false, false, 4,
 'Dưa leo Đà Lạt tươi giòn, ruột ít hạt. Trồng hữu cơ không thuốc. Ăn sống hoặc làm gỏi đều ngon.',
 ARRAY['Đà Lạt', 'Hữu cơ']),

('Hành tây Đà Lạt', 'hanh-tay-da-lat', 22000, 25000, 'kg', '5kg trở lên', 'Đà Lạt, Lâm Đồng', 4.2, 65, 750, true, true, false, false, 5,
 'Hành tây Đà Lạt củ to đều, vỏ đồng đỏ, ruột trắng, vị ngọt nhẹ. Bảo quản tốt, dùng xào nấu đều phù hợp.',
 ARRAY['Đà Lạt']),

('Bắp cải trắng tươi', 'bap-cai-trang-tuoi', 9000, 11000, 'kg', '3kg trở lên', 'Đà Lạt, Lâm Đồng', 4.1, 55, 620, true, true, true, false, 6,
 'Bắp cải trắng Đà Lạt, bẹ chắc, lá giòn ngọt. An toàn VietGAP. Nấu canh, xào thịt, muối dưa đều ngon.',
 ARRAY['VietGAP', 'Đà Lạt']),

('Cà rốt Đà Lạt', 'ca-rot-da-lat', 16000, 20000, 'kg', '2kg trở lên', 'Đà Lạt, Lâm Đồng', 4.6, 142, 1800, true, true, true, false, 7,
 'Cà rốt Đà Lạt baby, ruột đỏ cam đậm, vị ngọt tự nhiên. Giàu vitamin A và beta-carotene. Ăn sống, ép nước, nấu canh.',
 ARRAY['Đà Lạt', 'Baby', 'Giàu vitamin']),

('Nấm rơm tươi', 'nam-rom-tuoi', 35000, 42000, 'kg', '1kg trở lên', 'Long An', 4.8, 88, 450, true, true, false, true, 8,
 'Nấm rơm tươi thu hoạch trong ngày, nấm búp tròn đều, thịt dày trắng. Xào, nấu canh, lẩu đều tuyệt vời.',
 ARRAY['Tươi ngày', 'Nấm sạch']),

('Bí đỏ Đà Lạt', 'bi-do-da-lat', 14000, 16000, 'kg', '3kg trở lên', 'Đà Lạt, Lâm Đồng', 4.6, 72, 530, true, false, true, false, 9,
 'Bí đỏ Đà Lạt ruột vàng cam, bột dẻo thơm. Nấu canh, chè, hấp đều ngon. Giàu vitamin A.',
 ARRAY['Đà Lạt', 'Giàu vitamin']),

('Cà rốt baby', 'ca-rot-baby', 25000, 30000, 'kg', '2kg trở lên', 'Đà Lạt, Lâm Đồng', 4.4, 60, 320, true, false, true, false, 10,
 'Cà rốt baby Đà Lạt loại nhỏ, ngọt giòn. Phù hợp ăn sống, salad, ép nước detox.',
 ARRAY['Baby', 'Đà Lạt', 'Detox']),

('Dưa hấu đỏ ruột', 'dua-hau-do-ruot', 9000, 12000, 'kg', '5kg trở lên', 'Long An', 4.5, 180, 2800, true, false, true, false, 11,
 'Dưa hấu Long An ruột đỏ, vỏ mỏng, ngọt mát. Trái to đều 5-8kg. Giải nhiệt mùa hè tuyệt vời.',
 ARRAY['Long An', 'Ruột đỏ', 'Giải nhiệt']);

-- ============================================
-- BANNERS (Flash Sale & Promotions)
-- ============================================
INSERT INTO banners (title, subtitle, emoji, bg_gradient, position, sort_order, is_active) VALUES
('Rau Củ Tươi Mỗi Ngày 50%', 'Giảm sốc rau củ tươi từ nông trại', '🥬', 'linear-gradient(135deg, #ff9500, #ffcc02)', 'flash_sale', 1, true),
('Mua Sỉ Nông Sản Giá Tốt', 'Chiết khấu đến 20% cho đơn sỉ', '🥕', 'linear-gradient(135deg, #2a7a2a, #4caf50)', 'flash_sale', 2, true),
('Trái Cây Tươi Giá Rẻ', 'Trái cây nhập khẩu và nội địa', '🍓', 'linear-gradient(135deg, #e53935, #ff6659)', 'flash_sale', 3, true),
('Rau Đà Lạt Cuối Tuần', 'Ưu đãi đặc biệt thứ 7, Chủ nhật', '🥦', 'linear-gradient(135deg, #0277bd, #039be5)', 'flash_sale', 4, true),
('Trái Cây Nhập Khẩu Ưu Đãi', 'Nho Mỹ, Táo Pháp, Cherry Úc...', '🍇', 'linear-gradient(135deg, #6a1b9a, #9c27b0)', 'flash_sale', 5, true),
('Nguồn Hàng Tận Gốc - Giá Sỉ Tốt Nhất', 'Hàng tận gốc • Giao hàng toàn quốc • Đổi trả dễ dàng', '🏪', 'linear-gradient(160deg, #1b5e20 0%, #2e7d32 50%, #388e3c 100%)', 'hero', 1, true);

-- ============================================
-- DEALS (Ưu đãi)
-- ============================================
INSERT INTO deals (tag, title, description, emoji, bg_gradient, btn_text, sort_order, is_active, expires_at) VALUES
('MỚI NGÀY HÔM NAY', 'Giảm 50% rau củ tươi', 'Áp dụng cho đơn từ 200.000₫', '🥬', 'linear-gradient(135deg, #ff9500, #ffcc02)', 'MUA NGAY', 1, true, '2026-06-07'),
('MUA NHIỀU GIẢM NHIỀU', 'Chiết khấu 15% đơn sỉ 3tr', 'Áp dụng cho tất cả nông sản', '🥕', 'linear-gradient(135deg, #2a7a2a, #4caf50)', 'XEM NGAY', 2, true, '2026-06-15'),
('FLASH SALE', 'Trái cây tươi giảm 30%', 'Chỉ từ 10:00 - 14:00 hàng ngày', '🍓', 'linear-gradient(135deg, #e53935, #ff6659)', 'XEM NGAY', 3, true, '2026-06-10'),
('ƯU ĐÃI ĐỘC QUYỀN', 'Miễn phí ship đơn 500k', 'Giao nông sản toàn quốc', '🚚', 'linear-gradient(135deg, #1565c0, #1976d2)', 'ÁP DỤNG', 4, true, NULL),
('KHUYẾN MÃI MÙA VỤ', 'Giảm 20% rau Đà Lạt', 'Rau củ tươi từ nông trại', '🥦', 'linear-gradient(135deg, #6a1b9a, #8e24aa)', 'XEM NGAY', 5, true, '2026-06-30');

-- ============================================
-- VOUCHERS (Mã giảm giá)
-- ============================================
INSERT INTO vouchers (code, description, min_order, discount_value, discount_type, is_active, expires_at) VALUES
('MOINGAY50', 'Giảm 50% cho đơn đầu tiên', 200000, 50, 'percent', true, '2026-06-30'),
('SI3TR', 'Chiết khấu 15% đơn sỉ từ 3 triệu', 3000000, 15, 'percent', true, '2026-06-15'),
('FREESHIP', 'Miễn phí vận chuyển đơn 500k', 500000, 30000, 'fixed', true, NULL),
('DALAT20', 'Giảm 20% rau Đà Lạt', 100000, 20, 'percent', true, '2026-06-30'),
('GIAM50K', 'Giảm 50.000₫ cho đơn từ 300k', 300000, 50000, 'fixed', true, '2026-07-31'),
('TRAICAY30', 'Giảm 30% trái cây tươi', 150000, 30, 'percent', true, '2026-06-10'),
('WELCOME', 'Chào mừng thành viên mới - Giảm 10%', 0, 10, 'percent', true, NULL);

-- ============================================
-- PRODUCT SPECS (Thông số mẫu cho sản phẩm đầu tiên)
-- Gắn vào sản phẩm "Cải thảo Đà Lạt" (slug = 'cai-thao-da-lat')
-- ============================================
INSERT INTO product_specs (product_id, label, value, sort_order)
SELECT p.id, s.label, s.value, s.sort_order
FROM products p,
(VALUES
  ('Xuất xứ', 'Đà Lạt, Lâm Đồng', 1),
  ('Trọng lượng', '800g - 1.2kg/cây', 2),
  ('Bảo quản', 'Ngăn mát tủ lạnh 5-7 ngày', 3),
  ('Chứng nhận', 'VietGAP', 4),
  ('Thu hoạch', 'Hàng ngày', 5)
) AS s(label, value, sort_order)
WHERE p.slug = 'cai-thao-da-lat';

-- ============================================
-- PRICE TIERS (Bảng giá sỉ mẫu cho "Cà chua Đà Lạt")
-- ============================================
INSERT INTO price_tiers (product_id, min_qty, max_qty, price)
SELECT p.id, t.min_qty, t.max_qty, t.price
FROM products p,
(VALUES
  (1, 9, 18000),
  (10, 49, 16000),
  (50, 99, 14500),
  (100, NULL, 13000)
) AS t(min_qty, max_qty, price)
WHERE p.slug = 'ca-chua-da-lat-loai-1';

-- ============================================
-- SITE SETTINGS (Cấu hình mặc định)
-- ============================================
INSERT INTO site_settings (key, value) VALUES
('site_name', '{"v": "Chợ Đầu Mới Nông Sản"}'::jsonb),
('site_subtitle', '{"v": "Nguồn hàng tận gốc - Giá sỉ tốt nhất"}'::jsonb),
('site_phone', '{"v": "0900 000 000"}'::jsonb),
('site_email', '{"v": "lienhe@chodaumoi.vn"}'::jsonb),
('site_address', '{"v": "TP. Hồ Chí Minh"}'::jsonb),
('shipping_free_min', '{"v": 500000}'::jsonb),
('shipping_note', '{"v": "Giao hàng toàn quốc"}'::jsonb),
('hero_title', '{"v": "NGUỒN HÀNG TẬN GỐC"}'::jsonb),
('hero_subtitle', '{"v": "GIÁ SỈ TỐT NHẤT"}'::jsonb),
('hero_features', '{"v": "Hàng tận gốc|Giao hàng toàn quốc|Đổi trả dễ dàng"}'::jsonb),
('hero_features_subs', '{"v": "Nguồn gốc rõ ràng|Nhanh chóng tiện lợi|Hỗ trợ 24/7"}'::jsonb),
('hero_features_icons', '{"v": "✅|🚚|🔄"}'::jsonb),
('hero_features_icons_urls', '{"v": "||"}'::jsonb),
('hero_bottom_badges', '{"v": "🛡️ Cam kết chất lượng|📦 Giao hàng nhanh|💬 Hỗ trợ 24/7"}'::jsonb),
('hero_bottom_icons_urls', '{"v": "||"}'::jsonb),
('hero_price_label', '{"v": "GIÁ SỈ"}'::jsonb),
('hero_price_value', '{"v": "TẬN GỐC"}'::jsonb),
('hero_price_badge_img', '{"v": ""}'::jsonb)
ON CONFLICT (key) DO NOTHING;
