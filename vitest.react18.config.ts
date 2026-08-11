// Runs the exact same suite against React 18. React 18 is installed in its own
// tree (test-react18/node_modules — see `npm run test:react18`'s pre-script) so
// react-dom's internal require("react") natively resolves to React 18 instead
// of the hoisted React 19. `npm test` covers React 19.
// Order matters: subpath aliases must come before the bare ones.
import { fileURLToPath } from "node:url";
import { defineConfig } from "vitest/config";

const r18 = (spec: string): string =>
  fileURLToPath(new URL(`./test-react18/node_modules/${spec}`, import.meta.url));

export default defineConfig({
  resolve: {
    alias: [
      { find: /^react\/jsx-runtime$/, replacement: r18("react/jsx-runtime.js") },
      { find: /^react\/jsx-dev-runtime$/, replacement: r18("react/jsx-dev-runtime.js") },
      { find: /^react-dom\/client$/, replacement: r18("react-dom/client.js") },
      { find: /^react-dom\/test-utils$/, replacement: r18("react-dom/test-utils.js") },
      { find: /^react-dom$/, replacement: r18("react-dom/index.js") },
      { find: /^react$/, replacement: r18("react/index.js") },
    ],
  },
  test: {
    environment: "jsdom",
    globals: true,
    include: ["tests/**/*.test.{ts,tsx}"],
  },
});
