"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import AdminShell, { ADMIN_CARD, ADMIN_PRIMARY_BUTTON } from "@/app/admin/AdminShell";
import { Plus } from "lucide-react";
import AddProjectModal from "./AddProjectModal";
import useRealtimeTable from "@/hooks/useRealtimeTable";
import { fetchProjects } from "@/lib/portfolioService";

const byCreatedAt = (a: any, b: any) =>
  new Date(a.created_at).getTime() - new Date(b.created_at).getTime();

export default function ProjectsPage() {
  const router = useRouter();

  const [open, setOpen] = useState(false);
  const [projects, setProjects] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useRealtimeTable("projects", "projects-realtime", async () => {
    setProjects(await fetchProjects());
    setLoading(false);
  });

  const handleAdd = (newProject: any) => {
    setProjects((prev) => [...prev, newProject].sort(byCreatedAt));
  };

  return (
    <AdminShell
      title="Projects"
      subtitle="Shown in the Projects section of your site, oldest first"
      action={
        <button onClick={() => setOpen(true)} className={ADMIN_PRIMARY_BUTTON}>
          <Plus size={16} />
          Add Project
        </button>
      }
    >
          {/* GRID */}
          {loading ? (
            <div className="text-white/40 text-sm">
              Loading projects...
            </div>
          ) : projects.length === 0 ? (
            <div className={`${ADMIN_CARD} h-[240px] flex items-center justify-center text-white/35`}>
              No projects found
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-4 lg:gap-5 pb-6">
              {projects.map((project) => (
                <div
                  key={project.id}
                  className={`${ADMIN_CARD} p-3 lg:p-4 hover:border-white/25 transition-colors flex flex-col`}
                >
                  {/* IMAGE */}
                  <div className="w-full aspect-[4/3] rounded-2xl overflow-hidden bg-white/[0.03] mb-3">
                    {project.image_url ? (
                      <img
                        src={project.image_url}
                        alt={project.title}
                        className="w-full h-full object-cover block"
                      />
                    ) : (
                      <div className="w-full h-full bg-white/[0.03]" />
                    )}
                  </div>

                  {/* TITLE */}
                  <h2 className="font-semibold text-[14px] mb-1.5 line-clamp-1">
                    {project.title}
                  </h2>

                  {/* DESCRIPTION */}
                  <p className="text-[12px] text-white/50 line-clamp-2 mb-3 leading-relaxed min-h-[34px]">
                    {project.description}
                  </p>

                  {/* FOOTER */}
                  <div className="flex items-center justify-between mt-auto gap-3 flex-wrap">
                    <span className="text-[10px] text-white/30">
                      {project.created_at
                        ? new Date(
                            project.created_at
                          ).toLocaleDateString()
                        : "No date"}
                    </span>

                    <button
                      onClick={() =>
                        router.push(
                          `/admin/projects/${project.id}`
                        )
                      }
                      className="px-3 py-1.5 rounded-xl border border-white/10 hover:bg-white hover:text-black transition-colors text-[12px]"
                    >
                      Edit
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

      {/* MODAL */}
      <AddProjectModal
        isOpen={open}
        onClose={() => setOpen(false)}
        onAdd={handleAdd}
      />
    </AdminShell>
  );
}