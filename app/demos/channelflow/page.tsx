import type { Metadata } from "next";
import { ChannelflowClient } from "./client";

export const metadata: Metadata = {
  title: "Channelflow Demo | Rahmad Rizki",
  description:
    "Interactive mock of the Channelflow omnichannel AI agent: inbox reply pipeline, booking wizard, staff mobile board, and a live voice call.",
};

export default function ChannelflowDemoPage() {
  return <ChannelflowClient />;
}
