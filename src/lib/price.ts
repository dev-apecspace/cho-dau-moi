export function formatProductPrice(price: number, unit?: string, locale = 'vi-VN'): string {
  if (!price || price <= 0) return 'Liên hệ';
  return unit ? `${price.toLocaleString(locale)}₫/${unit}` : `${price.toLocaleString(locale)}₫`;
}
