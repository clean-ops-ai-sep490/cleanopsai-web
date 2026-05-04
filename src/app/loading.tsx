import { Card, CardContent } from "@/components/ui/card";
import { ListPageSkeleton } from "@/components/ui/page-skeleton";

export default function Loading() {
  return (
    <div className="min-h-screen bg-(--app-bg) px-4 py-8">
      <div className="mx-auto w-full max-w-[var(--app-max-content)]">
        <ListPageSkeleton cards={4} rows={6} />
      </div>
    </div>
  );
}
