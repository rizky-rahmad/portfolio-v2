"use client";

import Link from "next/link";
import { ArrowLeft, FlaskConical } from "lucide-react";
import { cn } from "@/lib/utils";
import { Navbar } from "@/components/portfolio/navbar";

export type DemoTab = { id: string; label: string };

export function DemoShell({
  title,
  description,
  tabs,
  active,
  onTab,
  children,
}: {
  title: string;
  description: string;
  tabs?: DemoTab[];
  active?: string;
  onTab?: (id: string) => void;
  children: React.ReactNode;
}) {
  return (
    <>
      <Navbar />
      <div className="mx-auto max-w-[1400px] px-4 sm:px-6 lg:px-8 py-24 sm:py-28">
      <Link
        href="/demos"
        className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        All demos
      </Link>

      <h1 className="mt-4 text-3xl sm:text-4xl font-bold text-foreground text-balance">
        {title}
      </h1>
      <p className="mt-3 text-muted-foreground text-lg max-w-3xl text-pretty">
        {description}
      </p>
      <p className="mt-3 inline-flex items-center gap-2 text-xs px-3 py-1.5 rounded-full bg-card border border-border text-muted-foreground">
        <FlaskConical className="w-3.5 h-3.5 text-primary" />
        Interactive mock — fictional data, everything runs in your browser.
      </p>

      {tabs && onTab && (
        <div className="mt-8 flex gap-2 flex-wrap" role="tablist" aria-label={`${title} sections`}>
          {tabs.map((tab) => (
            <button
              key={tab.id}
              role="tab"
              aria-selected={active === tab.id}
              onClick={() => onTab(tab.id)}
            className={cn(
              "px-4 py-2.5 text-sm font-medium rounded-lg border transition-colors min-h-11 cursor-pointer",
              active === tab.id
                ? "bg-primary text-primary-foreground border-primary"
                : "bg-card text-muted-foreground border-border hover:text-foreground hover:border-primary/30"
            )}
          >
            {tab.label}
          </button>
          ))}
        </div>
      )}

      <div className="mt-6">{children}</div>
      </div>
    </>
  );
}
