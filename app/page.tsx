import Link from "next/link";
import { formatPrice, getProducts } from "@/lib/products";

export default function HomePage() {
  const products = getProducts();

  return (
    <main className="container">
      <section className="hero">
        <h1>Shop the collection</h1>
        <p>
          A minimal e-commerce mock powered by the Genlook virtual try-on API.
          Open any product, upload your photo once,
          then try on every item in the catalog.
        </p>
      </section>

      <section className="catalog-section">
        <h2 className="catalog-title">Browse products</h2>
        <div className="product-grid">
          {products.map((product) => (
            <Link key={product.id} href={`/product/${product.id}`} className="product-card">
              <div className="product-card-image">
                <img src={product.image} alt={product.title} />
              </div>
              <div className="product-card-body">
                <h2>{product.title}</h2>
                <p>{product.description}</p>
                <div className="price">{formatPrice(product.price)}</div>
              </div>
            </Link>
          ))}
        </div>
      </section>

      <p className="footer-note">
        Built with{" "}
        <a href="https://www.npmjs.com/package/@genlook/api" target="_blank" rel="noreferrer">
          @genlook/api
        </a>
        . See the{" "}
        <a href="https://genlook.app/docs/tryon-api/introduction" target="_blank" rel="noreferrer">
          API introduction
        </a>{" "}
        and{" "}
        <a href="https://genlook.app/docs/tryon-api/quickstart" target="_blank" rel="noreferrer">
          quickstart
        </a>
        . Get an API key at{" "}
        <a href="https://genlook.app/try-on/api" target="_blank" rel="noreferrer">
          genlook.app/try-on/api
        </a>
        .
      </p>
    </main>
  );
}
