"use client";

import { useEffect } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { AlertTriangle } from "lucide-react";

export default function Error({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-(--app-bg) px-4">
      <Card className="w-full max-w-lg shadow-[var(--app-shadow)]">
        <CardHeader>
          <div className="mb-2 flex h-14 w-14 items-center justify-center rounded-2xl bg-rose-100 text-rose-600">
            <AlertTriangle className="h-7 w-7" />
          </div>
          <CardTitle>Đã xảy ra lỗi</CardTitle>
          <CardDescription>Hệ thống gặp sự cố tạm thời. Bạn có thể thử lại hoặc quay về trang an toàn.</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-3 sm:flex-row">
          <Button onClick={reset}>Thử lại</Button>
          <Button asChild variant="outline"><Link href="/manager">Về dashboard</Link></Button>
        </CardContent>
      </Card>
    </div>
  );
}
