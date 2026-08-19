# navigation-controller

**Level-based back navigation for React apps on Android and iPhone.** Every page
declares how deep it sits in your app. "Back" walks *up the tree*, not backwards
through clicks — whether the user taps Android's hardware back button, swipes right
from the edge as they would on iOS, or presses Back in the browser.

[![npm](https://img.shields.io/npm/v/navigation-controller)](https://www.npmjs.com/package/navigation-controller)
[![downloads](https://img.shields.io/npm/dm/navigation-controller)](https://www.npmjs.com/package/navigation-controller)
[![types](https://img.shields.io/npm/types/navigation-controller)](./src/index.d.ts)
[![license](https://img.shields.io/npm/l/navigation-controller)](./LICENSE)

> **History is a stack of where you've been. Your app is a tree of where things are.**

In a browser, "back" means linear history — *where I've been*. In a native app, "back"
means hierarchy — *where I am*. `react-router` gives you the first. Mobile apps need
the second. This library gives you the second, and wires it to the Android hardware
back button and the iOS edge-swipe gesture.

### ▶ See it in action

**[Open the live demo →](https://uidb-dev.github.io/navigation-controller/)** — four
pages with the level stack drawn on screen as you click. Go `hub → item-a → item-b`,
then press **your browser's Back button**: you land on the hub, not on item A.

The demo runs the 5.0 beta, so the code in it uses the newer API — but the behaviour
it shows is exactly what 4.x does.
[Demo source](https://github.com/uidb-dev/navigation-controller/tree/master/examples/minimal).

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

Item A is not "one step back" — it's a *sibling*. Native apps return you to the parent,
because the user's mental model is a tree, not a tape recorder. You get that by giving
Item A and Item B the same `levelPage`:

```jsx
<Navigator onRef={(nav) => (navRef.current = nav)}>
  <Home key="home" levelPage={0} nav={navRef} />
  <Hub  key="hub"  levelPage={1} nav={navRef} />

  {/* Siblings: same level. Back from either one returns to "hub", never to
      the other. Going sideways replaces, it does not stack. */}
  <Item key="item-a" levelPage={2} nav={navRef} />
  <Item key="item-b" levelPage={2} nav={navRef} />
</Navigator>
```

Verified stack as you navigate:

```
changePage("hub")     →  ["home", "hub"]
changePage("item-a")  →  ["home", "hub", "item-a"]
changePage("item-b")  →  ["home", "hub", "item-b"]   ← item-a pruned
back()                →  ["home", "hub"]              ← lands on the hub
```

## Platforms, and the three ways "back" can happen

Runs on **Android** and **iPhone / iPad**, inside a WebView (Cordova, Capacitor, Ionic)
or as a plain mobile web app in the browser. It is DOM-based — `<div>`s and CSS
animations — so it works anywhere a browser engine does.

Whichever way the user goes back, they all land on the same level-based logic: back
goes **up a level**, never sideways to a sibling.

| The user… | How it is handled | You need |
| --- | --- | --- |
| taps **Android's hardware back button** | Cordova's `backbutton` event → `back()`. From the root page it exits the app. | nothing — it is automatic |
| **swipes right from the left edge** — the iOS gesture, and the same gesture on Android | a drag from the left 20% of the screen, committed past 25% of the width | `backOnSwipeRight` on the page |
| presses the **browser's Back button** | the `hashchange` event → the page in the URL | `changeRoute` on the `<Navigator>` |

```jsx
<Navigator changeRoute>                            {/* browser Back button */}
  <Home    key="home"    levelPage={0} />
  <Details key="details" levelPage={1} backOnSwipeRight />   {/* iOS-style edge swipe */}
</Navigator>
{/* Android's hardware back button needs no opt-in. */}
```

Details: [Swipe back](#swipe-back) · [Android hardware back button](#android-hardware-back-button)

## Install

```bash
npm install navigation-controller
```

Peer dependencies: `react` / `react-dom` — React 18 or 19. (`prop-types` is a real
dependency and is installed for you; in 4.0.1 and earlier it was a peer dependency that
npm never installed, so importing the package failed with `Cannot find module
'prop-types'`.)

## Minimal working example

```jsx
import { useRef, useState } from "react";
import Navigator from "navigation-controller";

export default function App() {
  const navRef = useRef(null);          // the Navigator instance
  const [nowPage, setNowPage] = useState("home");

  return (
    <Navigator
      onRef={(nav) => (navRef.current = nav)}
      onChangePage={(pageKey) => setNowPage(pageKey)}
      changeRoute={false}
    >
      {/* levelPage is the whole idea: 0 is the root, higher is deeper. */}
      <Home    key="home"    levelPage={0} nav={navRef} />
      <Details key="details" levelPage={1} nav={navRef} backOnSwipeRight />
    </Navigator>
  );
}

const Home = ({ nav }) => (
  <button onClick={() => nav.current.changePage("details")}>Open details</button>
);

// back() pops one LEVEL, not one click.
const Details = ({ nav }) => <button onClick={() => nav.current.back()}>Back</button>;
```

That is the entire setup. No route table, no history object, no provider.

---

## Why

*Why should "back" depend on the order a user happened to visit pages?* A user who
reached a product from search and a user who reached it from a category should both
go back to something sensible — and "sensible" is a property of your information
architecture, not of their click trail.

*Why should a deep link from a push notification leave the user one tap from exiting
the app?* Open `item-b` cold and the stack is still `["home", "hub", "item-b"]`,
because the stack is derived from levels, not from what actually happened. Back
works immediately, on the first tap, with no synthetic history to fabricate.

*Why should a native-feeling app inherit navigation semantics designed for documents?*
Browser history was built for documents you read in sequence. An app is a place you
move around in.

Call it **the level stack**: every page names its depth, and the stack is always a
path from the root to where you are — never a log of what you clicked.

## When to use this

- A React app inside a **WebView**: Cordova, Capacitor, Ionic, or a mobile web app that
  should feel native.
- You want the **Android hardware back button** to do the right thing without
  hand-maintaining a stack.
- You want **iOS-style edge swipe-back**, per page, with one prop.
- Your app is a **hierarchy** — tabs, hubs, detail pages, wizards — and "back" should
  mean "up".

## When *not* to use this

| Use instead | When |
| --- | --- |
| **`react-router`** | A standard desktop/web SPA where URLs are the primary interface, linear browser history is correct, and users deep-link, bookmark and share freely. That is the right tool for documents-and-links; this one is for app hierarchies. You can also run both — see [With React Router](#with-react-router). |
| **`framer-motion`** / `react-transition-group` | You only want animated transitions. Those libraries animate; they do not model navigation semantics or touch the hardware back button. |
| **`@react-navigation/native`** | You are on **React Native**. This library is DOM-based (it renders `<div>`s and uses CSS animations) and will not run there. |
| Plain conditional rendering | You have two or three screens and no back-button requirements. Do not add a dependency for that. |

---

## The core idea: `levelPage`

Each child page declares a `levelPage` number. That is the only structural
information the library needs.

- Navigating to a **higher** level = going deeper. The page is pushed. Animates `"In"`.
- Navigating to a **lower or equal** level = going up or sideways. Everything at or
  below that depth is pruned from the stack. Animates `"Out"` / `"SameLevel"`.

The whole behaviour is these seven lines, from `src/index.js` (`changePage` →
`renewHistory`), with the author's original comment:

```js
if (fthis.listLevelPages[goToPage] <= fthis.listLevelPages[fromPage]) {
  //חוזרים אחורה, מחק את כל הדפים שהרמה שלהם גבוהה משלי.
  new_historyPages = new_historyPages.filter(
    (x) => fthis.listLevelPages[x] < fthis.listLevelPages[goToPage]
  );
}
new_historyPages.push(goToPage);
```

*"Going back — delete every page whose level is higher than mine."*

The stack is therefore always a root-to-current path through your page tree. It cannot
contain two pages at the same level, and it cannot contain a page deeper than the one
you are on.

> **Always set `levelPage` explicitly.** If you omit it, the home page defaults to `0`
> and every other page defaults to `99999` — which makes them all siblings of each
> other and produces confusing pruning.

### Recipe: a tab bar

Tabs are roots. Two correct shapes, depending on what back should do:

```jsx
{/* (a) Every tab is its own root. Back from ANY tab exits the app. */}
<Feed    key="feed"    levelPage={0} />
<Search  key="search"  levelPage={0} />
<Profile key="profile" levelPage={0} />
```

Switching tabs here collapses the stack to just the new tab (`["search"]`), because
nothing can sit below level 0. Back then hits the root and exits — see
[`beforExit`](#navigator-props).

```jsx
{/* (b) Usually nicer: home is the root, other tabs sit one level in.
       Back from any tab returns to the home tab, then exits. */}
<Feed    key="feed"    levelPage={0} />
<Search  key="search"  levelPage={1} />
<Profile key="profile" levelPage={1} />
```

Verified: `feed → search → profile` gives `["feed", "profile"]`. `search` is pruned
because you moved sideways, so back goes to `feed` — not through every tab you tried.

### Recipe: deep-linking

Because the stack is derived from levels, a cold start on a deep page is already
correct. Set `routeKey` (or let the built-in hash routing read the URL) and the
Navigator builds `[home, thatPage]` for you. There is no "synthesize a fake history"
step, and the user is never one tap from exiting.

---

## Pages stay mounted (and when they don't)

Every page gets a wrapper `<div id={key}>` up front, but its **contents** are mounted
only while the page is on the current path:

| Page | Mounted? |
| --- | --- |
| Current page | yes |
| Ancestors still in the stack | **yes** — scroll position, form state, video playback and timers all survive |
| A sibling that was pruned | no — unmounted, state lost |
| Never-visited pages | no |
| Any page with `alwaysLive` | always |

So drilling `hub → item → back` returns you to a `hub` that never re-rendered from
scratch. But moving `item-a → item-b` genuinely discards `item-a`. Add `alwaysLive`
to a page you need kept alive regardless (an audio player, a long form).

Hidden pages are `display: none`, so they cost no layout — but they are still in the
DOM. Do not put hundreds of heavy pages in one Navigator.

---

## Animations

Transitions use [animate.css](https://animate.css/) animation names. animate.css v4 is
bundled — you do not need to install it.

```jsx
<Details
  key="details"
  levelPage={1}
  transitionIn="slideInRight"
  transitionOut="slideOutRight"
  animationTimeInMS={250}
/>
```

Defaults: `slideInRight` going deeper, `slideOutRight` coming back, 250 ms.
The `animate__` prefix is stripped automatically, so `"animate__fadeIn"` and
`"fadeIn"` both work.

Precedence for duration: page `animationTimeInMS` → Navigator `animationTimeInMS` → 250.

### Direction-aware RTL

Flip the animation with the text direction so "forward" always moves inward:

```jsx
const dir = i18n.dir(); // "ltr" | "rtl"

<Page
  key="details"
  levelPage={1}
  transitionIn={dir === "ltr" ? "slideInRight" : "slideInLeft"}
  transitionOut={dir === "ltr" ? "slideOutRight" : "slideOutLeft"}
/>
```

### Swipe back

```jsx
<Details key="details" levelPage={1} backOnSwipeRight />
```

The gesture starts only if the touch begins in the **left 20%** of the screen, and
commits if the user drags past **25%** of the screen width — otherwise the page snaps
back. The outgoing animation is forced to `slideOutRight` to match the finger.

---

## Android hardware back button

The Navigator listens for Cordova's `backbutton` event and calls `back()`. When the
stack is down to a single page, back **exits the app** — veto it with `beforExit`:

```jsx
<Navigator
  beforExit={() => window.confirm("Exit the app?")} // return false to stay
  beforBack={(backToPage) => {
    if (formIsDirty) return false;  // must return TRUTHY to allow back
    return true;
  }}
>
```

---

## With React Router

React Router owns the **URL**; the Navigator owns the **view stack**. Turn off the
Navigator's own hash routing so the two never fight, and feed it the current param:

```jsx
const { key } = useParams();

<Navigator
  changeRoute={false}     // React Router owns the URL — required, or they fight
  routeKey={key}          // changing this navigates the Navigator
  homePageKey="home"
  errorPageKey="not-found-404"
>
  {routes.map((r) => (
    <r.component key={r.key} levelPage={r.levelPage} />
  ))}
</Navigator>
```

Changing `routeKey` triggers a navigation, so links, the browser back button and
programmatic `navigate()` calls all flow into the level stack.

---

## API

### `<Navigator>` props

| Prop | Type | Notes |
| --- | --- | --- |
| `children` | element(s) | **Required.** Each needs a unique `key`. |
| `homePageKey` | `string` | Root of the stack. Defaults to the first non-`kill` child. |
| `mobileMode` | `boolean` | Forces mobile mode. Auto-detected from `window.cordova` when the platform is not `"browser"`. Mobile mode disables hash routing. |
| `changeRoute` | `boolean` | Mirror the current page into `window.location.hash`. Default `true` off-device; **ignored (forced `false`) in mobile mode**. |
| `routeKey` | `string` | Controlled route. Changing it navigates. *(Named `routerKey` in `mobile-navigation-controller` — see [migration](#which-package-should-i-use).)* |
| `errorPageKey` | `string` | Page shown when a requested key matches no child. |
| `height` | `string \| number` | Default height for every page wrapper. Default `"100%"`. |
| `animationTimeInMS` | `number` | Default transition duration. Default `250`. |
| `onRef` | `(instance) => void` | Hands you the instance for `changePage` / `back`. |
| `onChangePage` | `(pageKey, direction) => void` | Fires **after** a transition, and once on mount with `"In"`. |
| `beforChangePage` | `(goToPage, direction) => void` | Fires before a transition. **Notification only — the return value is ignored.** |
| `beforBack` | `(backToPage) => boolean \| Promise<boolean>` | Awaited. **Must return truthy or back is cancelled.** |
| `beforExit` | `() => boolean` | Return falsy to prevent exiting the app from the root. |
| `onError` | `(e) => void` | Internal errors, plus `"page undefined"` for unknown keys. |

`direction` is `"In"` (deeper), `"Out"` (shallower) or `"SameLevel"` (sibling).

### Child page props

| Prop | Type | Notes |
| --- | --- | --- |
| `key` | `string` | **Required**, and becomes the page's DOM `id`. See the gotcha below. |
| `levelPage` | `number` | Depth. Always set it. |
| `backOnSwipeRight` | `boolean` | iOS-style edge swipe-back on this page. |
| `transitionIn` / `transitionOut` | `string` | animate.css names. |
| `animationTimeInMS` | `number` | Overrides the Navigator default. |
| `backgroundColor` | `string` | Wrapper background. Default `"#fff"`. |
| `height` | `string \| number` | Overrides the Navigator default. |
| `className` | `string` | Appended to the generated wrapper classes. |
| `alwaysLive` | `boolean` | Keep mounted even when off the current path. |
| `kill` | `boolean` | Drop the page entirely: never rendered, removed from history. |

### Instance methods (via `onRef`)

```js
nav.changePage("details");
nav.changePage("details", {
  props: { id: 42 },        // injected into the target page via cloneElement
  animationIn: "fadeIn",
  animationOut: "fadeOut",
  timeAnimationInMS: 400,
  callbackFun: () => {},    // called once the transition is kicked off
});

await nav.back();           // async
await nav.back({ animationOut: "zoomOut" });
```

Readable fields: `nav.historyPages` (array of keys, root first), `nav.nowPage`,
`nav.busy` (true while a transition is in flight).

---

## Gotchas

These are real, shipped behaviours. Reading this section will save you an afternoon.

1. **`key` becomes a DOM `id`.** The library looks pages up with
   `document.getElementById(key)`. Keys must be valid HTML ids: no dots, no colons,
   no spaces, no leading digits. `"item-a"` and `"item_a"` are fine; `"item.a"`,
   `"2col"` and `"user:1"` are not.

2. **`beforChangePage`, `beforBack`, `beforExit` are spelled without the "e".**
   That is not a typo in this document — it is the shipped API, kept for backwards
   compatibility. Using the correctly-spelled name silently does nothing.

3. **`beforBack` must return `true`.** A handler that returns `undefined` cancels
   every back navigation, including the hardware back button. This is the single most
   common way to "break back".

4. **Navigation is ignored while `busy`.** One transition at a time; calls during an
   animation are dropped, not queued. Check `nav.busy` if you fire navigations
   programmatically in quick succession.

5. **Transitions complete on the `webkitAnimationEnd` event.** That is fine in every
   WebView you will ship to (iOS WKWebView and Android System WebView are both
   WebKit/Blink and fire it), but **Firefox does not fire the prefixed event** — so
   navigation stalls after the first transition when previewing in desktop Firefox.
   Develop in Chrome/Safari, or test in the real WebView. Same reason a `jsdom` unit
   test needs the event dispatched by hand.

6. **`changeRoute` is ignored in mobile mode.** On-device the hash router is always
   off. Set `mobileMode={false}` explicitly if you need hash routing in a WebView.

---

## TypeScript

Types ship with the package — no `@types/` install, nothing to configure.

```ts
import Navigator, {
  NavigatorProps,
  NavigatorPageProps,
  NavigatorDirection,          // "In" | "Out" | "SameLevel"
  NavigatorChangePageOptions,
} from "navigation-controller";
```

`key` is deliberately absent from `NavigatorPageProps`, because React strips `key`
from props. Declare your page components with the props they actually receive.

---

## Which package should I use?

There are two packages in this family, for historical reasons. They are the same
lineage, and both are maintained.

| | `navigation-controller` | `mobile-navigation-controller` |
| --- | --- | --- |
| Version | 4.x | 1.5.x |
| Formerly | `react.cordova-navigation_controller` | — |
| Controlled route prop | **`routeKey`** | **`routerKey`** |
| `errorPageKey` | yes | no |
| `mobileMode` prop | yes | auto-detect only |
| `beforBack` argument | `(backToPage)` | *(no argument)* |
| Default deep animation | `slideInRight` / `slideOutRight` at every level | `zoomIn` / `zoomOut` below level 1 |
| `"animate__"` prefix stripped | yes | yes (since 1.5.0) |
| History update on transition | promise-sequenced | synchronous (older, racier) |
| Bundled animate.css | 4.1.1 | 3.7.0 |

**New project?** Use **`navigation-controller`** — it is the newer line.

**Migrating from `mobile-navigation-controller`?** The rename that bites is
`routerKey` → **`routeKey`**. It fails silently: the prop is simply ignored, and your
app stops responding to route changes with no error. Also re-check your transition
names, since default animations for levels deeper than 1 changed from zoom to slide.

No deprecation is announced for either package.

---

## Contributing & support

Issues and pull requests: <https://github.com/uidb-dev/navigation-controller/issues>

## License

ISC © [ui-db.com](https://ui-db.com)
