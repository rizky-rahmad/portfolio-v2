import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, MessagesSquare, Users, LayoutTemplate } from "lucide-react";
import { Navbar } from "@/components/portfolio/navbar";

export const metadata: Metadata = {
  title: "Interactive Demos | Rahmad Rizki",
  description:
    "Playable mock prototypes of shipped projects: Channelflow omnichannel AI agent, PeopleOS HR platform, and Unicorn CMS page builder.",
};

const demos = [
  {
    slug: "channelflow",
    icon: MessagesSquare,
    title: "Channelflow — Omnichannel AI Agent",
    description:
      "One inbox for WhatsApp, Instagram and Email where an AI agent drafts replies, completes bookings, and hands sensitive chats to a human — plus the staff mobile board and a voice-agent simulation.",
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

      <Link
        href="/#projects"
        className="mt-10 inline-block text-sm text-muted-foreground hover:text-foreground transition-colors"
      >
        ← Back to portfolio
      </Link>
    </main>
  );
}
