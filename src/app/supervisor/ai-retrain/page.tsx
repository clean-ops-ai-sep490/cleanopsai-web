"use client";

import { Suspense } from "react";
import { AiRetrainContainer } from "@/components/ai-retrain/AiRetrainContainer";

export default function AiRetrainPage() {
  return (
    <Suspense fallback={null}>
      <AiRetrainContainer />
    </Suspense>
  );
}
