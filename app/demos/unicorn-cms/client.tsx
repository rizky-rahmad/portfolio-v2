"use client";

import dynamic from "next/dynamic";
import { DemoShell } from "@/components/demos/demo-shell";

const Playground = dynamic(() => import("@/components/demos/unicorn-cms/playground").then((m) => m.Playground), { ssr: false });

export function UnicornClient() {
  return (
    <main>
      <DemoShell
        title="Unicorn CMS — Page Builder"
        description="The visual editor prototype: grab anything and drag it, click any text to type. Nothing is locked, and every step can be undone. Try it right here."
      >
        <Playground />
      </DemoShell>
    </main>
  );
}
