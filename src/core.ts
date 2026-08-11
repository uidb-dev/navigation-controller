/**
 * navigation-controller/core — the level-based back algorithm, headless.
 *
 * Pure TypeScript. Zero dependencies, no DOM, no React. This is the algorithm
 * that has shipped in 4.x (`renewHistory` inside `changePage`), extracted so it
 * can drive navigation in any environment: Next.js, react-router, a plain SPA,
 * a Cordova/Capacitor WebView, or a Node script.
 *
 * The idea in one paragraph: every page has an integer level. Navigating to a
 * DEEPER level pushes the page onto the stack. Navigating to a page whose level
 * is LOWER OR EQUAL to the current one prunes the stack of everything at or
 * above that level, then pushes the target. The stack is therefore always a
 * root-to-current path through the page tree — never a log of clicks. "Back"
 * goes UP a level, never sideways to a sibling.
 */

/** Direction of a navigation, comparing the target's level with the current one.
 *  The strings match 4.x exactly. */
export type Direction = "In" | "Out" | "SameLevel";

/** Event delivered to subscribers after every completed navigation. */
export type NavEvent = {
  type: "navigate";
  from: string;
  to: string;
  direction: Direction;
  stack: readonly string[];
};

/** Result returned by `go()` / `back()`. Same shape as `NavEvent` minus `type`. */
export interface NavResult {
  from: string;
  to: string;
  direction: Direction;
  stack: readonly string[];
}

export interface LevelStackConfig {
  /** pageKey -> level. Levels are finite numbers; equal levels are siblings. */
  levels: Record<string, number>;
  /** Root of the stack. Default: the lowest-level key (first wins on a tie). */
  homeKey?: string;
  /**
   * Called when `back()` is requested at the root of the stack — there is
   * nothing above, so in an app-like shell this means "exit". Return `false`
   * to signal a veto to whoever wired the back gesture; anything else means
   * the handler allowed (or itself performed) the exit. The core never exits
   * anything: `back()` at the root returns `null` either way.
   */
  onExit?: () => boolean | void;
  /**
   * Receives exceptions thrown by subscribers. Subscribers are isolated: one
   * throwing never blocks the others and never breaks the navigation itself.
   * When omitted, subscriber errors are rethrown on a microtask so they are
   * reported instead of silently swallowed.
   */
  onError?: (error: unknown) => void;
}

export interface LevelStack {
  /** Root-to-current path. A new frozen array after every navigation. */
  readonly stack: readonly string[];
  /** The page on top of the stack. */
  readonly current: string;
  /**
   * Navigate to `key`. Throws `UnknownPageError` for a key that is not in
   * `levels` — an explicit error path, no silent fallback. Navigating to the
   * page you are already on is a no-op: the stack is untouched, no event is
   * emitted, and the returned result has `from === to`.
   */
  go(key: string): NavResult;
  /**
   * Navigate to the parent (one entry down the stack). Returns `null` when
   * there is nothing to go back to: at the root the `onExit` hook fires and
   * no navigation happens, vetoed or not.
   */
  back(): NavResult | null;
  /** Whether `back()` would navigate (i.e. the stack has a parent). */
  canBack(): boolean;
  /** The key `back()` WOULD land on, or `null` at the root. Does not mutate. */
  peekBack(): string | null;
  /** Subscribe to navigation events. Returns an unsubscribe function. */
  subscribe(fn: (e: NavEvent) => void): () => void;
}

/** Thrown by `go()` (and config validation) for a key missing from `levels`. */
export class UnknownPageError extends Error {
  readonly key: string;
  constructor(key: string) {
    super(
      `navigation-controller: unknown page key "${key}" — it is not in the ` +
        `\`levels\` map. Every navigable page must declare a level.`
    );
    this.name = "UnknownPageError";
    this.key = key;
  }
}

const rethrowLater = (error: unknown): void => {
  queueMicrotask(() => {
    throw error;
  });
};

export function createLevelStack(config: LevelStackConfig): LevelStack {
  const levels: Record<string, number> = { ...config.levels };
  const keys = Object.keys(levels);

  if (keys.length === 0) {
    throw new Error(
      "navigation-controller: `levels` must contain at least one page."
    );
  }
  for (const key of keys) {
    const level = levels[key];
    if (typeof level !== "number" || !Number.isFinite(level)) {
      throw new Error(
        `navigation-controller: level for page "${key}" must be a finite ` +
          `number, got ${String(level)}.`
      );
    }
  }

  let homeKey: string;
  if (config.homeKey !== undefined) {
    if (!(config.homeKey in levels)) throw new UnknownPageError(config.homeKey);
    homeKey = config.homeKey;
  } else {
    homeKey = keys.reduce(
      (best, key) => ((levels[key] as number) < (levels[best] as number) ? key : best),
      keys[0] as string
    );
  }

  let stack: readonly string[] = Object.freeze([homeKey]);
  const listeners = new Set<(e: NavEvent) => void>();

  const emit = (event: NavEvent): void => {
    // Snapshot so a subscriber unsubscribing (or subscribing) mid-emit does
    // not affect this delivery round.
    for (const listener of [...listeners]) {
      try {
        listener(event);
      } catch (error) {
        if (config.onError) config.onError(error);
        else rethrowLater(error);
      }
    }
  };

  const go = (key: string): NavResult => {
    if (!(key in levels)) throw new UnknownPageError(key);

    const from = stack[stack.length - 1] as string;
    if (key === from) {
      // Same as 4.x (`if (goToPage !== fromPage)`): navigating to the page
      // you are on does nothing — no pruning, no event.
      return { from, to: key, direction: "SameLevel", stack };
    }

    const toLevel = levels[key] as number;
    const fromLevel = levels[from] as number;
    const direction: Direction =
      toLevel > fromLevel ? "In" : toLevel < fromLevel ? "Out" : "SameLevel";

    let next = stack.slice();
    if (toLevel <= fromLevel) {
      // The 4.x algorithm, verbatim: "going back — delete every page whose
      // level is at or above mine", then push the target. Siblings replace,
      // they never stack.
      next = next.filter((k) => (levels[k] as number) < toLevel);
    }
    next.push(key);
    stack = Object.freeze(next);

    const result: NavResult = { from, to: key, direction, stack };
    emit({ type: "navigate", ...result });
    return result;
  };

  const back = (): NavResult | null => {
    if (stack.length <= 1) {
      // Back at the root: nothing above. Give the exit hook its say; the core
      // itself never exits, so the result is `null` whether or not it vetoes.
      if (config.onExit) config.onExit();
      return null;
    }
    return go(stack[stack.length - 2] as string);
  };

  return {
    get stack() {
      return stack;
    },
    get current() {
      return stack[stack.length - 1] as string;
    },
    go,
    back,
    canBack: () => stack.length > 1,
    peekBack: () => (stack.length > 1 ? (stack[stack.length - 2] as string) : null),
    subscribe(fn) {
      listeners.add(fn);
      return () => {
        listeners.delete(fn);
      };
    },
  };
}
