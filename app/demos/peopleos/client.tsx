"use client";

import { useState } from "react";
import dynamic from "next/dynamic";
import { DemoShell } from "@/components/demos/demo-shell";
import { PosShell, type PosModule } from "@/components/demos/peopleos/shell-demo";

const DashboardDemo = dynamic(
  () => import("@/components/demos/peopleos/dashboard-demo").then((m) => m.DashboardDemo),
  { ssr: false }
);
const LeaveDemo = dynamic(
  () => import("@/components/demos/peopleos/leave-demo").then((m) => m.LeaveDemo),
  { ssr: false }
);
const ScheduleDemo = dynamic(
  () => import("@/components/demos/peopleos/schedule-demo").then((m) => m.ScheduleDemo),
  { ssr: false }
);
const HiringDemo = dynamic(
  () => import("@/components/demos/peopleos/hiring-demo").then((m) => m.HiringDemo),
  { ssr: false }
);

export function PeopleOsClient() {
  const [active, setActive] = useState<PosModule>("dashboard");

  return (
    <main>
      <DemoShell
        title="PeopleOS — HR Platform"
        description="HR overview, two-step leave approval, shift scheduling with GPS clock-in, and the hiring pipeline — rebuilt from the production app. Fictional data, everything runs in your browser."
      >
        <PosShell active={active} onNav={setActive}>
          {active === "dashboard" && <DashboardDemo />}
          {active === "approvals" && <LeaveDemo />}
          {active === "schedule" && <ScheduleDemo />}
          {active === "candidates" && <HiringDemo />}
        </PosShell>
      </DemoShell>
    </main>
  );
}
