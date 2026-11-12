"use client";

import { m } from "framer-motion";
import { useInView } from "framer-motion";
import { useRef } from "react";
import { ExternalLink, Github, Layers, FlaskConical } from "lucide-react";
import Image from "next/image";

// Tambahan Tipe Data untuk memperbaiki error TypeScript
type FeaturedProject = {
  title: string;
  description: string;
  image: string;
  liveUrl?: string;
  githubUrl?: string;
  demoUrl?: string;
  stack: string[];
  featured: boolean;
  label?: string;
};

// Terapkan tipe data ke array
const featuredProjects: FeaturedProject[] = [
  {
    title: "Channelflow — Omnichannel AI Agent",
    description:
      "Worked with staff and managers to define messaging and booking flows, test features with users, and follow up on feedback. Extended an existing inbox across WhatsApp, Instagram, email, and TikTok. The platform handles approximately 17,700 messages and 3,500 bookings per month. Developed AI messaging and booking features using semantic search, knowledge-base retrieval (RAG), and staff handoff. The AI agent generates an average of about 400 replies per day. Added WhatsApp voice-note transcription and role-based permissions and worked on message queues, retries, crash handoff, and photo understanding. Extended an existing Expo Android booking app supporting day, list, and month views, improved analytics and added over-the-air updates. Built a voice booking agent from the initial concept, defining conversation flows and testing calls. The pilot includes availability checks, booking tools, and caller confirmation before saving a reservation.",
    image: "/images/projects/channelflow.webp",
    demoUrl: "/demos/channelflow",
    stack: ["Next.js", "Hono", "Mastra", "BullMQ", "PostgreSQL", "Drizzle", "Expo", "LiveKit"],
    featured: true,
    label: "Team Project · PT Unicorn",
  },
  {
    title: "PeopleOS — HR Platform",
    description:
      "Developed web and mobile features for a platform used by 154 employees for hiring, training, scheduling, GPS clock-in, and leave. Work includes leave requests, approval flows, and leave-tracker exports. Developed AI interview authoring features and integration fixes, including controls for reviewing the interviewer’s script.",
    image: "/images/projects/peopleos.webp",
    demoUrl: "/demos/peopleos",
    stack: ["React", "Express", "PostgreSQL", "Drizzle", "React Native (Expo)"],
    featured: true,
    label: "Team Project · PT Unicorn",
  },
  {
    title: "Unicorn CMS — Multi-brand Website Builder",
    description:
      "Built a drag-and-drop page builder from the initial concept, defining editor workflows and guiding implementation. Includes 20+ components, device-specific layouts, and version history. Added website imports, brand-domain publishing, SEO, and tracking, with end-to-end checks in Playwright.",
    image: "/images/projects/unicorn-cms.webp",
    demoUrl: "/demos/unicorn-cms",
    stack: ["Next.js", "Hono", "PostgreSQL", "Drizzle", "Tiptap", "Playwright"],
    featured: true,
    label: "Team Project · PT Unicorn",
  },
  {
    title: "Portfolio with AI Assistant",
    description:
      "Built an assistant answering questions about my background in English or Indonesian. Reduced reply time from approximately 49 to 2 seconds by loading the résumé only when it changes. Identified a CSS fade-in delaying LCP. Mobile PageSpeed rose from 90 to 98 and LCP fell from 1,536 ms to 508 ms.",
    image: "/images/projects/portfolio-ai.webp",
    liveUrl: "https://rizky-portfolio.pages.dev",
    githubUrl: "https://github.com/rizky-rahmad/portfolio-v2",
    stack: ["Next.js", "Gemini", "Cloudflare", "GitHub Actions"],
    featured: true,
  },
  {
    title: "ApplyMate AI",
    description:
      "Analyzes a résumé against a job posting and produces a match analysis and tailored cover letter.",
    image: "/images/projects/applymate.webp",
    liveUrl: "https://apply-mate-ai-nine.vercel.app",
    githubUrl: "https://github.com/rizky-rahmad/ApplyMateAi",
    stack: ["Next.js", "TypeScript", "Gemini", "Tailwind CSS"],
    featured: true,
  },
  {
    title: "Barakah Qurban — Premium Landing Page",
    description:
      "Modern landing page for a Qurban cattle provider. Features smooth reveal-on-scroll animations, an elegant glassmorphism design, and a fully responsive interface.",
    image: "/images/projects/barakah-qurban.jpg",
    liveUrl: "https://barakah-qurban.vercel.app",
    githubUrl: "https://github.com/rizky-rahmad/barakah-qurban",
    stack: ["Next.js", "React 19", "TypeScript", "Tailwind CSS v4", "Radix UI"],
    featured: true,
  },
  {
    title: "SIKEMAS - Complaint Management System",
    description:
      "Built SIKEMAS (sikemasbpsdm.web.id), a complaint management platform with ticket tracking, role-based access, audit logs, and analytics.",
    image: "/images/projects/sikemas.webp",
    liveUrl: "https://sikemasbpsdm.web.id",
    stack: [
      "React (Vite)",
      "Bootstrap 5",
      "Node.js",
      "Express",
      "PostgreSQL",
      "JWT",
      "Google OAuth 2.0",
    ],
    featured: true,
  },
  {
    title: "Attendance System - Online Platform",
    description:
      "Developed an online attendance system with role-based access, one check-in per employee per day, and daily and monthly reports.",
    image: "/images/projects/attendance.webp",
    stack: [
      "React (Vite)",
      "Bootstrap 5",
      "Node.js",
      "Express",
      "PostgreSQL",
      "JWT",
    ],
    featured: true,
  },
];

export function Projects() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  return (
    <section
      id="projects"
      className="py-20 sm:py-32 relative overflow-hidden bg-secondary/20"
    >
      {/* Background decoration */}
      <div className="absolute inset-0 -z-10">
        <div className="absolute top-1/4 right-0 w-150 h-150 bg-primary/3 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 left-0 w-150 h-150 bg-primary/3 rounded-full blur-3xl" />
      </div>

      <div ref={ref} className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <m.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <span className="text-primary text-sm font-semibold tracking-wider uppercase">
            Portfolio
          </span>
          <h2 className="mt-3 text-3xl sm:text-4xl md:text-5xl font-bold text-foreground text-balance">
            Featured Projects
          </h2>
          <p className="mt-4 text-muted-foreground text-lg max-w-2xl mx-auto text-pretty">
            A selection of production-ready projects showcasing full-stack
            development expertise and real-world problem solving.
          </p>
        </m.div>

        {/* Featured Projects */}
        <div className="space-y-8 mb-20">
          {featuredProjects
            .filter((p) => p.featured)
            .map((project, index) => (
              <m.div
                key={project.title}
                initial={{ opacity: 0, y: 50 }}
                animate={isInView ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.6, delay: 0.2 + index * 0.2 }}
                className={`grid lg:grid-cols-2 gap-8 items-center ${
                  index % 2 === 1 ? "lg:flex-row-reverse" : ""
                }`}
              >
                {/* Project Image */}
                <div
                  className={`relative group ${index % 2 === 1 ? "lg:order-2" : ""}`}
                >
                  <div className="relative aspect-video rounded-2xl overflow-hidden bg-card border border-border">
                    <Image
                      src={project.image}
                      alt={`Screenshot of ${project.title}`}
                      fill
                      sizes="(max-width: 1024px) 100vw, 50vw"
                      className="object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-linear-to-t from-background/80 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

                    {/* Overlay links */}
                    <div className="absolute inset-0 flex items-center justify-center gap-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                      {project.demoUrl && (
                        <a
                          href={project.demoUrl}
                          aria-label={`Try the ${project.title} interactive demo`}
                          className="p-3 rounded-full bg-primary text-primary-foreground hover:bg-primary/90 transition-colors"
                        >
                          <FlaskConical className="w-5 h-5" />
                        </a>
                      )}
                      {project.liveUrl && (
                        <a
                          href={project.liveUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          aria-label={`Open the ${project.title} website`}
                          className="p-3 rounded-full bg-primary text-primary-foreground hover:bg-primary/90 transition-colors"
                        >
                          <ExternalLink className="w-5 h-5" />
                        </a>
                      )}
                      {project.githubUrl && (
                        <a
                          href={project.githubUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          aria-label={`View the ${project.title} source on GitHub`}
                          className="p-3 rounded-full bg-card text-foreground hover:bg-secondary transition-colors"
                        >
                          <Github className="w-5 h-5" />
                        </a>
                      )}
                    </div>
                  </div>

                  {/* Decorative elements */}
                  <div className="absolute -inset-2 bg-primary/10 rounded-2xl -z-10 blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                </div>

                {/* Project Info */}
                <div className={index % 2 === 1 ? "lg:order-1" : ""}>
                  <div className="flex items-center gap-2 mb-4">
                    <Layers className="w-5 h-5 text-primary" />
                    <span className="text-primary text-sm font-medium">
                      {project.label ?? "Featured Project"}
                    </span>
                  </div>
                  <h3 className="text-2xl sm:text-3xl font-bold text-foreground mb-4">
                    {project.title}
                  </h3>
                  <p className="text-muted-foreground leading-relaxed mb-6">
                    {project.description}
                  </p>

                  {/* Tech Stack */}
                  <div className="flex flex-wrap gap-2 mb-6">
                    {project.stack.map((tech) => (
                      <span
                        key={tech}
                        className="px-3 py-1.5 text-sm rounded-lg bg-card border border-border text-foreground hover:border-primary/30 transition-colors"
                      >
                        {tech}
                      </span>
                    ))}
                  </div>

                  {/* Links */}
                  <div className="flex items-center gap-4 flex-wrap">
                    {project.demoUrl && (
                      <a
                        href={project.demoUrl}
                        className="inline-flex items-center gap-2 text-primary font-medium hover:underline"
                      >
                        <FlaskConical className="w-4 h-4" />
                        <span>Interactive Demo</span>
                      </a>
                    )}
                    {project.liveUrl && (
                      <a
                        href={project.liveUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 text-primary font-medium hover:underline"
                      >
                        <span>Live Demo</span>
                        <ExternalLink className="w-4 h-4" />
                      </a>
                    )}
                    {project.githubUrl && (
                      <a
                        href={project.githubUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors"
                      >
                        <Github className="w-4 h-4" />
                        <span>Source Code</span>
                      </a>
                    )}
                  </div>
                </div>
              </m.div>
            ))}
        </div>

      </div>
    </section>
  );
}
