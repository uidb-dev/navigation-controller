# Minimal example

Four pages, one file of real code, and a panel that shows the URL and the level stack
while you click.

```bash
npm install
npm run dev
```

## What to do

1. **Open the hub**, then **open item A**. The stack grows: `home › hub › item-a`.
2. From item A, **jump sideways to item B**. Watch the panel: `item-a` gets struck out.
   The stack is now `home › hub › item-b` — B *replaced* A instead of stacking on it,
   because they share `levelPage={2}` and so they are siblings.
3. Now press **your browser's Back button**. You land on the **hub**, not on item A.

That third step is the whole library. Linear history would send you back to item A,
because that is where you have *been*. This sends you to the hub, because that is where
item B *lives*.

All three back gestures behave identically:

| | |
| --- | --- |
| the page's **Back** button | `nav.back()` → `onBackRequest` |
| the **browser's** Back button | intercepted via a history trap, then up a level |
| **Android's hardware** Back button | `bindHardwareBack` → `nav.back()` |

At the root, the panel says `back() → exits the app`, and the next browser Back really
does leave — the web equivalent of Android closing the app. Wire `onExit` to intercept it.

Two more things worth trying:

- Type into the input on the hub, drill down, and come back — your text is still there.
  Pages on the stack stay mounted, so component state survives.
- Deep-link straight to `#/item-b` in a fresh tab. The stack builds cold as
  `home › item-b`, so Back works correctly on the very first press — no synthetic
  history needed.

## The code

[`src/App.jsx`](./src/App.jsx) is the only file that matters. The model is one line:

```js
const LEVELS = { home: 0, hub: 1, "item-a": 2, "item-b": 2 };
```

The URL plumbing is a ten-line stand-in for react-router or Next: forward navigation
`replaceState`s, and a spare history entry is kept armed so the browser's Back button
fires `popstate` for us to interpret rather than walking its own linear history. Real
adapters for react-router v7, Next.js App Router and Cordova/Capacitor live in
[`../../docs/adapters`](../../docs/adapters).

Everything below `StackPanel` exists only to make the behaviour visible on screen —
none of it is needed to use the library.

## Things to try changing

- Give `item-b` `levelPage={3}` instead of `2`. It becomes a *child* of item A rather
  than a sibling, so it stacks on top and back returns to A. This one edit flips the
  behaviour and is the fastest way to feel what levels do.
- Add a page at `levelPage={0}` and navigate to it from deep in the tree — everything
  above level 0 is pruned at once. That is how a tab bar pops to root for free.
- Swap `<Navigator>` for the `useLevelNavigator` hook, or drop the React layer entirely
  and drive `createLevelStack` from `navigation-controller/core`. Same algorithm.
