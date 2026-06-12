import { getGenlookClient } from "@/lib/genlook";
import { errorMessage } from "@/lib/api-errors";

export const runtime = "nodejs";

interface RouteContext {
  params: Promise<{ id: string }>;
}

export async function GET(_request: Request, context: RouteContext) {
  try {
    const { id } = await context.params;
    const client = getGenlookClient();
    const generation = await client.generations.retrieve(id);

    return Response.json({
      status: generation.status,
      resultImageUrl: generation.resultImageUrl,
      errorMessage: generation.errorMessage,
    });
  } catch (error) {
    return Response.json({ error: errorMessage(error) }, { status: 500 });
  }
}
