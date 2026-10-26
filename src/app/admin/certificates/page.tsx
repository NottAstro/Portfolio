"use client";

import { useState } from "react";
import { Plus, Trash2, Pencil, X, Upload } from "lucide-react";
import Sidebar from "@/app/admin/Sidebar";
import { supabase } from "@/lib/supabase";
import { fetchCertificates } from "@/lib/portfolioService";
import { uploadPublicImage } from "@/lib/storage";
import { splitList } from "@/lib/list";
import { confirmDelete, darkAlert, errorAlert, successToast } from "@/lib/alerts";
import useRealtimeTable from "@/hooks/useRealtimeTable";

const INPUT_CLASS =
  "w-full px-4 py-2.5 rounded-2xl bg-[#0f0f0f] border border-white/10 outline-none text-sm focus:border-white/30 transition";

const LABEL_CLASS = "text-xs text-white/50 block mb-1.5 font-medium";

const BADGE_CLASS =
  "px-2 py-0.5 rounded bg-white/10 text-[10px] text-white/90 font-medium border border-white/10";

const SCHEMA_SQL_HTML = `
  <div style="text-align:left; font-size:13px; color:#ccc; line-height:1.6;">
    <p style="margin-bottom:8px;">A credential column is missing in your Supabase <b>certificates</b> table.</p>
    <p style="margin-bottom:8px;">Please execute this SQL in your <b>Supabase SQL Editor</b>:</p>
    <pre style="background:#1e1e1e; border:1px solid #333; padding:10px; border-radius:8px; color:#4ade80; font-family:monospace; font-size:11px; white-space:pre-wrap; user-select:all;">ALTER TABLE public.certificates 
ADD COLUMN IF NOT EXISTS issuer text,
ADD COLUMN IF NOT EXISTS issue_date text,
ADD COLUMN IF NOT EXISTS credential_url text,
ADD COLUMN IF NOT EXISTS tags text,
ADD COLUMN IF NOT EXISTS description text;</pre>
  </div>
`;

const handleSchemaError = (err: any) => {
  const msg = err?.message || "";
  const isColMissing = ["description", "issuer", "issue_date", "credential_url", "tags", "column"].some(
    (col) => msg.includes(col)
  );

  if (isColMissing) {
    darkAlert({
      title: "Supabase Schema Update Needed",
      html: SCHEMA_SQL_HTML,
      icon: "warning",
      confirmButtonText: "Got it",
      confirmButtonColor: "#3b82f6",
    });
  } else {
    errorAlert("Error", msg);
  }
};

export default function CertificatesPage() {
  const [certificates, setCertificates] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const [open, setOpen] = useState(false);
  const [editId, setEditId] = useState<number | null>(null);

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [issuer, setIssuer] = useState("");
  const [issueDate, setIssueDate] = useState("");
  const [credentialUrl, setCredentialUrl] = useState("");
  const [tags, setTags] = useState("");
  const [image, setImage] = useState<File | null>(null);
  const [preview, setPreview] = useState("");

  const [saving, setSaving] = useState(false);

  const loadCertificates = async () => {
    setCertificates(await fetchCertificates());
    setLoading(false);
  };

  useRealtimeTable("certificates", "certificates-realtime", loadCertificates);

  const resetForm = () => {
    setTitle("");
    setDescription("");
    setIssuer("");
    setIssueDate("");
    setCredentialUrl("");
    setTags("");
    setImage(null);
    setPreview("");
    setEditId(null);
  };

  const handleImage = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];

    if (!file) return;

    setImage(file);
    setPreview(URL.createObjectURL(file));
  };

  const handleSave = async () => {
    if (!title.trim()) return;

    setSaving(true);

    let imageUrl = preview;

    if (image) {
      try {
        imageUrl = await uploadPublicImage("certificates", `certificate-${Date.now()}-${image.name}`, image);
      } catch {
        errorAlert("Upload Failed", "Storage bucket error. Make sure the 'certificates' bucket exists and allows uploads.");
        setSaving(false);
        return;
      }
    }

    const certData = {
      title,
      description: description.trim() || null,
      issuer: issuer.trim() || null,
      issue_date: issueDate.trim() || null,
      credential_url: credentialUrl.trim() || null,
      tags: tags.trim() || null,
      image_url: imageUrl,
    };

    const { error } = editId
      ? await supabase.from("certificates").update(certData).eq("id", editId)
      : await supabase.from("certificates").insert([certData]);

    if (error) {
      handleSchemaError(error);
      setSaving(false);
      return;
    }

    setSaving(false);
    setOpen(false);
    resetForm();

    loadCertificates();
  };

  const handleDelete = async (id: number) => {
    const result = await confirmDelete(
      "Delete Certificate?",
      "Deleted certificates cannot be recovered."
    );

    if (!result.isConfirmed) return;

    const { data, error } = await supabase.from("certificates").delete().eq("id", id).select();

    if (error || !data || data.length === 0) {
      errorAlert(
        "Failed",
        error ? error.message : "Failed to delete certificate. Check your Supabase RLS policies (must allow DELETE)."
      );
    } else {
      setCertificates((prev) => prev.filter((item) => item.id !== id));
      successToast("Deleted!", "Certificate deleted successfully.");
    }
  };

  const closeModal = () => {
    setOpen(false);
    resetForm();
  };

  const handleEdit = (item: any) => {
    setTitle(item.title || "");
    setDescription(item.description || "");
    setIssuer(item.issuer || "");
    setIssueDate(item.issue_date || "");
    setCredentialUrl(item.credential_url || "");
    setTags(item.tags || "");
    setPreview(item.image_url || "");
    setEditId(item.id);
    setOpen(true);
  };

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white">
      {/* SIDEBAR */}
      <Sidebar />

      {/* MAIN */}
      <main className="lg:ml-[250px] min-h-screen px-4 sm:px-6 lg:px-8 pt-[90px] lg:pt-6 pb-6">
        <div className="py-6 lg:py-8">
          {/* HEADER */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold">Certificates</h1>

              <p className="text-sm text-white/40 mt-1">
                Manage your certificates
              </p>
            </div>

            <button
              onClick={() => {
                resetForm();
                setOpen(true);
              }}
              className="w-full sm:w-auto flex items-center justify-center gap-2 px-4 py-3 rounded-2xl bg-white text-black hover:scale-[1.02] transition"
            >
              <Plus size={16} />
              Add Certificate
            </button>
          </div>

          {/* CONTENT */}
          {loading ? (
            <div className="text-white/50 text-sm">Loading certificates...</div>
          ) : certificates.length === 0 ? (
            <div className="rounded-2xl border border-white/10 bg-white/[0.03] h-[240px] flex items-center justify-center text-white/35">
              No certificates found
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-5 pb-6">
              {certificates.map((item) => (
                <div
                  key={item.id}
                  className="border border-white/10 bg-white/[0.03] rounded-2xl p-4 hover:border-white/25 hover:-translate-y-1 transition-all duration-300 flex flex-col"
                >
                  {/* IMAGE */}
                  <div className="w-full rounded-xl overflow-hidden bg-white/[0.03] mb-4">
                    {item.image_url ? (
                      <img
                        src={item.image_url}
                        className="w-full h-auto hover:scale-105 transition duration-500 block"
                      />
                    ) : (
                      <div className="w-full h-[150px] bg-white/[0.03]" />
                    )}
                  </div>

                  {/* TITLE */}
                  <h2 className="font-semibold text-[15px] mb-1.5 line-clamp-1">
                    {item.title}
                  </h2>

                  {/* DESCRIPTION */}
                  <p className="text-xs text-white/50 line-clamp-2 mb-2 min-h-[32px] leading-relaxed">
                    {item.description || "No description provided"}
                  </p>

                  {/* CREDENTIAL INFO BADGES PREVIEW */}
                  <div className="flex flex-wrap gap-1.5 mb-3">
                    {item.issuer && (
                      <span className={BADGE_CLASS}>
                        {item.issuer}
                      </span>
                    )}
                    {item.issue_date && (
                      <span className={BADGE_CLASS}>
                        {item.issue_date.toLowerCase().startsWith("issued")
                          ? item.issue_date
                          : `Issued ${item.issue_date}`}
                      </span>
                    )}
                    {item.tags ? (
                      splitList(item.tags).map((tag: string, idx: number) => (
                          <span
                            key={idx}
                            className="px-2 py-0.5 rounded bg-white/[0.05] border border-white/10 text-[10px] text-white/70"
                          >
                            {tag}
                          </span>
                        ))
                    ) : (
                      <span className="px-2 py-0.5 rounded bg-white/[0.05] border border-white/10 text-[10px] text-white/50">
                        Verified Credential
                      </span>
                    )}
                  </div>

                  {/* DATE & STATUS */}
                  <div className="flex items-center justify-between text-[11px] text-white/30 mb-4">
                    <span>
                      {item.created_at
                        ? new Date(item.created_at).toLocaleDateString()
                        : "No Date"}
                    </span>
                    {item.credential_url && (
                      <span className="text-[10px] text-emerald-400/80 bg-emerald-500/10 px-1.5 py-0.5 rounded">
                        Link set
                      </span>
                    )}
                  </div>

                  {/* ACTION */}
                  <div className="flex gap-2 mt-auto">
                    <button
                      onClick={() => handleEdit(item)}
                      className="flex-1 px-3 py-2 rounded-xl border border-white/10 hover:bg-white/10 transition flex items-center justify-center gap-2 text-sm"
                    >
                      <Pencil size={14} />
                      Edit
                    </button>

                    <button
                      onClick={() => handleDelete(item.id)}
                      className="w-10 h-10 rounded-xl bg-red-500/10 border border-red-500/20 hover:bg-red-500/20 transition flex items-center justify-center text-red-300"
                    >
                      <Trash2 size={15} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>

      {/* MODAL */}
      {open && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-end sm:items-center justify-center px-3 sm:px-4 py-4">
          <div className="w-full max-w-lg rounded-t-3xl sm:rounded-3xl bg-[#111] border border-white/10 p-5 sm:p-6 max-h-[92vh] overflow-y-auto">
            {/* HEADER */}
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-lg sm:text-xl font-semibold">
                {editId ? "Edit Certificate" : "Add Certificate"}
              </h2>

              <button
                onClick={closeModal}
                className="w-9 h-9 rounded-xl bg-white/5 hover:bg-white/10 flex items-center justify-center"
              >
                <X size={16} />
              </button>
            </div>

            {/* IMAGE */}
            <label className="border border-dashed border-white/10 rounded-2xl bg-[#0f0f0f] min-h-[176px] sm:min-h-[208px] flex flex-col items-center justify-center cursor-pointer overflow-hidden mb-4">
              {preview ? (
                <div className="relative w-full group">
                  <img src={preview} className="w-full h-auto block" />
                  <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition flex flex-col items-center justify-center">
                    <Upload size={24} className="text-white mb-2" />
                    <span className="text-sm font-medium text-white">Change Image</span>
                  </div>
                </div>
              ) : (
                <>
                  <Upload size={24} className="text-white/50 mb-2" />

                  <p className="text-sm text-white/60">
                    Upload Certificate Image
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

            {/* TITLE */}
            <div className="mb-4">
              <label className={LABEL_CLASS}>
                Certificate Title
              </label>
              <input
                placeholder="e.g. AWS Certified Solutions Architect"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full px-4 py-3 rounded-2xl bg-[#0f0f0f] border border-white/10 outline-none text-sm focus:border-white/30 transition"
              />
            </div>

            {/* DESCRIPTION */}
            <div className="mb-4">
              <label className={LABEL_CLASS}>
                Description
              </label>
              <textarea
                placeholder="Write a description of the certificate, skills demonstrated, or credential details..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={3}
                className="w-full px-4 py-3 rounded-2xl bg-[#0f0f0f] border border-white/10 outline-none text-sm resize-none focus:border-white/30 transition leading-relaxed"
              />
            </div>

            {/* CREDENTIAL DETAILS */}
            <div className="mb-5 pt-3 border-t border-white/10">
              <span className="text-[11px] font-semibold text-white/60 uppercase tracking-wider block mb-3">
                Credential Info Details
              </span>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-3">
                {/* ISSUER */}
                <div>
                  <label className={LABEL_CLASS}>
                    Issuer / Organization
                  </label>
                  <input
                    placeholder="e.g. AWS, Meta, Google"
                    value={issuer}
                    onChange={(e) => setIssuer(e.target.value)}
                    className={INPUT_CLASS}
                  />
                </div>

                {/* ISSUE DATE */}
                <div>
                  <label className={LABEL_CLASS}>
                    Issue Date / Period
                  </label>
                  <input
                    placeholder="e.g. Sep 2026 or 2024"
                    value={issueDate}
                    onChange={(e) => setIssueDate(e.target.value)}
                    className={INPUT_CLASS}
                  />
                </div>
              </div>

              {/* CREDENTIAL BADGES / TAGS */}
              <div className="mb-3">
                <label className={LABEL_CLASS}>
                  Credential Badges / Tags (comma separated)
                </label>
                <input
                  placeholder="e.g. Verified Credential, Honors, Cloud Architect"
                  value={tags}
                  onChange={(e) => setTags(e.target.value)}
                  className={INPUT_CLASS}
                />
                <span className="text-[11px] text-white/30 mt-1 block">
                  Leave empty to default to &quot;Verified Credential&quot;.
                </span>
              </div>

              {/* CREDENTIAL URL */}
              <div>
                <label className={LABEL_CLASS}>
                  Verification / Credential URL (Optional)
                </label>
                <input
                  placeholder="https://www.credly.com/badges/... or https://coursera.org/verify/..."
                  value={credentialUrl}
                  onChange={(e) => setCredentialUrl(e.target.value)}
                  className={INPUT_CLASS}
                />
              </div>
            </div>

            {/* BUTTON */}
            <div className="flex flex-col sm:flex-row justify-end gap-3">
              <button
                onClick={closeModal}
                className="w-full sm:w-auto px-4 py-3 rounded-xl border border-white/10 hover:bg-white/5"
              >
                Cancel
              </button>

              <button
                onClick={handleSave}
                disabled={saving}
                className="w-full sm:w-auto px-5 py-3 rounded-xl bg-white text-black font-medium"
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
