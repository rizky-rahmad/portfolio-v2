import type { Metadata } from "next";
import { PeopleOsClient } from "./client";

export const metadata: Metadata = {
  title: "PeopleOS Demo | Rahmad Rizki",
  description:
    "Interactive mock of the PeopleOS HR platform: two-step leave approval, shift schedule with GPS clock-in, and hiring board.",
};

export default function PeopleOsDemoPage() {
  return <PeopleOsClient />;
}
