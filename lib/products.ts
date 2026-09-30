import productsData from "@/data/products.json";

export interface Product {
  id: string;
  externalId: string;
  title: string;
  description: string;
  price: number;
  image: string;
}

const products = productsData as Product[];

export function getProducts(): Product[] {
  return products;
}

export function getProduct(id: string): Product | undefined {
  return products.find((product) => product.id === id);
}

export function formatPrice(price: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(price);
}
