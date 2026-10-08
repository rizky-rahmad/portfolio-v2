"use client";

import { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";
import {
  AlignLeft,
  Check,
  Copy,
  Ellipsis,
  GripVertical,
  Heading as HeadingIcon,
  Image as ImageIcon,
  Layers,
  LayoutGrid,
  Monitor,
  MousePointerClick,
  Plus,
  RectangleHorizontal,
  Redo2,
  Smartphone,
  Tablet,
  Trash2,
  Undo2,
} from "lucide-react";
import { cn } from "@/lib/utils";
import {
  ACCEPTS,
  LABEL,
  LEAVES,
  MAX_COLUMNS,
  chainTo,
  clone,
  findNode,
  findParent,
  initialTree,
  makeNode,
  orderedChildren,
  type Colors,
  type NodeType,
  type TNode,
} from "./tree";
import "./ucms.css";

type Device = "desktop" | "tablet" | "mobile";
const DEVICE_LABEL: Record<Device, string> = { desktop: "Desktop", tablet: "Tablet", mobile: "Mobile" };

const ADD_ITEMS: { type: NodeType; label: string; Icon: typeof HeadingIcon; sec?: boolean }[] = [
  { type: "heading", label: "Heading", Icon: HeadingIcon },
  { type: "text", label: "Text", Icon: AlignLeft },
  { type: "image", label: "Photo", Icon: ImageIcon },
  { type: "button", label: "Button", Icon: RectangleHorizontal },
  { type: "columns", label: "Columns", Icon: LayoutGrid },
  { type: "section", label: "Section", Icon: Layers, sec: true },
];

type Target =
  | { mode: "inside"; id: string }
  | { mode: "before" | "after"; id: string }
  | { mode: "side"; id: string; edge: "left" | "right" };

export function Playground() {
  const [tree, setTree] = useState<TNode>(() => initialTree());
  const [device, setDevice] = useState<Device>("desktop");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [armed, setArmed] = useState<NodeType | null>(null);
  const [undo, setUndo] = useState<string[]>([]);
  const [redo, setRedo] = useState<string[]>([]);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState("");
  const [line, setLine] = useState<{ x: number; y: number; w: number; h: number } | null>(null);
  const [ghost, setGhost] = useState<{ x: number; y: number; label: string } | null>(null);
  const [toolPos, setToolPos] = useState<{ x: number; y: number } | null>(null);
  const [morePos, setMorePos] = useState<{ x: number; y: number } | null>(null);

  const rootRef = useRef<HTMLDivElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const els = useRef(new Map<string, HTMLElement>());
  const toastTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const saveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const drag = useRef<{
    kind: "new" | "move";
    type: NodeType;
    moveId?: string;
    sx: number;
    sy: number;
    threshold: number;
    active: boolean;
    target: Target | null;
    consumedClick?: boolean;
  } | null>(null);
  const pendingText = useRef<{ id: string; html: string } | null>(null);
  const justDragged = useRef(false);
  const mobileToastShown = useRef(false);
  const stateRef = useRef({ tree, device, selectedId, armed });
  stateRef.current = { tree, device, selectedId, armed };

  const showToast = useCallback((msg: string) => {
    setToast(msg);
    if (toastTimer.current) clearTimeout(toastTimer.current);
    toastTimer.current = setTimeout(() => setToast(""), 2600);
  }, []);

  const markSaved = useCallback(() => {
    setSaving(true);
    if (saveTimer.current) clearTimeout(saveTimer.current);
    saveTimer.current = setTimeout(() => setSaving(false), 700);
  }, []);

  /** Apply a mutation with undo support. */
  const commit = useCallback(
    (next: TNode, selectId?: string | null) => {
      setUndo((u) => [...u.slice(-49), JSON.stringify(stateRef.current.tree)]);
      setRedo([]);
      setTree(next);
      if (selectId !== undefined) setSelectedId(selectId);
      markSaved();
    },
    [markSaved]
  );

  const doUndo = useCallback(() => {
    const prev = undo[undo.length - 1];
    if (!prev) return;
    setRedo((r) => [JSON.stringify(stateRef.current.tree), ...r].slice(0, 50));
    setUndo((u) => u.slice(0, -1));
    setTree(JSON.parse(prev));
    setSelectedId(null);
    setMorePos(null);
    markSaved();
  }, [undo, markSaved]);

  const doRedo = useCallback(() => {
    const next = redo[0];
    if (!next) return;
    setUndo((u) => [...u, JSON.stringify(stateRef.current.tree)]);
    setRedo((r) => r.slice(1));
    setTree(JSON.parse(next));
    setSelectedId(null);
    setMorePos(null);
    markSaved();
  }, [redo, markSaved]);

  // ── placement ────────────────────────────────────────────────
  const placeNode = useCallback(
    (node: TNode, target: Target, movingId?: string) => {
      const { tree: t, device: dev } = stateRef.current;
      const next = clone(t);
      if (movingId) {
        const p = findParent(next, movingId);
        if (p) p.children = (p.children ?? []).filter((c) => c.id !== movingId);
      }
      const put = (parent: TNode, n: TNode, refId?: string, after = true) => {
        const kids = (parent.children ??= []);
        if (!refId) kids.push(n);
        else {
          const i = kids.findIndex((k) => k.id === refId);
          kids.splice(i < 0 ? kids.length : i + (after ? 1 : 0), 0, n);
        }
      };
      const okToast = () => {
        if (dev !== "desktop") showToast(movingId ? "Moved on all devices." : "Moved on all devices.");
      };

      if (target.mode === "side") {
        const leaf = findNode(next, target.id);
        const parent = leaf ? findParent(next, target.id) : null;
        if (!leaf || !parent || (parent.type !== "box" && parent.type !== "column")) {
          showToast("That spot can’t take this block — try another one.");
          return;
        }
        const cols: TNode = {
          id: `n${Date.now().toString(36)}c`,
          type: "columns",
          children: [
            { id: `n${Date.now().toString(36)}l`, type: "column", children: [] },
            { id: `n${Date.now().toString(36)}r`, type: "column", children: [] },
          ],
        };
        const kids = parent.children ?? [];
        const i = kids.findIndex((k) => k.id === leaf.id);
        kids.splice(i, 1, cols);
        const [left, right] = cols.children!;
        if (target.edge === "left") {
          left.children!.push(leaf);
          right.children!.push(node);
        } else {
          left.children!.push(node);
          right.children!.push(leaf);
        }
        commit(next, node.id);
        okToast();
        return;
      }

      if (target.mode === "inside") {
        const parent = findNode(next, target.id);
        if (!parent || !ACCEPTS[parent.type]?.includes(node.type)) {
          showToast("That spot can’t take this block — try another one.");
          return;
        }
        if (node.type === "column" && (parent.children ?? []).length >= MAX_COLUMNS) {
          showToast(`A row holds up to ${MAX_COLUMNS} columns.`);
          return;
        }
        (parent.children ??= []).push(node);
        commit(next, node.id);
        okToast();
        return;
      }

      // before / after a sibling
      const ref = findNode(next, target.id);
      const parent = ref ? findParent(next, target.id) : null;
      if (!ref || !parent || !ACCEPTS[parent.type]?.includes(node.type)) {
        showToast("That spot can’t take this block — try another one.");
        return;
      }
      if (dev !== "desktop" && movingId && parent.type !== "page" && parent.type !== "section") {
        // per-device reorder lives on the container
        const kids = orderedChildren(parent, dev).map((k) => k.id);
        const from = kids.indexOf(movingId);
        const to0 = kids.indexOf(ref.id) + (target.mode === "after" ? 1 : 0);
        if (from >= 0) kids.splice(from, 1);
        const to = from >= 0 && from < to0 ? to0 - 1 : to0;
        kids.splice(to, 0, movingId);
        if (dev === "mobile") parent.mobileOrder = kids;
        else parent.tabletOrder = kids;
        commit(next, movingId);
        showToast(`Order changed on ${DEVICE_LABEL[dev]} only. Desktop stays the same.`);
        return;
      }
      put(parent, node, ref.id, target.mode === "after");
      commit(next, node.id);
      okToast();
    },
    [commit, showToast]
  );

  const placeArmed = useCallback(
    (el: HTMLElement) => {
      const { armed: type } = stateRef.current;
      if (!type) return;
      const id = el.closest("[data-id]")?.getAttribute("data-id");
      if (!id) return;
      const { tree: t } = stateRef.current;
      const node = findNode(t, id);
      if (!node) return;
      const fresh = makeNode(type);
      if (ACCEPTS[node.type]?.includes(type) && node.children !== undefined) {
        if (type === "column" && (node.children ?? []).length >= MAX_COLUMNS) {
          showToast(`A row holds up to ${MAX_COLUMNS} columns.`);
          return;
        }
        placeNode(fresh, { mode: "inside", id });
      } else {
        const parent = findParent(t, id);
        if (parent && ACCEPTS[parent.type]?.includes(type)) placeNode(fresh, { mode: "after", id });
        else showToast("That spot can’t take this block — try another one.");
      }
      setArmed(null);
    },
    [placeNode, showToast]
  );

  // ── toolbar actions ──────────────────────────────────────────
  const duplicate = useCallback(
    (id: string) => {
      const next = clone(stateRef.current.tree);
      const node = findNode(next, id);
      const parent = node ? findParent(next, id) : null;
      if (!node || !parent) return;
      if (node.type === "column" && (parent.children ?? []).length >= MAX_COLUMNS) {
        showToast(`A row holds up to ${MAX_COLUMNS} columns.`);
        return;
      }
      const copy = clone(node);
      const reid = (n: TNode) => {
        n.id = `n${Date.now().toString(36)}${Math.floor(Math.random() * 1e4)}`;
        n.children?.forEach(reid);
      };
      reid(copy);
      const kids = parent.children ?? [];
      kids.splice(kids.findIndex((k) => k.id === id) + 1, 0, copy);
      commit(next, copy.id);
    },
    [commit, showToast]
  );

  const remove = useCallback(
    (id: string) => {
      const next = clone(stateRef.current.tree);
      const node = findNode(next, id);
      if (!node) return;
      if (node.type === "section" && (next.children ?? []).length <= 1) {
        showToast("A page needs at least one section.");
        return;
      }
      const parent = findParent(next, id);
      if (parent) parent.children = (parent.children ?? []).filter((c) => c.id !== id);
      commit(next, null);
    },
    [commit, showToast]
  );

  const moveBy = useCallback(
    (id: string, step: -1 | 1) => {
      const { tree: t, device: dev } = stateRef.current;
      const next = clone(t);
      const parent = findParent(next, id);
      if (!parent) return;
      const kids = orderedChildren(parent, dev);
      const i = kids.findIndex((k) => k.id === id);
      const j = i + step;
      if (j < 0 || j >= kids.length) {
        showToast(step < 0 ? "It’s already first here." : "It’s already last here.");
        return;
      }
      if (dev !== "desktop" && parent.type !== "page" && parent.type !== "section") {
        const ids = kids.map((k) => k.id);
        [ids[i], ids[j]] = [ids[j], ids[i]];
        if (dev === "mobile") parent.mobileOrder = ids;
        else parent.tabletOrder = ids;
        commit(next, id);
        showToast(`Order changed on ${DEVICE_LABEL[dev]} only. Desktop stays the same.`);
        return;
      }
      const raw = parent.children ?? [];
      const ri = raw.findIndex((k) => k.id === id);
      const [el] = raw.splice(ri, 1);
      raw.splice(ri + step, 0, el);
      commit(next, id);
    },
    [commit, showToast]
  );

  // ── pointer drag engine ──────────────────────────────────────
  const targetFromPoint = useCallback((x: number, y: number, type: NodeType): Target | null => {
    const el = document.elementFromPoint(x, y)?.closest?.("[data-id]") as HTMLElement | null;
    if (!el || !rootRef.current?.contains(el)) return null;
    const id = el.getAttribute("data-id")!;
    const { tree: t } = stateRef.current;
    const node = findNode(t, id);
    if (!node) return null;
    // side-drop: a photo onto the edge of a leaf
    if (type === "image" && LEAVES.includes(node.type)) {
      const r = el.getBoundingClientRect();
      if (x < r.left + r.width * 0.25) return { mode: "side", id, edge: "left" };
      if (x > r.left + r.width * 0.75) return { mode: "side", id, edge: "right" };
    }
    if (ACCEPTS[node.type]?.includes(type) && node.type !== "page") {
      const r = el.getBoundingClientRect();
      const inTop = y < r.top + 24 && (node.children ?? []).length > 0;
      if (inTop) {
        const first = orderedChildren(node, stateRef.current.device)[0];
        if (first) return { mode: "before", id: first.id };
      }
      return { mode: "inside", id };
    }
    if (node.type === "page") return null;
    const r = el.getBoundingClientRect();
    return { mode: y < r.top + r.height / 2 ? "before" : "after", id };
  }, []);

  const drawTarget = useCallback((target: Target | null) => {
    const stage = stageRef.current;
    if (!stage || !target) {
      setLine(null);
      return;
    }
    const s = stage.getBoundingClientRect();
    if (target.mode === "inside") {
      const el = els.current.get(target.id);
      if (!el) return setLine(null);
      const r = el.getBoundingClientRect();
      setLine({ x: r.left - s.left, y: r.top - s.top + 6, w: r.width, h: 4 });
      return;
    }
    if (target.mode === "side") {
      const el = els.current.get(target.id);
      if (!el) return setLine(null);
      const r = el.getBoundingClientRect();
      const x = target.edge === "left" ? r.left - s.left - 2 : r.right - s.left - 2;
      setLine({ x, y: r.top - s.top, w: 4, h: r.height });
      return;
    }
    const el = els.current.get(target.id);
    if (!el) return setLine(null);
    const r = el.getBoundingClientRect();
    const y = target.mode === "before" ? r.top - s.top - 2 : r.bottom - s.top - 2;
    setLine({ x: r.left - s.left, y, w: r.width, h: 4 });
  }, []);

  useEffect(() => {
    const onMove = (e: PointerEvent) => {
      const d = drag.current;
      if (!d) return;
      const dist = Math.hypot(e.clientX - d.sx, e.clientY - d.sy);
      if (!d.active) {
        if (dist < d.threshold) return;
        d.active = true;
        d.consumedClick = true;
        if (d.kind === "move" && d.moveId) {
          document.activeElement instanceof HTMLElement && document.activeElement.blur();
        }
        setMorePos(null);
      }
      const target = targetFromPoint(e.clientX, e.clientY, d.type);
      d.target = target;
      drawTarget(target);
      setGhost({ x: e.clientX + 14, y: e.clientY + 14, label: LABEL[d.type] });
    };
    const onUp = () => {
      const d = drag.current;
      drag.current = null;
      setGhost(null);
      setLine(null);
      rootRef.current?.classList.remove("pg-on-edge");
      if (d?.active) justDragged.current = true;
      if (!d || !d.active) return;
      const { target } = d;
      if (!target) {
        showToast("That spot can’t take this block — try another one.");
        return;
      }
      if (d.kind === "new") placeNode(makeNode(d.type), target);
      else if (d.moveId) placeNode(clone(findNode(stateRef.current.tree, d.moveId)!), target, d.moveId);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        if (drag.current) {
          drag.current = null;
          setGhost(null);
          setLine(null);
        }
        if (stateRef.current.armed) {
          setArmed(null);
          showToast("Placement cancelled.");
        }
        setMorePos(null);
      }
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "z") {
        e.preventDefault();
        if (e.shiftKey) doRedo();
        else doUndo();
      }
    };
    window.addEventListener("pointermove", onMove);
    window.addEventListener("pointerup", onUp);
    window.addEventListener("pointercancel", onUp);
    window.addEventListener("keydown", onKey);
    return () => {
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerup", onUp);
      window.removeEventListener("pointercancel", onUp);
      window.removeEventListener("keydown", onKey);
    };
  }, [placeNode, targetFromPoint, drawTarget, showToast, doUndo, doRedo]);

  const canvasDown = (e: React.PointerEvent) => {
    if (e.pointerType === "mouse" && e.button !== 0) return;
    if ((e.target as HTMLElement).closest?.(".pg-toolbar, .pg-more")) return;
    const { armed: a } = stateRef.current;
    const nodeEl = (e.target as HTMLElement).closest?.("[data-id]") as HTMLElement | null;
    if (a) {
      if (nodeEl) placeArmed(nodeEl);
      return;
    }
    if (!nodeEl) {
      setSelectedId(null);
      setMorePos(null);
      return;
    }
    const id = nodeEl.getAttribute("data-id")!;
    setSelectedId(id);
    setMorePos(null);
    const onEdge = (e.target as HTMLElement).closest?.("[data-edge]") != null;
    if (onEdge) rootRef.current?.classList.add("pg-on-edge");
    drag.current = { kind: "move", type: findNode(stateRef.current.tree, id)?.type ?? "text", moveId: id, sx: e.clientX, sy: e.clientY, threshold: 4, active: false, target: null };
  };

  const paletteDown = (e: React.PointerEvent, type: NodeType) => {
    if (e.pointerType === "mouse" && e.button !== 0) return;
    e.preventDefault();
    drag.current = { kind: "new", type, sx: e.clientX, sy: e.clientY, threshold: 2, active: false, target: null };
  };

  const paletteClick = (type: NodeType) => {
    if (justDragged.current) {
      justDragged.current = false;
      return;
    }
    setArmed((a) => {
      const next = a === type ? null : type;
      if (next) showToast(`Now click where the ${LABEL[type].toLowerCase()} should go (Esc to cancel).`);
      return next;
    });
  };

  // ── toolbar position ─────────────────────────────────────────
  useLayoutEffect(() => {
    const position = () => {
      const stage = stageRef.current;
      const el = selectedId ? els.current.get(selectedId) : null;
      if (!stage || !el || drag.current?.active) {
        if (!drag.current?.active) setToolPos((p) => (selectedId ? p : null));
        if (!selectedId) setToolPos(null);
        return;
      }
      const s = stage.getBoundingClientRect();
      const r = el.getBoundingClientRect();
      const y = r.top - s.top < 36 ? r.bottom - s.top + 6 : r.top - s.top - 34;
      setToolPos({ x: Math.min(Math.max(0, r.right - s.left - 120), s.width - 120), y });
    };
    position();
    window.addEventListener("scroll", position, true);
    window.addEventListener("resize", position);
    const t = setTimeout(position, 500);
    return () => {
      window.removeEventListener("scroll", position, true);
      window.removeEventListener("resize", position);
      clearTimeout(t);
    };
  }, [tree, selectedId, device]);

  // ── text editing ─────────────────────────────────────────────
  const textFocus = (id: string, el: HTMLElement) => {
    setUndo((u) => [...u.slice(-49), JSON.stringify(stateRef.current.tree)]);
    setRedo([]);
    pendingText.current = { id, html: el.innerHTML };
  };
  const textBlur = (id: string, el: HTMLElement) => {
    const p = pendingText.current;
    pendingText.current = null;
    if (!p || p.html === el.innerHTML) {
      // still drop the spare snapshot if nothing changed
      setUndo((u) => u.slice(0, -1));
      return;
    }
    const next = clone(stateRef.current.tree);
    const node = findNode(next, id);
    if (!node) return;
    if (stateRef.current.device === "desktop") node.text = el.innerText;
    else {
      node.mobileText = el.innerText;
      showToast("Mobile only text on this block.");
    }
    setTree(next);
    markSaved();
  };

  // ── options panel ────────────────────────────────────────────
  const selected = selectedId ? findNode(tree, selectedId) : null;
  const setColors = (c: Colors) => {
    if (!selected) return;
    const next = clone(tree);
    findNode(next, selected.id)!.colors = c;
    commit(next, selected.id);
  };
  const setSpace = (s: "s" | "m" | "l") => {
    if (!selected) return;
    const next = clone(tree);
    findNode(next, selected.id)!.space = s;
    commit(next, selected.id);
  };
  const setArrange = (a: "stack" | "row" | "grid") => {
    if (!selected) return;
    const next = clone(tree);
    findNode(next, selected.id)!.arrange = a;
    commit(next, selected.id);
  };
  const replacePhoto = () => {
    if (!selected) return;
    const next = clone(tree);
    const n = findNode(next, selected.id)!;
    n.photo = ((n.photo ?? 1) % 3) + 1;
    commit(next, selected.id);
  };
  const toggleHideMobile = (on: boolean) => {
    if (!selected) return;
    const next = clone(tree);
    const n = findNode(next, selected.id)!;
    if (on) n.hideMobile = true;
    else delete n.hideMobile;
    commit(next, selected.id);
    if (on && device !== "mobile") showToast("Hidden on Mobile — switch to Mobile to see it greyed out.");
  };
  const resetMobileText = () => {
    if (!selected) return;
    const next = clone(tree);
    delete findNode(next, selected.id)!.mobileText;
    commit(next, selected.id);
  };
  const resetOrder = () => {
    if (!selected) return;
    const next = clone(tree);
    const n = findNode(next, selected.id)!;
    delete n.mobileOrder;
    delete n.tabletOrder;
    commit(next, selected.id);
  };
  const orderBadge = (n: TNode) => {
    if (device === "mobile" && n.mobileOrder) return true;
    if (device === "tablet" && n.tabletOrder) return true;
    return false;
  };

  const switchDevice = (d: Device) => {
    setDevice(d);
    if (d === "mobile" && !mobileToastShown.current) {
      mobileToastShown.current = true;
      showToast("Mobile: columns stack. Change a text, or drag a block within its box, and it becomes “Mobile only”.");
    }
  };

  // ── render ───────────────────────────────────────────────────
  const renderNode = (n: TNode): React.ReactNode => {
    const sel = n.id === selectedId;
    const setRef = (el: HTMLElement | null) => {
      if (el) els.current.set(n.id, el);
      else els.current.delete(n.id);
    };
    const orderAttr =
      device === "mobile" && n.mobileOrder
        ? { "data-mobile-order": "1" }
        : device === "tablet" && n.tabletOrder
          ? { "data-tablet-order": "1" }
          : {};
    if (n.type === "section") {
      return (
        <section
          key={n.id}
          ref={setRef}
          data-id={n.id}
          className={cn("pg-node pg-section", sel && "pg-selected")}
          data-type="section"
          data-colors={n.colors ?? "light"}
          data-space={n.space ?? "m"}
          {...orderAttr}
        >
          {orderedChildren(n, device).map(renderNode)}
        </section>
      );
    }
    if (n.type === "box") {
      return (
        <div
          key={n.id}
          ref={setRef}
          data-id={n.id}
          className={cn("pg-node pg-box", sel && "pg-selected")}
          data-type="box"
          data-arrange={n.arrange ?? "stack"}
          {...orderAttr}
        >
          {orderedChildren(n, device).map(renderNode)}
        </div>
      );
    }
    if (n.type === "columns") {
      const kids = orderedChildren(n, device);
      return (
        <div
          key={n.id}
          ref={setRef}
          data-id={n.id}
          className={cn("pg-node pg-columns", sel && "pg-selected")}
          data-type="columns"
          style={{ ["--n" as string]: kids.length }}
          {...orderAttr}
        >
          {kids.map(renderNode)}
        </div>
      );
    }
    if (n.type === "column") {
      return (
        <div
          key={n.id}
          ref={setRef}
          data-id={n.id}
          className={cn("pg-node pg-column", sel && "pg-selected")}
          data-type="column"
          {...orderAttr}
        >
          {orderedChildren(n, device).map(renderNode)}
        </div>
      );
    }
    if (n.type === "heading" || n.type === "text") {
      const txt = device === "mobile" && n.mobileText ? n.mobileText : (n.text ?? "");
      return (
        <div
          key={n.id}
          ref={setRef}
          data-id={n.id}
          className={cn(`pg-node pg-${n.type}`, sel && "pg-selected", n.mobileText && "pg-has-mobile")}
          data-type={n.type}
          contentEditable
          spellCheck={false}
          suppressContentEditableWarning
          onFocus={(e) => textFocus(n.id, e.currentTarget)}
          onBlur={(e) => textBlur(n.id, e.currentTarget)}
          {...(n.hideMobile ? { "data-hide-mobile": "1" } : {})}
        >
          {txt}
        </div>
      );
    }
    if (n.type === "image") {
      return (
        <div
          key={n.id}
          ref={setRef}
          data-id={n.id}
          className={cn("pg-node pg-image", sel && "pg-selected")}
          data-type="image"
          data-photo={n.photo ?? 1}
          {...(n.hideMobile ? { "data-hide-mobile": "1" } : {})}
        >
          <ImageIcon className="ic" />
        </div>
      );
    }
    // button
    const btxt = device === "mobile" && n.mobileText ? n.mobileText : (n.text ?? "");
    return (
      <div
        key={n.id}
        ref={setRef}
        data-id={n.id}
        className={cn("pg-node pg-button", sel && "pg-selected", n.mobileText && "pg-has-mobile")}
        data-type="button"
        {...(n.hideMobile ? { "data-hide-mobile": "1" } : {})}
      >
        <span
          className="pg-btn"
          contentEditable
          spellCheck={false}
          suppressContentEditableWarning
          onFocus={(e) => textFocus(n.id, e.currentTarget)}
          onBlur={(e) => textBlur(n.id, e.currentTarget)}
        >
          {btxt}
        </span>
      </div>
    );
  };

  const crumbs = selectedId ? chainTo(tree, selectedId) : [tree];

  const segs = (opt: string, cur: string, choices: [string, string][], fn: (v: string) => void) => (
    <div className="pg-segs" role="group">
      {choices.map(([v, label]) => (
        <button key={v} type="button" data-opt={opt} data-value={v} aria-pressed={cur === v} onClick={() => fn(v)}>
          {label}
        </button>
      ))}
    </div>
  );

  const optionsBody = () => {
    if (!selected) {
      const ord = device !== "desktop" && ((device === "mobile" && tree.mobileOrder) || (device === "tablet" && tree.tabletOrder));
      return (
        <>
          <p className="pg-opt-title">Nothing selected</p>
          <p className="pg-note">Select anything on the page to see its options.</p>
          {ord && (
            <p className="pg-note">
              <b>{DEVICE_LABEL[device]} only</b> order here ·{" "}
              <button type="button" className="linkish" onClick={() => {
                const next = clone(tree);
                if (device === "mobile") delete next.mobileOrder;
                else delete next.tabletOrder;
                commit(next, null);
              }}>
                Reset
              </button>
            </p>
          )}
        </>
      );
    }
    const t = selected.type;
    if (t === "section") {
      return (
        <>
          <p className="pg-opt-title">Section</p>
          <p className="pg-opt-label">Colours</p>
          <div className="pg-swatches">
            {(["light", "soft", "dark", "brand"] as Colors[]).map((c) => (
              <button key={c} type="button" className={`sw sw-${c}`} data-opt="colors" data-value={c} aria-pressed={(selected.colors ?? "light") === c} aria-label={`${c} colours`} onClick={() => setColors(c)} />
            ))}
          </div>
          <p className="pg-opt-label">Spacing</p>
          {segs("space", selected.space ?? "m", [["s", "S"], ["m", "M"], ["l", "L"]], (v) => setSpace(v as "s" | "m" | "l"))}
          <p className="pg-note">To move the whole section, drag an empty spot in it — or its edge.</p>
          {orderBadge(selected) && (
            <p className="pg-note"><b>{DEVICE_LABEL[device]} only</b> order here · <button type="button" className="linkish" onClick={resetOrder}>Reset</button></p>
          )}
        </>
      );
    }
    if (LEAVES.includes(t)) {
      return (
        <>
          <p className="pg-opt-title">{LABEL[t]}</p>
          {t === "image" ? (
            <button type="button" className="pg-optbtn" onClick={replacePhoto}>
              <ImageIcon className="ic" />Replace photo
            </button>
          ) : (
            <p className="pg-note">Click the text on the page to type.</p>
          )}
          {selected.mobileText && (
            <p className="pg-note"><b>Mobile only</b> text on this block · <button type="button" className="linkish" onClick={resetMobileText}>Reset</button></p>
          )}
          <label className="pg-check">
            <input type="checkbox" checked={!!selected.hideMobile} onChange={(e) => toggleHideMobile(e.target.checked)} /> Hide on mobile
          </label>
        </>
      );
    }
    if (t === "box") {
      return (
        <>
          <p className="pg-opt-title">Box</p>
          <p className="pg-opt-label">Arrange</p>
          {segs("arrange", selected.arrange ?? "stack", [["stack", "Top to bottom"], ["row", "Side by side"], ["grid", "Grid"]], (v) => setArrange(v as "stack" | "row" | "grid"))}
          {orderBadge(selected) && (
            <p className="pg-note"><b>{DEVICE_LABEL[device]} only</b> order here · <button type="button" className="linkish" onClick={resetOrder}>Reset</button></p>
          )}
        </>
      );
    }
    if (t === "columns") {
      return (
        <>
          <p className="pg-opt-title">Columns</p>
          <p className="pg-note">{(selected.children ?? []).length} columns side by side. On Mobile they stack.</p>
          {orderBadge(selected) && (
            <p className="pg-note"><b>{DEVICE_LABEL[device]} only</b> order here · <button type="button" className="linkish" onClick={resetOrder}>Reset</button></p>
          )}
        </>
      );
    }
    return (
      <>
        <p className="pg-opt-title">Column</p>
        <p className="pg-note">Drop blocks into this column.</p>
        {orderBadge(selected) && (
          <p className="pg-note"><b>{DEVICE_LABEL[device]} only</b> order here · <button type="button" className="linkish" onClick={resetOrder}>Reset</button></p>
        )}
      </>
    );
  };

  return (
    <div className="ucms">
      <div ref={rootRef} className={cn("pg", armed && "armed")} id="pg">
        <div className="pg-top">
          <nav className="pg-crumbs" aria-label="Where the selected block sits">
            {crumbs.map((c) => (
              <button
                key={c.id}
                type="button"
                aria-current={c.id === selectedId || (c.type === "page" && !selectedId)}
                onClick={() => setSelectedId(c.type === "page" ? null : c.id)}
              >
                {c.type === "page" ? "Page" : LABEL[c.type]}
              </button>
            ))}
          </nav>
          <div className="seg" role="group" aria-label="Device">
            {(["desktop", "tablet", "mobile"] as Device[]).map((d) => {
              const Icon = d === "desktop" ? Monitor : d === "tablet" ? Tablet : Smartphone;
              return (
                <button key={d} type="button" aria-pressed={device === d} onClick={() => switchDevice(d)}>
                  <Icon className="ic" />
                  <span>{DEVICE_LABEL[d]}</span>
                </button>
              );
            })}
          </div>
          <div className="pg-actions">
            <button type="button" className="icon-btn" aria-label="Undo" disabled={undo.length === 0} onClick={doUndo}>
              <Undo2 className="ic" />
            </button>
            <button type="button" className="icon-btn" aria-label="Redo" disabled={redo.length === 0} onClick={doRedo}>
              <Redo2 className="ic" />
            </button>
            <span className="pg-save" data-state={saving ? "saving" : "saved"} role="status">
              <span className="saving">Saving…</span>
              <span className="saved">
                <Check className="ic" />All saved
              </span>
            </span>
          </div>
        </div>

        <aside className="pg-options" aria-label="Options">
          <div className="pg-options-body">{optionsBody()}</div>
        </aside>

        <div className="pg-canvas" onPointerDown={canvasDown}>
          <div className="pg-frame" data-device={device}>
            <div ref={stageRef} className="pg-stage">
              <div className="pg-page" data-device={device}>
                {orderedChildren(tree, device).map(renderNode)}
              </div>
              {line && (
                <div
                  className="pg-line"
                  style={{ left: line.x, top: line.y, width: line.w, height: line.h }}
                />
              )}
              {toolPos && selectedId && !ghost && (
                <div className="pg-toolbar" role="toolbar" aria-label="Block actions" style={{ left: toolPos.x, top: toolPos.y }}>
                  <button
                    type="button"
                    data-tool="move"
                    data-edge="1"
                    aria-label="Drag to move"
                    onPointerDown={(e) => {
                      e.stopPropagation();
                      if (e.pointerType === "mouse" && e.button !== 0) return;
                      rootRef.current?.classList.add("pg-on-edge");
                      drag.current = { kind: "move", type: selected ? selected.type : "text", moveId: selectedId, sx: e.clientX, sy: e.clientY, threshold: 2, active: false, target: null };
                    }}
                  >
                    <GripVertical className="ic" />
                  </button>
                  <button type="button" data-tool="duplicate" aria-label="Duplicate" onClick={() => duplicate(selectedId)}>
                    <Copy className="ic" />
                  </button>
                  <button type="button" data-tool="delete" aria-label="Delete" onClick={() => remove(selectedId)}>
                    <Trash2 className="ic" />
                  </button>
                  <button
                    type="button"
                    data-tool="more"
                    aria-label="More actions"
                    onClick={(e) => {
                      const stage = stageRef.current;
                      if (!stage) return;
                      const s = stage.getBoundingClientRect();
                      const r = (e.currentTarget as HTMLElement).getBoundingClientRect();
                      setMorePos({ x: r.left - s.left, y: r.bottom - s.top + 4 });
                    }}
                  >
                    <Ellipsis className="ic" />
                  </button>
                </div>
              )}
              {morePos && selectedId && (
                <div className="pg-more" style={{ left: morePos.x, top: morePos.y }}>
                  <button type="button" onClick={() => { moveBy(selectedId, -1); setMorePos(null); }}>Move up</button>
                  <button type="button" onClick={() => { moveBy(selectedId, 1); setMorePos(null); }}>Move down</button>
                  <button
                    type="button"
                    onClick={() => {
                      const p = findParent(tree, selectedId);
                      setSelectedId(p && p.type !== "page" ? p.id : null);
                      setMorePos(null);
                    }}
                  >
                    Select what it sits in
                  </button>
                </div>
              )}
            </div>
          </div>
          <div className={cn("pg-toast", toast && "show")} role="status" aria-live="polite">
            {toast}
          </div>
        </div>

        <aside className="pg-add" aria-label="Add blocks">
          <p className="pg-add-title">
            <Plus className="ic" />Add
          </p>
          {ADD_ITEMS.map(({ type, label, Icon, sec }) => (
            <button
              key={type}
              type="button"
              className={cn("pg-block", sec && "sec")}
              aria-pressed={armed === type}
              onPointerDown={(e) => paletteDown(e, type)}
              onClick={() => paletteClick(type)}
            >
              <Icon className="ic" />
              {label}
            </button>
          ))}
        </aside>
      </div>

      {ghost && (
        <div className="pg-ghost show" style={{ transform: `translate(${ghost.x}px, ${ghost.y}px)` }}>
          <MousePointerClick className="ic" />
          {ghost.label}
        </div>
      )}

      <ol className="mt-4 space-y-1 text-sm text-muted-foreground">
        <li>1. Drag a <b>Button</b> into the page — or click it, then click a spot</li>
        <li>2. <b>Grab anything</b> on the page — even a text — and drag it</li>
        <li>3. Drop a <b>Photo</b> on the side of a text</li>
        <li>4. Click the photo, then drag it by its <b>edge</b></li>
        <li>5. Switch to <b>Mobile</b> and drag the button above the heading — Desktop stays the same</li>
        <li>6. Press <b>Undo</b></li>
      </ol>
    </div>
  );
}
