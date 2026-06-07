import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ShieldOff, ArrowLeft } from "lucide-react";
import Image from "next/image";

export default function UnauthorizedPage() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-[#f4f7fb] px-4">
      {/* Logo */}
      <div className="mb-10 flex items-center gap-2">
        <Image src="/logo.png" alt="CleanOps AI" width={36} height={36} className="object-contain" />
        <span className="font-bold text-[#1a80a2] text-lg">CleanOps AI</span>
      </div>

      <div className="w-full max-w-md bg-white rounded-2xl shadow-[0_24px_80px_rgba(15,23,42,0.08)] p-10 text-center animate-rise-in">
        {/* Icon */}
        <div className="flex justify-center mb-6">
          <div className="w-20 h-20 rounded-2xl bg-amber-50 border border-amber-100 flex items-center justify-center">
            <ShieldOff className="w-9 h-9 text-amber-500" />
          </div>
        </div>

        {/* Status code */}
        <p className="text-xs font-semibold tracking-widest text-amber-500 uppercase mb-2">
          Lỗi 403 — Không có quyền
        </p>

        <h1 className="text-2xl font-bold text-slate-900 mb-3">
          Truy cập bị từ chối
        </h1>
        <p className="text-slate-500 text-sm leading-relaxed mb-8">
          Bạn không có quyền truy cập vào trang này.<br />
          Hãy đăng nhập bằng tài khoản có vai trò phù hợp.
        </p>

        <Button asChild className="w-full h-11 bg-[#1a80a2] hover:bg-[#0d6b8c] text-white font-medium transition-colors">
          <Link href="/login" className="flex items-center gap-2">
            <ArrowLeft className="w-4 h-4" />
            Về trang đăng nhập
          </Link>
        </Button>
      </div>

      <p className="mt-6 text-xs text-slate-400">
        Nếu bạn cho rằng đây là lỗi, hãy liên hệ quản trị viên.
      </p>
    </div>
  );
}
