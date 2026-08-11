import { describe, it, expect, vi, afterEach } from "vitest";
import { viewTransition, withViewTransitions } from "../src/transitions";

type StartViewTransition = (cb: () => void | Promise<void>) => {
  finished: Promise<void>;
  ready: Promise<void>;
  updateCallbackDone: Promise<void>;
};

const doc = document as unknown as Record<string, unknown>;

afterEach(() => {
  Reflect.deleteProperty(doc, "startViewTransition");
});

const installViewTransitions = () => {
  const start = vi.fn((cb: () => void | Promise<void>) => {
    const updateCallbackDone = Promise.resolve().then(() => {
      void cb();
    });
    return {
      finished: updateCallbackDone,
      ready: updateCallbackDone,
      updateCallbackDone,
    };
  });
  doc["startViewTransition"] = start as unknown as StartViewTransition;
  return start;
};

describe("viewTransition", () => {
  it("falls back to an instant, synchronous commit when unsupported", () => {
    const commit = vi.fn();
    viewTransition(commit);
    expect(commit).toHaveBeenCalledTimes(1);
  });

  it("routes the commit through document.startViewTransition when supported", async () => {
    const start = installViewTransitions();
    const commit = vi.fn();
    viewTransition(commit);
    expect(start).toHaveBeenCalledTimes(1);
    await start.mock.results[0]!.value.updateCallbackDone;
    expect(commit).toHaveBeenCalledTimes(1);
  });
});

describe("withViewTransitions", () => {
  it("resolves with the wrapped function's result when unsupported", async () => {
    const go = vi.fn((key: string) => ({ to: key }));
    const wrapped = withViewTransitions(go);
    await expect(wrapped("details")).resolves.toEqual({ to: "details" });
    expect(go).toHaveBeenCalledWith("details");
  });

  it("wraps the call in a view transition and resolves after the DOM update", async () => {
    const start = installViewTransitions();
    const go = vi.fn((key: string) => ({ to: key }));
    const wrapped = withViewTransitions(go);

    const pending = wrapped("details");
    expect(start).toHaveBeenCalledTimes(1);
    expect(go).not.toHaveBeenCalled(); // the callback runs asynchronously
    await expect(pending).resolves.toEqual({ to: "details" });
    expect(go).toHaveBeenCalledWith("details");
  });
});
