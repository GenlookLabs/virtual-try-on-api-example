import Link from "next/link";
import { notFound } from "next/navigation";
import { TryOnWidget } from "@/components/TryOnWidget";
import { formatPrice, getProduct } from "@/lib/products";

interface ProductPageProps {
  params: Promise<{ id: string }>;
}

export default async function ProductPage({ params }: ProductPageProps) {
  const { id } = await params;
  const product = getProduct(id);

  if (!product) {
    notFound();
  }

  return (
    <main className="container">
      <Link href="/" className="back-link">
        ← Back to shop
      </Link>

      <section className="product-page">
        <div className="product-gallery">
          <img src={product.image} alt={product.title} />
        </div>

        <div className="product-info">
          <h1>{product.title}</h1>
          <div className="price">{formatPrice(product.price)}</div>
          <p className="description">{product.description}</p>

          <TryOnWidget
            productId={product.id}
            productTitle={product.title}
            productImage={product.image}
          />
        </div>
      </section>
    </main>
  );
}
