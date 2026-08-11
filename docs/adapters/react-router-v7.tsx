/**
 * Adapter: react-router v7 owns the URL; navigation-controller owns "where is UP".
 *
 * The division of labor, stated once and honored everywhere:
 *
 *   - react-router owns the URL, the history entries, links, redirects and the
 *     browser Back button (popstate).
 *   - navigation-controller owns the LEVEL STACK: which page is the parent of
 *     which, what "back" (hardware button, in-app back UI) should mean.
 *
 * The wiring is three lines of intent:
 *   1. location -> routeKey        (the router tells the Navigator what to show)
 *   2. onBackRequest -> navigate() (the Navigator tells the router where UP is)
 *   3. never call nav.go() yourself — always navigate() and let (1) happen.
 *
 * popstate coherence comes free: the browser Back button changes the location,
 * the location changes `routeKey`, and the Navigator applies its level
 * algorithm to that change — one navigation source, no fights, no loops.
 *
 * This file typechecks against react-router v7 (`npm run typecheck:docs`).
 */
import * as React from "react";
import {
  createBrowserRouter,
  RouterProvider,
  useLocation,
  useNavigate,
} from "react-router";
import { Navigator, bindHardwareBack, type NavigatorHandle } from "navigation-controller";

/** One row per page: URL path, page key, and its depth in YOUR hierarchy. */
const PAGES = [
  { path: "/", key: "home", levelPage: 0 },
  { path: "/hub", key: "hub", levelPage: 1 },
  { path: "/hub/item-a", key: "item-a", levelPage: 2 },
  { path: "/hub/item-b", key: "item-b", levelPage: 2 },
] as const;

type PageKey = (typeof PAGES)[number]["key"];

const keyFromPath = (pathname: string): PageKey =>
  (PAGES.find((p) => p.path === pathname)?.key ?? "home");

const pathFromKey = (key: string): string =>
  PAGES.find((p) => p.key === key)?.path ?? "/";

const Page = (props: { levelPage?: number; children?: React.ReactNode }) => (
  <section>{props.children}</section>
);

function Shell(): React.ReactElement {
  const location = useLocation();
  const navigate = useNavigate();
  const navRef = React.useRef<NavigatorHandle>(null);

  // (1) location -> routeKey: the router is the single source of navigation.
  const routeKey = keyFromPath(location.pathname);

  // Hardware back (Cordova/Capacitor) goes through the Navigator's back(),
  // which — because onBackRequest is set — mutates nothing and instead asks
  // the router to go UP. Browsers without a hardware button never fire this.
  React.useEffect(() => bindHardwareBack(() => void navRef.current?.back()), []);

  return (
    <Navigator
      ref={navRef}
      routeKey={routeKey}
      // (2) The Navigator computed the PARENT via its level stack; the router
      // performs the actual navigation. `replace: true` keeps linear browser
      // history from piling up sibling entries underneath the app's tree.
      onBackRequest={(parentKey) => navigate(pathFromKey(parentKey), { replace: true })}
      onExit={() => false /* root: nothing above; keep the app open */}
    >
      {PAGES.map((p) => (
        <Page key={p.key} levelPage={p.levelPage}>
          {/* (3) In-app "up" buttons also go through back() -> the router. */}
          <button onClick={() => void navRef.current?.back()}>Up</button>
          <button onClick={() => navigate("/hub/item-b")}>Related item</button>
        </Page>
      ))}
    </Navigator>
  );
}

// The Navigator renders every page itself, so a single splat route hands all
// paths to the shell; the router still owns them.
const router = createBrowserRouter([{ path: "*", element: <Shell /> }]);

export function App(): React.ReactElement {
  return <RouterProvider router={router} />;
}
