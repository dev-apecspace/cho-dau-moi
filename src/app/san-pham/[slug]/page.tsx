import ProductDetailClient from './ProductDetailClient';

export default async function ProductDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const resolvedParams = await params;
  return <ProductDetailClient slug={resolvedParams.slug} />;
}
