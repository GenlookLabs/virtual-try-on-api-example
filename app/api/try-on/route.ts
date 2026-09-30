import { readFile } from "node:fs/promises";
import path from "node:path";
import { GenlookApiError, getGenlookClient, tryOnSync, useMockEngine } from "@/lib/genlook";
import { errorMessage } from "@/lib/api-errors";
import { mimeTypeFromPath } from "@/lib/mime";
import { getProduct, type Product } from "@/lib/products";

export const runtime = "nodejs";

interface TryOnRequestBody {
  productId?: string;
  imageId?: string;
  useMock?: boolean;
}

/**
 * Register the product once (POST /products). Genlook analyzes it right away,
 * so its first try-on is faster, and later try-ons only send the externalId.
 */
async function registerProduct(product: Product, externalId: string, mock: boolean) {
  const productPath = path.join(process.cwd(), "public", product.image.replace(/^\//, ""));
  await getGenlookClient().products.upsert({
    externalId,
    // A product titled "mock" returns the person photo unchanged: free to test the flow.
    title: mock ? "mock" : product.title,
    description: product.description,
    images: [{ source: { fileKey: "product" } }],
    files: {
      product: {
        data: await readFile(productPath),
        filename: path.basename(productPath),
        mimeType: mimeTypeFromPath(productPath),
      },
    },
  });
}

export async function POST(request: Request) {
  try {
    const { productId, imageId, useMock } = (await request.json()) as TryOnRequestBody;

    if (typeof productId !== "string" || !productId) {
      return Response.json({ error: "Missing productId." }, { status: 400 });
    }
    if (typeof imageId !== "string" || !imageId) {
      return Response.json({ error: "Missing imageId. Upload a photo first." }, { status: 400 });
    }

    const product = getProduct(productId);
    if (!product) {
      return Response.json({ error: "Unknown product." }, { status: 404 });
    }

    const mock = Boolean(useMock) || useMockEngine();
    const externalId = mock ? `${product.externalId}-mock` : product.externalId;
    const body = {
      products: [{ externalId }],
      person: { image: { source: { id: imageId } } },
    };

    let result;
    try {
      result = await tryOnSync(body);
    } catch (error) {
      if (!(error instanceof GenlookApiError) || error.code !== "PRODUCT_NOT_FOUND") throw error;
      // First try-on of this product on your account: register it, then retry.
      await registerProduct(product, externalId, mock);
      result = await tryOnSync(body);
    }

    return Response.json(result);
  } catch (error) {
    return Response.json({ error: errorMessage(error) }, { status: 500 });
  }
}
