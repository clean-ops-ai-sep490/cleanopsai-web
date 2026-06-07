"use client";

import { useAuth } from "@/contexts/AuthContext";
import { getMe } from "@/lib/auth-api";
import { useRouter } from "next/navigation";
import { useState, useEffect, type FormEvent } from "react";
import { getRouteByRole } from "@/lib/auth-utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useHasMounted } from "@/hooks/use-has-mounted";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { Eye, EyeOff, ShieldCheck, BarChart3, RefreshCcw } from "lucide-react";
import Image from "next/image";

export default function LoginPage() {
  const { login, isAuthenticated, isLoading, user } = useAuth();
  const hasMounted = useHasMounted();
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (!isLoading && isAuthenticated && user) {
      window.location.href = getRouteByRole(user.role);
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

  if (!hasMounted || isLoading || isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#f4f7fb]">
        <LoadingSpinner size={50} label="Hệ thống đang chuyển hướng bạn..." />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex">
      {/* Left brand panel */}
      <div className="hidden lg:flex lg:w-[52%] flex-col justify-between relative overflow-hidden bg-gradient-to-br from-[#1a80a2] via-[#0d6b8c] to-[#004D64] p-12">
        {/* Decorative circles */}
        <div className="absolute -top-32 -left-32 w-[420px] h-[420px] rounded-full bg-white/5" />
        <div className="absolute top-1/3 -right-40 w-96 h-96 rounded-full bg-white/5" />
        <div className="absolute -bottom-24 left-1/4 w-72 h-72 rounded-full bg-white/5" />
        <div className="absolute top-[22%] left-[38%] w-2 h-2 rounded-full bg-white/40" />
        <div className="absolute top-[55%] left-[20%] w-1.5 h-1.5 rounded-full bg-white/30" />
        <div className="absolute bottom-[30%] right-[28%] w-2 h-2 rounded-full bg-white/40" />

        {/* Logo */}
        <div className="relative z-10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center">
              <Image src="/logo.png" alt="CleanOps AI" width={36} height={36} className="object-contain" />
            </div>
            <span className="text-white font-bold text-lg tracking-wide">CleanOps AI</span>
          </div>
        </div>

        {/* Main hero */}
        <div className="relative z-10 space-y-8">
          <div>
            <h1 className="text-4xl xl:text-5xl font-bold text-white leading-tight mb-4">
              Quản lý vận hành<br />thông minh hơn
            </h1>
            <p className="text-white/70 text-lg leading-relaxed max-w-xs">
              Nền tảng AI giám sát chất lượng vệ sinh công nghiệp theo thời gian thực.
            </p>
          </div>

          <div className="space-y-4">
            {[
              { icon: BarChart3, text: "Chấm điểm ảnh tự động bằng YOLOv8 + U-Net" },
              { icon: ShieldCheck, text: "Quy trình duyệt và gán nhãn minh bạch" },
              { icon: RefreshCcw, text: "Retrain model liên tục từ phản hồi thực tế" },
            ].map(({ icon: Icon, text }) => (
              <div key={text} className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-white/15 flex items-center justify-center flex-shrink-0">
                  <Icon className="w-4 h-4 text-white" />
                </div>
                <span className="text-white/80 text-sm">{text}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Bottom badge */}
        <div className="relative z-10">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 border border-white/20">
            <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
            <span className="text-white/70 text-xs font-medium">SP26SE111 — Capstone 2026</span>
          </div>
        </div>
      </div>

      {/* Right form panel */}
      <div className="flex-1 flex items-center justify-center bg-white px-8 py-12">
        <div className="w-full max-w-sm animate-rise-in">
          {/* Mobile logo */}
          <div className="lg:hidden flex items-center gap-2 mb-8 justify-center">
            <Image src="/logo.png" alt="CleanOps AI" width={36} height={36} className="object-contain" />
            <span className="font-bold text-[#1a80a2] text-lg">CleanOps AI</span>
          </div>

          <div className="mb-8">
            <h2 className="text-2xl font-bold text-slate-900">Chào mừng trở lại</h2>
            <p className="text-slate-500 mt-1 text-sm">Đăng nhập để tiếp tục làm việc</p>
          </div>

          {error && (
            <div className="mb-5 rounded-lg border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700 flex items-center gap-2">
              <div className="w-1.5 h-1.5 rounded-full bg-rose-500 flex-shrink-0" />
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-1.5">
              <label htmlFor="email" className="text-sm font-medium text-slate-700">Email</label>
              <Input
                id="email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                className="h-11"
              />
            </div>

            <div className="space-y-1.5">
              <label htmlFor="password" className="text-sm font-medium text-slate-700">Mật khẩu</label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="h-11 pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                  tabIndex={-1}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <Button
              type="submit"
              className="w-full h-11 bg-[#1a80a2] hover:bg-[#0d6b8c] text-white font-medium transition-colors mt-2"
              disabled={isSubmitting}
            >
              {isSubmitting ? "Đang đăng nhập..." : "Đăng nhập"}
            </Button>
          </form>

          <p className="mt-6 text-center text-xs text-slate-400">
            Hệ thống dành riêng cho nhân viên CleanOps
          </p>
        </div>
      </div>
    </div>
  );
}
