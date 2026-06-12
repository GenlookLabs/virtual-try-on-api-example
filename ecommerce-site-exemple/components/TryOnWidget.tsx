"use client";

import { useMemo, useRef, useState } from "react";
import { useCustomerPhoto } from "@/components/CustomerPhotoProvider";

interface TryOnWidgetProps {
  productId: string;
  productTitle: string;
  productImage: string;
}

type Phase = "idle" | "generating" | "completed" | "failed";

interface GenerationResponse {
  status: string;
  resultImageUrl?: string;
  errorMessage?: string;
}

const POLL_INTERVAL_MS = 2000;

export function TryOnWidget({ productId, productTitle, productImage }: TryOnWidgetProps) {
  const { imageId, isUploading, uploadError, hasPhoto, uploadPhoto, clearPhoto } =
    useCustomerPhoto();

  const inputRef = useRef<HTMLInputElement>(null);
  const [resultUrl, setResultUrl] = useState<string | null>(null);
  const [phase, setPhase] = useState<Phase>("idle");
  const [message, setMessage] = useState<string | null>(null);
  const [useMock, setUseMock] = useState(true);

  const isGenerating = phase === "generating";
  const isBusy = isUploading || isGenerating;
  const activeStep = hasPhoto ? 2 : 1;

  const statusClass = useMemo(() => {
    if (phase === "failed" || uploadError) return "error";
    if (phase === "completed") return "success";
    return "info";
  }, [phase, uploadError]);

  async function handleFileChange(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;

    setResultUrl(null);
    setPhase("idle");
    setMessage(null);

    try {
      await uploadPhoto(file);
      setMessage("Photo saved for this session — try on any product.");
    } catch {
      // uploadError set in context
    } finally {
      event.target.value = "";
    }
  }

  async function pollGeneration(generationId: string): Promise<void> {
    while (true) {
      const response = await fetch(`/api/generations/${generationId}`);
      const payload = (await response.json()) as GenerationResponse & { error?: string };

      if (!response.ok) {
        throw new Error(payload.error ?? "Failed to fetch generation status.");
      }

      if (payload.status === "COMPLETED") {
        if (!payload.resultImageUrl) {
          throw new Error("Generation completed but no result image was returned.");
        }
        setResultUrl(payload.resultImageUrl);
        setPhase("completed");
        setMessage("Your virtual try-on is ready.");
        return;
      }

      if (payload.status === "FAILED") {
        throw new Error(payload.errorMessage ?? "Try-on generation failed.");
      }

      setMessage(`Generation status: ${payload.status.toLowerCase()}…`);
      await new Promise((resolve) => setTimeout(resolve, POLL_INTERVAL_MS));
    }
  }

  async function handleTryOn() {
    if (!imageId) {
      setPhase("failed");
      setMessage("Upload your photo first.");
      return;
    }

    setPhase("generating");
    setMessage("Starting try-on with your saved imageId…");
    setResultUrl(null);

    try {
      const response = await fetch("/api/try-on", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ productId, imageId, useMock }),
      });

      const payload = (await response.json()) as { generationId?: string; error?: string };

      if (!response.ok || !payload.generationId) {
        throw new Error(payload.error ?? "Failed to start try-on.");
      }

      setMessage("Generating your try-on result…");
      await pollGeneration(payload.generationId);
    } catch (error) {
      setPhase("failed");
      setMessage(error instanceof Error ? error.message : "Something went wrong.");
    }
  }

  function handleClearPhoto() {
    clearPhoto();
    setResultUrl(null);
    setPhase("idle");
    setMessage(null);
  }

  return (
    <div className="tryon-widget">
      <div className="tryon-widget-header">
        <div>
          <div className="tryon-widget-kicker">Virtual fitting room</div>
          <h2 className="tryon-widget-title">Try it on</h2>
        </div>
        <div className="stepper" aria-label="Try-on steps">
          <div className={`stepper-item ${activeStep >= 1 ? "active" : ""} ${hasPhoto ? "done" : ""}`}>
            <span className="stepper-dot">1</span>
            <span>Upload</span>
          </div>
          <div className="stepper-line" />
          <div className={`stepper-item ${activeStep >= 2 ? "active" : ""}`}>
            <span className="stepper-dot">2</span>
            <span>Try-on</span>
          </div>
        </div>
      </div>

      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        onChange={handleFileChange}
        disabled={isBusy}
        className="sr-only"
        id={`tryon-upload-${productId}`}
      />

      <div className="tryon-widget-body">
        {!hasPhoto ? (
          <section className="widget-step">
            <div className="widget-step-head">
              <span className="step-label">Step 1</span>
              <h3>Upload your photo</h3>
            </div>
            <p className="description">
              Calls <code>POST /images/upload</code>. Your <code>imageId</code> is saved for the whole
              session — browse other products without re-uploading.
            </p>

            <button
              className="upload-dropzone"
              type="button"
              onClick={() => inputRef.current?.click()}
              disabled={isUploading}
            >
              <span className="upload-dropzone-title">
                {isUploading ? "Uploading…" : "Choose a photo"}
              </span>
              <span className="upload-dropzone-hint">JPEG, PNG, or WebP · max 10 MB</span>
            </button>

            {uploadError ? <div className="status error">{uploadError}</div> : null}
          </section>
        ) : (
          <section className="widget-step">
            <div className="widget-step-head">
              <span className="step-label">Step 2</span>
              <h3>Generate try-on</h3>
            </div>
            <p className="description">
              Calls <code>POST /try-on</code> with <code>customer.id</code> referencing your saved{" "}
              <code>imageId</code> for <strong>{productTitle}</strong>.
            </p>

            <div className="preview-row">
              <div>
                <div className="preview-label">Product</div>
                <div className="preview-box">
                  <img src={productImage} alt={productTitle} />
                </div>
              </div>
              <div>
                <div className="preview-label">Result</div>
                <div className="preview-box preview-box-result">
                  {resultUrl ? (
                    <img src={resultUrl} alt="Virtual try-on result" />
                  ) : (
                    <div className="preview-placeholder">Ready to generate</div>
                  )}
                </div>
              </div>
            </div>

            <label className="checkbox-row">
              <input
                type="checkbox"
                checked={useMock}
                onChange={(event) => setUseMock(event.target.checked)}
                disabled={isBusy}
              />
              Use mock engine (free, instant)
            </label>

            <button className="btn btn-full" type="button" onClick={handleTryOn} disabled={isBusy}>
              {isGenerating ? "Generating…" : "Try it on"}
            </button>

            <button
              className="photo-reset"
              type="button"
              onClick={handleClearPhoto}
              disabled={isBusy}
            >
              Use a different photo
            </button>
          </section>
        )}
      </div>

      {message ? <div className={`status ${statusClass}`}>{message}</div> : null}
    </div>
  );
}
