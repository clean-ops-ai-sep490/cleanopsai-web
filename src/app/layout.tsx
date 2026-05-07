import type { Metadata } from "next";
import QueryProvider from "@/components/QueryProvider";
import { AuthProvider } from "@/contexts/AuthContext";
import { LoadingProvider } from "@/contexts/LoadingContext";
import { Toaster } from "@/components/ui/sonner";
import { Suspense } from "react";
import "./globals.css";

export const metadata: Metadata = {
  title: "CleanOps AI",
  description: "CleanOps AI Web App",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <QueryProvider>
          <AuthProvider>
            <Suspense fallback={null}>
              <LoadingProvider>
                {children}
                <Toaster />
              </LoadingProvider>
            </Suspense>
          </AuthProvider>
        </QueryProvider>
      </body>
    </html>
  );
}
