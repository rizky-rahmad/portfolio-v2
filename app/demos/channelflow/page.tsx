import type { Metadata } from "next";
import { ChannelflowClient } from "./client";

export const metadata: Metadata = {
  title: "Channelflow Demo | Rahmad Rizki",
  description:
    "Interactive mock of the Channelflow omnichannel AI agent: inbox reply pipeline, booking wizard, and staff mobile board.",
};

export default function ChannelflowDemoPage() {
  return <ChannelflowClient />;
}
