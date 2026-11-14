"use client";

import Link from "next/link";
import {
  LayoutDashboard,
  Folder,
  MessageSquare,
  Inbox,
  Layers,
  Menu,
  X,
  LogOut,
  ExternalLink,
} from "lucide-react";
import { usePathname, useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect } from "react";

const MENUS = [
  { name: "Dashboard", icon: LayoutDashboard, path: "/admin/dashboard" },
  { name: "Projects", icon: Folder, path: "/admin/projects" },
  { name: "Messages", icon: Inbox, path: "/admin/messages" },
  { name: "Comments", icon: MessageSquare, path: "/admin/comments" },
  { name: "Tech Stack", icon: Layers, path: "/admin/tech" },
];

function SidebarContent({
  pathname,
  hideTitle = false,
}: {
  pathname: string;
  hideTitle?: boolean;
}) {
  const unread = useUnreadMessages();

  return (
    <>
      {/* TOP */}
      <div>
        {!hideTitle && (
          <h1 className="text-lg font-semibold mb-8 tracking-wide text-white">
            Admin Panel
          </h1>
        )}

        <nav className="space-y-1.5">
          {MENUS.map((menu) => {
            const Icon = menu.icon;
            const active = pathname.startsWith(menu.path);
            const badge = menu.path === "/admin/messages" ? unread : 0;

            return (
              <Link
                key={menu.path}
                href={menu.path}
                aria-current={active ? "page" : undefined}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-colors ${
                  active
                    ? "bg-white text-black"
                    : "text-white/60 hover:text-white hover:bg-white/[0.06]"
                }`}
              >
                <Icon size={17} />
                {menu.name}

                {badge > 0 && (
                  <span
                    className={`ml-auto min-w-5 h-5 px-1.5 rounded-full text-[11px] flex items-center justify-center ${
                      active ? "bg-black text-white" : "bg-emerald-400 text-black"
                    }`}
                  >
                    {badge}
                  </span>
                )}
              </Link>
            );
          })}
        </nav>
      </div>

      {/* BOTTOM */}
      <div className="space-y-1.5">
        <Link
          href="/"
          target="_blank"
          className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm text-white/60 hover:text-white hover:bg-white/[0.06] transition-colors"
        >
          <ExternalLink size={17} />
          View site
        </Link>
        <SignOutButton />
      </div>
    </>
  );
}

// Number of unread contact messages, kept live
function useUnreadMessages() {
  const [unread, setUnread] = useState(0);

  useEffect(() => {
    const load = () =>
      supabase
        .from("messages")
        .select("*", { count: "exact", head: true })
        .eq("is_read", false)
        .then(({ count }) => setUnread(count || 0));

    load();

    const channel = supabase
      .channel("sidebar-unread")
      .on("postgres_changes", { event: "*", schema: "public", table: "messages" }, load)
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  return unread;
}

function SignOutButton() {
  const router = useRouter();
  const [busy, setBusy] = useState(false);

  const signOut = async () => {
    setBusy(true);
    await supabase.auth.signOut();
    router.replace("/admin/login");
  };

  return (
    <button
      onClick={signOut}
      disabled={busy}
      className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm text-white/60 hover:text-white hover:bg-white/[0.06] transition-colors disabled:opacity-50"
    >
      <LogOut size={17} />
      {busy ? "Signing out..." : "Sign out"}
    </button>
  );
}

export default function Sidebar() {
  const pathname = usePathname();

  const [open, setOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 1024);
    };

    checkMobile();
    window.addEventListener("resize", checkMobile);

    return () =>
      window.removeEventListener("resize", checkMobile);
  }, []);

  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  if (!isMobile) {
    return (
      <aside className="fixed left-0 top-0 h-screen w-[250px] bg-black border-r border-white/10 p-6 flex flex-col justify-between overflow-hidden z-50">
        <SidebarContent pathname={pathname} />
      </aside>
    );
  }

  return (
    <>
      {/* TOP BAR */}
      <div className="fixed top-0 left-0 right-0 h-[70px] bg-black/95 backdrop-blur-xl border-b border-white/10 flex items-center justify-between px-5 z-[60]">
        <h1 className="text-white font-semibold text-base">
          Admin Panel
        </h1>

        <button
          onClick={() => setOpen(true)}
          className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-white"
        >
          <Menu size={20} />
        </button>
      </div>

      {/* DRAWER */}
      <AnimatePresence>
        {open && (
          <>
            {/* BACKDROP */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setOpen(false)}
              className="fixed inset-0 bg-black/70 backdrop-blur-sm z-[70]"
            />

            {/* SIDEBAR */}
            <motion.aside
              initial={{ x: -280 }}
              animate={{ x: 0 }}
              exit={{ x: -280 }}
              transition={{
                type: "spring",
                stiffness: 260,
                damping: 28,
              }}
              className="fixed left-0 top-0 h-screen w-[260px] bg-black border-r border-white/10 p-6 flex flex-col justify-between z-[80]"
            >
              {/* HEADER */}
              <div className="flex items-center justify-between mb-8">
                <h1 className="text-lg font-semibold text-white">
                  Admin Panel
                </h1>

                <button
                  onClick={() => setOpen(false)}
                  className="w-9 h-9 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-white"
                >
                  <X size={18} />
                </button>
              </div>

              {/* CONTENT */}
              <div className="flex-1 flex flex-col justify-between">
                <SidebarContent pathname={pathname} hideTitle />
              </div>
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
