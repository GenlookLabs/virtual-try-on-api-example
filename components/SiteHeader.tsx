"use client";

import Link from "next/link";
import { useCustomerPhoto } from "@/components/CustomerPhotoProvider";

export function SiteHeader() {
  const { imageId, previewUrl, hasPhoto } = useCustomerPhoto();

  return (
    <header className="site-header">
      <div className="container site-header-inner">
        <Link href="/" className="brand">
          Demo Store
        </Link>

        <div className="header-actions">
          {hasPhoto && imageId ? (
            <div className="session-badge" title={imageId}>
              {previewUrl ? (
                <img src={previewUrl} alt="" className="session-thumb" />
              ) : null}
              <span>Photo ready</span>
            </div>
          ) : null}
        </div>
      </div>
    </header>
  );
}
