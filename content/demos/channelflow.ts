// Canned inbox data replicating the real CentralizedInbox UI.
// All people, messages and bookings are fictional.

export type InboxChannel = "whatsapp" | "instagram-dm" | "email";

export type MsgStatus = "sent" | "delivered" | "read";

export type CannedMsg = {
  id: string;
  from: "contact" | "ai" | "staff" | "note";
  text: string;
  time: string;
  status?: MsgStatus;
  senderName?: string;
  noteAuthor?: string;
};

export type InboxFolder = "All" | "Needs attention" | "Open" | "Closed" | "Archived";

export type PanelBooking = {
  id: string;
  dateLabel: string;
  partySize: number;
  status: "not_confirmed" | "confirmed" | "cancelled" | "completed";
  note?: string;
  aiUpdated?: boolean;
  manageUrl?: string;
  preorderUrl?: string;
};

export type HistoryItem = {
  id: string;
  channelKind: InboxChannel;
  lastMessagePreview: string;
  timeAgo: string;
  status: string;
};

export type CoachReview = {
  score: number;
  verdict: "good" | "fair" | "poor";
  guestReaction: "positive" | "neutral" | "negative" | "none";
  booked: boolean;
  dims: { accurate: number; safe: number; personal: number; proactive: number; notPushy: number };
};

export type CannedConv = {
  id: string;
  name: string;
  handle: string;
  channel: InboxChannel;
  folder: Exclude<InboxFolder, "All">;
  time: string;
  preview: string;
  unread: number;
  aiOn: boolean;
  goal?: "Interested" | "Booking" | "Booked" | "Lost";
  handoff: boolean;
  closed: boolean;
  bio: string;
  tags: string[];
  totalChats: number;
  memberSince: string;
  messages: CannedMsg[];
  draft?: { text: string; confidence: number; source: string };
  bookings: PanelBooking[];
  history: HistoryItem[];
  review: CoachReview | null;
};

export const folders: InboxFolder[] = ["All", "Needs attention", "Open", "Closed", "Archived"];

export const inboxConvs: CannedConv[] = [
  {
    id: "c-sofia",
    name: "Sofia",
    handle: "+62 812 3456 7890",
    channel: "whatsapp",
    folder: "Open",
    time: "2:30 PM",
    preview: "Around 7pm. Two of us are vegetarian, is that ok?",
    unread: 2,
    aiOn: true,
    goal: "Booking",
    handoff: false,
    closed: false,
    bio: "Returning guest · prefers outdoor seating.",
    tags: ["vip", "group"],
    totalChats: 6,
    memberSince: "Mar 2026",
    messages: [
      { id: "m1", from: "contact", text: "Hi! Do you have a table for 14 people this Saturday?", time: "2:12 PM" },
      { id: "m2", from: "ai", text: "Hi Sofia! Yes — for groups above 5 we arrange a shared long table. What time were you thinking?", time: "2:13 PM", status: "read" },
      { id: "m3", from: "contact", text: "Around 7pm. Two of us are vegetarian, is that ok?", time: "2:30 PM" },
    ],
    draft: {
      text: "7pm Saturday for 14 is available — I can hold it for you. And yes, our menu has vegetarian bowls; I can add a pre-order note for 2 vegetarian meals. Shall I confirm the booking?",
      confidence: 93,
      source: "Knowledge: Group bookings · Menu",
    },
    bookings: [
      {
        id: "TIB-2042",
        dateLabel: "Sat, Oct 10 · 7:00 PM",
        partySize: 14,
        status: "not_confirmed",
        note: "Shared long table · 2 vegetarian pre-order notes",
        aiUpdated: true,
        manageUrl: "book.thisbali.com/b/TIB-2042",
        preorderUrl: "book.thisbali.com/b/TIB-2042/preorder",
      },
    ],
    history: [
      { id: "h1", channelKind: "whatsapp", lastMessagePreview: "Is the rooftop available for birthdays?", timeAgo: "2d", status: "closed" },
      { id: "h2", channelKind: "instagram-dm", lastMessagePreview: "Do you have vegan options?", timeAgo: "Sep 28", status: "closed" },
    ],
    review: {
      score: 86,
      verdict: "good",
      guestReaction: "positive",
      booked: true,
      dims: { accurate: 90, safe: 95, personal: 82, proactive: 78, notPushy: 88 },
    },
  },
  {
    id: "c-made",
    name: "Made",
    handle: "@made.eats",
    channel: "instagram-dm",
    folder: "Needs attention",
    time: "1:05 PM",
    preview: "Ini urgent, kami mau booking untuk malam ini.",
    unread: 1,
    aiOn: false,
    handoff: true,
    closed: false,
    bio: "",
    tags: ["allergy"],
    totalChats: 2,
    memberSince: "Sep 2026",
    messages: [
      { id: "m1", from: "contact", text: "Halo, kakak saya alergi kacang parah. Apakah dapurnya aman?", time: "12:58 PM" },
      { id: "m2", from: "contact", text: "Ini urgent, kami mau booking untuk malam ini.", time: "1:05 PM" },
      { id: "m3", from: "note", text: "@team AI confidence was 0.41 on a health-safety topic — routed to human per policy.", time: "1:05 PM", noteAuthor: "System" },
    ],
    bookings: [],
    history: [],
    review: null,
  },
  {
    id: "c-daniel",
    name: "Daniel",
    handle: "daniel@example.com",
    channel: "email",
    folder: "Open",
    time: "11:20 AM",
    preview: "Hello, I need to move my booking TIB-2041 from Friday to Sunday…",
    unread: 0,
    aiOn: true,
    goal: "Booked",
    handoff: false,
    closed: false,
    bio: "Books monthly · usually 2 guests.",
    tags: [],
    totalChats: 11,
    memberSince: "Jan 2026",
    messages: [
      { id: "m1", from: "contact", text: "Hello, I need to move my booking TIB-2041 from Friday to Sunday, same time.", time: "11:02 AM" },
      { id: "m2", from: "ai", text: "Hi Daniel! I can move TIB-2041 to Sunday at the same time. Just to confirm — should I go ahead?", time: "11:03 AM", status: "read" },
      { id: "m3", from: "contact", text: "Yes please, go ahead.", time: "11:20 AM" },
    ],
    draft: {
      text: "Done — booking TIB-2041 is moved to Sunday at the same time. Your table and pre-order moved with it. Anything else I can help with?",
      confidence: 88,
      source: "Tool: moveBooking(TIB-2041)",
    },
    bookings: [
      {
        id: "TIB-2041",
        dateLabel: "Sun, Oct 11 · 7:00 PM",
        partySize: 2,
        status: "confirmed",
        aiUpdated: true,
        manageUrl: "book.thisbali.com/b/TIB-2041",
      },
    ],
    history: [
      { id: "h1", channelKind: "email", lastMessagePreview: "Can we add 2 more guests to Friday?", timeAgo: "3d", status: "closed" },
    ],
    review: {
      score: 92,
      verdict: "good",
      guestReaction: "positive",
      booked: true,
      dims: { accurate: 95, safe: 98, personal: 88, proactive: 90, notPushy: 94 },
    },
  },
  {
    id: "c-jonas",
    name: "Jonas",
    handle: "+49 170 123456",
    channel: "whatsapp",
    folder: "Closed",
    time: "Yesterday",
    preview: "Thanks, see you tonight!",
    unread: 0,
    aiOn: false,
    goal: "Booked",
    handoff: false,
    closed: true,
    bio: "",
    tags: [],
    totalChats: 4,
    memberSince: "Jun 2026",
    messages: [
      { id: "m1", from: "contact", text: "Is the 7pm slot still free for 2 tonight?", time: "4:40 PM" },
      { id: "m2", from: "ai", text: "Yes — 7pm for 2 is free. I've held it under TIB-2098. Show this code when you arrive!", time: "4:41 PM", status: "read" },
      { id: "m3", from: "contact", text: "Thanks, see you tonight!", time: "4:52 PM" },
      { id: "m4", from: "staff", text: "Enjoy your dinner, Jonas! Let us know if you need anything else.", time: "4:55 PM", status: "read", senderName: "Rizky" },
    ],
    bookings: [
      {
        id: "TIB-2098",
        dateLabel: "Thu, Oct 8 · 7:00 PM",
        partySize: 2,
        status: "completed",
        manageUrl: "book.thisbali.com/b/TIB-2098",
      },
    ],
    history: [
      { id: "h1", channelKind: "whatsapp", lastMessagePreview: "Table for 2 on Friday?", timeAgo: "Sep 12", status: "closed" },
    ],
    review: null,
  },
];

export type BookingSlot = { time: string; left: number };

export const bookingDays = ["Sat 10", "Sun 11", "Mon 12"];

export const bookingSlots: Record<string, BookingSlot[]> = {
  "Sat 10": [
    { time: "17:00", left: 4 },
    { time: "19:00", left: 2 },
    { time: "21:00", left: 6 },
  ],
  "Sun 11": [
    { time: "12:00", left: 8 },
    { time: "17:00", left: 5 },
    { time: "19:00", left: 0 },
  ],
  "Mon 12": [
    { time: "12:00", left: 9 },
    { time: "19:00", left: 7 },
  ],
};

// Busiest-hour slots: not bookable through the form — guest is routed to chat.
export const peakSlots: Record<string, string[]> = {
  "Sat 10": ["19:00"],
  "Sun 11": [],
  "Mon 12": [],
};

export type PreorderDish = {
  id: string;
  name: string;
  price: number;
  category: string;
  tags: string[];
};

export const preorderDishes: PreorderDish[] = [
  { id: "d1", name: "Nasi Campur Bali", price: 85000, category: "Mains", tags: [] },
  { id: "d2", name: "Vegan Buddha Bowl", price: 75000, category: "Mains", tags: ["Vegan"] },
  { id: "d3", name: "Grilled Jimbaran Fish", price: 120000, category: "Mains", tags: ["GF"] },
  { id: "d4", name: "Klepon Cake", price: 45000, category: "Desserts", tags: ["Vegetarian"] },
  { id: "d5", name: "Coconut Panna Cotta", price: 50000, category: "Desserts", tags: ["Vegetarian", "GF"] },
  { id: "d6", name: "Young Coconut", price: 35000, category: "Drinks", tags: ["Vegan"] },
];

export function rupiah(n: number) {
  return "Rp " + n.toLocaleString("en-US");
}

export type BoardBooking = {
  id: string;
  guest: string;
  pax: number;
  time: string;
  status: "not_confirmed" | "confirmed" | "seated" | "completed" | "cancelled";
};

export const boardBookings: BoardBooking[] = [
  { id: "TIB-2041", guest: "Daniel", pax: 2, time: "19:00", status: "confirmed" },
  { id: "TIB-2042", guest: "Sofia (14 pax)", pax: 14, time: "19:00", status: "not_confirmed" },
  { id: "TIB-2043", guest: "Ayu", pax: 4, time: "20:00", status: "seated" },
  { id: "TIB-2038", guest: "Jonas", pax: 2, time: "17:00", status: "completed" },
  { id: "TIB-2039", guest: "Putri", pax: 6, time: "18:00", status: "cancelled" },
];
