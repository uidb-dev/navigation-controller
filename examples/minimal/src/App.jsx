import { useRef, useState } from "react";
import { Navigator } from "navigation-controller";

// The whole model: which page sits at which depth.
// item-a and item-b share level 2 — that makes them SIBLINGS, and siblings
// are what this library does differently from a normal router.
const LEVELS = { home: 0, hub: 1, "item-a": 2, "item-b": 2 };

export default function App() {
  const nav = useRef(null);
  const [stack, setStack] = useState(["home"]);

  const go = (key) => nav.current.go(key);
  const back = () => nav.current.back();

  return (
    <div className="app">
      <Navigator
        ref={nav}
        className="pages"
        // Fires on mount and on every navigation. We only use it to mirror the
        // stack into React state so the panel below can render it.
        onChangePage={() => setStack([...nav.current.stack])}
      >
        <Page key="home" levelPage={0} title="Home">
          <button onClick={() => go("hub")}>Open the hub →</button>
        </Page>

        <Page key="hub" levelPage={1} title="Content hub">
          <button onClick={() => go("item-a")}>Open item A →</button>
          <button onClick={() => go("item-b")}>Open item B →</button>
          <label>
            Type here, drill down, then come back — it is still here:
            <input placeholder="scratch state" />
          </label>
        </Page>

        <Page key="item-a" levelPage={2} title="Item A">
          <button onClick={() => go("item-b")}>Jump sideways to item B →</button>
          <button onClick={back}>← Back</button>
        </Page>

        <Page key="item-b" levelPage={2} title="Item B">
          <button onClick={() => go("item-a")}>Jump sideways to item A →</button>
          <button onClick={back}>← Back</button>
        </Page>
      </Navigator>

      <StackPanel stack={stack} />
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
function StackPanel({ stack }) {
  const parent = stack.length > 1 ? stack[stack.length - 2] : null;

  return (
    <aside className="panel">
      <div className="row">
        <span className="label">stack</span>
        <span className="crumbs">
          {["home", "hub", "item-a", "item-b"].map((key) => {
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
    </aside>
  );
}
