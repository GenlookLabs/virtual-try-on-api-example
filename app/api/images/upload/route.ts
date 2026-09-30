import { getGenlookClient } from "@/lib/genlook";
import { errorMessage } from "@/lib/api-errors";

export const runtime = "nodejs";

export async function POST(request: Request) {
  try {
    const form = await request.formData();
    const file = form.get("file");

    if (!(file instanceof File)) {
      return Response.json({ error: "Missing customer photo." }, { status: 400 });
    }

    const client = getGenlookClient();
    const photoBytes = new Uint8Array(await file.arrayBuffer());

    const { imageId, imageUrl } = await client.images.upload(photoBytes, {
      mimeType: file.type || "image/jpeg",
      filename: file.name || "customer.jpg",
    });

    return Response.json({ imageId, imageUrl });
  } catch (error) {
    return Response.json({ error: errorMessage(error) }, { status: 500 });
  }
}
