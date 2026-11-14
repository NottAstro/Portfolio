import Link from "next/link";

export const metadata = {
  title: "Page not found | Aaryan Jain",
};

export default function NotFound() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center text-center px-6 bg-[linear-gradient(to_right,#ffffff10_1px,transparent_1px),linear-gradient(to_bottom,#ffffff10_1px,transparent_1px)] bg-[size:26px_26px]">
      <p
        className="text-[13px] tracking-[0.2em] text-white/40 mb-5"
        style={{ fontFamily: "var(--font-dm-mono), 'DM Mono', monospace" }}
      >
        ERROR 404
      </p>

      <h1 className="text-4xl md:text-5xl font-bold tracking-tight mb-4">Page not found</h1>

      <p className="text-white/60 text-sm sm:text-base leading-relaxed max-w-md mb-9">
        The page you&apos;re looking for doesn&apos;t exist or has been moved.
      </p>

      <div className="flex flex-wrap items-center justify-center gap-3">
        <Link
          href="/"
          className="px-6 py-3 rounded-xl bg-white text-black font-semibold text-sm hover:bg-white/90 transition-colors"
        >
          Back to home
        </Link>
        <Link
          href="/#projects"
          className="px-6 py-3 rounded-xl bg-white/[0.08] border border-white/15 text-sm font-medium hover:bg-white/15 hover:border-white/30 transition-colors"
        >
          View projects
        </Link>
      </div>
    </main>
  );
}
