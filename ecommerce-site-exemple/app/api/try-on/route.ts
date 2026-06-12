import { readFile } from "node:fs/promises";
import path from "node:path";
import { getGenlookClient, useMockEngine } from "@/lib/genlook";
import { errorMessage } from "@/lib/api-errors";
import { mimeTypeFromPath } from "@/lib/mime";
import { getProduct } from "@/lib/products";

export const runtime = "nodejs";

interface TryOnRequestBody {
  productId?: string;
  imageId?: string;
  useMock?: boolean;
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as TryOnRequestBody;
    const { productId, imageId, useMock: useMockFromClient } = body;

    if (typeof productId !== "string" || !productId) {
      return Response.json({ error: "Missing productId." }, { status: 400 });
    }

    if (typeof imageId !== "string" || !imageId) {
      return Response.json({ error: "Missing imageId. Upload a customer photo first." }, { status: 400 });
    }

    const product = getProduct(productId);
    if (!product) {
      return Response.json({ error: "Unknown product." }, { status: 404 });
    }

    const client = getGenlookClient();
    const productPath = path.join(process.cwd(), "public", product.image.replace(/^\//, ""));
    const productBytes = await readFile(productPath);
    const productFilename = path.basename(productPath);
    const productMimeType = mimeTypeFromPath(productPath);

    const shouldMock = useMockFromClient || useMockEngine();

    const generation = await client.tryOn.create({
      product: {
        externalId: product.externalId,
        title: shouldMock ? "mock" : product.title,
        description: product.description,
        images: [{ fileKey: "product" }],
      },
      customer: { id: imageId },
      files: {
        product: {
          data: productBytes,
          filename: productFilename,
          mimeType: productMimeType,
        },
      },
    });

    return Response.json({ generationId: generation.generationId });
  } catch (error) {
    return Response.json({ error: errorMessage(error) }, { status: 500 });
  }
}
