import React from 'react';
import { createRoot } from 'react-dom/client';
import { act } from 'react';
import { describe, it, expect, vi, afterEach } from 'vitest';
import Navigator from 'navigation-controller';

// Lets React treat act() as authoritative, so state updates commit when act
// returns instead of whenever the scheduler gets round to them.
globalThis.IS_REACT_ACT_ENVIRONMENT = true;

const Page = ({ children }) => <div className="page">{children}</div>;

function mount(element) {
    const div = document.createElement('div');
    document.body.appendChild(div);
    const root = createRoot(div);
    act(() => { root.render(element); });
    return {
        div,
        unmount: () => { act(() => { root.unmount(); }); div.remove(); }
    };
}

const tick = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

// The library completes every transition from a CSS animation-end event. jsdom
// never runs CSS animations, so that event never fires on its own -- dispatch it
// by hand or `busy` latches true and every later navigation is silently dropped.
async function finishTransition(id, eventType = 'webkitAnimationEnd') {
    await act(async () => {
        document.getElementById(id).dispatchEvent(new Event(eventType));
        await tick(0);
    });
}

// Start a navigation and let the library's own timers run. Two separate act()
// passes are required: the first commits the history setState (the upward path
// only arms its animation from that setState's callback), the second gives the
// deferred work time to run. The upward path waits ~18ms before arming the
// animation; the sideways/back path defers the history rewrite by the full
// animation duration (250ms by default), so sampling historyPages any earlier
// reads a stale stack.
async function navigate(fn, settleMs = 320) {
    await act(async () => { fn(); });
    await act(async () => { await tick(settleMs); });
}

describe('Navigator', () => {
    afterEach(() => {
        // Keep a failed test from leaving duplicate page ids behind for the next one.
        document.body.innerHTML = '';
    });

    it('fires the initial onChangePage on mount (regression: duplicate componentDidMount)', () => {
        const onChangePage = vi.fn();
        const { unmount } = mount(
            <Navigator changeRoute={false} onChangePage={onChangePage}>
                <Page key="home" levelPage={0}>home</Page>
                <Page key="details" levelPage={1}>details</Page>
            </Navigator>
        );

        expect(onChangePage).toHaveBeenCalledWith('home', 'In');
        unmount();
    });

    it('renders a single child declaring transitionIn without throwing (regression: ReferenceError on `children`)', () => {
        const onChangePage = vi.fn();
        const onError = vi.fn();
        const { div, unmount } = mount(
            <Navigator changeRoute={false} onChangePage={onChangePage} onError={onError}>
                <Page key="only" levelPage={0} transitionIn="animate__fadeIn" transitionOut="animate__fadeOut">
                    only
                </Page>
            </Navigator>
        );

        expect(onError).not.toHaveBeenCalled();
        expect(div.querySelector('#only')).toBeTruthy();
        expect(onChangePage).toHaveBeenCalledWith('only', 'In');
        unmount();
    });

    it('marks the single start page visible (regression: bare `child.key` in the single-child render branch)', () => {
        const onError = vi.fn();
        const { div, unmount } = mount(
            <Navigator changeRoute={false} onError={onError}>
                <Page key="only" levelPage={0}>only</Page>
            </Navigator>
        );

        const only = div.querySelector('#only');
        expect(only).toBeTruthy();
        expect(only.className).toContain('showPage');
        expect(only.className).toContain('scrollPage');
        expect(onError).not.toHaveBeenCalled();
        unmount();
    });

    it('uses child keys verbatim as DOM ids (guards against React.Children.toArray key rewriting)', () => {
        const { div, unmount } = mount(
            <Navigator changeRoute={false}>
                <Page key="home" levelPage={0}>home</Page>
                <Page key="details" levelPage={1}>details</Page>
            </Navigator>
        );

        expect(div.querySelector('#home')).toBeTruthy();
        expect(div.querySelector('#details')).toBeTruthy();
        unmount();
    });

    it('exposes historyPages / nowPage / changePage through onRef', () => {
        let nav = null;
        const { unmount } = mount(
            <Navigator changeRoute={false} onRef={(ref) => { nav = ref; }}>
                <Page key="home" levelPage={0}>home</Page>
                <Page key="details" levelPage={1}>details</Page>
            </Navigator>
        );

        expect(nav).toBeTruthy();
        expect(nav.historyPages).toEqual(['home']);
        expect(nav.nowPage).toBe('home');
        expect(typeof nav.changePage).toBe('function');
        expect(typeof nav.back).toBe('function');
        unmount();
    });

    it('does not blow up on array operations when there is exactly one child (regression: unguarded .filter/.forEach)', () => {
        const onError = vi.fn();
        // Returning false from beforExit stops back() at the root of the stack
        // before it reaches the Cordova-only window.navigator.app.exitApp().
        const beforExit = vi.fn(() => false);
        let nav = null;
        const { unmount } = mount(
            <Navigator
                changeRoute={false}
                onError={onError}
                beforExit={beforExit}
                onRef={(ref) => { nav = ref; }}
            >
                <Page key="only" levelPage={0}>only</Page>
            </Navigator>
        );

        act(() => { nav.changePage('only'); });
        act(() => { nav.back(); });

        // back() walks props.children with .forEach before delegating to
        // changePage, which walks it again with .filter -- both used to throw
        // TypeError for a single (non-array) child. The constructor's startPage
        // validation filtered it unguarded too.
        expect(beforExit).toHaveBeenCalled();
        expect(onError).not.toHaveBeenCalled();
        unmount();
    });

    it('falls back to errorPageKey when the requested page does not exist', async () => {
        const onError = vi.fn();
        let nav = null;
        const { unmount } = mount(
            <Navigator
                changeRoute={false}
                errorPageKey="oops"
                onError={onError}
                onRef={(ref) => { nav = ref; }}
            >
                <Page key="home" levelPage={0}>home</Page>
                <Page key="oops" levelPage={1}>not found</Page>
            </Navigator>
        );

        await navigate(() => nav.changePage('does-not-exist'), 60);

        expect(onError).toHaveBeenCalledWith('page undefined');
        // Settled above on purpose: the fallback navigation arms its animation on
        // a timer, which would otherwise fire against a torn-down tree mid-way
        // through a later test.
        unmount();
    });

    it('routes a throwing onChangePage at mount through onError instead of crashing the tree', () => {
        // The mount-time onChangePage call used to sit outside the try/catch that
        // guards every other call site, so a consumer handler that throws took the
        // whole React tree down from componentDidMount.
        const consoleError = vi.spyOn(console, 'error').mockImplementation(() => { });
        const onError = vi.fn();
        const boom = new Error('consumer handler blew up');
        const onChangePage = vi.fn(() => { throw boom; });

        let mounted = null;
        expect(() => {
            mounted = mount(
                <Navigator changeRoute={false} onChangePage={onChangePage} onError={onError}>
                    <Page key="home" levelPage={0}>home</Page>
                    <Page key="details" levelPage={1}>details</Page>
                </Navigator>
            );
        }).not.toThrow();

        expect(onChangePage).toHaveBeenCalledWith('home', 'In');
        expect(onError).toHaveBeenCalledTimes(1);
        expect(onError).toHaveBeenCalledWith(boom);

        mounted.unmount();
        consoleError.mockRestore();
    });

    it('applies a page height prop with one child as well as with many', () => {
        // The single-child branch assigned the whole props OBJECT to style.height,
        // which React drops, so the height came out "".
        const single = mount(
            <Navigator changeRoute={false}>
                <Page key="only" levelPage={0} height="50vh">only</Page>
            </Navigator>
        );
        expect(single.div.querySelector('#only').style.height).toBe('50vh');
        single.unmount();

        const many = mount(
            <Navigator changeRoute={false}>
                <Page key="home" levelPage={0} height="50vh">home</Page>
                <Page key="details" levelPage={1}>details</Page>
            </Navigator>
        );
        expect(many.div.querySelector('#home').style.height).toBe('50vh');
        // Falls back to 100% when the page declares no height of its own.
        expect(many.div.querySelector('#details').style.height).toBe('100%');
        many.unmount();
    });

    it('navigates across levels, prunes siblings, and lands on the parent when going back', async () => {
        const onChangePage = vi.fn();
        let nav = null;
        const { unmount } = mount(
            <Navigator changeRoute={false} onChangePage={onChangePage} onRef={(ref) => { nav = ref; }}>
                <Page key="home" levelPage={0}>home</Page>
                <Page key="hub" levelPage={1}>hub</Page>
                <Page key="itemA" levelPage={2}>item A</Page>
                <Page key="itemB" levelPage={2}>item B</Page>
            </Navigator>
        );

        // mount
        expect(nav.historyPages).toEqual(['home']);
        expect(nav.nowPage).toBe('home');
        expect(onChangePage).toHaveBeenLastCalledWith('home', 'In');

        // home -> hub : one level in
        await navigate(() => nav.changePage('hub'));
        await finishTransition('hub');
        expect(nav.historyPages).toEqual(['home', 'hub']);
        expect(nav.nowPage).toBe('hub');
        expect(onChangePage).toHaveBeenLastCalledWith('hub', 'In');

        // hub -> itemA : another level in
        await navigate(() => nav.changePage('itemA'));
        await finishTransition('itemA');
        expect(nav.historyPages).toEqual(['home', 'hub', 'itemA']);
        expect(nav.nowPage).toBe('itemA');
        expect(onChangePage).toHaveBeenLastCalledWith('itemA', 'In');

        // itemA -> itemB : sideways to a sibling; itemA must be pruned, not stacked
        await navigate(() => nav.changePage('itemB'));
        await finishTransition('itemA');
        expect(nav.historyPages).toEqual(['home', 'hub', 'itemB']);
        expect(nav.nowPage).toBe('itemB');
        expect(onChangePage).toHaveBeenLastCalledWith('itemB', 'SameLevel');

        // back() : lands on the PARENT, not on the pruned sibling
        await navigate(() => nav.back());
        await finishTransition('itemB');
        expect(nav.historyPages).toEqual(['home', 'hub']);
        expect(nav.nowPage).toBe('hub');
        expect(onChangePage).toHaveBeenLastCalledWith('hub', 'Out');

        expect(nav.busy).toBe(false);
        unmount();
    });

    it('completes a transition exactly once whether the browser fires animationend, webkitAnimationEnd, or both', async () => {
        const onChangePage = vi.fn();
        let nav = null;
        const { div, unmount } = mount(
            <Navigator changeRoute={false} onChangePage={onChangePage} onRef={(ref) => { nav = ref; }}>
                <Page key="home" levelPage={0}>home</Page>
                <Page key="hub" levelPage={1}>hub</Page>
                <Page key="itemA" levelPage={2}>item A</Page>
            </Navigator>
        );

        await navigate(() => nav.changePage('hub'));

        // An animation ending on content INSIDE the page must not end the page
        // transition -- animationend bubbles, webkitAnimationEnd did too.
        const inner = div.querySelector('#hub .page');
        expect(inner).toBeTruthy();
        await act(async () => {
            inner.dispatchEvent(new Event('animationend', { bubbles: true }));
            await tick(0);
        });
        expect(nav.nowPage).toBe('home');
        expect(nav.busy).toBe(true);

        // Firefox never fires the prefixed event, so the unprefixed one alone has
        // to complete the transition -- otherwise `busy` latches and the navigator
        // is stuck after the very first move.
        const beforeUnprefixed = onChangePage.mock.calls.length;
        await finishTransition('hub', 'animationend');
        expect(onChangePage.mock.calls.length - beforeUnprefixed).toBe(1);
        expect(onChangePage).toHaveBeenLastCalledWith('hub', 'In');
        expect(nav.historyPages).toEqual(['home', 'hub']);
        expect(nav.nowPage).toBe('hub');
        expect(nav.busy).toBe(false);

        // A browser firing BOTH events must advance the navigation exactly once.
        await navigate(() => nav.changePage('itemA'));
        const beforeBoth = onChangePage.mock.calls.length;
        await act(async () => {
            const page = document.getElementById('itemA');
            page.dispatchEvent(new Event('animationend'));
            page.dispatchEvent(new Event('webkitAnimationEnd'));
            await tick(0);
        });

        expect(onChangePage.mock.calls.length - beforeBoth).toBe(1);
        expect(onChangePage).toHaveBeenLastCalledWith('itemA', 'In');
        expect(nav.historyPages).toEqual(['home', 'hub', 'itemA']);
        expect(nav.nowPage).toBe('itemA');
        expect(nav.busy).toBe(false);
        unmount();
    });

    it('strips the animate.css v4 `animate__` prefix from child and option animation names', async () => {
        // animate.css v4 class names are `animate__x`, but its @keyframes are `x`.
        // Feeding the prefixed name to the `animation` style matches no keyframe,
        // so no animation-end event ever fires and `busy` latches true for good.
        let nav = null;
        const { div, unmount } = mount(
            <Navigator changeRoute={false} onRef={(ref) => { nav = ref; }}>
                <Page key="home" levelPage={0}>home</Page>
                <Page key="hub" levelPage={1} transitionIn="animate__slideInRight">hub</Page>
                <Page key="itemA" levelPage={2}>item A</Page>
            </Navigator>
        );

        await navigate(() => nav.changePage('hub'));
        expect(div.querySelector('#hub').style.animation).toContain('slideInRight');
        expect(div.querySelector('#hub').style.animation).not.toContain('animate__');
        await finishTransition('hub');
        expect(nav.busy).toBe(false);

        // The same normalisation applies to names passed through changePage options.
        await navigate(() => nav.changePage('itemA', { animationIn: 'animate__fadeIn' }));
        expect(div.querySelector('#itemA').style.animation).toContain('fadeIn');
        expect(div.querySelector('#itemA').style.animation).not.toContain('animate__');
        await finishTransition('itemA');
        expect(nav.busy).toBe(false);
        expect(nav.nowPage).toBe('itemA');
        unmount();
    });
});
