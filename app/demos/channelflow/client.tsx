"use client";

import { useState } from "react";
import dynamic from "next/dynamic";
import { JetBrains_Mono, Montserrat } from "next/font/google";
import { DemoShell } from "@/components/demos/demo-shell";

const jbMono = JetBrains_Mono({ subsets: ["latin"], variable: "--font-demo-mono" });
const mont = Montserrat({ subsets: ["latin"], variable: "--font-demo-mont" });

const InboxDemo = dynamic(() => import("@/components/demos/channelflow/inbox-demo").then((m) => m.InboxDemo), { ssr: false });
const BookingDemo = dynamic(() => import("@/components/demos/channelflow/booking-demo").then((m) => m.BookingDemo), { ssr: false });
const MobileDemo = dynamic(() => import("@/components/demos/channelflow/mobile-demo").then((m) => m.MobileDemo), { ssr: false });
const VoiceDemo = dynamic(() => import("@/components/demos/channelflow/voice-demo").then((m) => m.VoiceDemo), { ssr: false });

const tabs = [
  { id: "inbox", label: "AI Inbox" },
  { id: "booking", label: "Booking" },
  { id: "mobile", label: "Mobile board" },
  { id: "voice", label: "Voice" },
];

export function ChannelflowClient() {
  const [active, setActive] = useState("inbox");

  return (
    <main className={`${jbMono.variable} ${mont.variable}`}>
      <DemoShell
        title="Channelflow — Omnichannel AI Agent"
        description="WhatsApp, Instagram and Email in one inbox. The AI agent drafts replies for staff to approve, completes bookings, and hands sensitive chats to a human. The Voice tab is a live call with the agent over Gemini — mic required."
        tabs={tabs}
        active={active}
        onTab={setActive}
      >
        {active === "inbox" && <InboxDemo />}
        {active === "booking" && <BookingDemo />}
        {active === "mobile" && <MobileDemo />}
        {active === "voice" && <VoiceDemo />}
      </DemoShell>
    </main>
  );
}
