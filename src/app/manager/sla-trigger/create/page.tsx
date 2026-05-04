"use client";

import { useEffect, useState } from "react";
import { DetailPageSkeleton } from "@/components/ui/page-skeleton";
import { SLACreateContainer } from "@/components/sla/SLACreateContainer";

export default function CreateSLAPage() {
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setReady(true), 0);
    return () => clearTimeout(t);
  }, []);

  return (
    <>
      {ready ? <SLACreateContainer /> : <DetailPageSkeleton />}
    </>
  );
}
