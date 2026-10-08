export type BlockKind =
  | "heading"
  | "text"
  | "image"
  | "button"
  | "columns"
  | "gallery"
  | "form"
  | "video";

export type CanvasBlock = {
  id: string;
  kind: BlockKind;
  content: string;
};

export type PageVersion = {
  id: string;
  label: string;
  time: string;
  blocks: CanvasBlock[];
};

export const blockLabel: Record<BlockKind, string> = {
  heading: "Heading",
  text: "Text",
  image: "Image",
  button: "Button",
  columns: "Columns",
  gallery: "Gallery",
  form: "Form",
  video: "Video",
};

export const palette: { kind: BlockKind; hint: string }[] = [
  { kind: "heading", hint: "Title + subtitle" },
  { kind: "text", hint: "Paragraph" },
  { kind: "image", hint: "WebP, responsive" },
  { kind: "button", hint: "CTA link" },
  { kind: "columns", hint: "2-column row" },
  { kind: "gallery", hint: "3 images" },
  { kind: "form", hint: "Email capture" },
  { kind: "video", hint: "Embed" },
];

export const starterBlocks: CanvasBlock[] = [
  { id: "b1", kind: "heading", content: "This Is Bali — Sunset Dinners" },
  { id: "b2", kind: "text", content: "Beachfront restaurant in Canggu. Book a table in under a minute." },
  { id: "b3", kind: "button", content: "Book a table" },
];

export const versionHistory: PageVersion[] = [
  {
    id: "v3",
    label: "Current draft",
    time: "today 10:24",
    blocks: [
      { id: "b1", kind: "heading", content: "This Is Bali — Sunset Dinners" },
      { id: "b2", kind: "text", content: "Beachfront restaurant in Canggu. Book a table in under a minute." },
      { id: "b3", kind: "button", content: "Book a table" },
    ],
  },
  {
    id: "v2",
    label: "Before promo banner",
    time: "yesterday 16:02",
    blocks: [
      { id: "b1", kind: "heading", content: "This Is Bali" },
      { id: "b2", kind: "text", content: "Beachfront restaurant in Canggu." },
    ],
  },
  {
    id: "v1",
    label: "First draft",
    time: "Mon 09:41",
    blocks: [{ id: "b1", kind: "heading", content: "This Is Bali" }],
  },
];
