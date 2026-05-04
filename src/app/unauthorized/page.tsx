import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ShieldAlert } from "lucide-react";

export default function UnauthorizedPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-[var(--app-bg)] px-4">
      <Card className="w-full max-w-lg shadow-[var(--app-shadow)]">
        <CardHeader>
          <div className="mb-2 flex h-14 w-14 items-center justify-center rounded-2xl bg-amber-100 text-amber-600">
            <ShieldAlert className="h-7 w-7" />
          </div>
          <CardTitle>Không có quyền truy cập</CardTitle>
          <CardDescription>
            Bạn không có quyền truy cập vào trang này. Hãy đăng nhập bằng tài khoản phù hợp.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button asChild className="w-full"><Link href="/login">Về trang đăng nhập</Link></Button>
        </CardContent>
      </Card>
    </div>
  );
}
