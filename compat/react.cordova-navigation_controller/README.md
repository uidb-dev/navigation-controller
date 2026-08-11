# react.cordova-navigation_controller

> **This package was renamed to [`navigation-controller`](https://www.npmjs.com/package/navigation-controller).**

Version `3.2.0` contains no implementation of its own. It re-exports `navigation-controller`,
so existing installs keep working — and, importantly, start working again: every published
version up to and including `3.1.0` throws `ReferenceError: regeneratorRuntime is not defined`
at import time under any modern bundler (Vite, CRA 5+, webpack 5).

## Migrate

```bash
npm uninstall react.cordova-navigation_controller
npm install navigation-controller
```

```diff
- import Navigator from "react.cordova-navigation_controller";
+ import Navigator from "navigation-controller";
```

The API is identical — no prop changes, no behaviour changes. Full documentation lives in
the [`navigation-controller` README](https://www.npmjs.com/package/navigation-controller).
