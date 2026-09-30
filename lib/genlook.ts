import { Genlook } from "@genlook/api";

const DEFAULT_BASE_URL = "https://api.genlook.app/tryon/v1";

let client: Genlook | null = null;

function apiKey(): string {
  const key = process.env.GENLOOK_API_KEY;
  if (!key) {
    throw new Error("GENLOOK_API_KEY is not set. Copy .env.example to .env.local and add your key.");
  }
  return key;
}

function baseUrl(): string {
  return process.env.GENLOOK_BASE_URL ?? DEFAULT_BASE_URL;
}

export function getGenlookClient(): Genlook {
  if (!client) {
    client = new Genlook({ apiKey: apiKey(), baseUrl: process.env.GENLOOK_BASE_URL });
  }
  return client;
}

export function useMockEngine(): boolean {
  return process.env.GENLOOK_USE_MOCK === "true";
}

export interface SyncTryOnResult {
  /** 200: the result is ready. 202: still running, poll `generationId`. */
  status: 200 | 202;
  generationId: string;
  resultImageUrl?: string;
}

/** Thrown for API error responses; `code` is the Genlook error code (e.g. PRODUCT_NOT_FOUND). */
export class GenlookApiError extends Error {
  constructor(
    public readonly code: string,
    message: string,
    public readonly httpStatus: number,
  ) {
    super(message);
  }
}

/**
 * `POST /try-on/sync`: one request, the result comes back in the response.
 * The request stays open up to 90 seconds, then answers 202 with the id to poll.
 */
export async function tryOnSync(body: unknown): Promise<SyncTryOnResult> {
  const response = await fetch(`${baseUrl()}/try-on/sync`, {
    method: "POST",
    headers: { "x-api-key": apiKey(), "Content-Type": "application/json" },
    body: JSON.stringify(body),
    signal: AbortSignal.timeout(100_000),
  });
  const payload = await response.json();

  if (!response.ok) {
    throw new GenlookApiError(
      payload.code ?? "UNKNOWN",
      payload.message ?? "Try-on failed.",
      response.status,
    );
  }

  return {
    status: response.status === 202 ? 202 : 200,
    generationId: payload.generationId,
    resultImageUrl: payload.resultImageUrl,
  };
}
