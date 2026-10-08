"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import {
  Archive,
  ArchiveRestore,
  BookOpenText,
  Bot,
  CalendarPlus,
  Check,
  CheckCircle2,
  ChevronDown,
  ChevronLeft,
  Clock,
  EllipsisVertical,
  Gauge,
  History,
  Link2,
  Loader2,
  MessageSquare,
  PanelRightOpen,
  Paperclip,
  Pencil,
  RefreshCw,
  Search,
  Send,
  SlidersHorizontal,
  Sparkles,
  StickyNote,
  User,
  Users,
  WandSparkles,
  X,
} from "lucide-react";
import { cn } from "@/lib/utils";
import {
  folders,
  inboxConvs,
  type CannedConv,
  type CannedMsg,
  type CoachReview,
  type HistoryItem,
  type InboxChannel,
  type InboxFolder,
  type PanelBooking,
} from "@/content/demos/channelflow";
import { ChannelChip, ChannelDot, channelDotClass } from "./channel-chip";
import "./inbox.css";

const goalStyle: Record<string, string> = {
  Interested: "bg-emerald-50 text-emerald-700",
  Booking: "bg-blue-50 text-blue-700",
  Booked: "bg-green-50 text-green-700",
  Lost: "bg-rose-50 text-rose-700",
};

const channelFilterOptions: { id: "All" | InboxChannel; label: string }[] = [
  { id: "All", label: "All" },
  { id: "whatsapp", label: "WhatsApp" },
  { id: "instagram-dm", label: "Instagram" },
  { id: "email", label: "Email" },
];

const quickReplies = [
  "Thanks for reaching out! Let me check that for you.",
  "Your booking is confirmed. Show your reference code when you arrive!",
];

function nowTime() {
  return new Date().toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" });
}

function initials(name: string) {
  return name.split(" ").map((w) => w[0]).join("").slice(0, 2).toUpperCase();
}

export function InboxDemo() {
  const [convs, setConvs] = useState<CannedConv[]>(inboxConvs);
  const [convId, setConvId] = useState(inboxConvs[0].id);
  const [folder, setFolder] = useState<InboxFolder>("All");
  const [query, setQuery] = useState("");
  const [channel, setChannel] = useState<"All" | InboxChannel>("All");
  const [showFolders, setShowFolders] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [mobilePane, setMobilePane] = useState<"list" | "thread">("list");
  const [composerTab, setComposerTab] = useState<"reply" | "note">("reply");
  const [text, setText] = useState("");
  const [showTemplates, setShowTemplates] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [dismissedHandoff, setDismissedHandoff] = useState<string | null>(null);
  const [showKebab, setShowKebab] = useState(false);
  const [panelOpen, setPanelOpen] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  const conv = convs.find((c) => c.id === convId)!;

  const counts = useMemo(() => {
    const c: Record<InboxFolder, number> = { All: convs.length, "Needs attention": 0, Open: 0, Closed: 0, Archived: 0 };
    convs.forEach((x) => {
      if (x.handoff) c["Needs attention"] += 1;
      c[x.folder] += 1;
    });
    return c;
  }, [convs]);

  const visible = convs.filter((c) => {
    if (folder === "Needs attention" && !c.handoff) return false;
    if (folder !== "All" && folder !== "Needs attention" && c.folder !== folder) return false;
    if (channel !== "All" && c.channel !== channel) return false;
    if (query && !`${c.name} ${c.preview} ${c.handle}`.toLowerCase().includes(query.toLowerCase())) return false;
    return true;
  });

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight });
  }, [conv.messages.length, convId, generating]);

  const patch = (id: string, fn: (c: CannedConv) => CannedConv) =>
    setConvs((prev) => prev.map((c) => (c.id === id ? fn(c) : c)));

  const pushMsg = (msg: Omit<CannedMsg, "id" | "time">) =>
    patch(conv.id, (c) => ({
      ...c,
      preview: msg.text,
      time: nowTime(),
      messages: [...c.messages, { ...msg, id: `m${Date.now()}`, time: nowTime() }],
    }));

  const select = (id: string) => {
    setConvId(id);
    setMobilePane("thread");
    setText("");
    setComposerTab("reply");
    setGenerating(false);
    setShowKebab(false);
  };

  const send = () => {
    if (!text.trim() || conv.closed) return;
    if (composerTab === "note") {
      pushMsg({ from: "note", text: text.trim(), noteAuthor: "Rizky" });
    } else {
      pushMsg({ from: "staff", text: text.trim(), status: "sent", senderName: "Rizky" });
    }
    setText("");
    setShowTemplates(false);
  };

  const generateDraft = () => {
    setGenerating(true);
    setTimeout(() => {
      setGenerating(false);
      if (!conv.draft) {
        patch(conv.id, (c) => ({
          ...c,
          draft: {
            text: "Thanks for the message! I've noted the details and will follow up shortly with availability.",
            confidence: 79,
            source: "Knowledge: General replies",
          },
        }));
      }
    }, 1200);
  };

  const useDraft = () => {
    if (!conv.draft) return;
    pushMsg({ from: "ai", text: conv.draft.text, status: "delivered" });
    patch(conv.id, (c) => ({ ...c, draft: undefined }));
  };

  return (
    <div className="flex h-[76vh] min-h-[600px] w-full overflow-hidden rounded-2xl border border-border bg-slate-50 text-slate-900">
      {/* LIST RAIL */}
      <div className={cn("w-full shrink-0 md:w-[320px]", mobilePane === "thread" && "hidden md:block")}>
        <aside className="flex h-full w-full flex-col border-r border-slate-200 bg-white">
          <div className="border-b border-slate-200 px-4 py-3">
            <h2 className="text-sm font-semibold tracking-tight">Inbox</h2>
            <p className="cf-mono text-[10px] uppercase tracking-wider text-slate-400">
              {folder} · {visible.length} chats
            </p>
          </div>
          <div className="border-b border-slate-200 px-3 py-2.5">
            <label className="flex items-center gap-2 rounded-md border border-slate-200 bg-slate-50 px-2.5 py-1.5 text-sm focus-within:border-emerald-500">
              <Search className="h-4 w-4 text-slate-400" />
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search conversations…"
                aria-label="Search conversations"
                className="w-full bg-transparent text-[13px] placeholder:text-slate-400 focus:outline-none"
              />
            </label>
          </div>
          <div className="relative flex items-center gap-2 border-b border-slate-200 px-3 py-2">
            <div className="relative">
              <button
                onClick={() => { setShowFolders((v) => !v); setShowFilters(false); }}
                className="flex items-center gap-1.5 rounded-md border border-slate-200 px-2.5 py-1.5 text-[13px] font-medium hover:bg-slate-50"
              >
                {folder}
                <span className="cf-mono rounded-full bg-slate-100 px-1.5 text-[10px] text-slate-500">{counts[folder]}</span>
                <ChevronDown className="h-3.5 w-3.5 text-slate-400" />
              </button>
              {showFolders && (
                <div className="absolute left-0 top-full z-20 mt-1 w-52 rounded-md border border-slate-200 bg-white py-1 shadow-lg">
                  {folders.map((f) => (
                    <button
                      key={f}
                      onClick={() => { setFolder(f); setShowFolders(false); }}
                      className="flex w-full items-center justify-between px-3 py-2 text-[13px] hover:bg-slate-50"
                    >
                      <span>{f}</span>
                      <span className="flex items-center gap-1.5">
                        <span className="cf-mono text-[11px] text-slate-400">{counts[f]}</span>
                        {folder === f && <Check className="h-3.5 w-3.5 text-emerald-600" />}
                      </span>
                    </button>
                  ))}
                </div>
              )}
            </div>
            <div className="relative ml-auto">
              <button
                onClick={() => { setShowFilters((v) => !v); setShowFolders(false); }}
                className="flex items-center gap-1.5 rounded-md border border-slate-200 px-2.5 py-1.5 text-[13px] font-medium hover:bg-slate-50"
              >
                <SlidersHorizontal className="h-3.5 w-3.5 text-slate-400" />
                Filters
                {channel !== "All" && (
                  <span className="cf-mono rounded-full bg-emerald-600 px-1.5 text-[10px] text-white">1</span>
                )}
              </button>
              {showFilters && (
                <div className="absolute right-0 top-full z-20 mt-1 w-72 space-y-3 rounded-md border border-slate-200 bg-white p-3 shadow-lg">
                  <div>
                    <p className="cf-mono text-[10px] font-semibold uppercase tracking-wider text-slate-500">Channel</p>
                    <div className="mt-1.5 flex flex-wrap gap-1.5">
                      {channelFilterOptions.map((o) => (
                        <button
                          key={o.id}
                          onClick={() => setChannel(o.id)}
                          className={cn(
                            "rounded-full px-2.5 py-1 text-[12px] font-medium",
                            channel === o.id ? "bg-emerald-600 text-white" : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                          )}
                        >
                          {o.label}
                        </button>
                      ))}
                    </div>
                  </div>
                  <button onClick={() => setChannel("All")} className="text-[13px] font-medium text-slate-500 hover:text-slate-800">
                    Clear all filters
                  </button>
                </div>
              )}
            </div>
          </div>
          <ul className="min-h-0 flex-1 divide-y divide-slate-100 overflow-y-auto">
            {visible.length === 0 && (
              <li className="px-4 py-8 text-center text-[13px] text-slate-400">No conversations in this folder.</li>
            )}
            {visible.map((c) => {
              const active = c.id === convId;
              return (
                <li key={c.id} className="relative">
                  <button
                    onClick={() => select(c.id)}
                    className={cn(
                      "flex w-full items-start gap-3 px-4 py-3 text-left",
                      active ? "bg-emerald-50/70" : "hover:bg-slate-50"
                    )}
                  >
                    {active && <span className="absolute inset-y-2 left-0 w-1 rounded-r bg-emerald-500" />}
                    <ChannelDot channel={c.channel} />
                    <span className="min-w-0 flex-1">
                      <span className="flex items-baseline justify-between gap-2">
                        <span className={cn("truncate text-[13px]", c.unread ? "font-semibold text-slate-900" : "font-medium text-slate-800")}>
                          {c.name}
                        </span>
                        <span className={cn("cf-mono shrink-0 text-[10px] tabular-nums", c.unread ? "text-emerald-600" : "text-slate-400")}>
                          {c.time}
                        </span>
                      </span>
                      <span className="cf-mono block truncate text-[10px] text-slate-400">{c.handle}</span>
                      <span className="mt-0.5 line-clamp-2 block text-[12.5px] leading-snug text-slate-600">{c.preview}</span>
                      <span className="mt-1.5 flex items-center gap-1.5 flex-wrap">
                        {c.handoff ? (
                          <span className="rounded-full bg-amber-50 px-1.5 py-0.5 text-[9px] font-semibold uppercase text-amber-700">AI handoff</span>
                        ) : c.aiOn ? (
                          <span className="inline-flex items-center gap-0.5 rounded-full bg-violet-50 px-1.5 py-0.5 text-[9px] font-semibold uppercase text-violet-700">
                            <Bot className="h-2.5 w-2.5" /> AI
                          </span>
                        ) : null}
                        {c.goal && (
                          <span className={cn("rounded-full px-1.5 py-0.5 text-[9px] font-semibold uppercase", goalStyle[c.goal])}>
                            {c.goal}
                          </span>
                        )}
                        {c.unread > 0 && (
                          <span className="cf-mono ml-auto flex h-4 min-w-4 items-center justify-center rounded-full bg-emerald-600 px-1 text-[9px] text-white">
                            {c.unread}
                          </span>
                        )}
                      </span>
                    </span>
                  </button>
                </li>
              );
            })}
          </ul>
        </aside>
      </div>

      {/* THREAD */}
      <div className={cn("h-full min-h-0 min-w-0 flex-1 flex-col", mobilePane === "list" ? "hidden md:flex" : "flex")}>
        <header className="flex items-center gap-2 border-b border-slate-200 bg-white px-3 py-3 sm:gap-3 sm:px-4">
          <button onClick={() => setMobilePane("list")} aria-label="Back to conversations" className="md:hidden rounded-md p-1.5 hover:bg-slate-100">
            <ChevronLeft className="h-5 w-5" />
          </button>
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-slate-200 to-slate-300 text-xs font-semibold text-slate-700">
            {initials(conv.name)}
          </span>
          <div className="min-w-0">
            <div className="flex items-center gap-1.5">
              <h2 className="truncate text-[15px] font-semibold">{conv.name}</h2>
              <ChannelChip channel={conv.channel} />
              {conv.closed && (
                <span className="rounded-full bg-slate-100 px-1.5 py-0.5 text-[10px] font-semibold text-slate-500">Closed</span>
              )}
            </div>
            <div className="cf-mono truncate text-[11px] text-slate-500">{conv.handle}</div>
          </div>
          <div className="ml-auto flex items-center gap-1.5">
            <button
              disabled={conv.closed}
              onClick={() => {
                if (conv.closed) return;
                patch(conv.id, (c) => ({ ...c, aiOn: !c.aiOn, handoff: c.aiOn ? true : false }));
                if (conv.aiOn) setDismissedHandoff(null);
              }}
              title={conv.aiOn ? "AI is replying — click to disable" : "AI is off — click to let AI reply"}
              className={cn(
                "flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[12px] font-semibold disabled:opacity-50",
                conv.aiOn ? "border-violet-500 bg-violet-50 text-violet-700" : "border-slate-300 text-slate-500"
              )}
            >
              <Bot className="h-3.5 w-3.5" />
              {conv.aiOn ? "AI on" : "AI off"}
            </button>
            <button onClick={() => setPanelOpen(true)} aria-label="Open contact panel" className="lg:hidden rounded-md p-1.5 hover:bg-slate-100">
              <PanelRightOpen className="h-4.5 w-4.5" />
            </button>
            <div className="relative">
              <button onClick={() => setShowKebab((v) => !v)} aria-label="Conversation actions" className="rounded-md p-1.5 hover:bg-slate-100">
                <EllipsisVertical className="h-4.5 w-4.5" />
              </button>
              {showKebab && (
                <div className="absolute right-0 top-full z-20 mt-1 w-52 rounded-md border border-slate-200 bg-white py-1 shadow-lg">
                  <button
                    onClick={() => { patch(conv.id, (c) => ({ ...c, closed: !c.closed })); setShowKebab(false); }}
                    className="block w-full px-3 py-2 text-left text-[13px] hover:bg-slate-50"
                  >
                    {conv.closed ? "Reopen conversation" : "Close conversation"}
                  </button>
                  <button
                    onClick={() => { patch(conv.id, (c) => ({ ...c, folder: c.folder === "Archived" ? "Open" : "Archived" })); setShowKebab(false); }}
                    className="block w-full px-3 py-2 text-left text-[13px] hover:bg-slate-50"
                  >
                    {conv.folder === "Archived" ? "Unarchive" : "Archive"}
                  </button>
                  <button
                    onClick={() => {
                      const rest = convs.filter((c) => c.id !== conv.id);
                      setConvs(rest);
                      if (rest.length) select(rest[0].id);
                      setShowKebab(false);
                    }}
                    className="block w-full px-3 py-2 text-left text-[13px] text-rose-600 hover:bg-slate-50"
                  >
                    Delete conversation
                  </button>
                </div>
              )}
            </div>
          </div>
        </header>

        {conv.handoff && dismissedHandoff !== conv.id && (
          <div className="flex items-stretch gap-3 border-b border-amber-200 bg-gradient-to-r from-amber-50 to-white px-4 py-2.5">
            <span className="w-1 rounded bg-amber-500" />
            <div className="flex-1">
              <p className="text-[13px] font-semibold text-slate-900">AI handed this off to your team</p>
              <p className="text-[12.5px] text-slate-600">Needs human attention</p>
            </div>
            <button
              onClick={() => patch(conv.id, (c) => ({ ...c, handoff: false, aiOn: false }))}
              className="self-center rounded-md bg-amber-600 px-3 py-1.5 text-[13px] font-semibold text-white hover:bg-amber-700"
            >
              Take over
            </button>
            <button onClick={() => setDismissedHandoff(conv.id)} aria-label="Dismiss handoff banner" className="self-start rounded p-1 hover:bg-amber-100">
              <X className="h-4 w-4 text-slate-500" />
            </button>
          </div>
        )}

        <div ref={scrollRef} className="min-h-0 flex-1 overflow-y-auto bg-slate-50/60 px-4 py-6">
          <div className="mx-auto flex max-w-3xl flex-col gap-3">
            <div className="my-2 flex items-center gap-2">
              <span className="h-px flex-1 bg-slate-200" />
              <span className="cf-mono text-[10px] uppercase tracking-wider text-slate-400">Today</span>
              <span className="h-px flex-1 bg-slate-200" />
            </div>
            {conv.messages.map((m) => {
              if (m.from === "contact") {
                return (
                  <div key={m.id} className="flex max-w-[82%] flex-col items-start gap-1">
                    <div className="rounded-2xl rounded-bl-md border border-slate-200 bg-white px-3.5 py-2.5 text-[14px] leading-relaxed text-slate-800 shadow-sm whitespace-pre-wrap">
                      {m.text}
                    </div>
                    <span className="cf-mono ml-1 text-[10px] tabular-nums text-slate-400">{m.time}</span>
                  </div>
                );
              }
              if (m.from === "note") {
                return (
                  <div key={m.id} className="rounded-lg border border-amber-200 bg-amber-50/60 px-4 py-3">
                    <div className="flex items-center gap-2">
                      <span className="text-[13px] font-semibold text-amber-900">{m.noteAuthor}</span>
                      <span className="cf-mono rounded-full bg-amber-100 px-1.5 py-0.5 text-[9px] font-semibold uppercase text-amber-800">Internal</span>
                      <span className="cf-mono ml-auto text-[10px] text-slate-400">{m.time}</span>
                    </div>
                    <p className="mt-1 text-[13.5px] text-amber-900/90">{m.text}</p>
                  </div>
                );
              }
              const isAi = m.from === "ai";
              return (
                <div key={m.id} className="flex max-w-[82%] flex-col items-end gap-1 self-end">
                  {isAi ? (
                    <span className="cf-mono inline-flex items-center gap-1 rounded-full bg-violet-100 px-1.5 py-0.5 text-[9px] font-semibold uppercase text-violet-700">
                      <Bot className="h-2.5 w-2.5" /> AI agent
                    </span>
                  ) : (
                    <span className="text-[10px] font-medium text-slate-500">replied by {m.senderName ?? "Team"}</span>
                  )}
                  <div
                    className={cn(
                      "rounded-2xl rounded-br-md px-3.5 py-2.5 text-[14px] leading-relaxed shadow-sm whitespace-pre-wrap",
                      isAi ? "border border-violet-200 bg-violet-50 text-violet-950" : "bg-emerald-600 text-white"
                    )}
                  >
                    {m.text}
                  </div>
                  <span className="cf-mono mr-1 flex items-center gap-1 text-[10px] tabular-nums text-slate-400">
                    {m.time}
                    {m.status === "sent" && <span>✓</span>}
                    {m.status === "delivered" && <span>✓✓</span>}
                    {m.status === "read" && <span className="text-sky-500">✓✓</span>}
                  </span>
                </div>
              );
            })}

            {generating && (
              <div className="rounded-xl border border-dashed border-violet-300 bg-violet-50/50 px-4 py-3 text-[13px] text-violet-700">
                Generating draft…
              </div>
            )}

            {!generating && conv.aiOn && !conv.draft && !conv.closed && (
              <div className="rounded-xl border border-slate-200 bg-white px-4 py-3">
                <p className="text-[13px] text-slate-600">Drafts are not generated automatically (each one runs the AI). Click below when you want a suggested reply for the latest customer message.</p>
                <button
                  onClick={generateDraft}
                  className="mt-2 inline-flex items-center gap-1.5 rounded-md bg-violet-600 px-3 py-1.5 text-[13px] font-semibold text-white hover:bg-violet-700"
                >
                  <Sparkles className="h-3.5 w-3.5" /> Generate AI draft
                </button>
              </div>
            )}

            {!generating && conv.draft && (
              <div className="rounded-xl border border-violet-200 bg-gradient-to-r from-violet-50 to-white px-4 py-3">
                <div className="flex items-center gap-1.5">
                  <Sparkles className="h-3.5 w-3.5 text-violet-600" />
                  <span className="cf-mono text-[10px] font-semibold uppercase tracking-wider text-violet-700">AI draft</span>
                  <span className="cf-mono ml-auto flex items-center gap-1 text-[11px] text-slate-500">
                    <span className={cn("h-1.5 w-1.5 rounded-full", conv.draft.confidence >= 85 ? "bg-emerald-500" : "bg-amber-500")} />
                    {conv.draft.confidence}%
                  </span>
                </div>
                <p className="mt-1.5 text-[13.5px] text-violet-950">“{conv.draft.text}”</p>
                <p className="cf-mono mt-1 text-[11px] text-slate-400">{conv.draft.source}</p>
                <div className="mt-2.5 flex gap-2">
                  <button
                    onClick={() => { setText(conv.draft?.text ?? ""); setComposerTab("reply"); }}
                    className="rounded-md border border-violet-300 px-3 py-1.5 text-[13px] font-semibold text-violet-700 hover:bg-violet-100"
                  >
                    Edit
                  </button>
                  <button onClick={useDraft} className="rounded-md bg-violet-600 px-3 py-1.5 text-[13px] font-semibold text-white hover:bg-violet-700">
                    Use
                  </button>
                  <button onClick={generateDraft} className="rounded-md px-3 py-1.5 text-[13px] font-medium text-slate-500 hover:bg-violet-100">
                    Regenerate
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* COMPOSER */}
        <footer className="border-t border-slate-200 bg-white px-3 pb-3 pt-2 sm:px-4">
          <div className="flex gap-1">
            {(
              [
                { id: "reply", label: "Reply", icon: MessageSquare, active: "border-emerald-500 text-slate-900" },
                { id: "note", label: "Internal note", icon: StickyNote, active: "border-amber-500 text-slate-900" },
              ] as const
            ).map((t) => (
              <button
                key={t.id}
                onClick={() => setComposerTab(t.id)}
                className={cn(
                  "flex items-center gap-1.5 border-b-2 px-3 py-1.5 text-[13px] font-medium text-slate-500",
                  composerTab === t.id ? t.active : "border-transparent"
                )}
              >
                <t.icon className="h-3.5 w-3.5" /> {t.label}
              </button>
            ))}
          </div>
          {composerTab === "reply" && conv.aiOn && !conv.closed && (
            <p className="mt-1 hidden text-[12px] text-slate-400 sm:block">AI is on — your reply will pause it</p>
          )}
          {composerTab === "note" && (
            <p className="mt-1 text-[12px] text-slate-400">Internal — only your team can see this. Use @name to mention a teammate.</p>
          )}
          <div className="relative mt-1.5">
            <textarea
              value={text}
              onChange={(e) => setText(e.target.value)}
              disabled={conv.closed}
              rows={2}
              placeholder={
                conv.closed
                  ? "Conversation is closed — reopen to reply."
                  : composerTab === "note"
                    ? "Add an internal note for the team…"
                    : "Type a reply…"
              }
              className="w-full resize-none rounded-lg border border-slate-200 px-3 py-2 text-[14px] placeholder:text-slate-400 focus:border-emerald-500 focus:outline-none disabled:bg-slate-50"
            />
            {showTemplates && (
              <div className="absolute bottom-full left-0 z-20 mb-1 w-80 rounded-md border border-slate-200 bg-white p-3 shadow-lg">
                <p className="cf-mono text-[10px] font-semibold uppercase tracking-wider text-slate-500">Quick replies</p>
                <div className="mt-1.5 space-y-1">
                  {quickReplies.map((q) => (
                    <button
                      key={q}
                      onClick={() => { setText(q); setShowTemplates(false); }}
                      className="block w-full rounded-md px-2 py-1.5 text-left text-[13px] hover:bg-slate-50"
                    >
                      {q}
                    </button>
                  ))}
                </div>
                <p className="cf-mono mt-2 text-[10px] font-semibold uppercase tracking-wider text-slate-500">WhatsApp templates</p>
                <p className="mt-1 text-[12.5px] text-slate-400">No templates yet. Add them in Settings → Templates.</p>
              </div>
            )}
          </div>
          <div className="mt-1.5 flex items-center gap-1.5">
            <button aria-label="Attach a file" className="rounded-md p-2 hover:bg-slate-100">
              <Paperclip className="h-4 w-4 text-slate-500" />
            </button>
            <button
              onClick={() => setShowTemplates((v) => !v)}
              className="flex items-center gap-1.5 rounded-md px-2.5 py-1.5 text-[13px] font-medium text-slate-600 hover:bg-slate-100"
            >
              <WandSparkles className="h-4 w-4" /> Templates
            </button>
            <span className="cf-mono ml-auto hidden text-[11px] text-slate-400 sm:inline">{text.length} chars</span>
            <button
              onClick={send}
              disabled={!text.trim() || conv.closed}
              className={cn(
                "flex items-center gap-1.5 rounded-md px-4 py-2 text-[13px] font-semibold text-white disabled:opacity-50",
                composerTab === "note" ? "bg-amber-600 hover:bg-amber-700" : "bg-emerald-600 hover:bg-emerald-700"
              )}
            >
              <Send className="h-3.5 w-3.5" /> {composerTab === "note" ? "Post note" : "Send reply"}
            </button>
          </div>
        </footer>
      </div>

      {/* RIGHT PANEL desktop */}
      <div className="hidden h-full w-[360px] shrink-0 lg:block">
        <ContactPanel
          conv={conv}
          generating={generating}
          patch={patch}
          onGenerateDraft={generateDraft}
          onUseDraft={useDraft}
          onEditDraft={() => { setText(conv.draft?.text ?? ""); setComposerTab("reply"); }}
          onSolve={() => patch(conv.id, (c) => ({ ...c, handoff: false, aiOn: true }))}
          onArchive={() => patch(conv.id, (c) => ({ ...c, folder: c.folder === "Archived" ? "Open" : "Archived" }))}
        />
      </div>

      {/* RIGHT PANEL slide-over */}
      {panelOpen && (
        <div className="fixed inset-0 z-40 lg:hidden">
          <div className="absolute inset-0 bg-slate-950/40" onClick={() => setPanelOpen(false)} />
          <div className="absolute inset-y-0 right-0 z-50 w-[min(360px,90vw)]">
            <ContactPanel
              conv={conv}
              generating={generating}
              patch={patch}
              onClose={() => setPanelOpen(false)}
              onGenerateDraft={generateDraft}
              onUseDraft={useDraft}
              onEditDraft={() => { setText(conv.draft?.text ?? ""); setComposerTab("reply"); setPanelOpen(false); }}
              onSolve={() => patch(conv.id, (c) => ({ ...c, handoff: false, aiOn: true }))}
              onArchive={() => patch(conv.id, (c) => ({ ...c, folder: c.folder === "Archived" ? "Open" : "Archived" }))}
            />
          </div>
        </div>
      )}
    </div>
  );
}

type PatchFn = (id: string, fn: (c: CannedConv) => CannedConv) => void;

function ContactPanel({
  conv,
  generating,
  onClose,
  onGenerateDraft,
  onUseDraft,
  onEditDraft,
  onSolve,
  onArchive,
  patch,
}: {
  conv: CannedConv;
  generating: boolean;
  onClose?: () => void;
  onGenerateDraft: () => void;
  onUseDraft: () => void;
  onEditDraft: () => void;
  onSolve: () => void;
  onArchive: () => void;
  patch: PatchFn;
}) {
  const [linkState, setLinkState] = useState<Record<string, "busy" | "done">>({});
  const [reviewBusy, setReviewBusy] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  useEffect(() => {
    setEditingId(null);
  }, [conv.id]);

  const humanOwns = !conv.aiOn && !conv.closed;
  const isArchived = conv.folder === "Archived";
  const link = linkState[conv.id];

  const generateLink = () => {
    setLinkState((p) => ({ ...p, [conv.id]: "busy" }));
    setTimeout(() => setLinkState((p) => ({ ...p, [conv.id]: "done" })), 1000);
  };

  const reviewNow = () => {
    setReviewBusy(true);
    setTimeout(() => {
      setReviewBusy(false);
      patch(conv.id, (c) => ({
        ...c,
        review: {
          score: 84,
          verdict: "good",
          guestReaction: "positive",
          booked: c.goal === "Booked",
          dims: { accurate: 88, safe: 94, personal: 80, proactive: 76, notPushy: 86 },
        },
      }));
    }, 1200);
  };

  const createBooking = () => {
    const n = Math.floor(2000 + Math.random() * 8000);
    patch(conv.id, (c) => ({
      ...c,
      bookings: [
        ...c.bookings,
        {
          id: `TIB-${n}`,
          dateLabel: "Sat, Oct 10 · 7:00 PM",
          partySize: 2,
          status: "not_confirmed",
          manageUrl: `book.thisbali.com/b/TIB-${n}`,
        },
      ],
    }));
  };

  return (
    <aside className="flex h-full w-full flex-col border-l border-slate-200 bg-white">
      {onClose && (
        <div className="flex items-center justify-between border-b border-slate-200 px-4 py-2 lg:hidden">
          <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">
            Contact panel
          </span>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close panel"
            className="rounded-md p-1.5 text-slate-500 hover:bg-slate-100"
          >
            <X className="h-4 w-4" strokeWidth={2.25} />
          </button>
        </div>
      )}

      <div className="flex-1 overflow-y-auto">
        <ContactHeaderSection conv={conv} />

        {humanOwns && (
          <div className="border-b border-slate-200 px-4 py-3">
            <button
              type="button"
              onClick={onSolve}
              className="flex w-full items-center justify-center gap-2 rounded-md bg-emerald-600 px-3 py-2 text-[13px] font-semibold text-white shadow-sm transition hover:bg-emerald-700"
            >
              <CheckCircle2 className="h-4 w-4" strokeWidth={2.25} />
              Solved &amp; hand back to AI
            </button>
            <p className="mt-1.5 text-center text-[11px] leading-snug text-slate-500">
              Closes out the human handoff. The AI takes over again when the customer replies.
            </p>
          </div>
        )}

        <div className="border-b border-slate-200 px-4 py-3">
          {isArchived ? (
            <button
              type="button"
              onClick={onArchive}
              className="flex w-full items-center justify-center gap-1.5 rounded-md border border-emerald-200 bg-white px-3 py-2 text-[12.5px] font-semibold text-emerald-700 transition hover:bg-emerald-50"
            >
              <ArchiveRestore className="h-4 w-4" strokeWidth={2.25} />
              Unarchive
            </button>
          ) : (
            <button
              type="button"
              onClick={onArchive}
              className="flex w-full items-center justify-center gap-1.5 rounded-md border border-slate-200 bg-white px-3 py-2 text-[12.5px] font-semibold text-slate-700 transition hover:bg-slate-50"
            >
              <Archive className="h-4 w-4" strokeWidth={2.25} />
              Archive
            </button>
          )}
          <p className="mt-1.5 text-center text-[11px] leading-snug text-slate-500">
            {isArchived
              ? "Brings this chat back to the inbox."
              : "Hides this chat until the customer messages again."}
          </p>
        </div>

        <Section title="AI review" icon={Gauge} accent="violet" defaultOpen>
          <ReviewCard
            review={conv.review}
            busy={reviewBusy}
            onReview={reviewNow}
          />
        </Section>

        <Section title="AI suggestions" icon={Sparkles} count={conv.draft ? 1 : 0} accent="violet" defaultOpen>
          {generating ? (
            <div className="flex items-center justify-center gap-2 rounded-md border border-dashed border-violet-200 px-3 py-4 text-[12px] text-violet-600">
              <Loader2 className="h-3.5 w-3.5 animate-spin" strokeWidth={2.25} />
              Generating draft…
            </div>
          ) : !conv.draft ? (
            <div className="space-y-2">
              <p className="text-[12px] leading-relaxed text-slate-500">
                Drafts are not generated automatically (each one runs the AI). Click below when you
                want a suggested reply for the latest customer message.
              </p>
              <button
                type="button"
                onClick={onGenerateDraft}
                className="flex w-full items-center justify-center gap-1.5 rounded-md border border-violet-300 bg-violet-50 px-3 py-2 text-[12px] font-semibold text-violet-700 transition hover:bg-violet-100"
              >
                <Sparkles className="h-3.5 w-3.5" strokeWidth={2.25} />
                Generate AI draft
              </button>
            </div>
          ) : (
            <div className="space-y-2">
              <PanelSuggestionCard
                text={conv.draft.text}
                confidence={conv.draft.confidence / 100}
                source={conv.draft.source}
                onUse={onUseDraft}
                onEdit={onEditDraft}
              />
              <button
                type="button"
                onClick={onGenerateDraft}
                className="flex w-full items-center justify-center gap-1.5 rounded-md border border-slate-200 bg-white px-3 py-1.5 text-[11.5px] font-medium text-slate-500 transition hover:border-slate-300 hover:text-slate-700"
              >
                <RefreshCw className="h-3 w-3" strokeWidth={2.25} />
                Regenerate
              </button>
            </div>
          )}
        </Section>

        <Section title="Booking link" icon={Link2} accent="emerald">
          <p className="text-[12px] leading-relaxed text-slate-500">
            Generate a premium booking link for this guest. An AI-written invite (in their language)
            lands in your composer below to review and send.
          </p>
          {link === "done" ? (
            <CopyStatusLink url={`book.thisbali.com/?ref=${conv.id}`} />
          ) : (
            <button
              type="button"
              onClick={generateLink}
              disabled={link === "busy"}
              className="mt-2 flex w-full items-center justify-center gap-1.5 rounded-md border border-sky-300 bg-sky-50 px-3 py-2 text-[12px] font-semibold text-sky-700 transition hover:bg-sky-100 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {link === "busy" ? (
                <>
                  <Loader2 className="h-3.5 w-3.5 animate-spin" strokeWidth={2.25} />
                  Generating…
                </>
              ) : (
                <>
                  <Link2 className="h-3.5 w-3.5" strokeWidth={2.25} />
                  Generate booking link
                </>
              )}
            </button>
          )}
        </Section>

        <Section title="Bookings" icon={CalendarPlus} count={conv.bookings.length} accent="emerald" defaultOpen>
          <button
            type="button"
            onClick={createBooking}
            className="mb-3 flex w-full items-center justify-center gap-2 rounded-md bg-emerald-600 px-3 py-2 text-[13px] font-semibold text-white shadow-sm transition hover:bg-emerald-700"
          >
            <CalendarPlus className="h-4 w-4" strokeWidth={2.25} />
            Create booking
          </button>
          {conv.bookings.length === 0 ? (
            <EmptyHint>No bookings yet for this contact.</EmptyHint>
          ) : (
            <ul className="space-y-2">
              {conv.bookings.map((b) => (
                <BookingRow
                  key={b.id}
                  booking={b}
                  editing={editingId === b.id}
                  onEdit={() => setEditingId(b.id)}
                  onSave={(nb) => {
                    patch(conv.id, (c) => ({
                      ...c,
                      bookings: c.bookings.map((x) => (x.id === b.id ? { ...x, ...nb } : x)),
                    }));
                    setEditingId(null);
                  }}
                />
              ))}
            </ul>
          )}
        </Section>

        <Section title="Conversation history" icon={History} count={conv.history.length} accent="slate" defaultOpen={false}>
          {conv.history.length === 0 ? (
            <EmptyHint>No prior conversations with this contact.</EmptyHint>
          ) : (
            <ul className="space-y-1">
              {conv.history.map((h) => (
                <HistoryRow key={h.id} item={h} />
              ))}
            </ul>
          )}
        </Section>
      </div>
    </aside>
  );
}

function ContactHeaderSection({ conv }: { conv: CannedConv }) {
  return (
    <div className="border-b border-slate-200 bg-gradient-to-b from-slate-50 to-white p-4">
      <div className="flex items-start gap-3">
        <div className="relative inline-block shrink-0">
          <div
            aria-label={conv.name}
            className="flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-slate-200 to-slate-300 text-sm font-semibold text-slate-700"
          >
            <span>{initials(conv.name)}</span>
          </div>
        </div>
        <div className="min-w-0 flex-1">
          <h3 className="truncate text-[15px] font-semibold text-slate-900">{conv.name}</h3>
          <div className="cf-mono mt-0.5 flex items-center gap-1.5 text-[11px] text-slate-500">
            <span className="truncate">{conv.handle}</span>
          </div>
          <div className="mt-2">
            <ChannelChip channel={conv.channel} />
          </div>
        </div>
      </div>

      {conv.bio && (
        <p className="mt-3 text-[12.5px] leading-relaxed text-slate-600">{conv.bio}</p>
      )}

      {conv.tags.length > 0 && (
        <div className="mt-3 flex flex-wrap gap-1">
          {conv.tags.map((tag) => (
            <span
              key={tag}
              className="inline-flex items-center rounded-full border border-slate-200 bg-white px-2 py-0.5 text-[10.5px] font-medium text-slate-600"
            >
              {tag}
            </span>
          ))}
        </div>
      )}

      <dl className="mt-4 grid grid-cols-2 gap-3 border-t border-slate-100 pt-3">
        <div>
          <dt className="cf-mono text-[9px] font-semibold uppercase tracking-wider text-slate-400">
            Total chats
          </dt>
          <dd className="cf-mono mt-0.5 flex items-center gap-1 text-sm font-medium tabular-nums text-slate-900">
            <Users className="h-3.5 w-3.5 text-slate-400" strokeWidth={2.25} />
            {conv.totalChats}
          </dd>
        </div>
        <div>
          <dt className="cf-mono text-[9px] font-semibold uppercase tracking-wider text-slate-400">
            Member since
          </dt>
          <dd className="cf-mono mt-0.5 flex items-center gap-1 text-sm font-medium text-slate-900">
            <Clock className="h-3.5 w-3.5 text-slate-400" strokeWidth={2.25} />
            {conv.memberSince}
          </dd>
        </div>
      </dl>
    </div>
  );
}

function Section({
  title,
  icon: Icon,
  count,
  accent,
  defaultOpen = true,
  children,
}: {
  title: string;
  icon: typeof Sparkles;
  count?: number;
  accent: "violet" | "emerald" | "slate";
  defaultOpen?: boolean;
  children: React.ReactNode;
}) {
  const [open, setOpen] = useState(defaultOpen);
  const accentText =
    accent === "violet" ? "text-violet-600" : accent === "emerald" ? "text-emerald-600" : "text-slate-500";

  return (
    <section className="border-b border-slate-100 px-4 py-3">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        className="flex w-full items-center justify-between gap-2 text-left"
      >
        <span className="flex items-center gap-2">
          <Icon className={`h-3.5 w-3.5 ${accentText}`} strokeWidth={2.25} />
          <span className="text-[11px] font-semibold uppercase tracking-[0.08em] text-slate-700">
            {title}
          </span>
          {typeof count === "number" && count > 0 && (
            <span className="cf-mono rounded-full bg-slate-100 px-1.5 text-[10px] tabular-nums text-slate-500">
              {count}
            </span>
          )}
        </span>
        <ChevronDown
          className={`h-3.5 w-3.5 text-slate-400 transition ${open ? "rotate-180" : ""}`}
          strokeWidth={2.25}
        />
      </button>
      {open && <div className="mt-3">{children}</div>}
    </section>
  );
}

function confidenceTone(confidence: number) {
  if (confidence >= 0.85) return { dot: "bg-emerald-500", text: "text-emerald-600" };
  if (confidence >= 0.65) return { dot: "bg-amber-500", text: "text-amber-600" };
  return { dot: "bg-slate-400", text: "text-slate-500" };
}

function PanelSuggestionCard({
  text,
  confidence,
  source,
  onUse,
  onEdit,
}: {
  text: string;
  confidence: number;
  source: string;
  onUse: () => void;
  onEdit: () => void;
}) {
  const tone = confidenceTone(confidence);
  return (
    <article className="group relative overflow-hidden rounded-lg border border-violet-200/80 bg-gradient-to-br from-violet-50 to-violet-50/40 p-3 transition hover:border-violet-300">
      <span
        aria-hidden
        className="pointer-events-none absolute inset-y-0 left-0 w-0.5 bg-gradient-to-b from-violet-400 to-violet-600"
      />
      <div className="flex items-start justify-between gap-2 pl-1">
        <span className="cf-mono inline-flex items-center gap-1 text-[10px] font-semibold uppercase tracking-wider text-violet-700">
          <Sparkles className="h-3 w-3" strokeWidth={2.5} />
          AI draft
        </span>
        <span
          className={`cf-mono inline-flex items-center gap-1 text-[10px] tabular-nums ${tone.text}`}
          title={`Confidence: ${Math.round(confidence * 100)}%`}
        >
          <span className={`h-1.5 w-1.5 rounded-full ${tone.dot}`} />
          {Math.round(confidence * 100)}%
        </span>
      </div>
      <p className="mt-2 whitespace-pre-wrap break-words pl-1 text-[13.5px] leading-relaxed text-violet-950">
        &ldquo;{text}&rdquo;
      </p>
      <div className="mt-2 flex items-center justify-between gap-2 pl-1">
        <span className="inline-flex max-w-[60%] items-center gap-1 truncate text-[10.5px] text-violet-700/80">
          <BookOpenText className="h-3 w-3 shrink-0" strokeWidth={2.25} />
          <span className="truncate">{source}</span>
        </span>
        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={onEdit}
            className="inline-flex items-center gap-1 rounded-md border border-violet-200 bg-white px-2 py-1 text-[11px] font-semibold text-violet-700 transition hover:bg-violet-50"
          >
            <Pencil className="h-3 w-3" strokeWidth={2.25} />
            Edit
          </button>
          <button
            type="button"
            onClick={onUse}
            className="inline-flex items-center gap-1 rounded-md bg-violet-600 px-2 py-1 text-[11px] font-semibold text-white shadow-sm transition hover:bg-violet-700"
          >
            Use
          </button>
        </div>
      </div>
    </article>
  );
}

const VERDICT_LABEL: Record<string, string> = { good: "Good", fair: "Fair", poor: "Poor" };
const REACTION_LABEL: Record<string, string> = {
  positive: "Positive",
  neutral: "Neutral",
  negative: "Negative",
  none: "No reply yet",
};
const DIMENSIONS = [
  { key: "accurate", label: "Accurate" },
  { key: "safe", label: "Safe" },
  { key: "personal", label: "Personal" },
  { key: "proactive", label: "Proactive" },
  { key: "notPushy", label: "Not pushy" },
] as const;

function levelOf(v: number) {
  return v >= 80 ? "good" : v >= 60 ? "mid" : "low";
}

function ReviewCard({
  review,
  busy,
  onReview,
}: {
  review: CoachReview | null;
  busy: boolean;
  onReview: () => void;
}) {
  if (!review) {
    return (
      <div className="space-y-2">
        <p className="text-[12px] text-slate-500">
          Not reviewed yet. The AI Coach reviews chats every night, or press Review now.
        </p>
        <button
          type="button"
          onClick={onReview}
          disabled={busy}
          className="inline-flex w-full items-center justify-center gap-1.5 rounded-md border border-slate-200 bg-white px-2.5 py-2 text-[12px] font-semibold text-slate-600 transition hover:border-violet-400 hover:text-violet-700 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {busy ? (
            <>
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
              Reviewing…
            </>
          ) : (
            <>
              <RefreshCw className="h-3.5 w-3.5" />
              Review now
            </>
          )}
        </button>
      </div>
    );
  }
  const level = levelOf(review.score);
  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <b
          className={`cf-mono text-2xl tabular-nums ${
            level === "good" ? "text-emerald-600" : level === "mid" ? "text-amber-600" : "text-rose-600"
          }`}
        >
          {review.score}
        </b>
        <span className="text-[12px] font-semibold text-slate-700">
          {VERDICT_LABEL[review.verdict] ?? review.verdict}
        </span>
      </div>
      <div className="space-y-2">
        {DIMENSIONS.map((d) => {
          const v = review.dims[d.key];
          const bar = levelOf(v) === "good" ? "bg-emerald-500" : levelOf(v) === "mid" ? "bg-amber-500" : "bg-rose-500";
          return (
            <div key={d.key} className="grid grid-cols-[76px_1fr_28px] items-center gap-2 text-[12px]">
              <span className="text-slate-600">{d.label}</span>
              <span className="h-1.5 overflow-hidden rounded-full bg-slate-100">
                <span className={`block h-full rounded-full ${bar}`} style={{ width: `${v}%` }} />
              </span>
              <span className="cf-mono text-right tabular-nums text-slate-700">{v}</span>
            </div>
          );
        })}
      </div>
      <dl className="space-y-1 text-[12px]">
        <div className="flex justify-between gap-2">
          <dt className="text-slate-500">Guest reaction</dt>
          <dd className="text-slate-800">{REACTION_LABEL[review.guestReaction] ?? review.guestReaction}</dd>
        </div>
        <div className="flex justify-between gap-2">
          <dt className="text-slate-500">Became a booking</dt>
          <dd className="text-slate-800">{review.booked ? "Yes" : "No"}</dd>
        </div>
      </dl>
    </div>
  );
}

function BookingRow({
  booking,
  editing,
  onEdit,
  onSave,
}: {
  booking: PanelBooking;
  editing: boolean;
  onEdit: () => void;
  onSave: (nb: Partial<PanelBooking>) => void;
}) {
  const [party, setParty] = useState(booking.partySize);
  const [status, setStatus] = useState(booking.status);

  useEffect(() => {
    setParty(booking.partySize);
    setStatus(booking.status);
  }, [editing, booking.partySize, booking.status]);

  const statusTone =
    booking.status === "confirmed"
      ? "bg-emerald-100 text-emerald-700"
      : booking.status === "not_confirmed"
        ? "bg-amber-100 text-amber-700"
        : booking.status === "cancelled"
          ? "bg-rose-100 text-rose-700"
          : "bg-slate-100 text-slate-600";

  return (
    <li className="group rounded-md border border-slate-200 bg-white px-3 py-2.5 transition hover:border-slate-300">
      <div className="flex items-start gap-2">
        <div className="min-w-0 flex-1">
          <div className="flex items-baseline gap-2">
            <span className="cf-mono text-[12.5px] font-medium tabular-nums text-slate-900">
              {booking.dateLabel}
            </span>
          </div>
          {editing ? (
            <div className="mt-2 space-y-2">
              <div className="flex items-center gap-2 text-[12px]">
                <span className="text-slate-500">Guests</span>
                <button onClick={() => setParty(Math.max(1, party - 1))} aria-label="Fewer guests" className="rounded border border-slate-200 px-2 py-0.5">−</button>
                <span className="cf-mono font-semibold tabular-nums">{party}</span>
                <button onClick={() => setParty(Math.min(20, party + 1))} aria-label="More guests" className="rounded border border-slate-200 px-2 py-0.5">+</button>
              </div>
              <div className="flex items-center gap-2 text-[12px]">
                <span className="text-slate-500">Status</span>
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value as PanelBooking["status"])}
                  className="rounded-md border border-slate-200 px-1.5 py-1 text-[12px]"
                >
                  <option value="not_confirmed">not_confirmed</option>
                  <option value="confirmed">confirmed</option>
                  <option value="cancelled">cancelled</option>
                  <option value="completed">completed</option>
                </select>
              </div>
              <button
                onClick={() => onSave({ partySize: party, status })}
                className="rounded-md bg-emerald-600 px-3 py-1 text-[12px] font-semibold text-white hover:bg-emerald-700"
              >
                Save
              </button>
            </div>
          ) : (
            <div className="mt-1 flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center gap-1 text-[11px] text-slate-500">
                <User className="h-3 w-3" strokeWidth={2.25} />
                {booking.partySize} {booking.partySize === 1 ? "guest" : "guests"}
              </span>
              <span className={`inline-flex items-center rounded-full px-1.5 py-0.5 text-[10px] font-medium capitalize ${statusTone}`}>
                {booking.status}
              </span>
              {booking.aiUpdated && (
                <span className="inline-flex items-center gap-0.5 rounded-full bg-violet-100 px-1.5 py-0.5 text-[10px] font-medium text-violet-700">
                  <Sparkles className="h-2.5 w-2.5" strokeWidth={2.5} />
                  AI updated
                </span>
              )}
            </div>
          )}
          {booking.note && !editing && (
            <p className="mt-1 line-clamp-2 text-[11.5px] text-slate-500">{booking.note}</p>
          )}
        </div>
        {!editing && (
          <button
            type="button"
            onClick={onEdit}
            aria-label="Edit booking"
            className="mt-0.5 rounded p-2 text-slate-400 opacity-100 transition hover:bg-slate-100 hover:text-slate-700 md:p-1 md:opacity-0 md:group-hover:opacity-100"
          >
            <Pencil className="h-3 w-3" strokeWidth={2.25} />
          </button>
        )}
      </div>
      {booking.manageUrl && <CopyStatusLink url={booking.manageUrl} />}
      {booking.preorderUrl && (
        <CopyStatusLink url={booking.preorderUrl} label="Copy pre-order link" tone="sky" />
      )}
    </li>
  );
}

function CopyStatusLink({
  url,
  label = "Copy guest status link",
  tone = "emerald",
}: {
  url: string;
  label?: string;
  tone?: "emerald" | "sky";
}) {
  const [copied, setCopied] = useState(false);
  const copy = async () => {
    try {
      await navigator.clipboard.writeText(url);
    } catch {
      window.prompt(`${label}:`, url);
      return;
    }
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };
  const styles =
    tone === "sky"
      ? "border-sky-300 bg-sky-50 text-sky-700 hover:bg-sky-100"
      : "border-emerald-300 bg-emerald-50 text-emerald-700 hover:bg-emerald-100";
  return (
    <button
      type="button"
      onClick={copy}
      className={`mt-2 flex w-full items-center justify-center gap-1.5 rounded-md border px-3 py-1.5 text-[11px] font-semibold transition ${styles}`}
    >
      {copied ? (
        <>
          <Check className={`h-3 w-3 ${tone === "sky" ? "text-sky-500" : "text-emerald-500"}`} strokeWidth={2.5} />
          Link copied!
        </>
      ) : (
        <>
          <Link2 className="h-3 w-3" strokeWidth={2.25} />
          {label}
        </>
      )}
    </button>
  );
}

function HistoryRow({ item }: { item: HistoryItem }) {
  return (
    <li>
      <button
        type="button"
        className="flex w-full items-start gap-2 rounded-md px-2 py-2 text-left transition hover:bg-slate-100"
      >
        <span className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full ${channelDotClass[item.channelKind]}`}>
          <ChannelDotIcon kind={item.channelKind} />
        </span>
        <div className="min-w-0 flex-1">
          <p className="line-clamp-1 text-[12.5px] text-slate-700">{item.lastMessagePreview}</p>
          <p className="cf-mono text-[10px] text-slate-400">
            {item.timeAgo} · {item.status}
          </p>
        </div>
      </button>
    </li>
  );
}

function ChannelDotIcon({ kind }: { kind: InboxChannel }) {
  if (kind === "email") return <span className="cf-mono text-[8px] font-bold text-white">@</span>;
  if (kind === "instagram-dm") return <span className="cf-mono text-[8px] font-bold text-white">ig</span>;
  return <span className="cf-mono text-[8px] font-bold text-white">wa</span>;
}

function EmptyHint({ children }: { children: React.ReactNode }) {
  return (
    <p className="rounded-md border border-dashed border-slate-200 px-3 py-3 text-center text-[12px] text-slate-500">
      {children}
    </p>
  );
}
