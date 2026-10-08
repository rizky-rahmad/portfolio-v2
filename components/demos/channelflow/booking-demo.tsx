"use client";

import { useMemo, useState } from "react";
import { cn } from "@/lib/utils";
import {
  bookingDays,
  bookingSlots,
  peakSlots,
  preorderDishes,
  rupiah,
} from "@/content/demos/channelflow";
import "./booking.css";

const AUTO_MAX = 5;
const MAX_PARTY = 20;

type StatusState = "pending" | "confirmed" | "cancelled";

function longDate(day: string) {
  const map: Record<string, string> = {
    "Sat 10": "Saturday, October 10",
    "Sun 11": "Sunday, October 11",
    "Mon 12": "Monday, October 12",
  };
  return map[day] ?? day;
}

export function BookingDemo() {
  const [step, setStep] = useState(1);
  const [party, setParty] = useState(2);
  const [day, setDay] = useState(bookingDays[0]);
  const [time, setTime] = useState<string | null>(null);
  const [slotsOpen, setSlotsOpen] = useState(false);
  const [peakOpen, setPeakOpen] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [nationality, setNationality] = useState("Indonesia");
  const [notes, setNotes] = useState("");
  const [preorder, setPreorder] = useState<Record<string, number>>({});
  const [error, setError] = useState<string | null>(null);
  const [creating, setCreating] = useState(false);
  const [code, setCode] = useState<string | null>(null);
  const [status, setStatus] = useState<StatusState>("pending");
  const [cancelAsk, setCancelAsk] = useState(false);
  const [shared, setShared] = useState(false);

  const totalSteps = party > AUTO_MAX ? 4 : 3;
  const preorderEligible = party > AUTO_MAX;
  const slots = bookingSlots[day];
  const peaks = peakSlots[day] ?? [];
  const dishCount = Object.values(preorder).reduce((a, b) => a + b, 0);
  const subtotal = useMemo(
    () => preorderDishes.reduce((s, d) => s + (preorder[d.id] ?? 0) * d.price, 0),
    [preorder]
  );

  const goNext = () => {
    setError(null);
    if (step === 1) {
      if (!party) { setError("Please choose how many guests are coming."); return; }
      if (peaks.includes(time ?? "") || !time) {
        if (!time) { setError("Please choose an available time."); return; }
      }
      window.scrollTo({ top: 0 });
      setStep(2);
    } else if (step === 2) {
      if (!name.trim()) { setError("Please enter your full name."); return; }
      if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) { setError("Please enter a valid email address."); return; }
      if (phone.replace(/\D/g, "").length < 8) { setError("Please enter your WhatsApp number so we can confirm your booking."); return; }
      window.scrollTo({ top: 0 });
      setStep(preorderEligible ? 3 : totalSteps);
    }
  };

  const createBooking = () => {
    setCreating(true);
    setTimeout(() => {
      setCreating(false);
      setCode(`TIB-${Math.floor(2000 + Math.random() * 8000)}`);
      setStatus("pending");
    }, 1200);
  };

  const resetAll = () => {
    setStep(1); setParty(2); setTime(null); setName(""); setEmail("");
    setPhone(""); setNotes(""); setPreorder({}); setCode(null);
    setStatus("pending"); setCancelAsk(false); setError(null);
  };

  if (code) {
    return (
      <StatusView
        code={code}
        status={status}
        party={party}
        day={day}
        time={time ?? ""}
        name={name}
        dishCount={dishCount}
        cancelAsk={cancelAsk}
        shared={shared}
        onSimulate={() => setStatus("confirmed")}
        onChange={() => { setCode(null); setStep(1); }}
        onDirection={() => window.open("https://maps.google.com/?q=THIS+IS+BALI+Bali", "_blank")}
        onShare={async () => {
          try { await navigator.clipboard.writeText(`See my booking at THIS IS BALI! ${code} · ${party} guests · ${longDate(day)} ${time}`); } catch { /* clipboard unavailable */ }
          setShared(true);
          setTimeout(() => setShared(false), 2000);
        }}
        onCancelAsk={() => setCancelAsk(true)}
        onCancelKeep={() => setCancelAsk(false)}
        onCancelYes={() => { setStatus("cancelled"); setCancelAsk(false); }}
        onNew={resetAll}
      />
    );
  }

  return (
    <div className="demo-booking overflow-hidden rounded-2xl border border-[#e3d9ce]">
      <div className="flex min-h-[640px] flex-col lg:flex-row">
        {/* Hero */}
        <div className="relative hidden flex-col justify-end overflow-hidden bg-gradient-to-b from-[#2b2a2e] via-[#4b3b34] to-[#6e564b] p-8 text-white lg:flex lg:w-[42%]">
          <div className="relative">
            <p className="text-sm font-bold tracking-[0.2em]">THIS IS BALI</p>
            <p className="mt-2 text-[13px] text-white/80">Balinese Food &amp; Desserts • ★ 4.9 (17.5k reviews)</p>
            <div className="mt-6 inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-1.5 text-[12px]">
              Official partner of <span className="font-bold">AirAsia</span>
            </div>
          </div>
        </div>

        {/* Form */}
        <div className="mx-auto w-full max-w-xl flex-1 p-5 sm:p-8">
          {step === 1 && (
            <>
              <span className="bk-step-pill">Step 1 of {totalSteps}</span>
              <h1 className="mt-3 text-2xl sm:text-3xl">Book Your Table Now!</h1>

              <div className="mt-5">
                <label className="bk-label" htmlFor="bk-party">How many guests are coming?</label>
                <select
                  id="bk-party"
                  value={party}
                  onChange={(e) => { setParty(Number(e.target.value)); setTime(null); }}
                  className="bk-input"
                >
                  <option value={0}>- choose size -</option>
                  {Array.from({ length: MAX_PARTY }, (_, i) => i + 1).map((n) => (
                    <option key={n} value={n}>
                      {n} {n === 1 ? "guest" : "guests"}{n > AUTO_MAX ? " (group booking)" : ""}
                    </option>
                  ))}
                </select>
              </div>

              {party > AUTO_MAX && (
                <p className="mt-3 rounded-xl border border-amber-300 bg-amber-50 px-3 py-2 text-[13px] font-medium text-amber-800">
                  Large group — our reservations team will personally confirm seating for your group.
                </p>
              )}

              <div className="mt-4">
                <label className="bk-label" htmlFor="bk-date">Date</label>
                <select id="bk-date" value={day} onChange={(e) => { setDay(e.target.value); setTime(null); }} className="bk-input">
                  {bookingDays.map((d) => (
                    <option key={d} value={d}>{longDate(d)}</option>
                  ))}
                </select>
                <p className="bk-hint mt-1">Planning ahead? Book from 20 minutes to 30 days in advance!</p>
              </div>

              <div className="mt-4">
                <span className="bk-label">Preferred Time</span>
                <button
                  type="button"
                  onClick={() => setSlotsOpen((v) => !v)}
                  className="bk-input relative pr-10 text-left"
                  aria-expanded={slotsOpen}
                >
                  <span className={time ? "" : "text-[#a2988c]"}>{time ?? "Select time"}</span>
                  <span className={cn("absolute right-4 top-1/2 -translate-y-1/2 transition-transform", slotsOpen && "rotate-180")}>⌄</span>
                </button>
                {slotsOpen && (
                  <div>
                    <div className="mt-2 grid max-h-60 grid-cols-3 gap-3 overflow-y-auto">
                      {slots.map((s) => {
                        const isPeak = peaks.includes(s.time);
                        const full = s.left === 0;
                        return (
                          <button
                            key={s.time}
                            type="button"
                            disabled={full}
                            title={isPeak ? "Busiest hour — book this one by chat" : undefined}
                            onClick={() => {
                              if (isPeak) { setPeakOpen(true); return; }
                              setTime(s.time);
                              setSlotsOpen(false);
                            }}
                            className={cn(
                              "rounded-xl px-2 py-2.5 text-sm font-semibold transition",
                              full && "cursor-not-allowed bg-[#f1e9e2] text-gray-400",
                              !full && time === s.time && "bg-[#a08172] text-white",
                              !full && time !== s.time && (isPeak
                                ? "bg-white text-[#2b2a2e] ring-1 ring-amber-300"
                                : "bg-white text-[#2b2a2e] ring-1 ring-[#c4b4a0] hover:bg-[#f7f2ed]")
                            )}
                          >
                            {s.time}
                            {isPeak && <span className="ml-1 inline-block h-1.5 w-1.5 rounded-full bg-amber-400" />}
                          </button>
                        );
                      })}
                    </div>
                    <p className="bk-hint mt-1">Showing currently available slots · Last booking 21:00</p>
                  </div>
                )}
              </div>

              {error && <p className="bk-error">{error}</p>}

              <button type="button" onClick={goNext} className="bk-btn mt-6 w-full">
                Continue →
              </button>
              <button
                type="button"
                onClick={() => { setParty(8); setTime(null); }}
                className="mt-3 w-full text-center text-sm font-semibold text-[#6e564b] underline"
              >
                I&apos;m a tour guide
              </button>
            </>
          )}

          {step === 2 && (
            <>
              <span className="bk-step-pill">Step 2 of {totalSteps}</span>
              <h1 className="mt-3 text-2xl sm:text-3xl">Your details</h1>

              <div className="mt-5 space-y-4">
                <div>
                  <label className="bk-label" htmlFor="bk-name">Name</label>
                  <input id="bk-name" value={name} onChange={(e) => setName(e.target.value)} placeholder="Enter your name" className="bk-input" />
                </div>
                <div>
                  <label className="bk-label" htmlFor="bk-email">Your Email</label>
                  <input id="bk-email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" className="bk-input" />
                </div>
                <div>
                  <label className="bk-label" htmlFor="bk-phone">Your Phone Number</label>
                  <div className="flex gap-2">
                    <span className="bk-prefix">+62</span>
                    <input id="bk-phone" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="812 3456 7890" inputMode="tel" className="bk-input" />
                  </div>
                </div>
                <div>
                  <label className="bk-label" htmlFor="bk-nat">Nationality</label>
                  <select id="bk-nat" value={nationality} onChange={(e) => setNationality(e.target.value)} className="bk-input">
                    {["Indonesia", "Australia", "Germany", "France", "Netherlands", "United States", "United Kingdom", "Malaysia", "Singapore", "Other"].map((c) => (
                      <option key={c}>{c}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="bk-label" htmlFor="bk-notes">Special request (optional)</label>
                  <textarea
                    id="bk-notes"
                    value={notes}
                    onChange={(e) => setNotes(e.target.value.slice(0, 120))}
                    placeholder="Any special request or occasion?"
                    rows={2}
                    maxLength={120}
                    className="bk-input resize-none"
                  />
                  <p className="bk-hint mt-1 text-right tabular-nums">{notes.length}/120</p>
                </div>
              </div>

              {error && <p className="bk-error">{error}</p>}

              <div className="mt-6 flex gap-3">
                <button type="button" onClick={() => { setStep(1); setError(null); }} className="bk-back flex-1">
                  Back
                </button>
                <button type="button" onClick={goNext} className="bk-btn flex-1">
                  Next
                </button>
              </div>
            </>
          )}

          {step === 3 && preorderEligible && (
            <>
              <div className="flex items-start justify-between">
                <span className="bk-step-pill">Step 3 of {totalSteps}</span>
                <button type="button" onClick={() => setStep(4)} className="bk-step-pill">Skip ⌄</button>
              </div>
              <h2 className="mt-3 text-xl sm:text-2xl">Pre-order for your group</h2>
              <p className="mt-2 text-[13px] text-[#635c54]">
                Choosing dishes ahead lets our kitchen shop and prep for you. Tap + to add — prices are pre-tax.
              </p>

              <div className="mt-4 space-y-2.5">
                {preorderDishes.map((d) => (
                  <div key={d.id} className="flex items-center gap-3 rounded-2xl bg-white p-3 ring-1 ring-[#e2d5c8]">
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-semibold">{d.name}</p>
                      <p className="cf-mono text-[13px] text-[#6e564b] tabular-nums">{rupiah(d.price)}</p>
                      {d.tags.length > 0 && (
                        <p className="text-[11px] text-[#7e756b]">{d.tags.join(" · ")}</p>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      <button aria-label={`Less ${d.name}`} onClick={() => setPreorder((p) => ({ ...p, [d.id]: Math.max(0, (p[d.id] ?? 0) - 1) }))} className="h-8 w-8 rounded-full bg-[#f1e9e2] font-bold">−</button>
                      <span className="w-5 text-center text-sm font-bold tabular-nums">{preorder[d.id] ?? 0}</span>
                      <button aria-label={`More ${d.name}`} onClick={() => setPreorder((p) => ({ ...p, [d.id]: (p[d.id] ?? 0) + 1 }))} className="h-8 w-8 rounded-full bg-[#8b6e60] font-bold text-white">+</button>
                    </div>
                  </div>
                ))}
              </div>

              <div className="sticky bottom-2 mt-4 flex items-center justify-between rounded-2xl bg-[#2b2a2e] px-4 py-3 text-white">
                <span className="text-sm">{dishCount === 0 ? "No dishes yet" : `${dishCount} dish(es) selected`}</span>
                <span className="cf-mono text-sm font-semibold tabular-nums">Subtotal (pre-tax) {rupiah(subtotal)}</span>
              </div>

              <button type="button" onClick={() => setStep(4)} className="bk-btn mt-4 w-full">
                {dishCount > 0 ? "Review my order →" : "Skip for now"}
              </button>
            </>
          )}

          {step === totalSteps && (
            <>
              <span className="bk-step-pill">Step {totalSteps} of {totalSteps}</span>
              <h2 className="mt-3 text-xl sm:text-2xl">Almost there!</h2>
              <p className="mt-1 text-sm text-[#635c54]">Please review your booking details.</p>

              <div className="mt-4 rounded-2xl bg-white p-4 ring-1 ring-[#e2d5c8]">
                <div className="space-y-1.5 text-sm">
                  <p><span className="font-semibold">Guests:</span> {party} {party === 1 ? "person" : "people"}</p>
                  <p><span className="font-semibold">Date:</span> {longDate(day)}</p>
                  <p><span className="font-semibold">Time:</span> {time}</p>
                  <p><span className="font-semibold">Restaurant:</span> THIS IS BALI</p>
                  {dishCount > 0 && (
                    <p><span className="font-semibold">Pre-order:</span> {dishCount} item(s) · {rupiah(subtotal)} before tax &amp; service</p>
                  )}
                </div>
                <button type="button" onClick={() => setStep(1)} className="mt-2 text-sm font-semibold text-[#6e564b]">
                  ✎ Edit selection
                </button>
              </div>

              <button type="button" onClick={createBooking} disabled={creating} className="bk-btn mt-5 w-full">
                {creating ? "Creating your booking…" : "Create booking"}
              </button>
              <p className="mt-2 text-center text-[13px] text-[#635c54]">🔒 Your data is safe and secure.</p>
              <button type="button" onClick={() => setStep(preorderEligible ? 3 : 2)} className="bk-back mt-3 w-full">
                Back
              </button>
            </>
          )}
        </div>
      </div>

      {peakOpen && (
        <PeakDialog
          day={day}
          time={time ?? ""}
          party={party}
          name={name}
          onClose={() => setPeakOpen(false)}
        />
      )}
    </div>
  );
}

function PeakDialog({ day, time, party, name, onClose }: { day: string; time: string; party: number; name: string; onClose: () => void }) {
  const msg = `Hi THIS IS BALI, I'd like to book a table at one of your busiest times: • Date: ${longDate(day)} • Time: ${time} • Guests: ${party}${name ? ` • Name: ${name}` : ""} / Is that possible?`;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/55" onClick={onClose} />
      <div className="demo-booking relative w-full max-w-md rounded-3xl bg-[#f7f2ed] p-6">
        <h3 className="text-lg">One of our busiest hours</h3>
        <p className="cf-mono mt-2 text-[13px] tabular-nums text-[#6e564b]">
          {longDate(day)} · {time} · {party} guests
        </p>
        <p className="mt-3 text-sm leading-relaxed text-[#4a443f]">
          A table this size at that time is arranged personally by our reservations team, so it
          isn&apos;t bookable through the form. Send us a message and we&apos;ll take it from
          there — it only takes a minute.
        </p>
        <a
          href={`https://wa.me/6281234567890?text=${encodeURIComponent(msg)}`}
          target="_blank"
          rel="noreferrer"
          className="bk-btn mt-4 block text-center"
        >
          Book by chat on WhatsApp
        </a>
        <button type="button" onClick={onClose} className="mt-2 w-full text-center text-sm font-semibold text-[#6e564b]">
          Pick another time
        </button>
      </div>
    </div>
  );
}

function StatusView(props: {
  code: string;
  status: StatusState;
  party: number;
  day: string;
  time: string;
  name: string;
  dishCount: number;
  cancelAsk: boolean;
  shared: boolean;
  onSimulate: () => void;
  onChange: () => void;
  onDirection: () => void;
  onShare: () => void;
  onCancelAsk: () => void;
  onCancelKeep: () => void;
  onCancelYes: () => void;
  onNew: () => void;
}) {
  const { code, status, party, day, time, name, dishCount } = props;

  if (status === "cancelled") {
    return (
      <div className="demo-booking rounded-2xl border border-[#e3d9ce] p-6 text-center">
        <p className="text-sm font-semibold">This reservation has been cancelled.</p>
        <p className="cf-mono mt-1 text-[13px] text-[#6e564b] tabular-nums">{code}</p>
        <button type="button" onClick={props.onNew} className="bk-btn mt-4">
          Make a reservation
        </button>
      </div>
    );
  }

  const confirmed = status === "confirmed";
  const steps = [
    "We check availability",
    "We send you a confirmation",
    "See you at THIS IS BALI!",
  ];

  return (
    <div className="demo-booking overflow-hidden rounded-2xl border border-[#e3d9ce]">
      <div className="bg-gradient-to-b from-[#2b2a2e] to-[#4b3b34] px-6 py-8 text-center text-white">
        <p className="text-sm font-bold tracking-[0.2em]">THIS IS BALI</p>
      </div>
      <div className="mx-auto -mt-6 w-full max-w-md px-4 pb-6">
        <div className="rounded-3xl bg-white p-3.5 shadow-lg">
          <div className={cn("rounded-2xl p-4", confirmed ? "bg-emerald-50" : "bg-[#f7f2ed]")}>
            <div className="flex items-start justify-between gap-2">
              <span className={cn(
                "rounded-full px-2.5 py-1 text-[11px] font-bold uppercase tracking-wide",
                confirmed ? "bg-emerald-600 text-white" : "bg-[#e2d5c8] text-[#4a443f]"
              )}>
                {confirmed ? "Confirmed" : "Not confirmed yet"}
              </span>
              <a
                href={`https://wa.me/6281234567890?text=${encodeURIComponent(`Hi THIS IS BALI, I need help with my reservation: • Ref: ${code}`)}`}
                target="_blank"
                rel="noreferrer"
                className="rounded-full bg-white px-2.5 py-1 text-[11px] font-bold text-[#6e564b] ring-1 ring-[#e2d5c8]"
              >
                Need help?
              </a>
            </div>
            <h2 className="mt-3 text-xl">
              {confirmed ? "Your table is confirmed" : "We're checking your booking"}
            </h2>
            <p className="mt-1 text-[13px] normal-case tracking-normal text-[#4a443f]">
              {confirmed
                ? "Everything's set. Show your reference when you arrive."
                : "Our team is confirming your table now — this usually takes a few minutes."}
              {party >= 6 ? " (6 or more guests)" : ""}
            </p>
          </div>

          <div className="mt-3 rounded-2xl bg-[#f7f2ed]/60 p-4 ring-1 ring-[#f1e9e2]">
            <div className="flex items-center gap-3">
              <span className="flex h-10 w-10 items-center justify-center rounded-full bg-[#8b6e60] font-bold text-white">
                {(name || "?")[0].toUpperCase()}
              </span>
              <div>
                <p className="text-sm font-bold">{name}</p>
                <p className="text-[13px] text-[#635c54]">{party} Guests{dishCount > 0 ? ` · pre-order ${dishCount} item(s)` : ""}</p>
              </div>
            </div>
            <div className="mt-3 grid grid-cols-2 gap-2 text-sm">
              <div>
                <p className="text-[11px] font-semibold uppercase text-[#7e756b]">Date</p>
                <p className="font-semibold">{longDate(day)}</p>
              </div>
              <div>
                <p className="text-[11px] font-semibold uppercase text-[#7e756b]">Time</p>
                <p className="font-semibold">{time}</p>
              </div>
            </div>
            <p className="mt-3">
              <span className="text-[11px] font-semibold uppercase text-[#7e756b]">Reference </span>
              <span className="cf-mono rounded-full bg-white px-2.5 py-1 text-[13px] font-bold tabular-nums ring-1 ring-[#e2d5c8]">{code}</span>
            </p>
          </div>

          <div className="mt-3 rounded-2xl p-4 ring-1 ring-[#f1e9e2]">
            <p className="text-[11px] font-bold uppercase tracking-wide text-[#7e756b]">What&apos;s happening now?</p>
            <ol className="mt-2 space-y-2">
              {steps.map((s, i) => {
                const done = confirmed ? i < 2 : i === 0;
                const current = confirmed ? i === 2 : i === 1;
                return (
                  <li key={s} className="flex items-center gap-2 text-[13px]">
                    <span className={cn(
                      "flex h-5 w-5 items-center justify-center rounded-full text-[10px] font-bold",
                      done ? "bg-emerald-500 text-white" : "bg-[#e2d5c8] text-[#4a443f]"
                    )}>
                      {done ? "✓" : i + 1}
                    </span>
                    <span className={done ? "font-semibold" : ""}>{s}</span>
                    <span className="cf-mono ml-auto text-[10px] uppercase text-[#7e756b]">
                      {done ? "Completed" : current ? (confirmed ? "Happening now" : "In progress") : "Up next"}
                    </span>
                  </li>
                );
              })}
            </ol>
          </div>

          <div className="mt-3 space-y-2">
            {!confirmed && (
              <a
                href={`https://wa.me/6281234567890?text=${encodeURIComponent(`Hi THIS IS BALI, following up on ${code}`)}`}
                target="_blank"
                rel="noreferrer"
                className="bk-btn block text-center"
              >
                Get updates on WhatsApp
              </a>
            )}
            <button type="button" onClick={props.onChange} className="bk-back w-full">
              Change booking
            </button>
            <button type="button" onClick={props.onDirection} className="bk-back w-full">
              Get direction
            </button>
            <div className="flex gap-2">
              <button type="button" onClick={props.onShare} className="bk-back flex-1">
                {props.shared ? "Copied!" : "Share reservation"}
              </button>
              <button type="button" onClick={props.onCancelAsk} className="flex-1 rounded-full bg-rose-50 px-4 py-2.5 text-[15px] font-semibold text-rose-700 ring-1 ring-rose-200">
                Cancel reservation
              </button>
            </div>
            {!confirmed && (
              <button type="button" onClick={props.onSimulate} className="w-full pt-1 text-center text-[12px] text-[#7e756b] underline">
                Demo: simulate staff confirmation
              </button>
            )}
          </div>

          {props.cancelAsk && (
            <div className="mt-3 rounded-2xl bg-rose-50 p-4 ring-1 ring-rose-200">
              <p className="text-sm font-bold">Cancel this reservation? This can&apos;t be undone.</p>
              <div className="mt-3 flex gap-2">
                <button type="button" onClick={props.onCancelYes} className="flex-1 rounded-full bg-rose-600 px-4 py-2 text-sm font-bold text-white">
                  Yes, cancel
                </button>
                <button type="button" onClick={props.onCancelKeep} className="bk-back flex-1">
                  Keep it
                </button>
              </div>
            </div>
          )}

          <p className="mt-3 text-center text-[12px] text-[#7e756b]">
            {confirmed
              ? "We'll send you a reminder before your visit."
              : "You can close this page. We'll notify you as soon as your booking is confirmed."}
          </p>
        </div>
      </div>
    </div>
  );
}
