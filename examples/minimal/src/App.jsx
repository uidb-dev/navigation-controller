import { useEffect, useRef, useState } from "react";
import { Navigator, bindHardwareBack } from "navigation-controller";

// The whole model: which page sits at which depth.
// item-a and item-b share level 2 — that makes them SIBLINGS, and siblings
// are what this library does differently from a normal router.
const LEVELS = { home: 0, hub: 1, "item-a": 2, "item-b": 2 };

const keyFromUrl = () => window.location.hash.replace(/^#\/?/, "") || "home";

export default function App() {
  const nav = useRef(null);
  const [routeKey, setRouteKey] = useState(keyFromUrl);
  const [stack, setStack] = useState([keyFromUrl()]);

  // The app owns the URL. Forward navigation REPLACES the current entry, so
  // browsing never piles up linear history for us to fight with later.
  const show = (key) => {
    window.history.replaceState(null, "", "#/" + key);
    setRouteKey(key);
  };

  // "Up one level" — the library works out where that is, we just navigate.
  const back = () => nav.current.back();

  useEffect(() => {
    // Make the URL explicit on a cold load, so every page is shareable.
    if (!window.location.hash) window.history.replaceState(null, "", "#/" + routeKey);

    // One spare history entry sits on top of ours. The browser's Back button
    // consumes it and fires popstate, which lets us decide what back MEANS
    // instead of letting the browser walk its linear history.
    const armTrap = () => window.history.pushState(null, "", window.location.hash);
    armTrap();

    const onPop = () => {
      const parent = nav.current.peekBack();
      if (parent) {
        armTrap(); // re-arm for the next press
        show(parent); // ...and go UP a level
      }
      // No parent means we are at the root: we do not re-arm, so the next
      // press leaves the app — the web equivalent of Android's exit.
    };

    window.addEventListener("popstate", onPop);
    // Android's hardware Back button, when running in a Cordova/Capacitor
    // WebView. Same destination as everything else: up one level.
    const unbindHardware = bindHardwareBack(() => nav.current.back());

    return () => {
      window.removeEventListener("popstate", onPop);
      unbindHardware();
    };
  }, []);

  return (
    <div className="app">
      <Navigator
        ref={nav}
        className="pages"
        // The URL decides what is shown...
        routeKey={routeKey}
        // ...and back() never mutates anything itself: the library computes the
        // parent and hands it here, so every route change goes through one path.
        onBackRequest={show}
        onChangePage={() => setStack([...nav.current.stack])}
      >
        <Page key="home" levelPage={0} title="Home">
          <button onClick={() => show("hub")}>Open the hub →</button>
        </Page>

        <Page key="hub" levelPage={1} title="Content hub">
          <button onClick={() => show("item-a")}>Open item A →</button>
          <button onClick={() => show("item-b")}>Open item B →</button>
          <button onClick={back}>← Back</button>
          <label>
            Type here, drill down, then come back — it is still here:
            <input placeholder="scratch state" />
          </label>
        </Page>

        <Page key="item-a" levelPage={2} title="Item A">
          <button onClick={() => show("item-b")}>Jump sideways to item B →</button>
          <button onClick={back}>← Back</button>
        </Page>

        <Page key="item-b" levelPage={2} title="Item B">
          <button onClick={() => show("item-a")}>Jump sideways to item A →</button>
          <button onClick={back}>← Back</button>
        </Page>
      </Navigator>

      <StackPanel stack={stack} routeKey={routeKey} />
    </div>
  );
}

// A page is just a div. The Navigator reads `key` and `levelPage` off it.
function Page({ title, children }) {
  return (
    <section className="page">
      <h1>{title}</h1>
      {children}
    </section>
  );
}

// Everything below is only here to make the algorithm visible. None of it is
// required to use the library.
function StackPanel({ stack, routeKey }) {
  const parent = stack.length > 1 ? stack[stack.length - 2] : null;

  return (
    <aside className="panel">
      <div className="row">
        <span className="label">url</span>
        <code className="on">#/{routeKey}</code>
      </div>

      <div className="row">
        <span className="label">stack</span>
        <span className="crumbs">
          {Object.keys(LEVELS).map((key) => {
            const on = stack.includes(key);
            return (
              <code key={key} className={on ? "on" : "off"} title={`level ${LEVELS[key]}`}>
                {key}
              </code>
            );
          })}
        </span>
      </div>

      <div className="row">
        <span className="label">back()</span>
        <span>{parent ? <code className="on">{parent}</code> : <em>exits the app</em>}</span>
      </div>

      <p className="hint">
        Go <code>hub → item-a → item-b</code> and watch <code>item-a</code> drop out of the
        stack. They are siblings, so B replaces A instead of stacking on top of it — and
        back then lands on <code>hub</code>, the parent, not on A.
      </p>
      <p className="hint">
        <b>All three back gestures do the same thing:</b> the button above, your browser's
        Back button, and Android's hardware Back button in a WebView. All of them go{" "}
        <em>up a level</em> — never sideways to a sibling you happened to visit, and never
        off the app until you are at the root.
      </p>
    </aside>
  );
}
