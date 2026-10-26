"use client";

import Image from "next/image";
import { motion, Variants } from "framer-motion";
import { Code, Layers, Mail, ArrowUpRight } from "lucide-react";
import usePortfolio from "@/hooks/usePortfolio";
import { EASE } from "@/lib/motion";

/* ================== ANIMATION ================== */

const container: Variants = {
  hidden: {},
  show: {
    transition: {
      staggerChildren: 0.16,
    },
  },
};

const fadeUp: Variants = {
  hidden: { opacity: 0, y: 35, filter: "blur(8px)" },
  show: {
    opacity: 1,
    y: 0,
    filter: "blur(0px)",
    transition: {
      duration: 1,
      ease: EASE,
    },
  },
};

const slideLeft: Variants = {
  hidden: { opacity: 0, x: 70, rotate: 2 },
  show: {
    opacity: 1,
    x: 0,
    rotate: 0,
    transition: {
      duration: 1.2,
      ease: EASE,
    },
  },
};

const pop: Variants = {
  hidden: { opacity: 0, scale: 0.92, y: 25 },
  show: {
    opacity: 1,
    scale: 1,
    y: 0,
    transition: {
      duration: 0.85,
      ease: EASE,
    },
  },
};

const SKILLS = [
  "Full-Stack Web Development",
  "React 19 / Next.js",
  "TypeScript & JavaScript",
  "Node.js & Express",
  "Distributed Systems",
  "Computer Vision & OpenCV",
  "Python",
  "C++ & Java",
  "MySQL & PostgreSQL",
  "RESTful APIs",
  "Algorithms & DSA",
];

/* ================== COMPONENT ================== */

export default function About() {
  const { projects, techStacks } = usePortfolio();

  const stats = [
    { icon: Code, value: projects.length, title: "PROJECTS", tab: "projects" },
    { icon: Layers, value: techStacks.length, title: "TECH STACK", tab: "techstack" },
    { icon: Mail, value: null, title: "CONTACT", tab: "contact" },
  ];

  return (
    <section
      id="about"
      className="flex items-start min-h-screen pt-[60px] px-6 pb-[30px] md:pt-20 md:pr-[60px] md:pl-[120px]"
    >
      <div style={{ width: "100%" }}>
        <div className="flex flex-col md:flex-row items-center justify-between gap-8">
          {/* LEFT */}
          <motion.div
            variants={container}
            initial="hidden"
            whileInView="show"
            viewport={{ once: false, margin: "-80px" }}
            style={{
              maxWidth: "600px",
              width: "100%",
            }}
          >
            <motion.div variants={fadeUp} style={{ marginBottom: 16 }}>
              <span
                style={{
                  fontFamily: "var(--font-dm-mono), 'DM Mono', monospace",
                  fontSize: 12,
                  color: "var(--text-muted)",
                  letterSpacing: "0.2em",
                }}
              >
                ABOUT ME
              </span>
            </motion.div>

            <motion.div variants={fadeUp}>
              <div
                style={{
                  fontSize: "clamp(30px, 5vw, 42px)",
                  fontWeight: 800,
                  lineHeight: 1.03,
                  color: "var(--text-primary)",
                }}
              >
                <div>Aaryan Jain</div>
              </div>
            </motion.div>

            <motion.div
              variants={{
                hidden: { opacity: 0, y: 40 },
                show: {
                  opacity: 1,
                  y: 0,
                  transition: {
                    duration: 1.1,
                    delay: 0.2,
                  },
                },
              }}
              className="max-w-full md:max-w-[520px]"
              style={{
                marginTop: 18,
                fontSize: 14,
                color: "var(--text-secondary)",
                lineHeight: 1.75,
              }}
            >
              <p style={{ marginBottom: "22px", lineHeight: "1.85" }}>
                Computer Science undergraduate at <strong>SVKM&apos;s NMIMS MPSTME</strong> (2024–2028),
                working across <strong>full-stack web development</strong>,{" "}
                <strong>distributed architectures</strong>, <strong>computer vision</strong>,
                and <strong>algorithmic systems</strong>. From creating modern, interactive web applications
                with React &amp; Next.js to building fault-tolerant storage engines and real-time AI tools with OpenCV,
                I enjoy engineering comprehensive solutions across the software stack.
              </p>

              <div>
                <strong style={{ color: "var(--text-primary)", fontSize: 13 }}>
                  Core Competencies
                </strong>
                <div
                  style={{
                    display: "flex",
                    gap: 8,
                    flexWrap: "wrap",
                    marginTop: 10,
                  }}
                >
                  {SKILLS.map((skill) => (
                    <span
                      key={skill}
                      style={{
                        fontFamily: "var(--font-dm-mono), 'DM Mono', monospace",
                        fontSize: 11,
                        color: "var(--text-secondary)",
                        border: "1px solid var(--border)",
                        borderRadius: 999,
                        padding: "5px 12px",
                        backgroundColor: "var(--bg-card)",
                      }}
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
            </motion.div>
          </motion.div>

          {/* IMAGE (desktop only) */}
          <motion.div
            variants={slideLeft}
            initial="hidden"
            whileInView="show"
            viewport={{ once: false }}
            className="hidden md:flex justify-end w-[48%]"
          >
            <div
              style={{
                padding: 12,
                borderRadius: "50%",
                border: "1px solid var(--border)",
                transform: "translateX(-80px)",
              }}
            >
              <Image
                src="/assets/profile.jpg"
                alt="Aaryan Jain"
                width={240}
                height={240}
                style={{
                  width: 240,
                  height: 240,
                  borderRadius: "50%",
                  objectFit: "cover",
                  display: "block",
                }}
              />
            </div>
          </motion.div>
        </div>

        {/* CARDS */}
        <motion.div
          variants={container}
          initial="hidden"
          whileInView="show"
          viewport={{ once: false }}
          className="grid grid-cols-[1fr] md:grid-cols-[repeat(3,1fr)] gap-[18px] mt-9"
        >
          {stats.map(({ icon: Icon, value, title, tab }) => (
            <motion.div
              key={tab}
              variants={pop}
              whileHover={{ scale: 1.03 }}
              onClick={() =>
                document.getElementById(tab)?.scrollIntoView({ behavior: "smooth" })
              }
              style={{
                position: "relative",
                padding: 18,
                borderRadius: 16,
                border: "1px solid var(--border)",
                background: "var(--bg-card)",
                cursor: "pointer",
              }}
            >
              <div
                style={{
                  width: 34,
                  height: 34,
                  borderRadius: "50%",
                  border: "1px solid var(--border)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  marginBottom: 10,
                }}
              >
                <Icon size={16} />
              </div>

              <div
                style={{
                  position: "absolute",
                  top: 16,
                  right: 16,
                  fontSize: 18,
                  fontWeight: 700,
                }}
              >
                {value}
              </div>

              <div
                style={{
                  fontSize: 11,
                  letterSpacing: "0.08em",
                }}
              >
                {title}
              </div>

              <div
                style={{
                  position: "absolute",
                  bottom: 14,
                  right: 14,
                  cursor: "pointer",
                }}
              >
                <ArrowUpRight size={15} />
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
