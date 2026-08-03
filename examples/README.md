## React example

A small React app demonstrating `navigation-controller`. It is wired to
the library source in this repository (`"navigation-controller": "file:.."`),
so changes to `../src` show up here after `npm run transpile` in the repo root.

Built with [Vite](https://vite.dev/). The app previously used `create-react-app`,
which is no longer maintained and was the source of a large number of Dependabot
alerts.

```bash
npm install
npm start      # dev server on http://localhost:3000
npm run build  # production build into ./build
npm test       # vitest
```

`cordova.js` is injected by the Cordova platform at runtime, so a 404 for it when
running in a plain browser is expected.
