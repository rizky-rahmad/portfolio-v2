import { Instagram, Mail, MessageCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import type { InboxChannel } from "@/content/demos/channelflow";

const meta: Record<InboxChannel, { label: string; icon: typeof Mail; chip: string; dot: string }> = {
  whatsapp: {
    label: "WhatsApp",
    icon: MessageCircle,
    chip: "bg-emerald-50 text-emerald-700",
    dot: "bg-emerald-500",
  },
  "instagram-dm": {
    label: "Instagram DM",
    icon: Instagram,
    chip: "bg-violet-50 text-violet-700",
    dot: "bg-violet-500",
  },
  email: {
    label: "Email",
    icon: Mail,
    chip: "bg-sky-50 text-sky-700",
    dot: "bg-sky-500",
  },
};

export const channelDotClass: Record<InboxChannel, string> = {
  whatsapp: "bg-emerald-500",
  "instagram-dm": "bg-violet-500",
  email: "bg-sky-500",
};

export function ChannelDot({ channel, className }: { channel: InboxChannel; className?: string }) {
  const m = meta[channel];
  const Icon = m.icon;
  return (
    <span
      title={m.label}
      aria-label={m.label}
      className={cn("flex items-center justify-center rounded-full", m.dot, className ?? "h-10 w-10")}
    >
      <Icon className="h-5 w-5 text-white" strokeWidth={2.25} />
    </span>
  );
}

export function ChannelChip({ channel }: { channel: InboxChannel }) {
  const m = meta[channel];
  const Icon = m.icon;
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full px-1.5 py-0.5 text-[10px] font-semibold",
        m.chip
      )}
    >
      <Icon className="h-3 w-3" strokeWidth={2.25} />
      {m.label}
    </span>
  );
}
