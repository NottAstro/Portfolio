"use client";

import { useState } from "react";
import Sidebar from "@/app/admin/Sidebar";
import { supabase } from "@/lib/supabase";
import { fetchTechStacks } from "@/lib/portfolioService";
import { uploadPublicImage } from "@/lib/storage";
import { confirmDelete, errorAlert, successToast } from "@/lib/alerts";
import useRealtimeTable from "@/hooks/useRealtimeTable";
import { Plus, Trash2, Pencil, X, Upload } from "lucide-react";

export default function TechStackPage() {
  const [techStacks, setTechStacks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const [open, setOpen] = useState(false);
  const [editId, setEditId] = useState<number | null>(null);

  const [name, setName] = useState("");
  const [logo, setLogo] = useState<File | null>(null);
  const [preview, setPreview] = useState("");

  const [saving, setSaving] = useState(false);

  const loadTechStacks = async () => {
    setTechStacks(await fetchTechStacks());
    setLoading(false);
  };

  useRealtimeTable("tech_stack", "techstack-realtime", loadTechStacks);

  const resetForm = () => {
    setName("");
    setLogo(null);
    setPreview("");
    setEditId(null);
  };

  const handleImage = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];

    if (!file) return;

    setLogo(file);
    setPreview(URL.createObjectURL(file));
  };

  const handleSave = async () => {
    if (!name.trim()) return;

    setSaving(true);

    let logoUrl = preview;

    if (logo) {
      try {
        logoUrl = await uploadPublicImage("tech-stack", `tech-${Date.now()}-${logo.name}`, logo);
      } catch {
        errorAlert("Upload Failed", "Storage bucket error. Make sure the 'tech-stack' bucket exists and allows uploads.");
        setSaving(false);
        return;
      }
    }

    const techData = { name, logo_url: logoUrl };

    const { error } = editId
      ? await supabase.from("tech_stack").update(techData).eq("id", editId)
      : await supabase.from("tech_stack").insert([techData]);

    if (error) {
      errorAlert("Error", error.message);
      setSaving(false);
      return;
    }

    setSaving(false);
    setOpen(false);
    resetForm();

    loadTechStacks();
  };

  const handleDelete = async (id: number) => {
    const result = await confirmDelete(
      "Delete Tech Stack?",
      "Deleted data cannot be recovered."
    );

    if (!result.isConfirmed) return;

    const { data, error } = await supabase
      .from("tech_stack")
      .delete()
      .eq("id", id)
      .select();

    if (error || !data || data.length === 0) {
      errorAlert(
        "Failed",
        error ? error.message : "Failed to delete tech stack. Check your Supabase RLS policies (must allow DELETE)."
      );
    } else {
      setTechStacks((prev) =>
        prev.filter((item) => item.id !== id)
      );

      successToast("Deleted!", "Tech stack deleted successfully.");
    }
  };

  const closeModal = () => {
    setOpen(false);
    resetForm();
  };

  const handleEdit = (item: any) => {
    setEditId(item.id);
    setName(item.name);
    setPreview(item.logo_url);
    setOpen(true);
  };

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white">
      {/* SIDEBAR */}
      <div className="fixed left-0 top-0 h-screen z-40">
        <Sidebar />
      </div>

      {/* MAIN */}
      <main className="ml-0 lg:ml-[250px] min-h-screen">
        <div className="px-4 sm:px-6 md:px-8 pt-28 lg:pt-8 pb-8">
          {/* HEADER */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold">
                Tech Stack
              </h1>

              <p className="text-sm text-white/40 mt-1">
                Manage technology stack
              </p>
            </div>

            <button
              onClick={() => {
                resetForm();
                setOpen(true);
              }}
              className="w-full sm:w-auto flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-white text-black hover:scale-[1.02] transition"
            >
              <Plus size={16} />
              Add Tech
            </button>
          </div>

          {/* GRID */}
          {loading ? (
            <div className="text-white/40 text-sm">
              Loading...
            </div>
          ) : techStacks.length === 0 ? (
            <div className="rounded-2xl border border-white/10 bg-white/[0.03] h-[220px] flex items-center justify-center text-white/35 text-sm">
              No tech stack
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 sm:gap-5">
              {techStacks.map((item) => (
                <div
                  key={item.id}
                  className="rounded-2xl border border-white/10 bg-white/[0.03] p-4 sm:p-5 hover:border-white/20 transition"
                >
                  <div className="flex justify-between items-start mb-4">
                    <div className="w-14 h-14 rounded-2xl bg-white/[0.04] border border-white/10 overflow-hidden flex items-center justify-center shrink-0">
                      {item.logo_url ? (
                        <img
                          src={item.logo_url}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full bg-white/[0.03]" />
                      )}
                    </div>

                    <div className="flex gap-2 ml-3">
                      <button
                        onClick={() => handleEdit(item)}
                        className="w-9 h-9 rounded-xl border border-white/10 hover:bg-white/10 flex items-center justify-center transition"
                      >
                        <Pencil size={14} />
                      </button>

                      <button
                        onClick={() => handleDelete(item.id)}
                        className="w-9 h-9 rounded-xl bg-red-500/10 border border-red-500/20 text-red-300 flex items-center justify-center hover:bg-red-500/20 transition"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>

                  <h2 className="text-[14px] sm:text-[15px] font-medium break-words leading-relaxed">
                    {item.name}
                  </h2>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>

      {/* MODAL */}
      {open && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center px-4 py-6">
          <div className="w-full max-w-md rounded-3xl bg-[#111] border border-white/10 p-5 sm:p-6 max-h-[90vh] overflow-y-auto">
            {/* HEADER */}
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg sm:text-xl font-semibold">
                {editId ? "Edit Tech" : "Add Tech"}
              </h2>

              <button
                onClick={closeModal}
                className="w-9 h-9 rounded-xl bg-white/5 hover:bg-white/10 flex items-center justify-center shrink-0"
              >
                <X size={16} />
              </button>
            </div>

            {/* IMAGE */}
            <label className="border border-dashed border-white/10 rounded-2xl bg-[#0f0f0f] h-40 sm:h-44 flex flex-col items-center justify-center cursor-pointer overflow-hidden mb-4">
              {preview ? (
                <div className="relative w-full h-full group">
                  <img src={preview} className="w-full h-full object-cover" />
                  <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition flex flex-col items-center justify-center">
                    <Upload size={24} className="text-white mb-2" />
                    <span className="text-sm font-medium text-white">Change Logo</span>
                  </div>
                </div>
              ) : (
                <>
                  <Upload
                    size={22}
                    className="text-white/50 mb-2"
                  />

                  <p className="text-sm text-white/50">
                    Upload Logo
                  </p>
                </>
              )}

              <input
                type="file"
                hidden
                accept="image/*"
                onChange={handleImage}
              />
            </label>

            {/* INPUT */}
            <input
              placeholder="Tech Name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-4 py-3 rounded-2xl bg-[#0f0f0f] border border-white/10 outline-none mb-5 text-sm"
            />

            {/* BUTTONS */}
            <div className="flex flex-col sm:flex-row justify-end gap-3">
              <button
                onClick={closeModal}
                className="w-full sm:w-auto px-4 py-2.5 rounded-xl border border-white/10 hover:bg-white/5 transition"
              >
                Cancel
              </button>

              <button
                onClick={handleSave}
                disabled={saving}
                className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-white text-black hover:opacity-90 transition"
              >
                {saving ? "Saving..." : "Save"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}