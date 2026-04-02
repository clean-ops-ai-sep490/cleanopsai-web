"use client";

import { DashboardLayout } from "@/components/layout/DashboardLayout";

export default function DashboardPage() {
  return (
    <DashboardLayout>
      <div className="space-y-8">
        {/* Top 4 cards with gradients - empty as per Figma */}
        <div className="flex gap-10">
          {/* Card 1 - Red gradient */}
          <div
            className="w-[250px] h-[165px] rounded-lg shadow-[3px_-2px_10px_0px_rgba(0,0,0,0.25)]"
            style={{
              backgroundImage:
                'url(\'data:image/svg+xml;utf8,<svg viewBox="0 0 250 165" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="none"><rect x="0" y="0" height="100%" width="100%" fill="url(%23grad)" opacity="1"/><defs><radialGradient id="grad" gradientUnits="userSpaceOnUse" cx="0" cy="0" r="10" gradientTransform="matrix(26 -47.35 71.742 39.394 34 392)"><stop stop-color="rgba(190,40,40,1)" offset="0.11063"/><stop stop-color="rgba(198,66,66,1)" offset="0.1581"/><stop stop-color="rgba(206,93,93,1)" offset="0.20558"/><stop stop-color="rgba(214,120,120,1)" offset="0.25306"/><stop stop-color="rgba(222,147,147,1)" offset="0.30054"/><stop stop-color="rgba(239,201,201,1)" offset="0.39549"/><stop stop-color="rgba(255,255,255,1)" offset="0.49045"/></radialGradient></defs></svg>\')',
            }}
          />

          {/* Card 2 - Green gradient */}
          <div
            className="w-[250px] h-[165px] rounded-lg shadow-[3px_-2px_10px_0px_rgba(0,0,0,0.25)]"
            style={{
              backgroundImage:
                'url(\'data:image/svg+xml;utf8,<svg viewBox="0 0 250 165" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="none"><rect x="0" y="0" height="100%" width="100%" fill="url(%23grad)" opacity="1"/><defs><radialGradient id="grad" gradientUnits="userSpaceOnUse" cx="0" cy="0" r="10" gradientTransform="matrix(26 -47.35 71.742 39.394 34 392)"><stop stop-color="rgba(40,190,120,1)" offset="0.11063"/><stop stop-color="rgba(66,198,136,1)" offset="0.1581"/><stop stop-color="rgba(93,206,153,1)" offset="0.20558"/><stop stop-color="rgba(147,222,187,1)" offset="0.30054"/><stop stop-color="rgba(201,239,221,1)" offset="0.39549"/><stop stop-color="rgba(255,255,255,1)" offset="0.49045"/></radialGradient></defs></svg>\')',
            }}
          />

          {/* Card 3 - Blue gradient */}
          <div
            className="w-[250px] h-[165px] rounded-lg shadow-[3px_-2px_10px_0px_rgba(0,0,0,0.25)]"
            style={{
              backgroundImage:
                'url(\'data:image/svg+xml;utf8,<svg viewBox="0 0 250 165" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="none"><rect x="0" y="0" height="100%" width="100%" fill="url(%23grad)" opacity="1"/><defs><radialGradient id="grad" gradientUnits="userSpaceOnUse" cx="0" cy="0" r="10" gradientTransform="matrix(26 -47.35 71.742 39.394 34 392)"><stop stop-color="rgba(10,77,172,1)" offset="0.11063"/><stop stop-color="rgba(25,89,177,1)" offset="0.13436"/><stop stop-color="rgba(40,100,183,1)" offset="0.1581"/><stop stop-color="rgba(71,122,193,1)" offset="0.20558"/><stop stop-color="rgba(102,144,203,1)" offset="0.25306"/><stop stop-color="rgba(132,166,214,1)" offset="0.30054"/><stop stop-color="rgba(194,211,234,1)" offset="0.39549"/><stop stop-color="rgba(255,255,255,1)" offset="0.49045"/></radialGradient></defs></svg>\')',
            }}
          />

          {/* Card 4 - Light green gradient */}
          <div
            className="w-[250px] h-[165px] rounded-lg shadow-[3px_-2px_10px_0px_rgba(0,0,0,0.25)]"
            style={{
              backgroundImage:
                'url(\'data:image/svg+xml;utf8,<svg viewBox="0 0 250 165" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="none"><rect x="0" y="0" height="100%" width="100%" fill="url(%23grad)" opacity="1"/><defs><radialGradient id="grad" gradientUnits="userSpaceOnUse" cx="0" cy="0" r="10" gradientTransform="matrix(26 -47.35 71.742 39.394 34 392)"><stop stop-color="rgba(125,190,40,1)" offset="0.11063"/><stop stop-color="rgba(141,198,66,1)" offset="0.1581"/><stop stop-color="rgba(157,206,93,1)" offset="0.20558"/><stop stop-color="rgba(190,222,147,1)" offset="0.30054"/><stop stop-color="rgba(222,239,201,1)" offset="0.39549"/><stop stop-color="rgba(255,255,255,1)" offset="0.49045"/></radialGradient></defs></svg>\')',
            }}
          />
        </div>

        {/* Middle 2 cards - empty white cards as per Figma */}
        <div className="flex gap-5">
          <div className="w-[680px] h-[403px] bg-white border border-black rounded-lg" />
          <div className="w-[403px] h-[402px] bg-white border border-black rounded-lg" />
        </div>

        {/* Bottom large card - empty white card as per Figma */}
        <div className="w-[1105px] h-[363px] bg-white border border-black rounded-lg" />
      </div>
    </DashboardLayout>
  );
}
