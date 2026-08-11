# navigation-controller

**Level-based back navigation for React. Bring your own router and your own
animations.** Every page declares how deep it sits in your app; "back" walks
*up the tree*, not backwards through clicks. 5.0 is headless-first: the
algorithm is a zero-dependency core you can run anywhere — Next.js,
react-router, a plain SPA, a Cordova/Capacitor WebView, even a Node script —
with a thin React layer on top that never restyles your page.

[![npm](https://img.shields.io/npm/v/navigation-controller)](https://www.npmjs.com/package/navigation-controller)
[![downloads](https://img.shields.io/npm/dm/navigation-controller)](https://www.npmjs.com/package/navigation-controller)
[![types](https://img.shields.io/npm/types/navigation-controller)](./src/core.ts)
[![license](https://img.shields.io/npm/l/navigation-controller)](./LICENSE)

> **History is a stack of where you've been. Your app is a tree of where things are.**

In a browser, "back" means linear history — *where I've been*. In a native app,
"back" means hierarchy — *where I am*. Your router gives you the first. Users
of app-shaped UIs expect the second. This library gives you the second, and
stays out of everything else.

### ▶ Try it in 10 seconds

**[Open the live demo →](https://uidb-dev.github.io/navigation-controller/)** — four
pages with the level stack rendered on screen as you click. Go
`hub → item-a → item-b`, then press **your browser's Back button**: you land on the
hub, not on item A.

**[Edit it in your browser →](https://stackblitz.com/github/uidb-dev/navigation-controller/tree/master/examples/minimal)**
— the same demo on StackBlitz, running and editable, nothing to install.

Or run it locally:

```bash
git clone https://github.com/uidb-dev/navigation-controller
cd navigation-controller/examples/minimal && npm install && npm run dev
```

The whole demo is [one file](./examples/minimal/src/App.jsx), and its model is one line:
`{ home: 0, hub: 1, "item-a": 2, "item-b": 2 }`.

---

## The one example that explains everything

```
Home  →  Content Hub  →  Item A  →  (tap a "related" link, sideways)  →  Item B
```

Now press back from **Item B**.

|                        | Where you land | Right? |
| ---------------------- | -------------- | ------ |
| Linear history         | **Item A**     | ✗      |
| `navigation-controller`| **Content Hub**| ✓      |

Item A is not "one step back" — it's a *sibling*. Native apps return you to the
parent, because the user's mental model is a tree, not a tape recorder. You get
that by giving Item A and Item B the same level:

```ts
import { createLevelStack } from "navigation-controller/core";

const nav = createLevelStack({
  levels: { home: 0, hub: 1, "item-a": 2, "item-b": 2 },
});

nav.go("hub");     // stack: ["home", "hub"]
nav.go("item-a");  // stack: ["home", "hub", "item-a"]
nav.go("item-b");  // stack: ["home", "hub", "item-b"]   ← item-a pruned
nav.back();        // stack: ["home", "hub"]              ← lands on the hub
```

That is the whole product. Everything else in this package is a way to plug it
into React.

## Install

```bash
npm install navigation-controller
```

Three entry points:

| Import | What you get | Needs React? |
| --- | --- | --- |
| `navigation-controller` | the core **plus** `<Navigator>`, `useLevelNavigator`, `bindHardwareBack` | yes (18.2+ or 19) |
| `navigation-controller/core` | `createLevelStack` only — pure TypeScript, no DOM, no React | **no** |
| `navigation-controller/transitions` | opt-in View Transitions helpers | no |

`react` / `react-dom` are *optional* peer dependencies: a project that only
uses `/core` needs neither. ESM and CJS are both shipped, with types.
No `prop-types`, no CSS, `sideEffects: false` — importing this package changes
nothing about your page.

## The core: `createLevelStack`

```ts
import { createLevelStack, UnknownPageError } from "navigation-controller/core";

const nav = createLevelStack({
  levels: { home: 0, hub: 1, "item-a": 2, "item-b": 2 },
  homeKey: "home",          // optional; defaults to the lowest-level key
  onExit: () => false,      // back at the root: return false to veto the exit
});

nav.current;                // "home"
nav.stack;                  // frozen ["home"], a new array per navigation
nav.go("hub");              // { from, to, direction, stack }
nav.canBack();              // true
nav.peekBack();             // "home" — what back() WOULD do, without doing it
nav.back();                 // NavResult, or null at the root
const unsubscribe = nav.subscribe((e) => {
  // { type: "navigate", from, to, direction, stack }
});
```

The rules, exactly as they have shipped since 4.x:

- Navigating to a **higher** level pushes the page. Direction `"In"`.
- Navigating to a **lower or equal** level prunes the stack of everything at or
  above that level, then pushes. Direction `"Out"` (lower) / `"SameLevel"` (equal).
- The stack is therefore always a root-to-current path through your page tree —
  it cannot contain two pages at the same level.
- Deep starts are already correct: build the stack cold on `item-b` and it is
  `["home", "item-b"]` — back works on the first tap, no synthetic history.
- `go()` with an **unknown key throws `UnknownPageError`** — an explicit error
  path, no silent fallback. `go()` to the current page is a no-op.
- `back()` at the root calls `onExit` and returns `null`; the core never exits
  anything itself.

## The React layer

### `<Navigator>` — uncontrolled

```tsx
import { useRef } from "react";
import { Navigator, type NavigatorHandle } from "navigation-controller";

function App() {
  const nav = useRef<NavigatorHandle>(null);
  return (
    <Navigator ref={nav} onChangePage={(key, direction) => console.log(key, direction)}>
      {/* levelPage is the whole idea: 0 is the root, higher is deeper. */}
      <Home    key="home"    levelPage={0} nav={nav} />
      <Hub     key="hub"     levelPage={1} nav={nav} />
      <Item    key="item-a"  levelPage={2} nav={nav} />
      <Item    key="item-b"  levelPage={2} nav={nav} />
    </Navigator>
  );
}

const Home = ({ nav }) => <button onClick={() => nav.current.go("hub")}>Open hub</button>;
const Item = ({ nav }) => <button onClick={() => nav.current.back()}>Up</button>;
```

Children declare `key` + `levelPage` exactly like 4.x. What the Navigator does
differently in 5.0:

- **CSS Grid stacking.** The container is `display: grid`; every page sits in
  `grid-area: 1/1`. No `position: absolute`, no z-index juggling, and **zero
  global CSS** — nothing touches `html`, `body` or your layout. All styling is
  inline on the elements the Navigator itself renders.
- **Pages on the stack stay mounted** while hidden (`display: none`), so form
  state, video playback and component state survive drilling in and backing
  out. A pruned sibling genuinely unmounts — unless it declares `keepMounted`
  (the 4.x `alwaysLive`).
- **No animations.** Page swap is instant. Transitions are opt-in — see below.
- **No URL writes.** The Navigator never touches `window.location`. If you have
  a router, use controlled mode.

### Controlled mode — your router owns the URL

```tsx
<Navigator
  routeKey={keyFromLocation(location)}          // router -> navigator
  onBackRequest={(parentKey) =>                 // navigator -> router
    navigate(pathFromKey(parentKey), { replace: true })}
>
  ...
</Navigator>
```

Changing `routeKey` navigates the level stack. With `onBackRequest` set,
`back()` **mutates nothing**: the Navigator computes the parent via
`peekBack()` and hands it to your router; the router changes the URL; the URL
changes `routeKey`; *that* navigates. One navigation source, so the browser
Back button (popstate), links and programmatic navigation can never fight the
level stack.

Complete, typechecked adapters live in [`docs/adapters/`](./docs/adapters):
**react-router v7**, **Next.js App Router**, and **Cordova/Capacitor**. Each
states the same contract: *the router owns the URL, this package owns "where
is UP".*

### `useLevelNavigator` — no component at all

```tsx
import { useLevelNavigator } from "navigation-controller";

function App() {
  const { current, stack, go, back, canBack, direction } = useLevelNavigator({
    levels: { home: 0, hub: 1, "item-a": 2, "item-b": 2 },
  });
  return current === "hub" ? <Hub onOpen={() => go("item-a")} /> : /* ... */ null;
}
```

Backed by `useSyncExternalStore`: tearing-free under React 18 and 19
concurrent rendering, SSR-safe.

### Hardware back button — opt-in

```tsx
import { bindHardwareBack } from "navigation-controller";

useEffect(() => bindHardwareBack(() => navRef.current?.back()), []);
```

Attaches the Cordova/Capacitor document `backbutton` event and returns the
unbind function. 5.0 attaches **nothing** on its own — no more surprise
listeners from merely rendering a component.

### Vetoes and errors

```tsx
<Navigator
  beforeBack={(target) => !formIsDirty}   // false cancels; may be async
  onExit={() => window.confirm("Exit?")}  // back at the root
  onError={(error) => report(error)}      // unknown keys, throwing callbacks
>
```

`beforeBack` fixes both 4.x problems at once: the spelling (`beforBack` → 
`beforeBack`) and the footgun — in 4.x a handler that forgot to return
anything cancelled every back navigation; in 5.0 **only an explicit `false`
cancels**. Callbacks that throw are routed to `onError`, never crash the tree.

## Transitions — opt-in, View Transitions API

5.0 ships no animation engine. When you want animated navigation:

```tsx
import { viewTransition } from "navigation-controller/transitions";

<Navigator transition={viewTransition}> ... </Navigator>
```

Where the browser supports `document.startViewTransition`, every page swap is
wrapped in a view transition; everywhere else it falls back to an instant
swap. For the headless path there is `withViewTransitions(fn)`, which wraps
any navigation function and resolves after the DOM update.

You style the animation in plain CSS. Give a page a `transitionName` and the
Navigator sets `view-transition-name` on its wrapper:

```tsx
<Details key="details" levelPage={1} transitionName="details-page" />
```

```css
/* A slide, entirely yours to customize: */
::view-transition-new(details-page) {
  animation: slide-in-right 250ms ease-out;
}
::view-transition-old(details-page) {
  animation: slide-out-right 250ms ease-in;
}
@keyframes slide-in-right  { from { transform: translateX(100%); } }
@keyframes slide-out-right { to   { transform: translateX(100%); } }
```

The container also exposes `data-direction="In" | "Out" | "SameLevel"`, so CSS
can animate "deeper" differently from "back". The 4.x animate.css engine was
deliberately **not** ported — 4.x remains published and maintained if you want
the classic animated WebView experience out of the box.

## When to use this

- Your app is a **hierarchy** — tabs, hubs, detail pages, wizards — and "back"
  should mean "up", regardless of the click trail.
- A React app inside a **WebView** (Cordova, Capacitor, Ionic) where the
  Android hardware back button must do the right thing.
- You already have a router (react-router, Next.js) and want native-feeling
  back semantics **on top of** it, not instead of it.
- You want the algorithm with none of the UI: `navigation-controller/core`.

## When *not* to use this

| Use instead | When |
| --- | --- |
| **your router alone** | A document-shaped site where linear browser history is correct and users deep-link, bookmark and share freely. |
| **`framer-motion`** / `react-transition-group` | You only want animated transitions. Those animate; they do not model navigation semantics. |
| **`@react-navigation/native`** | You are on **React Native**. This library renders DOM. |
| Plain conditional rendering | Two or three screens, no back-button requirements. Do not add a dependency for that. |
| **`navigation-controller@4`** | You want the batteries-included 4.x behaviour: built-in animate.css transitions, hash routing, edge-swipe-back. 4.x remains maintained. |

---

## Migration from 4.x

5.0 keeps the mental model and changes the defaults. The algorithm, the
`levelPage` prop, child `key` semantics and the direction strings
(`"In"` / `"Out"` / `"SameLevel"`) are exactly what shipped in 4.x.

**What changed:**

| 4.x | 5.0 |
| --- | --- |
| Global CSS (`html, body { overflow: hidden !important }`, injected by import) | **Gone.** No stylesheet ships at all; nothing is imported by side effect. |
| `position: absolute` page stacking | CSS Grid (`grid-area: 1/1`), inline styles only. |
| Built-in animate.css transitions (`transitionIn` / `transitionOut` / `animationTimeInMS`) | **Gone by default.** Opt-in `transition` prop + `navigation-controller/transitions` (View Transitions API). Keep 4.x if you want the old engine. |
| `changeRoute` hash routing (`window.location.hash` writes) | **Removed** in favor of controlled mode: `routeKey` in, `onBackRequest` out. Your router owns the URL. |
| `beforBack` (sic), cancels unless you return truthy | **`beforeBack`** — spelled right, and only an explicit `false` cancels. |
| `beforExit` (sic) | **`onExit`**. |
| `beforChangePage` (sic) | Dropped. Use `onChangePage(key, direction)`; veto with `beforeBack`. |
| Automatic `backbutton` listener on mount | **Opt-in** `bindHardwareBack()`, returns an unbinder. |
| `alwaysLive` | **`keepMounted`**. |
| `onRef={(nav) => ...}` + `nav.changePage(key, options)` | Standard `ref` + `nav.go(key)` / `nav.back()`. |
| `errorPageKey` silent fallback | Explicit error path: unknown keys throw (`/core`) or hit `onError` (`<Navigator>`). Render your own error page from it. |
| Child `key` doubles as a DOM `id` (no dots/colons/spaces) | Keys are plain strings again — no DOM id constraint (`data-page-key` is used instead). |
| `mobileMode`, swipe-back (`backOnSwipeRight`), per-page `backgroundColor`/`height` | Not ported. Layout and gestures belong to your app; 4.x still has them. |
| `prop-types` runtime dependency | Gone. TypeScript is the validation story. |

**What stayed:** `levelPage`, unique child `key`s, `homePageKey`, `routeKey`,
`onChangePage(key, direction)`, direction strings, deep-link cold starts,
pages-on-the-stack staying mounted.

4.x is not deprecated: it remains the right choice for the classic
animated-WebView setup, and continues to receive fixes on the 4.x line.

## TypeScript

Everything ships typed — the package is written in strict TypeScript.

```ts
import type {
  Direction,            // "In" | "Out" | "SameLevel"  (alias: NavigatorDirection)
  LevelStack, LevelStackConfig, NavEvent, NavResult,
  NavigatorProps, NavigatorPageProps, NavigatorHandle,
} from "navigation-controller";
```

## Contributing & support

Issues and pull requests: <https://github.com/uidb-dev/navigation-controller/issues>

## License

ISC © [ui-db.com](https://ui-db.com)
