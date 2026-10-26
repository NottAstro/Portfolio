"use client";

import { useState } from "react";
import Sidebar from "@/app/admin/Sidebar";
import { supabase } from "@/lib/supabase";
import { confirmDelete, errorAlert, successToast } from "@/lib/alerts";
import useRealtimeTable from "@/hooks/useRealtimeTable";
import { Trash2, Inbox, RefreshCcw, Reply, MailOpen, Mail } from "lucide-react";

const BG = "#0f0f0f";

type Message = {
  id: number;
  name: string;
  email: string;
  message: string;
  is_read: boolean;
  created_at: string;
};

export default function AdminMessagesPage() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");

  const fetchMessages = async () => {
    setLoading(true);

    const { data, error } = await supabase
      .from("messages")
      .select("*")
      .order("created_at", { ascending: false });

    setLoadError(
      error
        ? "Messages could not be loaded. Has supabase/contact_and_comments.sql been run?"
        : ""
    );
    setMessages((data as Message[]) || []);
    setLoading(false);
  };

  useRealtimeTable("messages", "messages-realtime", fetchMessages);

  const setRead = async (id: number, is_read: boolean) => {
    const { error } = await supabase.from("messages").update({ is_read }).eq("id", id);

    if (error) return errorAlert("Update failed", error.message, BG);

    setMessages((prev) => prev.map((m) => (m.id === id ? { ...m, is_read } : m)));
  };

  const deleteMessage = async (id: number) => {
    const result = await confirmDelete(
      "Delete Message?",
      "This action cannot be undone.",
      BG,
      { confirmButtonText: "Delete", reverseButtons: false },
    );

    if (!result.isConfirmed) return;

    const { error } = await supabase.from("messages").delete().eq("id", id);

    if (error) return errorAlert("Delete failed", error.message, BG);

    setMessages((prev) => prev.filter((m) => m.id !== id));

    successToast("Deleted", "Message removed successfully", BG, 1600);
  };

  const unread = messages.filter((m) => !m.is_read).length;

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white">
      <Sidebar />

      <main className="lg:ml-[250px] min-h-screen px-4 sm:px-6 lg:px-8 pt-[90px] lg:pt-8 pb-8">
        <div className="max-w-[1250px] mx-auto">
          {/* HEADER */}
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
            <div>
              <h1 className="text-2xl md:text-3xl font-bold">Messages</h1>

              <p className="text-sm text-white/40 mt-1">
                {unread > 0 ? `${unread} unread` : "Messages from the contact form"}
              </p>
            </div>

            <button
              onClick={fetchMessages}
              className="h-11 px-5 rounded-2xl border border-white/10 bg-white/[0.04] hover:bg-white/[0.08] transition flex items-center justify-center gap-2 text-sm w-full sm:w-fit"
            >
              <RefreshCcw size={14} />
              Refresh
            </button>
          </div>

          {/* CONTENT */}
          <div className="space-y-4">
            {loading ? (
              <div className="rounded-3xl border border-white/10 bg-white/[0.03] py-20 text-center text-white/40">
                Loading messages...
              </div>
            ) : loadError ? (
              <div className="rounded-3xl border border-red-500/20 bg-red-500/5 py-16 px-6 text-center text-red-300 text-sm">
                {loadError}
              </div>
            ) : messages.length === 0 ? (
              <div className="rounded-3xl border border-white/10 bg-white/[0.03] py-20 flex flex-col items-center gap-3 text-white/40">
                <Inbox size={28} />
                No messages yet
              </div>
            ) : (
              messages.map((msg) => (
                <div
                  key={msg.id}
                  className={`rounded-3xl border p-4 sm:p-5 transition ${
                    msg.is_read
                      ? "border-white/10 bg-white/[0.02]"
                      : "border-white/25 bg-white/[0.05]"
                  }`}
                >
                  <div className="flex flex-col xl:flex-row gap-5">
                    {/* LEFT */}
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-wrap items-center gap-2 mb-1">
                        <p className="font-medium text-[14px] break-all">{msg.name}</p>

                        {!msg.is_read && (
                          <span className="text-[9px] px-2 py-[3px] rounded-full bg-emerald-500/15 text-emerald-300 border border-emerald-500/20">
                            NEW
                          </span>
                        )}
                      </div>

                      <a
                        href={`mailto:${msg.email}`}
                        className="text-[12px] text-white/45 hover:text-white break-all"
                      >
                        {msg.email}
                      </a>

                      <p className="text-[13px] text-white/70 leading-6 mt-3 whitespace-pre-wrap break-words">
                        {msg.message}
                      </p>

                      <p className="text-[11px] text-white/30 mt-3">
                        {new Date(msg.created_at).toLocaleString()}
                      </p>
                    </div>

                    {/* ACTIONS */}
                    <div className="flex xl:flex-col flex-row gap-2 shrink-0">
                      <a
                        href={`mailto:${msg.email}?subject=${encodeURIComponent("Re: your message on my portfolio")}`}
                        onClick={() => !msg.is_read && setRead(msg.id, true)}
                        title="Reply by email"
                        className="w-11 h-11 rounded-2xl bg-white text-black hover:opacity-90 transition flex items-center justify-center"
                      >
                        <Reply size={15} />
                      </a>

                      <button
                        onClick={() => setRead(msg.id, !msg.is_read)}
                        title={msg.is_read ? "Mark as unread" : "Mark as read"}
                        className="w-11 h-11 rounded-2xl border bg-white/5 border-white/10 hover:bg-white/10 flex items-center justify-center transition"
                      >
                        {msg.is_read ? <Mail size={15} /> : <MailOpen size={15} />}
                      </button>

                      <button
                        onClick={() => deleteMessage(msg.id)}
                        title="Delete"
                        className="w-11 h-11 rounded-2xl bg-red-500/10 border border-red-500/20 hover:bg-red-500/20 transition flex items-center justify-center text-red-300"
                      >
                        <Trash2 size={15} />
                      </button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
