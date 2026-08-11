/**
 * Adapter: Next.js App Router owns the URL; navigation-controller owns "where is UP".
 *
 *   - Next.js owns the URL: usePathname/useRouter, prefetching, server
 *     components, the browser Back button.
 *   - navigation-controller owns the LEVEL STACK: which page is the parent of
 *     which, and what "back" should mean inside the app shell.
 *
 * Identical shape to the react-router adapter:
 *   1. usePathname() -> routeKey
 *   2. onBackRequest -> router.replace(parentPath)
 *   3. app code navigates with the Next router only.
 *
 * Place this component in a client boundary ('use client') — the Navigator
 * holds client state. It still renders on the server without crashing
 * (useSyncExternalStore has a server snapshot), so the initial HTML shows the
 * deep-linked page.
 *
 * This file typechecks via a minimal next/navigation shim
 * (`npm run typecheck:docs`) — the signatures match Next 14/15.
 */
"use client";

import * as React from "react";
import { usePathname, useRouter } from "next/navigation";
import { Navigator, bindHardwareBack, type NavigatorHandle } from "navigation-controller";

const PAGES = [
  { path: "/", key: "home", levelPage: 0 },
  { path: "/hub", key: "hub", levelPage: 1 },
  { path: "/hub/item-a", key: "item-a", levelPage: 2 },
  { path: "/hub/item-b", key: "item-b", levelPage: 2 },
] as const;

const keyFromPath = (pathname: string): string =>
  PAGES.find((p) => p.path === pathname)?.key ?? "home";

const pathFromKey = (key: string): string =>
  PAGES.find((p) => p.key === key)?.path ?? "/";

const Page = (props: { levelPage?: number; children?: React.ReactNode }) => (
  <section>{props.children}</section>
);

export function AppShell(): React.ReactElement {
  const pathname = usePathname();
  const router = useRouter();
  const navRef = React.useRef<NavigatorHandle>(null);

  // (1) URL -> routeKey. Every navigation source Next knows about — <Link>,
  // router.push, the browser Back button — funnels through this one prop.
  const routeKey = keyFromPath(pathname);

  // Capacitor/Cordova hardware back -> Navigator.back() -> onBackRequest.
  React.useEffect(() => bindHardwareBack(() => void navRef.current?.back()), []);

  return (
    <Navigator
      ref={navRef}
      routeKey={routeKey}
      // (2) The Navigator says where UP is; Next performs the navigation.
      // replace() rather than push(): going up should not add history depth.
      onBackRequest={(parentKey) => router.replace(pathFromKey(parentKey))}
      onExit={() => false}
    >
      {PAGES.map((p) => (
        <Page key={p.key} levelPage={p.levelPage}>
          {/* (3) Forward navigation is plain Next navigation. */}
          <button onClick={() => router.push("/hub/item-b")}>Related item</button>
          <button onClick={() => void navRef.current?.back()}>Up</button>
        </Page>
      ))}
    </Navigator>
  );
}
