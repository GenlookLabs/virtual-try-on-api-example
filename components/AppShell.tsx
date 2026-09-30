"use client";

import { CustomerPhotoProvider } from "@/components/CustomerPhotoProvider";
import { SiteHeader } from "@/components/SiteHeader";

export function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <CustomerPhotoProvider>
      <SiteHeader />
      {children}
    </CustomerPhotoProvider>
  );
}
