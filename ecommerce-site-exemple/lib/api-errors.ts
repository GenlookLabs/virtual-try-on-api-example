import {
  GenlookError,
  GenerationFailedError,
  GenerationNotFoundError,
  InsufficientCreditsError,
  ProductNotFoundError,
} from "@genlook/api";

export function errorMessage(error: unknown): string {
  if (error instanceof InsufficientCreditsError) {
    return "Insufficient credits. Top up your Genlook account and try again.";
  }

  if (error instanceof ProductNotFoundError) {
    return "Product not found in your Genlook catalog. This demo upserts inline, so retry once.";
  }

  if (error instanceof GenerationNotFoundError) {
    return "Generation not found.";
  }

  if (error instanceof GenerationFailedError) {
    return error.message;
  }

  if (error instanceof GenlookError) {
    return error.message;
  }

  if (error instanceof Error) {
    return error.message;
  }

  return "Unexpected server error.";
}
