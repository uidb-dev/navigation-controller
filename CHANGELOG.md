# Changelog

All notable changes to `navigation-controller` are documented here.
This project follows [Semantic Versioning](https://semver.org/).

## 5.0.0-beta.1

A deliberate architectural rewrite: the level-based back algorithm becomes the
product, usable in any React environment, and everything that restyled or
hijacked the host page is gone from the default path. 4.x remains maintained
for the classic animated WebView experience.

### Added

- **`navigation-controller/core`** — the algorithm as a headless, zero-dependency
  TypeScript module: `createLevelStack({ levels, homeKey, onExit })` with
  `go` / `back` / `canBack` / `peekBack` / `subscribe`. Runs without React or a DOM.
- **`useLevelNavigator`** hook (`useSyncExternalStore`-based; React 18 & 19, SSR-safe).
- **Controlled back**: `onBackRequest(parentKey)` — the Navigator computes the
  parent and asks *your* router to navigate, mutating nothing.
- **`bindHardwareBack`** — opt-in Cordova/Capacitor `backbutton` binding that
  returns its unbinder. Nothing attaches listeners on its own anymore.
- **`navigation-controller/transitions`** — opt-in View Transitions API helpers
  (`viewTransition` for the `transition` prop, `withViewTransitions` for the
  headless path), falling back to an instant swap.
- Dual ESM + CJS build with generated types, `exports` map, `sideEffects: false`.

### Changed (breaking)

- No global CSS and no side-effect imports; page stacking is CSS Grid
  (`grid-area: 1/1`) with inline styles — no `position: absolute`, no z-index.
- No animations by default; the animate.css engine was not ported.
- Hash routing (`changeRoute`) removed; use controlled mode (`routeKey` +
  `onBackRequest`) — your router owns the URL.
- `beforBack` → **`beforeBack`** (spelled right), and only an explicit `false`
  cancels; `beforExit` → **`onExit`**; `beforChangePage` dropped.
- `alwaysLive` → **`keepMounted`**; `onRef`/`changePage` → standard `ref` with
  `go`/`back`; `errorPageKey` silent fallback replaced by an explicit error
  path (`UnknownPageError` / `onError`).
- Child `key`s are no longer used as DOM ids (`data-page-key` instead).
- `prop-types` dependency removed; `react`/`react-dom` peers are optional (only
  the React layer needs them).
- Not ported: `mobileMode`, `backOnSwipeRight` swipe gesture, per-page
  `backgroundColor`/`height`, per-navigation `props` injection via `cloneElement`.

See "Migration from 4.x" in the README for the full table.

## 4.1.1

### Documentation

- Stated the supported platforms (Android, iPhone/iPad) and documented all three back
  gestures — Android's hardware button, the iOS-style edge swipe, and the browser's
  Back button — including what each one requires to be enabled.

## 4.1.0

First release since 4.0.1. The published 4.0.x bundle could not be imported at
all by a modern bundler; if 4.0.1 worked for you, nothing here should break you,
with the one behaviour change noted below.

### Behaviour change

- **`onChangePage` now fires on mount.** The class defined `componentDidMount`
  twice and the second definition silently shadowed the first, so the initial
  `onChangePage(startPage, "In")` callback never ran. It now runs, once, right
  after the back-button and hash-change listeners are attached. If your handler
  was written assuming it is only ever called for *subsequent* navigations, it
  will now also see the start page. A handler that throws is reported through
  `onError` and does not propagate — see below.

### Fixed

- A consumer `onChangePage` handler that throws no longer crashes the React tree
  at startup. The mount-time call sat outside the `try/catch` that guards every
  other `onChangePage` call site, so the exception escaped `componentDidMount`.
  It is now routed to `props.onError` like every other callback failure.
- With exactly one child, a page's `height` prop was silently dropped: the
  single-child render branch assigned the child's whole props *object* to
  `style.height`, which React discards, so the height came out `""`. The
  multi-child branch was already correct.
- Animation names passed through `changePage`/`back` options are now normalised
  for animate.css v4 the same way child `transitionIn`/`transitionOut` props
  already were. animate.css v4 exposes `animate__`-prefixed *class* names while
  its `@keyframes` stay unprefixed; this library drives transitions through the
  `animation` style property, so a prefixed name matched no keyframe — no
  animation ran, no animation-end event fired, the internal `busy` flag latched
  true and the navigator froze permanently.
- Transitions now complete on the unprefixed `animationend` event as well as
  `webkitAnimationEnd`, so navigation no longer stalls after the first
  transition in Firefox (harmless in Cordova/Capacitor WebViews, which are
  Chromium/WebKit). The completion handler runs exactly once — both listeners
  are detached on the first accepted event — so a browser firing both events
  cannot double-advance the history stack, and animation-end events bubbling up
  from content *inside* a page are ignored so page content cannot end a page
  transition early.
- Duplicate `componentDidMount` (see above).
- `ReferenceError` during construction when the single child declared
  `transitionIn`: the constructor read an undefined `children` binding.
- The single-child render branch read a `child.key` binding that was not in
  scope, so it threw on every render with exactly one child.
- `changePage()`, `back()` and the constructor's start-page validation called
  `.filter()`/`.forEach()` straight on `props.children`, which is a single
  element and not an array when there is exactly one child.
- The published bundle was unimportable: the build ran on a Babel 6 `.babelrc`
  the installed Babel 7 toolchain ignored. Migrated to `babel.config.json`.

### Added

- Hand-written TypeScript definitions (`dist/index.d.ts`).
- A `LICENSE` file (ISC), which the package had always declared but never
  shipped.
- A vitest regression suite covering every fix above **and** the level-based
  navigation the package exists for: `home` → `hub` → `itemA` → sibling `itemB`
  (pruning `itemA`) → `back()` landing on the parent, asserting `historyPages`,
  `nowPage` and the `"In"`/`"SameLevel"`/`"Out"` direction at each step.

### Changed

- `prop-types` moved from `peerDependencies` to `dependencies`. `dist/proptypes.js`
  requires it unconditionally, so on React 19 — where nothing pulls it in
  transitively — npm installed without a single warning and the package then
  threw `Cannot find module 'prop-types'` on import.
- `react` / `react-dom` peer range widened to `^18.2.0 || ^19.0.0`. React 19 is
  verified working, including a full level-based navigation run.
- Vendored jQuery 3.3.1 (~87KB, CVE-2019-11358, CVE-2020-11022/11023) removed in
  favour of `classList`/`style` helpers. Call ordering inside every animation
  function, including the swipe-gesture handlers, is unchanged.
- Debug `console.log` calls removed. `console.error` diagnostics are kept.
- Two dev-only npm scripts (`eli-build`, `or-build`) removed: they hardcoded a
  `J:/work/...` Windows path and a `sudo npm i`.

### Removed from the published package

The tarball is now limited to `dist/`, `README.md` and `LICENSE`. These files
were published in 4.0.1 and are **gone** — if you deep-import any of them,
that import will break:

- `dist/jquery-3.3.1.min.js`
- `dist/indexOld20210331.js`
- `dist/hooks/changePage.js`
- `dist/constructor.js`
- `dist/babel.config.js`

The supported entry points are unchanged: `navigation-controller` (→
`dist/index.js`) and its types (→ `dist/index.d.ts`).

## 4.0.1 and earlier

Not documented. See the git history.
