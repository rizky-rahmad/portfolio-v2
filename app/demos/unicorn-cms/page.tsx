import type { Metadata } from "next";
import { UnicornClient } from "./client";

export const metadata: Metadata = {
  title: "Unicorn CMS Demo | Rahmad Rizki",
  description:
    "Interactive mock of the Unicorn CMS page builder: add blocks, preview per device, and restore versions.",
};

export default function UnicornDemoPage() {
  return <UnicornClient />;
}
