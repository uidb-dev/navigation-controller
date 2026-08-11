/**
 * navigation-controller — the React layer over the headless core.
 *
 * Nothing here restyles the host page: no global CSS, no `position: absolute`,
 * no `window.location` writes. Pages are stacked with CSS Grid (`grid-area:
 * 1/1`) via inline styles only, and the URL belongs to whatever router you
 * already use — see the adapters in `docs/`.
 */
import * as React from "react";
import { flushSync } from "react-dom";
import {
  createLevelStack,
  UnknownPageError,
  type Direction,
  type LevelStack,
  type LevelStackConfig,
  type NavResult,
} from "./core";

/* ------------------------------------------------------------------ */
/* Internal store: LevelStack adapted for useSyncExternalStore          */
/* ------------------------------------------------------------------ */

interface NavSnapshot {
  stack: readonly string[];
  current: string;
  direction: Direction;
}

interface NavStore {
  nav: LevelStack;
  subscribe: (onStoreChange: () => void) => () => void;
  getSnapshot: () => NavSnapshot;
}

function createNavStore(config: LevelStackConfig): NavStore {
  const nav = createLevelStack(config);
  let snapshot: NavSnapshot = {
    stack: nav.stack,
    current: nav.current,
    direction: "In",
  };
  const listeners = new Set<() => void>();
  nav.subscribe((e) => {
    snapshot = { stack: e.stack, current: e.to, direction: e.direction };
    for (const listener of [...listeners]) listener();
  });
  return {
    nav,
    subscribe(onStoreChange) {
      listeners.add(onStoreChange);
      return () => {
        listeners.delete(onStoreChange);
      };
    },
    getSnapshot: () => snapshot,
  };
}

/** Keeps the latest value of a prop readable from stable callbacks. */
function useLatest<T>(value: T): React.MutableRefObject<T> {
  const ref = React.useRef(value);
  ref.current = value;
  return ref;
}

/* ------------------------------------------------------------------ */
/* useLevelNavigator                                                    */
/* ------------------------------------------------------------------ */

export interface UseLevelNavigatorResult {
  /** The page on top of the stack. */
  current: string;
  /** Root-to-current path. */
  stack: readonly string[];
  /** Direction of the last navigation ("In" on first render). */
  direction: Direction;
  /** Whether `back()` would navigate. */
  canBack: boolean;
  /** Navigate. Throws `UnknownPageError` for unknown keys, like the core. */
  go: (key: string) => NavResult;
  /** Navigate to the parent; `null` at the root (after the `onExit` hook). */
  back: () => NavResult | null;
  /** The underlying headless `LevelStack` (e.g. for `bindHardwareBack`). */
  navigator: LevelStack;
}

/**
 * React hook over `createLevelStack`. Safe under React 18 and 19 — state is
 * read through `useSyncExternalStore`, so tearing-free under concurrent
 * rendering, and SSR-safe (the server snapshot is the initial stack).
 *
 * The `config` is captured on the first render: the page set and levels are
 * fixed for the lifetime of the component.
 */
export function useLevelNavigator(
  config: LevelStackConfig
): UseLevelNavigatorResult {
  const [store] = React.useState(() => createNavStore(config));
  const snap = React.useSyncExternalStore(
    store.subscribe,
    store.getSnapshot,
    store.getSnapshot
  );
  return {
    current: snap.current,
    stack: snap.stack,
    direction: snap.direction,
    canBack: snap.stack.length > 1,
    go: store.nav.go,
    back: store.nav.back,
    navigator: store.nav,
  };
}

/* ------------------------------------------------------------------ */
/* <Navigator>                                                          */
/* ------------------------------------------------------------------ */

/**
 * Props each child page of `<Navigator>` may declare, exactly like 4.x:
 * a unique `key` plus `levelPage`. (`key` is not listed here because React
 * strips it from props — but it is required.)
 */
export interface NavigatorPageProps {
  /** Depth of the page. Always set it: the default (0 for the home page,
   *  99999 for everything else) makes all non-home pages siblings. */
  levelPage?: number;
  /** Keep the page mounted even when it is off the current path
   *  (the 4.x `alwaysLive`). Hidden pages are `display: none`. */
  keepMounted?: boolean;
  /** Appended to the page wrapper element. */
  className?: string;
  /** Sets `view-transition-name` on the page wrapper — the hook the
   *  `navigation-controller/transitions` subpath animates against. */
  transitionName?: string;
}

/** Imperative surface exposed through the `<Navigator>` `ref`. */
export interface NavigatorHandle {
  /**
   * Navigate. Unknown keys are routed to `onError` and return `null` (they
   * never throw out of an event handler). Also returns `null` when a
   * `transition` prop defers the commit.
   */
  go(key: string): NavResult | null;
  /**
   * Level-based back. Honors `beforeBack`; with `onBackRequest` it does NOT
   * mutate — it hands the parent key to your router instead.
   */
  back(): Promise<NavResult | null>;
  canBack(): boolean;
  peekBack(): string | null;
  readonly current: string;
  readonly stack: readonly string[];
}

export interface NavigatorProps {
  /** Page elements. Each needs a unique `key` and should declare `levelPage`. */
  children: React.ReactNode;
  /** Root of the stack. Defaults to the first child's key, like 4.x. */
  homePageKey?: string;
  /**
   * Controlled mode: the parent (usually a router adapter) tells the
   * Navigator what to show. Changing it navigates. See `docs/`.
   */
  routeKey?: string;
  /**
   * Controlled back: when provided, `back()` (and any hardware back wired to
   * it) does NOT mutate the stack. The Navigator computes the parent via
   * `peekBack()` and calls this callback so YOUR router navigates; the
   * resulting `routeKey` change is what actually moves the Navigator.
   */
  onBackRequest?: (parentKey: string) => void;
  /** Fires after every navigation, and once on mount with direction "In". */
  onChangePage?: (key: string, direction: Direction) => void;
  /**
   * Veto hook for `back()`. Renamed from the 4.x `beforBack` (sic). Also
   * fixed: only an explicit `false` cancels — returning nothing allows the
   * navigation. May be async.
   */
  beforeBack?: (target: string) => boolean | void | Promise<boolean | void>;
  /** Back at the root. Return `false` to veto; do your app exit here. */
  onExit?: () => boolean | void;
  /** Receives unknown-key errors and exceptions thrown by your callbacks. */
  onError?: (error: unknown) => void;
  /**
   * Opt-in transition wrapper. Receives a `commit` function that applies the
   * DOM update synchronously; call it inside `document.startViewTransition`
   * or any animation frame of your choosing. Pass `viewTransition` from
   * `navigation-controller/transitions` for the View Transitions API.
   * No transition prop = instant swap (the default).
   */
  transition?: (commit: () => void) => void;
  /** Class for the grid container. */
  className?: string;
  /** Style for the grid container (merged over `display: grid`). */
  style?: React.CSSProperties;
}

/**
 * `props.children` may be a single element, an array, or nested arrays from
 * `.map()`. Deliberately NOT `React.Children.toArray` — that rewrites keys
 * (".$myKey") and this library uses child keys verbatim as page keys.
 */
function flattenChildren(children: React.ReactNode): React.ReactElement[] {
  const out: React.ReactElement[] = [];
  const walk = (node: React.ReactNode): void => {
    if (node === null || node === undefined || typeof node === "boolean") return;
    if (Array.isArray(node)) {
      node.forEach(walk);
      return;
    }
    if (React.isValidElement(node)) out.push(node);
  };
  walk(children);
  return out;
}

const childKey = (child: React.ReactElement): string | null =>
  child.key === null ? null : String(child.key);

export const Navigator = React.forwardRef<NavigatorHandle, NavigatorProps>(
  function Navigator(props, ref) {
    const onErrorRef = useLatest(props.onError);
    const onExitRef = useLatest(props.onExit);
    const onChangePageRef = useLatest(props.onChangePage);
    const beforeBackRef = useLatest(props.beforeBack);
    const onBackRequestRef = useLatest(props.onBackRequest);
    const transitionRef = useLatest(props.transition);

    const reportError = React.useCallback(
      (error: unknown): void => {
        if (onErrorRef.current) onErrorRef.current(error);
        else console.error("navigation-controller:", error);
      },
      [onErrorRef]
    );

    // The page set and levels are captured at mount, exactly like the 4.x
    // constructor. Children can re-render freely; adding/removing PAGES after
    // mount is not supported in 5.0.0-beta.1.
    const [store] = React.useState(() => {
      const children = flattenChildren(props.children);
      const levels: Record<string, number> = {};
      const homeKey =
        props.homePageKey ??
        (children.length > 0 ? childKey(children[0] as React.ReactElement) ?? undefined : undefined);
      for (const child of children) {
        const key = childKey(child);
        if (key === null) {
          reportError(
            new Error("navigation-controller: every page needs a `key`.")
          );
          continue;
        }
        const declared = (child.props as NavigatorPageProps).levelPage;
        levels[key] = declared !== undefined ? declared : key === homeKey ? 0 : 99999;
      }
      const s = createNavStore({
        levels,
        homeKey,
        onExit: () => onExitRef.current?.(),
        onError: reportError,
      });
      // Deep-linked controlled start: derive [home, ..., routeKey] from levels,
      // exactly the 4.x cold-start behaviour. No event fires this early; the
      // mount effect announces the resulting page.
      if (props.routeKey !== undefined && props.routeKey !== s.nav.current) {
        try {
          s.nav.go(props.routeKey);
        } catch (error) {
          reportError(error);
        }
      }
      return s;
    });

    const snap = React.useSyncExternalStore(
      store.subscribe,
      store.getSnapshot,
      store.getSnapshot
    );

    // Announce navigations (and the mount) to the consumer. A throwing
    // handler is routed to onError — it must never take the tree down.
    React.useEffect(() => {
      const safeAnnounce = (key: string, direction: Direction): void => {
        try {
          onChangePageRef.current?.(key, direction);
        } catch (error) {
          reportError(error);
        }
      };
      safeAnnounce(store.nav.current, "In");
      return store.nav.subscribe((e) => safeAnnounce(e.to, e.direction));
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const go = React.useCallback(
      (key: string): NavResult | null => {
        const commit = (): NavResult | null => {
          try {
            return store.nav.go(key);
          } catch (error) {
            reportError(error);
            return null;
          }
        };
        const transition = transitionRef.current;
        if (transition) {
          let result: NavResult | null = null;
          transition(() => {
            // The DOM must reflect the new page inside the transition
            // callback (e.g. between the View Transitions API snapshots),
            // so force React to flush synchronously.
            flushSync(() => {
              result = commit();
            });
          });
          return result; // null when the transition defers the commit
        }
        return commit();
      },
      [store, reportError, transitionRef]
    );

    const back = React.useCallback(async (): Promise<NavResult | null> => {
      const target = store.nav.peekBack();
      if (target === null) {
        // At the root: nothing above. core.back() runs the onExit hook.
        return store.nav.back();
      }
      if (beforeBackRef.current) {
        let allowed: boolean | void;
        try {
          allowed = await beforeBackRef.current(target);
        } catch (error) {
          reportError(error);
          return null;
        }
        if (allowed === false) return null;
      }
      if (onBackRequestRef.current) {
        // Controlled back: the app's router owns navigation. Tell it where
        // "up" is; it responds by changing `routeKey`.
        onBackRequestRef.current(target);
        return null;
      }
      return go(target);
    }, [store, go, reportError, beforeBackRef, onBackRequestRef]);

    // Controlled mode: `routeKey` changes drive navigation (4.x
    // componentDidUpdate semantics, including falling back to home when the
    // key becomes undefined again).
    const routeKey = props.routeKey;
    const lastRouteKey = React.useRef(routeKey);
    const homeKeyRef = React.useRef(store.getSnapshot().stack[0] as string);
    React.useEffect(() => {
      if (routeKey === lastRouteKey.current) return;
      const hadRouteKey = lastRouteKey.current !== undefined;
      lastRouteKey.current = routeKey;
      const target = routeKey !== undefined ? routeKey : hadRouteKey ? homeKeyRef.current : undefined;
      if (target !== undefined && target !== store.nav.current) go(target);
    }, [routeKey, go, store]);

    React.useImperativeHandle(
      ref,
      (): NavigatorHandle => ({
        go,
        back,
        canBack: () => store.nav.canBack(),
        peekBack: () => store.nav.peekBack(),
        get current() {
          return store.nav.current;
        },
        get stack() {
          return store.nav.stack;
        },
      }),
      [go, back, store]
    );

    const children = flattenChildren(props.children);
    const stackSet = new Set(snap.stack);

    return (
      <div
        className={props.className}
        style={{ display: "grid", ...props.style }}
        data-level-navigator=""
        data-direction={snap.direction}
      >
        {children.map((child, index) => {
          const key = childKey(child) ?? `__missing_key_${index}`;
          const pageProps = child.props as NavigatorPageProps;
          const isCurrent = key === snap.current;
          // Pages on the stack stay MOUNTED while hidden, so scroll, form and
          // video state survive going deeper and coming back — the same value
          // 4.x provided. A pruned sibling genuinely unmounts, unless it opts
          // into `keepMounted`.
          const isMounted =
            isCurrent || stackSet.has(key) || pageProps.keepMounted === true;
          return (
            <div
              key={key}
              data-page-key={key}
              data-page-state={isCurrent ? "current" : isMounted ? "hidden" : "unmounted"}
              className={pageProps.className}
              style={{
                gridArea: "1 / 1",
                minWidth: 0,
                // `display: none` (not `visibility`) so hidden pages cost no
                // layout, trap no focus and are out of the a11y tree — no
                // `inert` needed, which keeps React 18/19 behaviour identical.
                display: isCurrent ? undefined : "none",
                viewTransitionName: pageProps.transitionName,
              }}
            >
              {isMounted ? child : null}
            </div>
          );
        })}
      </div>
    );
  }
);

/* ------------------------------------------------------------------ */
/* bindHardwareBack                                                     */
/* ------------------------------------------------------------------ */

/**
 * Wire the Cordova/Capacitor hardware back button (the document-level
 * `backbutton` event) to a navigator — or to any callback. Opt-in: nothing
 * in this package attaches listeners on its own. Returns the unbind function.
 *
 * ```ts
 * useEffect(() => bindHardwareBack(() => navRef.current?.back()), []);
 * ```
 */
export function bindHardwareBack(
  target: { back(): unknown } | (() => unknown),
  doc: Pick<Document, "addEventListener" | "removeEventListener"> = document
): () => void {
  const handler = (): void => {
    if (typeof target === "function") target();
    else target.back();
  };
  doc.addEventListener("backbutton", handler, false);
  return () => {
    doc.removeEventListener("backbutton", handler, false);
  };
}

export { UnknownPageError };
export type { Direction, LevelStack, LevelStackConfig, NavResult };
