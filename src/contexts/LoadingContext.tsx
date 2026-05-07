"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { usePathname, useSearchParams } from "next/navigation";
import { FullPageLoading } from "@/components/ui/loading-spinner";

interface LoadingContextType {
  isLoading: boolean;
  startLoading: (label?: string) => void;
  stopLoading: () => void;
}

const LoadingContext = createContext<LoadingContextType | undefined>(undefined);

export function LoadingProvider({ children }: { children: React.ReactNode }) {
  const [isLoading, setIsLoading] = useState(false);
  const [loadingLabel, setLoadingLabel] = useState<string | undefined>(undefined);
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const startLoading = (label?: string) => {
    setLoadingLabel(label);
    setIsLoading(true);
  };

  const stopLoading = () => {
    setIsLoading(false);
  };

  // Stop loading when pathname or search params change (navigation complete)
  useEffect(() => {
    stopLoading();
  }, [pathname, searchParams]);

  return (
    <LoadingContext.Provider value={{ isLoading, startLoading, stopLoading }}>
      {children}
      {isLoading && <FullPageLoading label={loadingLabel} />}
    </LoadingContext.Provider>
  );
}

export function useLoading() {
  const context = useContext(LoadingContext);
  if (context === undefined) {
    throw new Error("useLoading must be used within a LoadingProvider");
  }
  return context;
}
