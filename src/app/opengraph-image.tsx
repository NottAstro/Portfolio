import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { ImageResponse } from "next/og";

// Social link preview (LinkedIn, WhatsApp, X, Slack...), rendered at build time.
export const alt = "Aaryan Jain — Software Engineer";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

const ROLES = ["Full-Stack Development", "Distributed Systems", "Computer Vision"];

// Syne (the site's font) from Google Fonts; falls back to the default font if unreachable
async function loadSyne(weight: 400 | 800) {
  try {
    const css = await (
      await fetch(`https://fonts.googleapis.com/css2?family=Syne:wght@${weight}`)
    ).text();
    const url = css.match(/src: url\((.+?)\) format\('(?:truetype|opentype)'\)/)?.[1];
    if (!url) return [];
    const data = await (await fetch(url)).arrayBuffer();
    return [{ name: "Syne", data, weight, style: "normal" as const }];
  } catch {
    return [];
  }
}

export default async function OpengraphImage() {
  const photo = await readFile(join(process.cwd(), "public/assets/profile.jpg"));
  const photoSrc = `data:image/jpeg;base64,${photo.toString("base64")}`;
  const fonts = (await Promise.all([loadSyne(400), loadSyne(800)])).flat();

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "0 80px",
          backgroundColor: "#0d0d0d",
          backgroundImage:
            "linear-gradient(to right, rgba(255,255,255,0.05) 1px, transparent 1px), linear-gradient(to bottom, rgba(255,255,255,0.05) 1px, transparent 1px)",
          backgroundSize: "40px 40px",
          color: "#f0f0f0",
          fontFamily: fonts.length ? "Syne" : undefined,
        }}
      >
        <div style={{ display: "flex", flexDirection: "column", maxWidth: 720 }}>
          <div style={{ fontSize: 26, color: "#888888", letterSpacing: 4, marginBottom: 18 }}>
            AARYANN.DEV
          </div>
          <div
            style={{
              fontSize: 66,
              fontWeight: 800,
              lineHeight: 1.02,
              letterSpacing: -2,
              whiteSpace: "nowrap",
            }}
          >
            Aaryan Jain
          </div>
          <div style={{ fontSize: 38, color: "#bdbdbd", marginTop: 16 }}>Software Engineer</div>
          <div style={{ display: "flex", gap: 12, marginTop: 40 }}>
            {ROLES.map((role) => (
              <div
                key={role}
                style={{
                  display: "flex",
                  fontSize: 19,
                  color: "#d4d4d4",
                  padding: "8px 16px",
                  borderRadius: 999,
                  border: "1px solid #2a2a2a",
                  backgroundColor: "#1a1a1a",
                }}
              >
                {role}
              </div>
            ))}
          </div>
        </div>

        <div
          style={{
            display: "flex",
            padding: 12,
            borderRadius: 999,
            border: "1px solid #2a2a2a",
          }}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={photoSrc}
            width={300}
            height={300}
            alt=""
            style={{ borderRadius: 999, objectFit: "cover" }}
          />
        </div>
      </div>
    ),
    { ...size, fonts }
  );
}
