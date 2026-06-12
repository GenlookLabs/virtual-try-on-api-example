"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";

interface CustomerPhotoState {
  imageId: string | null;
  imageUrl: string | null;
  previewUrl: string | null;
  isUploading: boolean;
  uploadError: string | null;
}

interface CustomerPhotoContextValue extends CustomerPhotoState {
  uploadPhoto: (file: File) => Promise<void>;
  clearPhoto: () => void;
  hasPhoto: boolean;
}

const CustomerPhotoContext = createContext<CustomerPhotoContextValue | null>(null);

export function CustomerPhotoProvider({ children }: { children: ReactNode }) {
  const [imageId, setImageId] = useState<string | null>(null);
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);

  useEffect(() => {
    return () => {
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
      }
    };
  }, [previewUrl]);

  const clearPhoto = useCallback(() => {
    setImageId(null);
    setImageUrl(null);
    setUploadError(null);
    setPreviewUrl((current) => {
      if (current) {
        URL.revokeObjectURL(current);
      }
      return null;
    });
  }, []);

  const uploadPhoto = useCallback(async (file: File) => {
    setIsUploading(true);
    setUploadError(null);

    const nextPreviewUrl = URL.createObjectURL(file);
    setPreviewUrl((current) => {
      if (current) {
        URL.revokeObjectURL(current);
      }
      return nextPreviewUrl;
    });

    try {
      const formData = new FormData();
      formData.append("file", file);

      const response = await fetch("/api/images/upload", {
        method: "POST",
        body: formData,
      });

      const payload = (await response.json()) as {
        imageId?: string;
        imageUrl?: string;
        error?: string;
      };

      if (!response.ok || !payload.imageId) {
        throw new Error(payload.error ?? "Failed to upload customer photo.");
      }

      setImageId(payload.imageId);
      setImageUrl(payload.imageUrl ?? null);
    } catch (error) {
      clearPhoto();
      setUploadError(error instanceof Error ? error.message : "Upload failed.");
      throw error;
    } finally {
      setIsUploading(false);
    }
  }, [clearPhoto]);

  const value = useMemo<CustomerPhotoContextValue>(
    () => ({
      imageId,
      imageUrl,
      previewUrl,
      isUploading,
      uploadError,
      uploadPhoto,
      clearPhoto,
      hasPhoto: Boolean(imageId),
    }),
    [imageId, imageUrl, previewUrl, isUploading, uploadError, uploadPhoto, clearPhoto],
  );

  return (
    <CustomerPhotoContext.Provider value={value}>{children}</CustomerPhotoContext.Provider>
  );
}

export function useCustomerPhoto(): CustomerPhotoContextValue {
  const context = useContext(CustomerPhotoContext);

  if (!context) {
    throw new Error("useCustomerPhoto must be used within CustomerPhotoProvider.");
  }

  return context;
}
