import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { FileX } from "lucide-react";

export default function NotFound() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-(--app-bg) px-4">
      <Card className="w-full max-w-lg shadow-[var(--app-shadow)]">
        <CardHeader>
          <CardTitle>Không tìm thấy trang</CardTitle>
          <CardDescription>Trang bạn đang tìm đã bị xóa, đổi đường dẫn hoặc không tồn tại.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <EmptyState
            title="404 - Trang không tồn tại"
            description="Quay lại dashboard để tiếp tục thao tác."
            icon={<FileX className="h-10 w-10" />}
          />
          <div className="flex justify-center gap-3">
            <Button asChild variant="outline"><Link href="/">Về trang chủ</Link></Button>
            <Button asChild><Link href="/manager">Về dashboard</Link></Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
