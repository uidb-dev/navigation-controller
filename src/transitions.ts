/**
 * navigation-controller/transitions — opt-in View Transitions API wrapper.
 *
 * 5.0 ships NO animation engine: page swaps are instant by default. When you
 * want animated navigation, this subpath wraps a state change in
 * `document.startViewTransition` where the browser supports it, and falls
 * back to an instant swap everywhere else. You style the animation yourself
 * in CSS — see the "slide" example in the package README. (The 4.x animate.css
 * engine was not ported; 4.x remains available if you want that experience.)
 */

type StartViewTransitionFn = (updateCallback: () => void | Promise<void>) => {
  updateCallbackDone: Promise<void>;
};

const getStartViewTransition = (): StartViewTransitionFn | null => {
  if (typeof document === "undefined") return null;
  const svt = (document as { startViewTransition?: unknown }).startViewTransition;
  return typeof svt === "function"
    ? ((svt as StartViewTransitionFn).bind(document) as StartViewTransitionFn)
    : null;
};

/**
 * Run `commit` inside a view transition when supported, or immediately when
 * not. Shaped to be handed straight to the `<Navigator transition>` prop:
 *
 * ```tsx
 * import { viewTransition } from "navigation-controller/transitions";
 * <Navigator transition={viewTransition}>…</Navigator>
 * ```
 */
export function viewTransition(commit: () => void): void {
  const startViewTransition = getStartViewTransition();
  if (startViewTransition) startViewTransition(commit);
  else commit();
}

/**
 * Wrap a navigation function so each call runs inside a view transition.
 * Because `startViewTransition` invokes its callback asynchronously, the
 * wrapped function resolves with the original's result once the DOM update
 * has been applied (immediately when the API is unsupported).
 *
 * With the `useLevelNavigator` hook, remember the DOM update must be flushed
 * inside the callback: `withViewTransitions((key) => flushSync(() => go(key)))`.
 *
 * ```ts
 * const go = withViewTransitions(stack.go);
 * await go("details");
 * ```
 */
export function withViewTransitions<A extends unknown[], R>(
  fn: (...args: A) => R
): (...args: A) => Promise<R> {
  return (...args: A): Promise<R> => {
    const startViewTransition = getStartViewTransition();
    if (!startViewTransition) return Promise.resolve(fn(...args));
    let result!: R;
    const transition = startViewTransition(() => {
      result = fn(...args);
    });
    return transition.updateCallbackDone.then(() => result);
  };
}
