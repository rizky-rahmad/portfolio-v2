// Tree model ported from unicorn-cms/docs/plan-overview.html playground.
// Registry + labels verbatim; per-device order lives on the container.

export type NodeType =
  | "page"
  | "section"
  | "box"
  | "columns"
  | "column"
  | "heading"
  | "text"
  | "image"
  | "button";

export type Colors = "light" | "soft" | "dark" | "brand";

export type TNode = {
  id: string;
  type: NodeType;
  children?: TNode[];
  text?: string;
  photo?: number;
  colors?: Colors;
  space?: "s" | "m" | "l";
  arrange?: "stack" | "row" | "grid";
  hideMobile?: boolean;
  mobileText?: string;
  mobileOrder?: string[];
  tabletOrder?: string[];
};

export const LEAVES: NodeType[] = ["heading", "text", "image", "button"];

export const ACCEPTS: Record<string, NodeType[]> = {
  page: ["section"],
  section: ["box", "columns"],
  box: ["heading", "text", "image", "button", "columns"],
  columns: ["column"],
  column: ["heading", "text", "image", "button"],
};

export const LABEL: Record<NodeType, string> = {
  page: "Page",
  section: "Section",
  box: "Box",
  columns: "Columns",
  column: "Column",
  heading: "Heading",
  text: "Text",
  image: "Photo",
  button: "Button",
};

export const MAX_COLUMNS = 4;

let seq = 1;
export const nid = () => `n${seq++}${Date.now().toString(36)}`;

export function makeNode(type: NodeType): TNode {
  const id = nid();
  switch (type) {
    case "heading":
      return { id, type, text: "New heading" };
    case "text":
      return { id, type, text: "Click here and type." };
    case "image":
      return { id, type, photo: 2 };
    case "button":
      return { id, type, text: "New button" };
    case "columns":
      return {
        id,
        type,
        children: [
          { id: nid(), type: "column", children: [{ id: nid(), type: "text", text: "Left column" }] },
          { id: nid(), type: "column", children: [{ id: nid(), type: "text", text: "Right column" }] },
        ],
      };
    case "section":
      return {
        id,
        type,
        colors: "light",
        space: "m",
        children: [
          {
            id: nid(),
            type: "box",
            arrange: "stack",
            children: [
              { id: nid(), type: "heading", text: "A new section" },
              { id: nid(), type: "text", text: "Ready-made sections look right straight away." },
            ],
          },
        ],
      };
    default:
      return { id, type, children: [] };
  }
}

export function initialTree(): TNode {
  seq = 1;
  return {
    id: "page",
    type: "page",
    children: [
      {
        id: nid(),
        type: "section",
        colors: "soft",
        space: "m",
        children: [
          {
            id: nid(),
            type: "box",
            arrange: "stack",
            children: [
              { id: nid(), type: "heading", text: "Welcome to our kitchen" },
              { id: nid(), type: "text", text: "Fresh food, every day from 11:00. Click this text and type." },
              { id: nid(), type: "button", text: "Book a table" },
            ],
          },
        ],
      },
      {
        id: nid(),
        type: "section",
        colors: "light",
        space: "m",
        children: [
          {
            id: nid(),
            type: "columns",
            children: [
              {
                id: nid(),
                type: "column",
                children: [{ id: nid(), type: "image", photo: 1 }],
              },
              {
                id: nid(),
                type: "column",
                children: [
                  { id: nid(), type: "heading", text: "Made with local produce" },
                  {
                    id: nid(),
                    type: "text",
                    text: "Drop a Photo on the right edge of this text — it becomes a new column.",
                  },
                ],
              },
            ],
          },
        ],
      },
    ],
  };
}

export function findNode(root: TNode, id: string): TNode | null {
  if (root.id === id) return root;
  for (const c of root.children ?? []) {
    const f = findNode(c, id);
    if (f) return f;
  }
  return null;
}

export function findParent(root: TNode, id: string): TNode | null {
  for (const c of root.children ?? []) {
    if (c.id === id) return root;
    const f = findParent(c, id);
    if (f) return f;
  }
  return null;
}

export function chainTo(root: TNode, id: string): TNode[] {
  if (root.id === id) return [root];
  for (const c of root.children ?? []) {
    const ch = chainTo(c, id);
    if (ch.length) return [root, ...ch];
  }
  return [];
}

/** Children in display order for a device (per-device rank arrays). */
export function orderedChildren(n: TNode, device: string): TNode[] {
  const kids = n.children ?? [];
  const order = device === "mobile" ? n.mobileOrder : device === "tablet" ? n.tabletOrder : undefined;
  if (!order) return kids;
  const rank = new Map(order.map((id, i) => [id, i]));
  return [...kids].sort((a, b) => (rank.get(a.id) ?? 999) - (rank.get(b.id) ?? 999));
}

export const clone = (t: TNode): TNode => JSON.parse(JSON.stringify(t));
