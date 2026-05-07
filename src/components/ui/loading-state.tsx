import { LoadingSpinner } from "@/components/ui/loading-spinner";

interface LoadingStateProps {
  label?: string;
}

export function LoadingState({ label = "Đang tải dữ liệu..." }: LoadingStateProps) {
  return (
    <div className="flex w-full items-center justify-center p-12">
      <LoadingSpinner label={label} />
    </div>
  );
}

