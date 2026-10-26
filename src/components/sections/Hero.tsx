"use client";

import { useEffect, useState, useSyncExternalStore } from "react";
import dynamic from "next/dynamic";
import { motion, TargetAndTransition } from "framer-motion";
import { FolderGit2 } from "lucide-react";
import TextType from "@/components/band/TextType";
import { EASE } from "@/lib/motion";

// three.js + physics are large; load them only on desktop, off the critical path.
const loadBandCard = () => import("@/components/band/App");
const BandCard = dynamic(loadBandCard, { ssr: false });

const ROLES = [
  "Full-Stack Web Developer",
  "Distributed & Backend Engineer",
  "Computer Vision & AI Enthusiast",
  "Algorithmic Problem Solver",
];

const DESKTOP_QUERY = "(min-width: 768px)";

const subscribeToDesktop = (onChange: () => void) => {
  const query = window.matchMedia(DESKTOP_QUERY);
  query.addEventListener("change", onChange);
  return () => query.removeEventListener("change", onChange);
};

const isDesktopViewport = () => window.matchMedia(DESKTOP_QUERY).matches;

type HeroProps = {
  showApp: boolean;
};

const headingStyle = {
  fontSize: "clamp(36px, 6.5vw, 68px)",
  fontWeight: 800,
  lineHeight: 1.05,
  letterSpacing: "-0.03em",
};

const monoStyle = {
  fontFamily: "var(--font-dm-mono), 'DM Mono', monospace",
  fontSize: 14,
  color: "var(--text-muted)",
};

const ctaStyle = {
  display: "inline-flex",
  alignItems: "center",
  gap: 9,
  padding: "13px 26px",
  borderRadius: 12,
  fontSize: 14.5,
  fontWeight: 600,
  cursor: "pointer",
  textDecoration: "none",
  userSelect: "none",
} as const;

export default function Hero({ showApp }: HeroProps) {
  const [startAnim, setStartAnim] = useState(false);
  const isDesktop = useSyncExternalStore(subscribeToDesktop, isDesktopViewport, () => false);

  useEffect(() => {
    const heroPlayed = sessionStorage.getItem("heroPlayed");

    if (heroPlayed === "true") {
      setStartAnim(true);
      return;
    }

    const delay = 3600;

    const textTimer = setTimeout(() => {
      setStartAnim(true);
    }, delay);

    const appTimer = setTimeout(() => {
      sessionStorage.setItem("heroPlayed", "true");
    }, delay + 1500);

    return () => {
      clearTimeout(textTimer);
      clearTimeout(appTimer);
    };
  }, []);

  // Start downloading the 3D card now so it is ready when the intro ends
  useEffect(() => {
    if (isDesktop) loadBandCard();
  }, [isDesktop]);

  // Animate to `shown` once the intro is done, otherwise hold at `hidden`
  const reveal = (hidden: TargetAndTransition, shown: TargetAndTransition) => ({
    initial: false as const,
    animate: startAnim ? shown : hidden,
  });

  return (
    <section
      id="home"
      className="px-6 md:pl-[120px] md:pr-[60px]"
      style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "flex-start",
        position: "relative",
        overflow: "hidden",
      }}
    >
      {/* APP LAYER (3D Card & Band Canvas) */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          zIndex: 10,
          pointerEvents: showApp ? "auto" : "none",
        }}
      >
        {showApp && isDesktop && <BandCard />}
      </div>

      {/* TEXT CONTENT LAYER */}
      <div
        className="md:max-w-[680px]"
        style={{
          width: "100%",
          position: "relative",
          zIndex: 30,
          pointerEvents: "none",
        }}
      >
        {/* HEADING */}
        <div>
          <motion.h1
            {...reveal(
              { opacity: 0, scale: 0.85, y: 50 },
              { opacity: 1, scale: 1, y: 0 }
            )}
            transition={{ duration: 1, ease: EASE }}
            style={{
              ...headingStyle,
              color: "var(--text-primary)",
              marginBottom: 0,
            }}
          >
            Hi, I&apos;m
          </motion.h1>

          <motion.h1
            {...reveal(
              { opacity: 0, x: -80, rotate: -4 },
              { opacity: 1, x: 0, rotate: 0 }
            )}
            transition={{ duration: 1, delay: 0.2, ease: EASE }}
            style={{
              ...headingStyle,
              color: "var(--text-secondary)",
              marginBottom: 24,
            }}
          >
            Aaryan Jain
          </motion.h1>
        </div>

        {/* STATUS */}
        <motion.div
          {...reveal({ opacity: 0, x: 40 }, { opacity: 1, x: 0 })}
          transition={{ duration: 0.8, delay: 0.35 }}
          style={{ marginBottom: 14 }}
        >
          <span
            style={{
              fontFamily: "var(--font-dm-mono), 'DM Mono', monospace",
              fontSize: 17,
              color: "var(--text-secondary)",
              letterSpacing: "0.08em",
            }}
          >
            <TextType
              text={ROLES}
              typingSpeed={70}
              pauseDuration={1600}
              showCursor
              cursorCharacter="_"
              deletingSpeed={45}
              cursorBlinkDuration={0.5}
            />
          </span>
        </motion.div>

        {/* DESC */}
        <motion.div
          {...reveal(
            { opacity: 0, y: 50, scale: 0.96 },
            { opacity: 1, y: 0, scale: 1 }
          )}
          transition={{ duration: 1, delay: 0.5 }}
          style={{
            marginBottom: 26,
            width: "100%",
            maxWidth: 580,
          }}
        >
          <p
            style={{
              fontSize: 16.5,
              color: "var(--text-secondary)",
              lineHeight: 1.85,
              letterSpacing: "0.01em",
              textWrap: "pretty",
            }}
          >
            Multi-disciplinary software engineer building scalable web applications,
            distributed systems, and computer vision tools. Experienced across
            modern frontend engineering with React &amp; Next.js, resilient backend
            architectures, and algorithmic computing with Python, C++, and Java.
          </p>
        </motion.div>

        {/* CTA BUTTONS */}
        <motion.div
          {...reveal({ opacity: 0, y: 30 }, { opacity: 1, y: 0 })}
          transition={{ duration: 0.8, delay: 0.7 }}
          style={{
            position: "relative",
            zIndex: 40,
            pointerEvents: "auto",
            display: "flex",
            alignItems: "center",
            gap: 14,
            marginBottom: 28,
            flexWrap: "wrap",
          }}
        >
          <a
            href="#projects"
            className="hero-cta hero-cta-primary"
            onClick={(e) => {
              e.preventDefault();
              const target = document.getElementById("projects");
              if (target) {
                target.scrollIntoView({ behavior: "smooth" });
                window.history.pushState(null, "", "#projects");
              }
            }}
            style={{
              ...ctaStyle,
              border: "1px solid white",
              background: "white",
              color: "black",
              transition: "transform 0.25s ease, opacity 0.25s ease, box-shadow 0.25s ease",
              boxShadow: "0 4px 20px rgba(255,255,255,0.15)",
            }}
          >
            <FolderGit2 size={17} />
            Projects
          </a>

          <a
            href="https://github.com/NottAstro"
            target="_blank"
            rel="noopener noreferrer"
            className="hero-cta hero-cta-secondary"
            style={{
              ...ctaStyle,
              border: "1px solid rgba(255,255,255,0.2)",
              background: "rgba(255,255,255,0.05)",
              backdropFilter: "blur(8px)",
              WebkitBackdropFilter: "blur(8px)",
              color: "white",
              transition: "transform 0.25s ease, background 0.25s ease, border-color 0.25s ease",
            }}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="17"
              height="17"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.403 5.403 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.17.6-.22 1.23-.15 1.85v4" />
              <path d="M9 18c-4.51 2-5-2-7-2" />
            </svg>
            GitHub
          </a>
        </motion.div>

        {/* FOOTER */}
        <motion.div
          {...reveal({ opacity: 0, y: 25 }, { opacity: 1, y: 0 })}
          transition={{ duration: 0.8, delay: 1 }}
          style={{
            display: "flex",
            flexDirection: "column",
            gap: 8,
          }}
        >
          <span style={monoStyle}>↓ explore my work below</span>
          <span style={monoStyle}>↗ open to full-time &amp; freelance opportunities</span>
        </motion.div>
      </div>

      {/* SCROLL INDICATOR */}
      <motion.div
        {...reveal({ opacity: 0, y: 80 }, { opacity: 1, y: 0 })}
        transition={{
          duration: 0.9,
          delay: 1.2,
          ease: EASE,
        }}
        className="absolute left-1/2 z-20 pointer-events-none w-0 flex justify-center"
        style={{ bottom: 54 }}
      >
        <motion.div
          animate={{
            y: [0, 6, 0],
            opacity: [1, 0.65, 1],
          }}
          transition={{
            duration: 1.4,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
          className="flex items-center justify-center gap-2"
        >
          <span
            style={{
              fontFamily: "var(--font-dm-mono), 'DM Mono', monospace",
              fontSize: 11,
              letterSpacing: '0.2em',
              textTransform: 'uppercase',
              color: 'var(--text-muted)',
            }}
          >
            Scroll
          </span>

          <span
            style={{
              fontSize: 16,
              color: 'var(--text-secondary)',
              lineHeight: 1,
            }}
          >
            ↓
          </span>
        </motion.div>
      </motion.div>
    </section>
  );
}
