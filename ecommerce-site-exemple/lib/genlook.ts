import { Genlook } from "@genlook/api";

let client: Genlook | null = null;

export function getGenlookClient(): Genlook {
  const apiKey = process.env.GENLOOK_API_KEY;

  if (!apiKey) {
    throw new Error("GENLOOK_API_KEY is not set. Copy .env.example to .env.local and add your key.");
  }

  if (!client) {
    client = new Genlook({
      apiKey,
      baseUrl: process.env.GENLOOK_BASE_URL,
    });
  }

  return client;
}

export function useMockEngine(): boolean {
  return process.env.GENLOOK_USE_MOCK === "true";
}
