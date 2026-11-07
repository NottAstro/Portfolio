"use client";

import { useEffect, useEffectEvent, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Sidebar from "@/app/admin/Sidebar";
import { supabase } from "@/lib/supabase";
import type { Comment } from "@/lib/commentService";
import {
  Folder,
  Inbox,
  MessageSquare,
  Pin,
  Layers,
  RefreshCcw,
  Heart,
  CornerDownRight,
  ArrowUpRight,
  LucideIcon,
} from "lucide-react";

type Message = {
  id: number;
  name: string;
  email: string;
  message: string;
  is_read: boolean;
  created_at: string;
};

type Stats = {
  projects: number;
  messages: number;
  unread: number;
  comments: number;
  pinned: number;
  techStacks: number;
};

// Tables shown on the dashboard; any change in them refreshes it live
const LIVE_TABLES = ["projects", "tech_stack", "comments", "messages"];

const NUMBER_STYLE = {
  fontFamily: "var(--font-dm-mono), 'DM Mono', monospace",
  fontVariantNumeric: "tabular-nums",
} as const;

const count = (table: string) =>
  supabase.from(table).select("*", { count: "exact", head: true });

export default function DashboardPage() {
  const router = useRouter();

  const [authorized, setAuthorized] = useState(false);
  const [stats, setStats] = useState<Stats>({
    projects: 0,
    messages: 0,
    unread: 0,
    comments: 0,
    pinned: 0,
    techStacks: 0,
  });
  const [recentComments, setRecentComments] = useState<Comment[]>([]);
  const [recentMessages, setRecentMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchDashboard = async () => {
    try {
      const [
        projectsRes,
        messagesRes,
        unreadRes,
        commentsRes,
        pinnedRes,
        techStacksRes,
        recentCommentsRes,
        recentMessagesRes,
      ] = await Promise.all([
        count("projects"),
        count("messages"),
        count("messages").eq("is_read", false),
        count("comments"),
        count("comments").eq("is_pinned", true),
        count("tech_stack"),
        supabase
          .from("comments")
          .select("*")
          .order("created_at", { ascending: false })
          .limit(30),
        supabase
          .from("messages")
          .select("*")
          .order("created_at", { ascending: false })
          .limit(5),
      ]);

      setStats({
        projects: projectsRes.count || 0,
        messages: messagesRes.count || 0,
        unread: unreadRes.count || 0,
        comments: commentsRes.count || 0,
        pinned: pinnedRes.count || 0,
        techStacks: techStacksRes.count || 0,
      });

      setRecentComments((recentCommentsRes.data as Comment[]) || []);
      setRecentMessages((recentMessagesRes.data as Message[]) || []);
    } catch (err) {
      console.error("Dashboard fetch error:", err);
    }

    setLoading(false);
  };

  const refresh = useEffectEvent(fetchDashboard);

  // The proxy already checks the admin on the server; this guards client-side
  // navigation if the session expires while the page is open
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session) {
        router.replace("/admin/login");
        return;
      }
      setAuthorized(true);
      refresh();
    });
  }, [router]);

  // Live counts: refetch whenever any shown table changes
  useEffect(() => {
    if (!authorized) return;

    const channel = supabase.channel("dashboard-live");
    for (const table of LIVE_TABLES) {
      channel.on("postgres_changes", { event: "*", schema: "public", table }, () => refresh());
    }
    channel.subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [authorized]);

  const cards: { icon: LucideIcon; title: string; value: number; caption: string; href: string }[] = [
    { icon: Folder, title: "Projects", value: stats.projects, caption: "Shown in your Projects section", href: "/admin/projects" },
    {
      icon: Inbox,
      title: "Messages",
      value: stats.messages,
      caption: stats.unread ? `${stats.unread} unread` : "All read",
      href: "/admin/messages",
    },
    { icon: MessageSquare, title: "Comments", value: stats.comments, caption: "On your comments wall", href: "/admin/comments" },
    { icon: Pin, title: "Pinned", value: stats.pinned, caption: "Shown at the top of comments", href: "/admin/comments" },
    { icon: Layers, title: "Tech Stack", value: stats.techStacks, caption: "Logos in your Tech Stack", href: "/admin/tech" },
  ];

  if (!authorized) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center text-white">
        Checking session...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white overflow-hidden">
      <Sidebar />

      <main className="lg:ml-[250px] pt-[95px] lg:pt-6 min-h-screen px-4 sm:px-6 lg:px-8 pb-8">
        <div className="max-w-[1400px] mx-auto">
          {/* HEADER */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-7">
            <div>
              <h1 className="text-2xl sm:text-3xl font-semibold">Dashboard</h1>
              <p className="text-sm text-white/40 mt-1">Live overview of your portfolio</p>
            </div>

            <button
              onClick={fetchDashboard}
              className="h-11 px-5 rounded-2xl border border-white/10 bg-white/[0.04] hover:bg-white/[0.08] hover:border-white/20 transition-colors flex items-center justify-center gap-2 text-sm"
            >
              <RefreshCcw size={14} />
              Refresh
            </button>
          </div>

          {/* TOP CARDS */}
          <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4 mb-6">
            {cards.map(({ icon: Icon, title, value, caption, href }) => (
              <Link
                key={title}
                href={href}
                className="rounded-[24px] border border-white/10 px-5 py-4 bg-white/[0.03] hover:border-white/20 hover:bg-white/[0.06] transition-colors"
              >
                <div className="flex justify-between items-start">
                  <div>
                    <p className="text-xs text-white/45 mb-2">{title}</p>
                    <p className="text-[28px] font-medium leading-none" style={NUMBER_STYLE}>
                      {loading ? "–" : value}
                    </p>
                  </div>

                  <div className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center">
                    <Icon size={16} />
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-white/5 flex items-center justify-between gap-2">
                  <p
                    className={`text-[11px] truncate ${
                      title === "Messages" && stats.unread ? "text-emerald-300" : "text-white/35"
                    }`}
                  >
                    {caption}
                  </p>
                  <ArrowUpRight size={12} className="text-white/25 shrink-0" />
                </div>
              </Link>
            ))}
          </div>

          {/* CONTENT */}
          <div className="grid grid-cols-1 xl:grid-cols-3 gap-5">
            {/* RECENT COMMENTS */}
            <div className="xl:col-span-2 rounded-[24px] border border-white/10 p-5 sm:p-6 bg-white/[0.03]">
              <div className="flex items-center justify-between mb-5">
                <div>
                  <h2 className="text-base font-medium">Recent comments</h2>
                  <p className="text-xs text-white/35 mt-1">As they appear on your comments wall</p>
                </div>
                <Link href="/admin/comments" className="text-xs text-white/45 hover:text-white transition-colors">
                  Manage
                </Link>
              </div>

              <div className="max-h-[580px] overflow-y-auto pr-2 space-y-3 custom-scroll">
                {loading ? (
                  <div className="text-sm text-white/30">Loading comments...</div>
                ) : recentComments.length === 0 ? (
                  <div className="text-sm text-white/30">No comments yet</div>
                ) : (
                  recentComments.map((comment) => (
                    <div
                      key={comment.id}
                      className="rounded-[24px] border border-white/10 bg-white/[0.03] px-4 py-4"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex gap-3 flex-1 min-w-0">
                          <div className="w-9 h-9 rounded-full bg-white/10 flex items-center justify-center text-[11px] font-medium shrink-0">
                            {comment.name?.charAt(0) || "?"}
                          </div>

                          <div className="min-w-0 flex-1">
                            <div className="flex flex-wrap items-center gap-2">
                              <p className="text-[13px] font-medium truncate">{comment.name}</p>
                              <span className="text-[10px] text-white/30">
                                {new Date(comment.created_at).toLocaleDateString()}
                              </span>
                              {comment.is_pinned && (
                                <span className="text-[10px] px-2 py-[2px] rounded-full bg-purple-500/15 text-purple-300 border border-purple-500/20">
                                  Pinned
                                </span>
                              )}
                            </div>

                            <p className="text-[12px] text-white/50 mt-2 line-clamp-2 leading-relaxed break-words">
                              {comment.comment}
                            </p>

                            {comment.replies?.length > 0 && (
                              <p className="mt-2 flex items-center gap-1 text-[11px] text-white/35">
                                <CornerDownRight size={12} />
                                {comment.replies.length} {comment.replies.length === 1 ? "reply" : "replies"}
                              </p>
                            )}
                          </div>
                        </div>

                        <div className="flex items-center gap-1 text-[11px] text-white/40 shrink-0" style={NUMBER_STYLE}>
                          <Heart size={12} fill={comment.liked_by_admin ? "currentColor" : "none"} />
                          {comment.likes || 0}
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* RECENT MESSAGES */}
            <div className="rounded-[24px] border border-white/10 p-5 sm:p-6 bg-white/[0.03] h-fit">
              <div className="flex items-center justify-between mb-5">
                <div>
                  <h2 className="text-base font-medium">Recent messages</h2>
                  <p className="text-xs text-white/35 mt-1">From your contact form</p>
                </div>
                <Link href="/admin/messages" className="text-xs text-white/45 hover:text-white transition-colors">
                  Open inbox
                </Link>
              </div>

              <div className="space-y-3">
                {loading ? (
                  <div className="text-sm text-white/30">Loading messages...</div>
                ) : recentMessages.length === 0 ? (
                  <div className="text-sm text-white/30">No messages yet</div>
                ) : (
                  recentMessages.map((msg) => (
                    <Link
                      key={msg.id}
                      href="/admin/messages"
                      className="block rounded-[24px] border border-white/10 bg-white/[0.03] px-4 py-3 hover:border-white/20 transition-colors"
                    >
                      <div className="flex items-center gap-2">
                        {!msg.is_read && <span className="w-2 h-2 rounded-full bg-emerald-400 shrink-0" />}
                        <p className="text-[13px] font-medium truncate">{msg.name}</p>
                        <span className="ml-auto text-[10px] text-white/30 shrink-0">
                          {new Date(msg.created_at).toLocaleDateString()}
                        </span>
                      </div>
                      <p className="text-[12px] text-white/45 mt-1.5 line-clamp-2 break-words">{msg.message}</p>
                    </Link>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
