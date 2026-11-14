"use client";

import Sidebar from "@/app/admin/Sidebar";

// Buttons shared by every admin page
export const ADMIN_PRIMARY_BUTTON =
  "h-11 px-5 rounded-xl bg-white text-black text-sm font-medium hover:bg-white/90 transition-colors flex items-center justify-center gap-2 w-full sm:w-fit";

export const ADMIN_GHOST_BUTTON =
  "h-11 px-5 rounded-xl border border-white/10 bg-white/[0.04] text-sm hover:bg-white/[0.08] hover:border-white/20 transition-colors flex items-center justify-center gap-2 w-full sm:w-fit";

// Card surface shared by every admin page
export const ADMIN_CARD = "rounded-[24px] border border-white/10 bg-white/[0.03]";

// Page frame for every admin screen: sidebar, consistent width and padding,
// and one header layout (title, subtitle, optional action on the right)
export default function AdminShell({
  title,
  subtitle,
  action,
  children,
}: {
  title: string;
  subtitle: string;
  action?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white">
      <Sidebar />

      <main className="lg:ml-[250px] min-h-screen px-4 sm:px-6 lg:px-8 pt-[94px] lg:pt-8 pb-8">
        <div className="max-w-[1400px] mx-auto">
          <header className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-7">
            <div>
              <h1 className="text-2xl sm:text-3xl font-semibold tracking-tight">{title}</h1>
              <p className="text-sm text-white/40 mt-1">{subtitle}</p>
            </div>

            {action}
          </header>

          {children}
        </div>
      </main>
    </div>
  );
}
