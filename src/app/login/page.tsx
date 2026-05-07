"use client";

import { useAuth } from "@/contexts/AuthContext";
import { getMe } from "@/lib/auth-api";
import { useRouter } from "next/navigation";
import { useState, useEffect, type FormEvent } from "react";
import { getRouteByRole } from "@/lib/auth-utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

import { LoadingSpinner } from "@/components/ui/loading-spinner";

export default function LoginPage() {

  const { login, isAuthenticated, isLoading, user } = useAuth();
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Auto redirect if already logged in
  useEffect(() => {
    if (!isLoading && isAuthenticated && user) {
      const redirectPath = getRouteByRole(user.role);
      window.location.href = redirectPath;
    }
  }, [isAuthenticated, isLoading, user]);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError("");
    setIsSubmitting(true);

    try {
      await login({ email, password });
      try {
        const me = await getMe();
        router.push(getRouteByRole(me.role));
      } catch {
        router.push(getRouteByRole(undefined));
      }
    } catch {
      setError("Email hoặc mật khẩu không đúng");
    } finally {
      setIsSubmitting(false);
    }
  }

  if (isLoading || isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#f8fafc] px-4">
        <LoadingSpinner 
          size={50} 
          label="Hệ thống đang chuyển hướng bạn..." 
        />
      </div>
    );
  }




  return (
    <div className="min-h-screen flex items-center justify-center bg-[var(--app-bg)] px-4">
      <Card className="w-full max-w-md shadow-[var(--app-shadow)]">
        <CardHeader>
          <CardTitle>Đăng nhập</CardTitle>
          <CardDescription>Truy cập hệ thống OPMS bằng tài khoản của bạn.</CardDescription>
        </CardHeader>
        <CardContent>
          {error ? <div className="mb-4 rounded-[var(--radius-md)] border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-700">{error}</div> : null}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <label htmlFor="email" className="text-sm font-medium text-slate-700">Email</label>
              <Input id="email" type="email" required value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" />
            </div>
            <div className="space-y-2">
              <label htmlFor="password" className="text-sm font-medium text-slate-700">Mật khẩu</label>
              <Input id="password" type="password" required value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" />
            </div>
            <Button type="submit" className="w-full" disabled={isSubmitting}>{isSubmitting ? "Đang đăng nhập..." : "Đăng nhập"}</Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
