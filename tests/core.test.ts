import { describe, it, expect, vi } from "vitest";
import {
  createLevelStack,
  UnknownPageError,
  type NavEvent,
} from "../src/core";

const LEVELS = { home: 0, hub: 1, itemA: 2, itemB: 2 };

describe("createLevelStack: config validation", () => {
  it("throws on an empty levels map", () => {
    expect(() => createLevelStack({ levels: {} })).toThrow(
      /at least one page/
    );
  });

  it("throws on a non-finite level", () => {
    expect(() =>
      createLevelStack({ levels: { home: 0, broken: Number.NaN } })
    ).toThrow(/finite number/);
    expect(() =>
      createLevelStack({ levels: { home: 0, broken: Infinity } })
    ).toThrow(/finite number/);
    expect(() =>
      // A consumer without TypeScript can hand us anything.
      createLevelStack({ levels: { home: 0, broken: "2" as unknown as number } })
    ).toThrow(/finite number/);
  });

  it("throws UnknownPageError when homeKey is not in levels", () => {
    expect(() => createLevelStack({ levels: LEVELS, homeKey: "nope" })).toThrow(
      UnknownPageError
    );
  });

  it("uses the explicit homeKey when given", () => {
    const nav = createLevelStack({ levels: LEVELS, homeKey: "hub" });
    expect(nav.stack).toEqual(["hub"]);
    expect(nav.current).toBe("hub");
  });

  it("defaults homeKey to the lowest-level key", () => {
    const nav = createLevelStack({ levels: { deep: 3, shallow: 1, root: 0 } });
    expect(nav.current).toBe("root");
  });

  it("breaks lowest-level ties by declaration order", () => {
    const nav = createLevelStack({ levels: { feed: 0, search: 0, deep: 1 } });
    expect(nav.current).toBe("feed");
  });

  it("does not observe later mutation of the levels object it was given", () => {
    const levels: Record<string, number> = { home: 0, hub: 1 };
    const nav = createLevelStack({ levels });
    levels["hub"] = -1; // consumer mutates their copy
    nav.go("hub");
    expect(nav.stack).toEqual(["home", "hub"]); // still level 1: pushed, not pruned
  });
});

describe("go(): the level algorithm", () => {
  it("runs the canonical scenario: sibling replaces, back lands on the parent", () => {
    const nav = createLevelStack({ levels: LEVELS });
    expect(nav.stack).toEqual(["home"]);

    let r = nav.go("hub");
    expect(r).toMatchObject({ from: "home", to: "hub", direction: "In" });
    expect(nav.stack).toEqual(["home", "hub"]);

    r = nav.go("itemA");
    expect(r).toMatchObject({ from: "hub", to: "itemA", direction: "In" });
    expect(nav.stack).toEqual(["home", "hub", "itemA"]);

    // Sideways to the sibling: itemA is REPLACED, not stacked.
    r = nav.go("itemB");
    expect(r).toMatchObject({ from: "itemA", to: "itemB", direction: "SameLevel" });
    expect(nav.stack).toEqual(["home", "hub", "itemB"]);

    // Back from itemB lands on hub (the parent), never on itemA.
    const b = nav.back();
    expect(b).toMatchObject({ from: "itemB", to: "hub", direction: "Out" });
    expect(nav.stack).toEqual(["home", "hub"]);
    expect(nav.current).toBe("hub");
  });

  it("prunes everything at or above the target level on a multi-level jump", () => {
    const nav = createLevelStack({
      levels: { home: 0, hub: 1, item: 2, detail: 3, feed: 0 },
    });
    nav.go("hub");
    nav.go("item");
    nav.go("detail");
    expect(nav.stack).toEqual(["home", "hub", "item", "detail"]);

    // Deep page -> another level-0 page: everything is pruned.
    const r = nav.go("feed");
    expect(r).toMatchObject({ from: "detail", to: "feed", direction: "Out" });
    expect(nav.stack).toEqual(["feed"]);
  });

  it("prunes back to the root when navigating to the home key itself", () => {
    const nav = createLevelStack({ levels: LEVELS });
    nav.go("hub");
    nav.go("itemA");
    const r = nav.go("home");
    expect(r).toMatchObject({ from: "itemA", to: "home", direction: "Out" });
    expect(nav.stack).toEqual(["home"]);
  });

  it("keeps replacing across a sibling chain", () => {
    const nav = createLevelStack({
      levels: { home: 0, a: 1, b: 1, c: 1 },
    });
    nav.go("a");
    nav.go("b");
    expect(nav.stack).toEqual(["home", "b"]);
    nav.go("c");
    expect(nav.stack).toEqual(["home", "c"]);
    expect(nav.back()).toMatchObject({ to: "home", direction: "Out" });
  });

  it("handles gap levels: pruning uses levels, not stack positions", () => {
    // h(0) -> a(3), then go to b(2): a (level 3 >= 2) is pruned, b pushed.
    const nav = createLevelStack({ levels: { h: 0, a: 3, b: 2 } });
    nav.go("a");
    expect(nav.stack).toEqual(["h", "a"]);
    const r = nav.go("b");
    expect(r.direction).toBe("Out");
    expect(nav.stack).toEqual(["h", "b"]);
  });

  it("supports levels that skip numbers (0 -> 5 -> 9)", () => {
    const nav = createLevelStack({ levels: { root: 0, mid: 5, deep: 9 } });
    nav.go("mid");
    nav.go("deep");
    expect(nav.stack).toEqual(["root", "mid", "deep"]);
    expect(nav.back()).toMatchObject({ to: "mid", direction: "Out" });
    expect(nav.back()).toMatchObject({ to: "root", direction: "Out" });
  });

  it("throws UnknownPageError for an unknown key and leaves the stack intact", () => {
    const nav = createLevelStack({ levels: LEVELS });
    nav.go("hub");
    let caught: unknown;
    try {
      nav.go("does-not-exist");
    } catch (error) {
      caught = error;
    }
    expect(caught).toBeInstanceOf(UnknownPageError);
    expect((caught as UnknownPageError).key).toBe("does-not-exist");
    expect(nav.stack).toEqual(["home", "hub"]);
  });

  it("treats go() to the current page as a no-op: no pruning, no event", () => {
    const nav = createLevelStack({ levels: LEVELS });
    nav.go("hub");
    nav.go("itemA");
    const events: NavEvent[] = [];
    nav.subscribe((e) => events.push(e));

    const before = nav.stack;
    const r = nav.go("itemA");
    expect(r).toMatchObject({ from: "itemA", to: "itemA", direction: "SameLevel" });
    expect(nav.stack).toBe(before); // same frozen array, untouched
    expect(events).toEqual([]);
  });

  it("exposes a frozen stack and a fresh array per navigation", () => {
    const nav = createLevelStack({ levels: LEVELS });
    const first = nav.stack;
    expect(Object.isFrozen(first)).toBe(true);
    nav.go("hub");
    expect(nav.stack).not.toBe(first);
    expect(Object.isFrozen(nav.stack)).toBe(true);
    expect(first).toEqual(["home"]); // old snapshot untouched
  });
});

describe("back(), canBack(), peekBack()", () => {
  it("reports canBack/peekBack without mutating", () => {
    const nav = createLevelStack({ levels: LEVELS });
    expect(nav.canBack()).toBe(false);
    expect(nav.peekBack()).toBeNull();

    nav.go("hub");
    nav.go("itemB");
    expect(nav.canBack()).toBe(true);
    expect(nav.peekBack()).toBe("hub");
    expect(nav.stack).toEqual(["home", "hub", "itemB"]); // peek did not move
  });

  it("returns null and calls onExit when back is requested at the root", () => {
    const onExit = vi.fn(() => false); // veto
    const nav = createLevelStack({ levels: LEVELS, onExit });
    expect(nav.back()).toBeNull();
    expect(onExit).toHaveBeenCalledTimes(1);
    expect(nav.stack).toEqual(["home"]);

    // A non-vetoing onExit still yields null: the core never exits anything.
    const allow = vi.fn(() => true);
    const nav2 = createLevelStack({ levels: LEVELS, onExit: allow });
    expect(nav2.back()).toBeNull();
    expect(allow).toHaveBeenCalledTimes(1);
  });

  it("returns null at the root when no onExit is configured", () => {
    const nav = createLevelStack({ levels: LEVELS });
    expect(nav.back()).toBeNull();
    expect(nav.stack).toEqual(["home"]);
  });
});

describe("subscribe()", () => {
  it("delivers navigation events with the direction strings of 4.x", () => {
    const nav = createLevelStack({ levels: LEVELS });
    const events: NavEvent[] = [];
    nav.subscribe((e) => events.push(e));

    nav.go("hub");
    nav.go("itemA");
    nav.go("itemB");
    nav.back();

    expect(events.map((e) => [e.type, e.from, e.to, e.direction])).toEqual([
      ["navigate", "home", "hub", "In"],
      ["navigate", "hub", "itemA", "In"],
      ["navigate", "itemA", "itemB", "SameLevel"],
      ["navigate", "itemB", "hub", "Out"],
    ]);
    expect(events[3]!.stack).toEqual(["home", "hub"]);
  });

  it("stops delivering after unsubscribe", () => {
    const nav = createLevelStack({ levels: LEVELS });
    const fn = vi.fn();
    const unsubscribe = nav.subscribe(fn);
    nav.go("hub");
    unsubscribe();
    nav.go("itemA");
    expect(fn).toHaveBeenCalledTimes(1);
  });

  it("isolates a throwing subscriber: others still run, onError receives it", () => {
    const onError = vi.fn();
    const nav = createLevelStack({ levels: LEVELS, onError });
    const boom = new Error("subscriber blew up");
    const after = vi.fn();
    nav.subscribe(() => {
      throw boom;
    });
    nav.subscribe(after);

    const r = nav.go("hub");
    expect(r.to).toBe("hub"); // navigation itself completed
    expect(after).toHaveBeenCalledTimes(1);
    expect(onError).toHaveBeenCalledWith(boom);
  });

  it("rethrows subscriber errors on a microtask when no onError is configured", () => {
    const scheduled: Array<() => void> = [];
    vi.stubGlobal("queueMicrotask", (fn: () => void) => scheduled.push(fn));
    try {
      const nav = createLevelStack({ levels: LEVELS });
      const boom = new Error("unhandled subscriber error");
      nav.subscribe(() => {
        throw boom;
      });

      expect(nav.go("hub").to).toBe("hub"); // go() itself must not throw
      expect(scheduled).toHaveLength(1);
      expect(() => scheduled[0]!()).toThrow(boom); // the deferred rethrow
    } finally {
      vi.unstubAllGlobals();
    }
  });
});
