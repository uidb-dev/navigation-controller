import * as React from "react";
import { createRoot, type Root } from "react-dom/client";
import { act } from "react";
import { describe, it, expect, vi, afterEach } from "vitest";
import {
  Navigator,
  useLevelNavigator,
  bindHardwareBack,
  UnknownPageError,
  type NavigatorHandle,
  type Direction,
} from "../src/react";

// Lets React treat act() as authoritative, so state updates commit when act
// returns instead of whenever the scheduler gets round to them.
(globalThis as Record<string, unknown>).IS_REACT_ACT_ENVIRONMENT = true;

const Page = ({ children }: { children?: React.ReactNode; levelPage?: number; keepMounted?: boolean; className?: string; transitionName?: string }) => (
  <div className="page">{children}</div>
);

const roots: Array<{ root: Root; div: HTMLDivElement }> = [];

function mount(element: React.ReactElement) {
  const div = document.createElement("div");
  document.body.appendChild(div);
  const root = createRoot(div);
  act(() => {
    root.render(element);
  });
  roots.push({ root, div });
  const rerender = (next: React.ReactElement) => {
    act(() => {
      root.render(next);
    });
  };
  return { div, rerender };
}

afterEach(() => {
  for (const { root, div } of roots.splice(0)) {
    act(() => {
      root.unmount();
    });
    div.remove();
  }
  document.body.innerHTML = "";
});

const pageWrapper = (div: HTMLElement, key: string): HTMLElement | null =>
  div.querySelector(`[data-page-key="${key}"]`);

describe("<Navigator> — uncontrolled", () => {
  it("drives the canonical scenario: stack, current and direction at every step", async () => {
    const onChangePage = vi.fn<(key: string, direction: Direction) => void>();
    const nav = React.createRef<NavigatorHandle>();
    const { div } = mount(
      <Navigator ref={nav} onChangePage={onChangePage}>
        <Page key="home" levelPage={0}>home</Page>
        <Page key="hub" levelPage={1}>hub</Page>
        <Page key="itemA" levelPage={2}>item A</Page>
        <Page key="itemB" levelPage={2}>item B</Page>
      </Navigator>
    );

    // mount
    expect(nav.current!.stack).toEqual(["home"]);
    expect(nav.current!.current).toBe("home");
    expect(onChangePage).toHaveBeenLastCalledWith("home", "In");
    expect(pageWrapper(div, "home")!.style.display).not.toBe("none");
    expect(pageWrapper(div, "hub")!.style.display).toBe("none");

    // home -> hub : one level in
    act(() => {
      nav.current!.go("hub");
    });
    expect(nav.current!.stack).toEqual(["home", "hub"]);
    expect(nav.current!.current).toBe("hub");
    expect(onChangePage).toHaveBeenLastCalledWith("hub", "In");
    expect(pageWrapper(div, "hub")!.style.display).not.toBe("none");
    expect(pageWrapper(div, "home")!.style.display).toBe("none");
    // ancestor stays mounted while hidden
    expect(pageWrapper(div, "home")!.querySelector(".page")).toBeTruthy();

    // hub -> itemA : another level in
    act(() => {
      nav.current!.go("itemA");
    });
    expect(nav.current!.stack).toEqual(["home", "hub", "itemA"]);
    expect(onChangePage).toHaveBeenLastCalledWith("itemA", "In");

    // itemA -> itemB : sideways to a sibling; itemA pruned AND unmounted
    act(() => {
      nav.current!.go("itemB");
    });
    expect(nav.current!.stack).toEqual(["home", "hub", "itemB"]);
    expect(nav.current!.current).toBe("itemB");
    expect(onChangePage).toHaveBeenLastCalledWith("itemB", "SameLevel");
    expect(pageWrapper(div, "itemA")!.querySelector(".page")).toBeNull();
    expect(pageWrapper(div, "itemA")!.dataset.pageState).toBe("unmounted");

    // back(): lands on the PARENT, not the pruned sibling
    await act(async () => {
      await nav.current!.back();
    });
    expect(nav.current!.stack).toEqual(["home", "hub"]);
    expect(nav.current!.current).toBe("hub");
    expect(onChangePage).toHaveBeenLastCalledWith("hub", "Out");

    // the container advertises the direction for CSS hooks
    expect(div.querySelector("[data-level-navigator]")!.getAttribute("data-direction")).toBe("Out");
  });

  it("renders a single child without throwing and announces it on mount", () => {
    const onChangePage = vi.fn();
    const onError = vi.fn();
    const { div } = mount(
      <Navigator onChangePage={onChangePage} onError={onError}>
        <Page key="only" levelPage={0}>only</Page>
      </Navigator>
    );

    expect(onError).not.toHaveBeenCalled();
    expect(pageWrapper(div, "only")).toBeTruthy();
    expect(onChangePage).toHaveBeenCalledWith("only", "In");
  });

  it("uses child keys verbatim (no React.Children.toArray key rewriting)", () => {
    const items = ["itemA", "itemB"];
    const { div } = mount(
      <Navigator>
        <Page key="home" levelPage={0}>home</Page>
        {items.map((k) => (
          <Page key={k} levelPage={2}>{k}</Page>
        ))}
      </Navigator>
    );

    expect(pageWrapper(div, "home")).toBeTruthy();
    expect(pageWrapper(div, "itemA")).toBeTruthy();
    expect(pageWrapper(div, "itemB")).toBeTruthy();
  });

  it("stacks pages with CSS grid and never touches position/global styles", () => {
    const { div } = mount(
      <Navigator>
        <Page key="home" levelPage={0}>home</Page>
        <Page key="hub" levelPage={1}>hub</Page>
      </Navigator>
    );

    const container = div.querySelector<HTMLElement>("[data-level-navigator]")!;
    expect(container.style.display).toBe("grid");
    const wrapper = pageWrapper(div, "home")!;
    expect(wrapper.style.gridArea).toContain("1 / 1");
    expect(wrapper.style.position).toBe("");
    expect(wrapper.style.zIndex).toBe("");
    // No global stylesheet was injected by side effect.
    expect(document.head.querySelector("style, link[rel=stylesheet]")).toBeNull();
    expect(getComputedStyle(document.body).overflow).not.toBe("hidden");
  });

  it("routes a throwing onChangePage to onError instead of crashing the tree", () => {
    const onError = vi.fn();
    const boom = new Error("consumer handler blew up");
    const onChangePage = vi.fn(() => {
      throw boom;
    });
    const nav = React.createRef<NavigatorHandle>();

    expect(() => {
      mount(
        <Navigator ref={nav} onChangePage={onChangePage} onError={onError}>
          <Page key="home" levelPage={0}>home</Page>
          <Page key="details" levelPage={1}>details</Page>
        </Navigator>
      );
    }).not.toThrow();

    expect(onChangePage).toHaveBeenCalledWith("home", "In");
    expect(onError).toHaveBeenCalledWith(boom);

    // ...and during navigation too, with the navigation still completing.
    act(() => {
      nav.current!.go("details");
    });
    expect(nav.current!.current).toBe("details");
    expect(onError).toHaveBeenLastCalledWith(boom);
  });

  it("routes unknown keys to onError without changing pages (no silent fallback)", () => {
    const onError = vi.fn();
    const nav = React.createRef<NavigatorHandle>();
    mount(
      <Navigator ref={nav} onError={onError}>
        <Page key="home" levelPage={0}>home</Page>
        <Page key="details" levelPage={1}>details</Page>
      </Navigator>
    );

    let result: unknown = "sentinel";
    act(() => {
      result = nav.current!.go("does-not-exist");
    });
    expect(result).toBeNull();
    expect(onError).toHaveBeenCalledTimes(1);
    expect(onError.mock.calls[0]![0]).toBeInstanceOf(UnknownPageError);
    expect(nav.current!.current).toBe("home");
    expect(nav.current!.stack).toEqual(["home"]);
  });

  it("ignores go() to the current page (no onChangePage, no state change)", () => {
    const onChangePage = vi.fn();
    const nav = React.createRef<NavigatorHandle>();
    mount(
      <Navigator ref={nav} onChangePage={onChangePage}>
        <Page key="home" levelPage={0}>home</Page>
        <Page key="details" levelPage={1}>details</Page>
      </Navigator>
    );
    onChangePage.mockClear();
    act(() => {
      nav.current!.go("home");
    });
    expect(onChangePage).not.toHaveBeenCalled();
    expect(nav.current!.stack).toEqual(["home"]);
  });

  it("preserves a hidden keepMounted page's input value across hide/show", async () => {
    const nav = React.createRef<NavigatorHandle>();
    const Form = (_props: { levelPage?: number; keepMounted?: boolean }) => (
      <input id="name" defaultValue="" />
    );
    const { div } = mount(
      <Navigator ref={nav}>
        <Page key="home" levelPage={0}>home</Page>
        <Form key="form" levelPage={2} keepMounted />
        <Page key="other" levelPage={2}>other sibling</Page>
      </Navigator>
    );

    act(() => {
      nav.current!.go("form");
    });
    const input = div.querySelector<HTMLInputElement>("#name")!;
    input.value = "typed by the user";

    // Navigate SIDEWAYS: a normal sibling would be pruned and unmounted,
    // but keepMounted keeps the very same DOM node alive, hidden.
    act(() => {
      nav.current!.go("other");
    });
    expect(nav.current!.stack).toEqual(["home", "other"]);
    const hidden = pageWrapper(div, "form")!;
    expect(hidden.dataset.pageState).toBe("hidden");
    expect(hidden.style.display).toBe("none");
    expect(div.querySelector<HTMLInputElement>("#name")).toBe(input);

    act(() => {
      nav.current!.go("form");
    });
    expect(div.querySelector<HTMLInputElement>("#name")!.value).toBe(
      "typed by the user"
    );
  });

  it("awaits beforeBack and cancels only on an explicit false (4.x gotcha fixed)", async () => {
    const nav = React.createRef<NavigatorHandle>();
    let veto = true;
    const beforeBack = vi.fn(async (target: string) => {
      expect(target).toBe("home");
      if (veto) return false;
      return undefined; // returning nothing ALLOWS the navigation in 5.0
    });
    mount(
      <Navigator ref={nav} beforeBack={beforeBack}>
        <Page key="home" levelPage={0}>home</Page>
        <Page key="details" levelPage={1}>details</Page>
      </Navigator>
    );
    act(() => {
      nav.current!.go("details");
    });

    await act(async () => {
      expect(await nav.current!.back()).toBeNull();
    });
    expect(nav.current!.current).toBe("details"); // vetoed

    veto = false;
    await act(async () => {
      await nav.current!.back();
    });
    expect(nav.current!.current).toBe("home"); // undefined allowed it
  });

  it("runs onExit when back is pressed at the root, and never navigates", async () => {
    const onExit = vi.fn(() => false);
    const nav = React.createRef<NavigatorHandle>();
    mount(
      <Navigator ref={nav} onExit={onExit}>
        <Page key="home" levelPage={0}>home</Page>
        <Page key="details" levelPage={1}>details</Page>
      </Navigator>
    );

    await act(async () => {
      expect(await nav.current!.back()).toBeNull();
    });
    expect(onExit).toHaveBeenCalledTimes(1);
    expect(nav.current!.stack).toEqual(["home"]);
  });

  it("honors homePageKey over first-child order", () => {
    const nav = React.createRef<NavigatorHandle>();
    mount(
      <Navigator ref={nav} homePageKey="real-home">
        <Page key="splash" levelPage={1}>splash</Page>
        <Page key="real-home" levelPage={0}>home</Page>
      </Navigator>
    );
    expect(nav.current!.current).toBe("real-home");
  });
});

describe("<Navigator> — controlled (routeKey / onBackRequest)", () => {
  const App = ({
    route,
    onBackRequest,
    onChangePage,
    navRef,
  }: {
    route: string;
    onBackRequest?: (parentKey: string) => void;
    onChangePage?: (key: string, direction: Direction) => void;
    navRef: React.Ref<NavigatorHandle>;
  }) => (
    <Navigator
      ref={navRef}
      routeKey={route}
      onBackRequest={onBackRequest}
      onChangePage={onChangePage}
    >
      <Page key="home" levelPage={0}>home</Page>
      <Page key="hub" levelPage={1}>hub</Page>
      <Page key="itemA" levelPage={2}>item A</Page>
      <Page key="itemB" levelPage={2}>item B</Page>
    </Navigator>
  );

  it("navigates when routeKey changes, with level semantics intact", () => {
    const onChangePage = vi.fn();
    const nav = React.createRef<NavigatorHandle>();
    const { rerender } = mount(
      <App route="home" navRef={nav} onChangePage={onChangePage} />
    );

    rerender(<App route="hub" navRef={nav} onChangePage={onChangePage} />);
    expect(nav.current!.stack).toEqual(["home", "hub"]);

    rerender(<App route="itemA" navRef={nav} onChangePage={onChangePage} />);
    rerender(<App route="itemB" navRef={nav} onChangePage={onChangePage} />);
    expect(nav.current!.stack).toEqual(["home", "hub", "itemB"]); // sibling pruned
    expect(onChangePage).toHaveBeenLastCalledWith("itemB", "SameLevel");

    rerender(<App route="hub" navRef={nav} onChangePage={onChangePage} />);
    expect(nav.current!.stack).toEqual(["home", "hub"]);
    expect(onChangePage).toHaveBeenLastCalledWith("hub", "Out");
  });

  it("derives the full stack when mounted directly on a deep routeKey (deep link)", () => {
    const onChangePage = vi.fn();
    const nav = React.createRef<NavigatorHandle>();
    mount(<App route="itemB" navRef={nav} onChangePage={onChangePage} />);

    // Cold start on a deep page: back works immediately, no synthetic history.
    expect(nav.current!.stack).toEqual(["home", "itemB"]);
    expect(nav.current!.current).toBe("itemB");
    expect(onChangePage).toHaveBeenCalledWith("itemB", "In"); // mount announce
    expect(nav.current!.peekBack()).toBe("home");
  });

  it("with onBackRequest, back() computes the parent and mutates NOTHING", async () => {
    const onBackRequest = vi.fn();
    const nav = React.createRef<NavigatorHandle>();
    const { rerender } = mount(
      <App route="home" navRef={nav} onBackRequest={onBackRequest} />
    );
    rerender(<App route="hub" navRef={nav} onBackRequest={onBackRequest} />);
    rerender(<App route="itemB" navRef={nav} onBackRequest={onBackRequest} />);
    expect(nav.current!.stack).toEqual(["home", "hub", "itemB"]);

    await act(async () => {
      expect(await nav.current!.back()).toBeNull();
    });
    // The navigator did not move — it asked the app's router to.
    expect(onBackRequest).toHaveBeenCalledWith("hub");
    expect(nav.current!.current).toBe("itemB");
    expect(nav.current!.stack).toEqual(["home", "hub", "itemB"]);

    // The router answers by changing routeKey; THAT is what navigates.
    rerender(<App route="hub" navRef={nav} onBackRequest={onBackRequest} />);
    expect(nav.current!.current).toBe("hub");
    expect(nav.current!.stack).toEqual(["home", "hub"]);
  });
});

describe("useLevelNavigator", () => {
  const HookApp = ({
    onExit,
    spy,
  }: {
    onExit?: () => boolean | void;
    spy: (v: ReturnType<typeof useLevelNavigator>) => void;
  }) => {
    const nav = useLevelNavigator({
      levels: { home: 0, hub: 1, itemA: 2, itemB: 2 },
      onExit,
    });
    spy(nav);
    return <div data-current={nav.current} data-direction={nav.direction} />;
  };

  it("re-renders through useSyncExternalStore with current/stack/direction/canBack", () => {
    let latest!: ReturnType<typeof useLevelNavigator>;
    const { div } = mount(<HookApp spy={(v) => (latest = v)} />);

    expect(latest.current).toBe("home");
    expect(latest.canBack).toBe(false);
    expect(latest.direction).toBe("In");

    act(() => {
      latest.go("hub");
    });
    expect(div.querySelector("[data-current]")!.getAttribute("data-current")).toBe("hub");
    expect(latest.current).toBe("hub");
    expect(latest.stack).toEqual(["home", "hub"]);
    expect(latest.canBack).toBe(true);

    act(() => {
      latest.go("itemA");
      latest.go("itemB");
    });
    expect(latest.stack).toEqual(["home", "hub", "itemB"]);
    expect(latest.direction).toBe("SameLevel");

    act(() => {
      latest.back();
    });
    expect(latest.current).toBe("hub");
    expect(latest.direction).toBe("Out");
    expect(div.querySelector("[data-current]")!.getAttribute("data-direction")).toBe("Out");
  });

  it("exposes the underlying headless navigator", () => {
    let latest!: ReturnType<typeof useLevelNavigator>;
    mount(<HookApp spy={(v) => (latest = v)} />);
    expect(latest.navigator.peekBack()).toBeNull();
    act(() => {
      latest.navigator.go("hub");
    });
    expect(latest.current).toBe("hub");
  });
});

describe("bindHardwareBack", () => {
  it("wires the Cordova backbutton event to back() and unbinds cleanly", async () => {
    const nav = React.createRef<NavigatorHandle>();
    mount(
      <Navigator ref={nav}>
        <Page key="home" levelPage={0}>home</Page>
        <Page key="details" levelPage={1}>details</Page>
      </Navigator>
    );
    act(() => {
      nav.current!.go("details");
    });

    const unbind = bindHardwareBack(() => nav.current!.back());
    await act(async () => {
      document.dispatchEvent(new Event("backbutton"));
    });
    expect(nav.current!.current).toBe("home");

    unbind();
    act(() => {
      nav.current!.go("details");
    });
    await act(async () => {
      document.dispatchEvent(new Event("backbutton"));
    });
    expect(nav.current!.current).toBe("details"); // unbound: nothing happened
  });

  it("accepts an object with a back() method", () => {
    const target = { back: vi.fn() };
    const unbind = bindHardwareBack(target);
    document.dispatchEvent(new Event("backbutton"));
    expect(target.back).toHaveBeenCalledTimes(1);
    unbind();
  });
});

describe("<Navigator transition>", () => {
  it("routes the commit through the transition wrapper (flushed synchronously)", () => {
    const nav = React.createRef<NavigatorHandle>();
    const transition = vi.fn((commit: () => void) => {
      // simulate document.startViewTransition applying the update
      commit();
    });
    const { div } = mount(
      <Navigator ref={nav} transition={transition}>
        <Page key="home" levelPage={0}>home</Page>
        <Page key="details" levelPage={1}>details</Page>
      </Navigator>
    );

    act(() => {
      nav.current!.go("details");
    });
    expect(transition).toHaveBeenCalledTimes(1);
    expect(nav.current!.current).toBe("details");
    expect(pageWrapper(div, "details")!.style.display).not.toBe("none");
  });

  it("applies the page's transitionName as view-transition-name on its wrapper", () => {
    const { div } = mount(
      <Navigator>
        <Page key="home" levelPage={0} transitionName="page-home">home</Page>
        <Page key="details" levelPage={1}>details</Page>
      </Navigator>
    );
    const wrapper = pageWrapper(div, "home")!;
    expect(
      wrapper.style.getPropertyValue("view-transition-name") ||
        (wrapper.style as unknown as Record<string, string>)["viewTransitionName"]
    ).toBe("page-home");
  });
});
