"use client";

import { useState } from "react";
import AdminShell, { ADMIN_GHOST_BUTTON } from "@/app/admin/AdminShell";
import { supabase } from "@/lib/supabase";
import { fetchCommentsService } from "@/lib/commentService";
import { confirmDelete, errorAlert, successToast } from "@/lib/alerts";
import useRealtimeTable from "@/hooks/useRealtimeTable";
import {
  Trash2,
  Pin,
  Heart,
  MessageSquare,
  RefreshCcw,
  Send,
} from "lucide-react";

const BG = "#0f0f0f";

export default function AdminCommentsPage() {
  const [comments, setComments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [replyText, setReplyText] = useState<Record<number, string>>({});

  const fetchComments = async () => {
    setLoading(true);
    setComments(await fetchCommentsService().catch(() => []));
    setLoading(false);
  };

  useRealtimeTable("comments", "comments-realtime", fetchComments);

  // Saves `patch` to the DB row and mirrors it in local state
  const updateComment = async (id: number, patch: Record<string, unknown>) => {
    const { data, error } = await supabase.from("comments").update(patch).eq("id", id).select("id");

    if (error || !data?.length) {
      errorAlert("Not saved", error?.message || "You don't have permission to change this comment.", BG);
      return false;
    }

    setComments((prev) =>
      prev.map((item) => (item.id === id ? { ...item, ...patch } : item)),
    );
    return true;
  };

  const deleteComment = async (id: number) => {
    const result = await confirmDelete(
      "Delete Comment?",
      "This action cannot be undone.",
      BG,
      { confirmButtonText: "Delete", reverseButtons: false },
    );

    if (!result.isConfirmed) return;

    const { data, error } = await supabase.from("comments").delete().eq("id", id).select("id");

    if (error || !data?.length) {
      errorAlert("Not deleted", error?.message || "You don't have permission to delete this comment.", BG);
      return;
    }

    setComments((prev) => prev.filter((item) => item.id !== id));

    successToast("Deleted", "Comment removed successfully", BG, 1600);
  };

  const togglePin = (id: number, current: boolean) =>
    updateComment(id, { is_pinned: !current });

  const addLike = (id: number, likes: number, liked: boolean) =>
    updateComment(id, {
      likes: liked ? Math.max((likes || 1) - 1, 0) : (likes || 0) + 1,
      liked_by_admin: !liked,
    });

  const sendReply = async (commentId: number) => {
    const text = replyText[commentId];

    if (!text?.trim()) return;

    const target = comments.find((x) => x.id === commentId);

    const saved = await updateComment(commentId, {
      replies: [
        ...(target?.replies || []),
        {
          username: "Admin",
          message: text,
          created_at: new Date().toISOString(),
        },
      ],
    });

    if (!saved) return;

    setReplyText((prev) => ({
      ...prev,
      [commentId]: "",
    }));
  };

  return (
    <AdminShell
      title="Comments"
      subtitle="Pin, like, reply to or remove comments on your wall"
      action={
        <button onClick={fetchComments} className={ADMIN_GHOST_BUTTON}>
          <RefreshCcw size={14} />
          Refresh
        </button>
      }
    >
          {/* CONTENT */}
          <div className="space-y-4">
            {loading ? (
              <div className="rounded-[24px] border border-white/10 bg-white/[0.03] py-20 text-center text-white/40">
                Loading comments...
              </div>
            ) : comments.length === 0 ? (
              <div className="rounded-[24px] border border-white/10 bg-white/[0.03] py-20 flex flex-col items-center gap-3 text-white/40">
                <MessageSquare size={28} />
                No comments yet
              </div>
            ) : (
              comments.map((comment) => (
                <div
                  key={comment.id}
                  className="rounded-[24px] border border-white/10 bg-white/[0.03] p-4 sm:p-5 hover:border-white/20 transition"
                >
                  <div className="flex flex-col gap-5">
                    {/* TOP */}
                    <div className="flex flex-col xl:flex-row gap-5">
                      {/* LEFT */}
                      <div className="flex-1 min-w-0">
                        <div className="flex flex-wrap items-center gap-2 mb-3">
                          <p className="font-medium text-[14px] break-all">
                            {comment.name || comment.username}
                          </p>

                          {comment.is_pinned && (
                            <span className="text-[9px] px-2 py-[3px] rounded-full bg-yellow-500/15 text-yellow-300 border border-yellow-500/20">
                              PINNED
                            </span>
                          )}

                          {comment.liked_by_admin && (
                            <span className="text-[9px] px-2 py-[3px] rounded-full bg-pink-500/15 text-pink-300 border border-pink-500/20">
                              LIKED
                            </span>
                          )}
                        </div>

                        <p className="text-[13px] text-white/60 leading-6 mb-3 break-words">
                          {comment.comment}
                        </p>

                        {comment.image_url && (
                          <img
                            src={comment.image_url}
                            className="rounded-2xl border border-white/10 w-full max-w-full sm:max-w-[260px] object-cover mb-4"
                          />
                        )}

                        <div className="flex flex-wrap items-center gap-3 text-[11px] text-white/35">
                          <span>{comment.likes || 0} likes</span>

                          <span>
                            {new Date(comment.created_at).toLocaleDateString()}
                          </span>
                        </div>
                      </div>

                      {/* ACTION */}
                      <div className="flex xl:flex-col flex-row gap-2 shrink-0">
                        <button
                          onClick={() =>
                            addLike(
                              comment.id,
                              comment.likes,
                              comment.liked_by_admin,
                            )
                          }
                          className={`w-11 h-11 rounded-2xl border flex items-center justify-center transition ${
                            comment.liked_by_admin
                              ? "bg-pink-500/20 border-pink-500/30 text-pink-300"
                              : "bg-white/5 border-white/10 hover:bg-white/10"
                          }`}
                        >
                          <Heart
                            size={15}
                            fill={
                              comment.liked_by_admin ? "currentColor" : "none"
                            }
                          />
                        </button>

                        <button
                          onClick={() =>
                            togglePin(comment.id, comment.is_pinned)
                          }
                          className={`w-11 h-11 rounded-2xl border flex items-center justify-center transition ${
                            comment.is_pinned
                              ? "bg-yellow-500/20 border-yellow-500/30 text-yellow-300"
                              : "bg-white/5 border-white/10 hover:bg-white/10"
                          }`}
                        >
                          <Pin size={15} />
                        </button>

                        <button
                          onClick={() => deleteComment(comment.id)}
                          className="w-11 h-11 rounded-2xl bg-red-500/10 border border-red-500/20 hover:bg-red-500/20 transition flex items-center justify-center text-red-300"
                        >
                          <Trash2 size={15} />
                        </button>
                      </div>
                    </div>

                    {/* REPLY */}
                    <div className="border-t border-white/5 pt-4">
                      <div className="flex items-center gap-2">
                        <input
                          value={replyText[comment.id] || ""}
                          onChange={(e) =>
                            setReplyText((prev) => ({
                              ...prev,
                              [comment.id]: e.target.value,
                            }))
                          }
                          placeholder="Reply..."
                          className="flex-1 h-11 px-4 rounded-2xl bg-black/20 border border-white/10 outline-none text-sm"
                        />

                        <button
                          onClick={() => sendReply(comment.id)}
                          className="h-11 min-w-[54px] px-4 rounded-2xl bg-white text-black hover:opacity-90 transition flex items-center justify-center"
                        >
                          <Send size={15} />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
    </AdminShell>
  );
}
