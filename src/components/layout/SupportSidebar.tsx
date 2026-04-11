"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { Building2, Award, Star } from "lucide-react";

export function SupportSidebar() {
  const pathname = usePathname();

  const items = [
    { name: "Thiết bị", href: "/support/equipments", icon: Building2 },
    { name: "Chứng chỉ", href: "/support/certifications", icon: Award },
    { name: "Kỹ năng", href: "/support/skills", icon: Star },
  ];

  return (
    <aside className="fixed left-0 top-0 h-screen w-[240px] bg-[#f9fafb] border-r border-gray-200 flex flex-col">
      <div className="h-[106px] flex items-center px-6 border-b border-gray-200 flex-shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-[58px] h-[58px] bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center flex-shrink-0">
            <span className="text-white font-bold text-[20px]">S</span>
          </div>
          <span className="text-[18px] font-semibold whitespace-nowrap" style={{ color: "black" }}>
            Support
          </span>
        </div>
      </div>

      <nav className="flex-1 py-5 overflow-y-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
        <ul className="space-y-2" style={{ listStyle: "none", paddingLeft: 0 }}>
          {items.map((item) => {
            const isActive = pathname === item.href || pathname.startsWith(item.href + "/");
            const Icon = item.icon;
            return (
              <li key={item.name} style={{ listStyle: "none" }}>
                <Link
                  href={item.href}
                  className={cn(
                    "group flex items-center py-3 px-[18px] text-[16px] font-medium transition-colors relative no-underline",
                    isActive ? "bg-[#1a80a2] text-white rounded-tr-[10px]" : "text-black hover:text-[#1a80a2]",
                  )}
                >
                  <Icon className={cn("w-5 h-5 flex-shrink-0 transition-colors", isActive ? "text-white" : "text-black group-hover:text-[#1a80a2]")}
                    style={{ marginRight: "10px" }}
                  />
                  <span className={cn(isActive ? "text-white" : "text-black group-hover:text-[#1a80a2]")}>{item.name}</span>
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>
    </aside>
  );
}
