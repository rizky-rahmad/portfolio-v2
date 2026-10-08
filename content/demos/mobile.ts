// Canned mobile board data replicating the Expo staff app.
// All people and bookings are fictional.

export type MobileStatus =
  | "not_confirmed"
  | "confirmed"
  | "completed"
  | "cancelled"
  | "no_show";

export type MobileBooking = {
  id: string;
  customerName: string;
  customerPhone?: string;
  customerEmail?: string;
  day: string;
  dateLabel: string;
  reservationTime: string;
  partySize: number;
  status: MobileStatus;
  source: string;
  referenceCode: string;
  specialRequests?: string;
  occasion?: string;
  dietary?: string;
};

export const STATUS_LABEL: Record<MobileStatus, string> = {
  not_confirmed: "Not confirmed",
  confirmed: "Confirmed",
  completed: "Completed",
  cancelled: "Cancelled",
  no_show: "No-show",
};

export type CardTone = "cancelled" | "noShow" | "group" | "unconfirmed" | "ok";

export const TONES: Record<CardTone, { color: string; body: string }> = {
  cancelled: { color: "#A93B2A", body: "#EACBC1" },
  noShow: { color: "#6E6055", body: "#DBD4CC" },
  group: { color: "#2C6470", body: "#CAD5D2" },
  unconfirmed: { color: "#8A5E08", body: "#E2D4B8" },
  ok: { color: "#3A7C34", body: "#CEDBC3" },
};

export function cardTone(b: Pick<MobileBooking, "status" | "partySize">): CardTone {
  if (b.status === "cancelled") return "cancelled";
  if (b.status === "no_show") return "noShow";
  if (b.status === "not_confirmed") return "unconfirmed";
  if (b.partySize >= 6) return "group";
  return "ok";
}

export const mobileDays = [
  { day: "Sat 10", label: "Saturday, October 10" },
  { day: "Sun 11", label: "Sunday, October 11" },
  { day: "Mon 12", label: "Monday, October 12" },
];

export const mobileBookings: MobileBooking[] = [
  {
    id: "TIB-2042", customerName: "Sofia", customerPhone: "+62 812 3456 7890",
    day: "Sat 10", dateLabel: "Saturday, October 10", reservationTime: "19:00",
    partySize: 14, status: "not_confirmed", source: "AI agent",
    referenceCode: "TIB-2042", specialRequests: "Shared long table · 2 vegetarian pre-order notes",
  },
  {
    id: "TIB-2041", customerName: "Daniel", customerPhone: "+49 170 123456",
    day: "Sat 10", dateLabel: "Saturday, October 10", reservationTime: "19:00",
    partySize: 2, status: "confirmed", source: "Booking app",
    referenceCode: "TIB-2041", occasion: "Anniversary",
  },
  {
    id: "TIB-2043", customerName: "Ayu Lestari Wijaya", customerPhone: "+62 819 0001 2233",
    day: "Sat 10", dateLabel: "Saturday, October 10", reservationTime: "20:00",
    partySize: 4, status: "confirmed", source: "Booking link",
    referenceCode: "TIB-2043", dietary: "No peanuts at the table",
  },
  {
    id: "TIB-2044", customerName: "Jonas", customerPhone: "+49 170 654321",
    day: "Sun 11", dateLabel: "Sunday, October 11", reservationTime: "12:00",
    partySize: 2, status: "confirmed", source: "AI agent",
    referenceCode: "TIB-2044",
  },
  {
    id: "TIB-2045", customerName: "Made", customerPhone: "+62 813 5555 0101",
    day: "Sun 11", dateLabel: "Sunday, October 11", reservationTime: "19:00",
    partySize: 8, status: "confirmed", source: "Tour guide",
    referenceCode: "TIB-2045", specialRequests: "Group seating together · one guest uses a wheelchair",
  },
  {
    id: "TIB-2038", customerName: "Putri", customerPhone: "+62 821 7777 8899",
    day: "Mon 12", dateLabel: "Monday, October 12", reservationTime: "12:00",
    partySize: 6, status: "cancelled", source: "Booking app",
    referenceCode: "TIB-2038", specialRequests: "Birthday cake to be served after mains",
  },
  {
    id: "TIB-2039", customerName: "Rani", customerPhone: "+62 822 1111 3344",
    day: "Mon 12", dateLabel: "Monday, October 12", reservationTime: "19:00",
    partySize: 2, status: "no_show", source: "AI agent",
    referenceCode: "TIB-2039",
  },
];
