/**
 * Adapter: Cordova / Capacitor WebView — no router at all.
 *
 * In a WebView shell there is often no URL worth owning; the Navigator can be
 * UNCONTROLLED and own the whole stack itself (no routeKey, no onBackRequest).
 * The two platform concerns are:
 *
 *   - the hardware back button: `bindHardwareBack` wires the document-level
 *     `backbutton` event (Cordova fires it natively; on Capacitor, forward
 *     App.addListener('backButton', ...) to the same document event or call
 *     `back()` directly in that listener). Opt-in — 5.0 never attaches
 *     listeners on its own.
 *   - exiting at the root: `onExit` fires when back is pressed on the home
 *     page. Return false to veto (e.g. show a "press again to exit" toast);
 *     perform the actual exit yourself.
 *
 * This file typechecks (`npm run typecheck:docs`).
 */
import * as React from "react";
import { Navigator, bindHardwareBack, type NavigatorHandle } from "navigation-controller";

/** Cordova's app exit hook, typed narrowly; Capacitor apps use @capacitor/app's App.exitApp(). */
declare global {
  interface Navigator {
    app?: { exitApp?: () => void };
  }
}

const Page = (props: { levelPage?: number; keepMounted?: boolean; children?: React.ReactNode }) => (
  <section>{props.children}</section>
);

export function App(): React.ReactElement {
  const navRef = React.useRef<NavigatorHandle>(null);
  const [confirmExit, setConfirmExit] = React.useState(false);

  // Hardware back -> level-based back. Returns the unbind function, which
  // useEffect uses as its cleanup.
  React.useEffect(() => bindHardwareBack(() => void navRef.current?.back()), []);

  return (
    <Navigator
      ref={navRef}
      onExit={() => {
        // Back pressed at the root. First press: veto and warn. Second press
        // (within the toast window): actually leave.
        if (!confirmExit) {
          setConfirmExit(true);
          setTimeout(() => setConfirmExit(false), 2000);
          return false; // veto
        }
        window.navigator.app?.exitApp?.();
        return true;
      }}
      beforeBack={(target) => {
        // Example veto: keep the user on a dirty form. Only an explicit
        // `false` cancels (unlike 4.x, forgetting to return does NOT veto).
        void target;
        return true;
      }}
    >
      <Page key="home" levelPage={0}>home {confirmExit ? "— press back again to exit" : ""}</Page>
      <Page key="hub" levelPage={1}>hub</Page>
      {/* keepMounted: an audio player or long form survives being pruned. */}
      <Page key="player" levelPage={2} keepMounted>player</Page>
      <Page key="details" levelPage={2}>details</Page>
    </Navigator>
  );
}
