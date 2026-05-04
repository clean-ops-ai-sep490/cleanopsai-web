"use client";

import { useParams } from "next/navigation";

import { WorkflowCreateContainer } from "@/components/workflow/WorkflowCreateContainer";

export default function WorkflowEditPage() {
  const params = useParams();
  const sopId = params.id as string;

  return (
    <>
      <WorkflowCreateContainer sopId={sopId} />
    </>
  );
}
