import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, ExternalLink, MessagesSquare, Users, LayoutTemplate, Sparkles, MoonStar, ClipboardList } from "lucide-react";
import { Navbar } from "@/components/portfolio/navbar";

export const metadata: Metadata = {
  title: "Interactive Demos | Rahmad Rizki",
  description:
    "Playable mock prototypes of shipped projects: Channelflow omnichannel AI agent, PeopleOS HR platform, and Unicorn CMS page builder — plus live links to deployed projects.",
};

const demos = [
  {
    slug: "channelflow",
    icon: MessagesSquare,
    title: "Channelflow — Omnichannel AI Agent",
    description:
      "One inbox for WhatsApp, Instagram and Email where an AI agent drafts replies, completes bookings, and hands sensitive chats to a human — plus the staff mobile board and a voice call preview.",
    tries: ["AI inbox reply", "Booking wizard", "Mobile board", "Voice call"],
  },
  {
    slug: "peopleos",
    icon: Users,
    title: "PeopleOS — HR Platform",
    description:
      "Leave requests flowing through leader then People & Culture approval, the weekly shift schedule with GPS clock-in, and a hiring candidate board.",
    tries: ["Leave approval", "Clock-in", "Hiring board"],
  },
  {
    slug: "unicorn-cms",
    icon: LayoutTemplate,
    title: "Unicorn CMS — Page Builder",
    description:
      "A mini page builder: add blocks to a canvas, switch Desktop / Tablet / Mobile layouts, and restore an older version from history.",
    tries: ["Add blocks", "Device preview", "Version restore"],
  },
];

// Projects with a real deployed site instead of an in-browser mock.
// Copy matches components/portfolio/projects.tsx — external links open in a new tab.
const liveSites = [
  {
    href: "https://apply-mate-ai-nine.vercel.app",
    icon: Sparkles,
    title: "ApplyMate AI",
    description:
      "Turns a résumé and a job posting into a match score, the skills that line up and the ones missing, and a tailored cover letter — grounded only in the candidate's real experience.",
  },
  {
    href: "https://barakah-qurban.vercel.app",
    icon: MoonStar,
    title: "Barakah Qurban — Premium Landing Page",
    description:
      "Modern landing page for a Qurban cattle provider. Features smooth reveal-on-scroll animations, an elegant glassmorphism design, and a fully responsive interface.",
  },
  {
    href: "https://sikemasbpsdm.web.id",
    icon: ClipboardList,
    title: "SIKEMAS - Complaint Management System",
    description:
      "Managed platform for BPSDM Aceh with multi-role RBAC, audit logs, and automated ticket dispatching. A comprehensive system for handling institutional complaints efficiently.",
  },
];

export default function DemosPage() {
  return (
    <main className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 py-24 sm:py-28">
      <Navbar />
      <p className="text-primary text-sm font-semibold tracking-wider uppercase">Prototypes</p>
      <h1 className="mt-3 text-3xl sm:text-4xl md:text-5xl font-bold text-foreground text-balance">
        Interactive demos
      </h1>
      <p className="mt-4 text-muted-foreground text-lg max-w-2xl text-pretty">
        Playable mock versions of production projects. Fictional data — everything runs
        locally in your browser, no account needed.
      </p>

      <div className="mt-12 grid gap-6 md:grid-cols-3">
        {demos.map((demo) => (
          <Link
            key={demo.slug}
            href={`/demos/${demo.slug}`}
            className="group rounded-2xl bg-card border border-border p-6 hover:border-primary/40 transition-colors flex flex-col"
          >
            <demo.icon className="w-8 h-8 text-primary" />
            <h2 className="mt-4 text-xl font-bold text-foreground">{demo.title}</h2>
            <p className="mt-2 text-sm text-muted-foreground leading-relaxed flex-1">
              {demo.description}
            </p>
            <p className="mt-4 text-xs text-muted-foreground">
              Try: {demo.tries.join(" · ")}
            </p>
            <span className="mt-4 inline-flex items-center gap-2 text-primary font-medium text-sm">
              Open demo
              <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
            </span>
          </Link>
        ))}
      </div>

      <h2 className="mt-16 text-2xl sm:text-3xl font-bold text-foreground text-balance">
        Live sites
      </h2>
      <p className="mt-3 text-muted-foreground max-w-2xl text-pretty">
        Deployed projects you can visit directly — real apps with real backends,
        opening in a new tab.
      </p>

      <div className="mt-8 grid gap-6 md:grid-cols-3">
        {liveSites.map((site) => (
          <a
            key={site.href}
            href={site.href}
            target="_blank"
            rel="noopener noreferrer"
            className="group rounded-2xl bg-card border border-border p-6 hover:border-primary/40 transition-colors flex flex-col"
          >
            <site.icon className="w-8 h-8 text-primary" />
            <h3 className="mt-4 text-xl font-bold text-foreground">{site.title}</h3>
            <p className="mt-2 text-sm text-muted-foreground leading-relaxed flex-1">
              {site.description}
            </p>
            <span className="mt-4 inline-flex items-center gap-2 text-primary font-medium text-sm">
              Visit live site
              <ExternalLink className="w-4 h-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
            </span>
          </a>
        ))}
      </div>

      <Link
        href="/#projects"
        className="mt-10 inline-block text-sm text-muted-foreground hover:text-foreground transition-colors"
      >
        ← Back to portfolio
      </Link>
    </main>
  );
}
