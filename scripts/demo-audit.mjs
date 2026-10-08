// Visual + interaction audit for /demos routes.
// Usage: npm run demo:audit  (requires dev server on :3000)
// Fails (exit 1) on console errors, missing selectors, or broken flows.
import { chromium } from "playwright-core";

const BASE = process.env.DEMO_BASE ?? "http://localhost:3000";
const SHOT = new URL("./screenshots/", import.meta.url).pathname;

const failures = [];
const notes = [];
function check(name, ok, extra = "") {
  if (ok) notes.push(`ok   ${name}`);
  else failures.push(`FAIL ${name} ${extra}`);
}

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
const errors = [];
page.on("pageerror", (e) => errors.push(`pageerror: ${e.message}`));
page.on("console", (m) => {
  if (m.type() === "error") errors.push(`console: ${m.text().slice(0, 200)}`);
});

// ---------- inbox ----------
await page.goto(`${BASE}/demos/channelflow`, { waitUntil: "networkidle" });
await page.getByRole("tab", { name: "AI Inbox" }).click();
await page.waitForTimeout(800);
check("inbox list visible", await page.getByPlaceholder("Search conversations…").isVisible());
check("inbox thread visible", await page.getByText("Shared long table").or(page.getByText("Around 7pm")).first().isVisible());
check(
  "inbox panel visible",
  await page.getByRole("button", { name: "Generate booking link" }).first().isVisible()
);
await page.screenshot({ path: `${SHOT}inbox.png` });

// inbox: Sofia already carries a canned draft -> Use it
check("draft card appears", await page.getByText("AI draft").first().isVisible());
await page.getByRole("button", { name: "Use", exact: true }).first().click();
await page.waitForTimeout(400);
check("draft Use works", (await page.getByText("vegetarian bowls").count()) >= 1);
await page.screenshot({ path: `${SHOT}inbox-draft.png` });

// inbox: handoff thread
await page.getByRole("tab", { name: /Made/ }).or(page.getByText("Made", { exact: true })).first().click().catch(() => {});
await page.getByText("@made.eats").first().click({ timeout: 5000 }).catch(() => {});
await page.waitForTimeout(400);
check("handoff banner visible", await page.getByText("AI handed this off to your team").isVisible());
await page.screenshot({ path: `${SHOT}inbox-handoff.png` });

// ---------- booking wizard ----------
await page.getByRole("tab", { name: "Booking" }).click();
await page.waitForTimeout(600);
check("booking step1 visible", await page.getByRole("heading", { name: /Book Your Table/i }).isVisible());
await page.screenshot({ path: `${SHOT}booking-step1.png` });

// pick peak slot -> dialog
await page.getByRole("button", { name: /Select time/ }).click();
await page.waitForTimeout(300);
await page.getByRole("button", { name: /19:00/ }).first().click();
await page.waitForTimeout(400);
check("peak dialog opens", await page.getByText("One of our busiest hours").isVisible());
await page.screenshot({ path: `${SHOT}booking-peak.png` });
await page.getByRole("button", { name: "Pick another time" }).click();

// choose valid slot -> step 2, check phone prefix layout (grid still open after peak dialog)
await page.getByRole("button", { name: /17:00/ }).first().click();
await page.getByRole("button", { name: /Continue/ }).click();
await page.waitForTimeout(400);
const prefixBox = await page.getByText("+62", { exact: true }).boundingBox();
const phoneBox = await page.getByPlaceholder("812 3456 7890").boundingBox();
check("phone prefix narrow", !!prefixBox && !!phoneBox && prefixBox.width < 120 && phoneBox.width > 200,
  `prefix=${prefixBox?.width} phone=${phoneBox?.width}`);
await page.screenshot({ path: `${SHOT}booking-step2.png` });

// fill details -> review -> create -> status
await page.getByPlaceholder("Enter your name").fill("Sofia");
await page.getByPlaceholder("you@example.com").fill("sofia@example.com");
await page.getByPlaceholder("812 3456 7890").fill("81234567890");
await page.getByRole("button", { name: "Next", exact: true }).click();
await page.waitForTimeout(400);
check("review visible", await page.getByRole("heading", { name: /Almost there/i }).isVisible());
await page.getByRole("button", { name: "Create booking" }).click();
await page.waitForTimeout(1800);
check("status page visible", await page.getByText(/We're checking your booking|Your table is confirmed/).isVisible());
check("reference shown", await page.getByText(/TIB-\d+/).first().isVisible());
await page.screenshot({ path: `${SHOT}booking-status.png` });

// cancel flow
await page.getByRole("button", { name: "Cancel reservation" }).click();
await page.waitForTimeout(300);
check("cancel confirm visible", await page.getByText("Cancel this reservation?").isVisible());
await page.getByRole("button", { name: "Yes, cancel" }).click();
await page.waitForTimeout(300);
check("cancelled state visible", await page.getByText("This reservation has been cancelled.").isVisible());
await page.screenshot({ path: `${SHOT}booking-cancelled.png` });

// ---------- mobile board (faithful replica) ----------
await page.getByRole("tab", { name: "Mobile board" }).click();
await page.waitForTimeout(500);
check("mobile tabs visible", await page.getByRole("tab", { name: "Day by Hour" }).isVisible());
check("day nav visible", await page.getByText(/Today · \d+ bookings/).isVisible());
check("day tiles visible", await page.getByRole("button", { name: /Sofia.*14 guests/ }).isVisible());
await page.screenshot({ path: `${SHOT}mobile-day.png` });

// day tile -> detail sheet
await page.getByRole("button", { name: /Sofia.*14 guests/ }).click();
await page.waitForTimeout(400);
check("detail sheet visible", await page.getByText("Recent chats").isVisible());
check("detail actions visible", await page.getByRole("button", { name: "Guest arrived" }).first().isVisible());
await page.screenshot({ path: `${SHOT}mobile-detail.png` });
// guest arrived removes card from day board
await page.getByRole("button", { name: "Guest arrived" }).first().click();
await page.waitForTimeout(400);
check("arrived hides tile", (await page.getByRole("button", { name: /Sofia.*14 guests/ }).count()) === 0);
await page.keyboard.press("Escape").catch(() => {});

// list tab: search + new booking
await page.getByRole("tab", { name: "List View" }).click();
await page.waitForTimeout(400);
check("list search visible", await page.getByPlaceholder("Search name, phone, code").isVisible());
await page.getByPlaceholder("Search name, phone, code").fill("daniel");
await page.waitForTimeout(300);
check("list search filters",
  (await page.getByText("Daniel", { exact: true }).count()) >= 1 &&
  (await page.getByText("Sofia", { exact: true }).count()) === 0);
await page.getByPlaceholder("Search name, phone, code").fill("");
await page.screenshot({ path: `${SHOT}mobile-list.png` });

// month tab
await page.getByRole("tab", { name: "Month Summary" }).click();
await page.waitForTimeout(400);
check("month grid visible", await page.getByText("Each day shows the total guests booked.").isVisible());
await page.screenshot({ path: `${SHOT}mobile-month.png` });

// ---------- voice call tab (scripted preview via ?voice=preview: no mic, no quota) ----------
await page.goto(`${BASE}/demos/channelflow?voice=preview`, { waitUntil: "networkidle" });
await page.getByRole("tab", { name: "Voice", exact: true }).click();
await page.waitForTimeout(600);
check("voice ready visible", await page.getByText("Preview mode: a scripted exchange, no model connected.").isVisible());
check("voice preview badge", await page.getByText("Preview", { exact: true }).isVisible());
await page.screenshot({ path: `${SHOT}voice-idle.png` });
await page.getByRole("button", { name: "Start call" }).click();
await page.waitForTimeout(2000);
check("voice connecting->live", await page.getByText(/Live · 00:0/).isVisible());
await page.waitForTimeout(6000);
check("voice transcript flows", await page.getByText("Are you open this Friday evening?").isVisible());
check("voice orb visible", await page.locator(".bk-voice-orb").isVisible());
await page.screenshot({ path: `${SHOT}voice-live.png` });
await page.getByRole("button", { name: "End call" }).click();
await page.waitForTimeout(400);
check("voice ended summary", await page.getByText(/Call lasted/).isVisible());
await page.screenshot({ path: `${SHOT}voice-ended.png` });

// ---------- voice token route (validation only: never mint in audit, quota is 5/hour) ----------
const badToken = await page.request.post(`${BASE}/api/voice/token`, {
  data: "not-json",
  headers: { "Content-Type": "application/json" },
});
check("voice token rejects bad body", badToken.status() === 400);

// ---------- peopleos (sidebar shell; default = HR overview) ----------
await page.goto(`${BASE}/demos/peopleos`, { waitUntil: "networkidle" });
await page.waitForTimeout(800);
check("pos sidebar visible", await page.getByRole("navigation", { name: "PeopleOS modules" }).isVisible());
check("dashboard default visible", await page.getByRole("heading", { name: /HR Overview/ }).isVisible());
check("dashboard hero visible", await page.getByText("This period at a glance").isVisible());
check("dashboard birthdays visible", await page.getByText("Kadek Ariani").first().isVisible());
// bars render with per-item color + proportional widths (exact HBars port)
const barService = await page.locator("text=Service").first().boundingBox().catch(() => null);
const bars = page.locator(".pos-card-body .bg-slate-800 > i.block");
const barCount = await bars.count();
check("hbars render fills", barCount >= 6);
const widths = [];
for (let i = 0; i < Math.min(barCount, 12); i++) {
  const b = await bars.nth(i).boundingBox();
  if (b) widths.push(b.width);
}
check("hbars proportional", widths.length >= 2 && Math.max(...widths) > Math.min(...widths) + 5, widths.map((w) => Math.round(w)).join(","));
// hero legend carries brand + count
check("hero legend visible", await page.getByText("Acai Queen").first().isVisible());
// sidebar stays visible after scrolling down (sticky)
await page.evaluate(() => window.scrollTo(0, 1500));
await page.waitForTimeout(400);
const sideBox = await page.getByRole("navigation", { name: "PeopleOS modules" }).boundingBox();
check("sidebar sticky on scroll", !!sideBox && sideBox.y >= 0 && sideBox.y < 300, `y=${sideBox?.y}`);
await page.evaluate(() => window.scrollTo(0, 0));
await page.waitForTimeout(300);
await page.screenshot({ path: `${SHOT}peopleos-dashboard.png` });
// dashboard tabs: headcount + readiness
await page.getByRole("tab", { name: /Headcount/ }).click();
await page.waitForTimeout(400);
check("headcount tab visible", await page.getByText("Department × brand").isVisible());
await page.screenshot({ path: `${SHOT}peopleos-headcount.png` });
await page.getByRole("tab", { name: /Data readiness/ }).click();
await page.waitForTimeout(400);
check("readiness tab visible", await page.getByText("How to complete").isVisible());
await page.screenshot({ path: `${SHOT}peopleos-readiness.png` });

// approvals module
await page.getByRole("button", { name: "Approvals", exact: true }).click();
await page.waitForTimeout(500);
check("approvals queue visible", await page.getByText("Review leave, attendance corrections and overtime within your access.").isVisible());
check("approval rows visible", await page.getByText("Awaiting your review").first().isVisible());
await page.screenshot({ path: `${SHOT}peopleos-approvals.png` });
// approve as leader advances to PC with verbatim message
await page.getByRole("button", { name: "Approve", exact: true }).first().click();
await page.waitForTimeout(400);
check("approve advances step", await page.getByText("Your approval is saved. The request is still waiting for the other approver.").isVisible());
await page.screenshot({ path: `${SHOT}peopleos-approved.png` });
// kind filter
await page.getByLabel("Request type").selectOption("overtime");
await page.waitForTimeout(300);
check("kind filter works", await page.getByText("Overtime · Overtime · Acai Queen").first().isVisible());
await page.getByLabel("Request type").selectOption("");
// schedule-requests tab
await page.getByRole("tab", { name: "Shift requests & leave history" }).click();
await page.waitForTimeout(400);
check("requests rail visible", await page.getByText("Pick a request to review.").or(page.getByPlaceholder("Search name or type…")).first().isVisible());
await page.screenshot({ path: `${SHOT}peopleos-requests.png` });

// schedule module
await page.getByRole("button", { name: "Schedule & Attendance", exact: true }).click();
await page.waitForTimeout(500);
check("schedule grid visible", await page.getByRole("heading", { name: /Schedule/ }).isVisible());
check("draft banner visible", await page.getByText("are not published yet").isVisible());
check("attendance ledger visible", await page.getByText("Late 14m").isVisible());
await page.screenshot({ path: `${SHOT}peopleos-schedule.png` });
await page.getByRole("button", { name: /Publish \d+ draft shifts/ }).click();
await page.waitForTimeout(300);
check("publish works", (await page.getByText("are not published yet").count()) === 0);
await page.getByRole("button", { name: "Start shift", exact: true }).click();
await page.waitForTimeout(1500);
check("clock-in works", await page.getByText("Work time on").isVisible());
check("clock-in adds ledger row", await page.getByText("You (demo)").first().isVisible());
await page.screenshot({ path: `${SHOT}peopleos-clockin.png` });
await page.getByRole("button", { name: "End Shift", exact: true }).click();
await page.waitForTimeout(300);
// hiring module
await page.getByRole("button", { name: "Candidates", exact: true }).click();
await page.waitForTimeout(500);
check("hiring table visible", await page.getByRole("heading", { name: "Candidates." }).isVisible());
check("candidate rows visible", await page.getByText("dewa@example.com").isVisible());
check("stage tags visible", await page.locator("td .pos-tag", { hasText: "Screening" }).first().isVisible());
await page.getByPlaceholder("Search by name, email, phone, job or stage…").fill("sinta");
await page.waitForTimeout(300);
check("hiring search works",
  (await page.getByText("sinta@example.com").count()) >= 1 &&
  (await page.getByText("dewa@example.com").count()) === 0);
await page.getByPlaceholder("Search by name, email, phone, job or stage…").fill("");
await page.getByText("Dewa", { exact: true }).first().click().catch(() => {});
await page.getByRole("button", { name: "View details" }).first().click();
await page.waitForTimeout(400);
check("candidate drawer visible", await page.getByRole("dialog").isVisible());
await page.getByLabel("Move Dewa to stage").selectOption("screening");
await page.waitForTimeout(300);
check("drawer move stage works", (await page.getByLabel("Move Dewa to stage").inputValue()) === "screening");
await page.screenshot({ path: `${SHOT}peopleos-hiring.png` });
await page.keyboard.press("Escape").catch(() => {});

// ---------- unicorn-cms playground (port of plan-overview #pg) ----------
await page.goto(`${BASE}/demos/unicorn-cms`, { waitUntil: "networkidle" });
await page.waitForTimeout(800);
check("ucms canvas visible", await page.getByText("Welcome to our kitchen").isVisible());
check("ucms add palette visible", await page.getByRole("button", { name: "Photo" }).isVisible());
check("ucms save state visible", await page.getByText("All saved").isVisible());
await page.screenshot({ path: `${SHOT}ucms-desktop.png` });

// click-add: arm heading, click a spot in the page
await page.getByRole("button", { name: "Heading", exact: true }).click();
await page.getByText("Book a table").click();
await page.waitForTimeout(400);
check("click-add works", (await page.getByText("New heading").count()) >= 1);
await page.screenshot({ path: `${SHOT}ucms-added.png` });

// options: select section -> panel shows Colours
await page.getByText("Welcome to our kitchen").click();
await page.waitForTimeout(300);
check("options panel visible", await page.locator(".pg-options-body").getByText("Heading", { exact: true }).isVisible());
// toolbar: select text, open More, Move down, order changes in DOM
await page.getByText("Fresh food, every day from 11:00. Click this text and type.").click();
await page.waitForTimeout(300);
await page.getByRole("button", { name: "More actions" }).click();
await page.waitForTimeout(200);
await page.getByRole("button", { name: "Move down", exact: true }).click();
await page.waitForTimeout(1000);
const movedOrder = await page.evaluate(() => {
  const box = [...document.querySelectorAll(".pg-box")][0];
  return [...box.querySelectorAll(":scope > .pg-node")].map((n) => n.getAttribute("data-type"));
});
check("move down works", JSON.stringify(movedOrder) === JSON.stringify(["heading", "button", "text", "heading"]), movedOrder.join(","));
check("saved after move", await page.getByText("All saved").isVisible());

// drag Button above heading with mouse
const btn = page.getByText("Book a table");
const head = page.getByText("Welcome to our kitchen");
const bb = await btn.boundingBox();
const hb = await head.boundingBox();
await page.mouse.move(bb.x + bb.width / 2, bb.y + bb.height / 2);
await page.mouse.down();
await page.mouse.move(hb.x + hb.width / 2, hb.y + 4, { steps: 12 });
await page.mouse.up();
await page.waitForTimeout(1000);
const dragOrder = await page.evaluate(() => {
  const box = [...document.querySelectorAll(".pg-box")][0];
  return [...box.querySelectorAll(":scope > .pg-node")].map((n) => n.getAttribute("data-type"));
});
check("drag reorder works", JSON.stringify(dragOrder) === JSON.stringify(["button", "heading", "text", "heading"]), dragOrder.join(","));
await page.screenshot({ path: `${SHOT}ucms-drag.png` });

// undo restores
await page.getByRole("button", { name: "Undo" }).click();
await page.waitForTimeout(300);
check("undo works", await page.getByRole("button", { name: "Redo" }).isEnabled());

// mobile device stacks + hide-on-mobile flow
await page.getByRole("button", { name: "Mobile", exact: true }).click();
await page.waitForTimeout(600);
await page.screenshot({ path: `${SHOT}ucms-mobile.png` });
check("mobile toast visible", await page.getByText(/Mobile: columns stack/).isVisible());

check("no console/page errors", errors.length === 0, errors.join(" | ").slice(0, 500));

await browser.close();
console.log(notes.join("\n"));
if (failures.length) {
  console.log(failures.join("\n"));
  process.exit(1);
}
console.log(`\nAUDIT PASS — screenshots in scripts/screenshots/`);
