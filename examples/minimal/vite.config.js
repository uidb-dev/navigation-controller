import react from "@vitejs/plugin-react";

// GitHub Pages serves this from /navigation-controller/, local dev from /.
export default {
  base: process.env.DEMO_BASE || "/",
  plugins: [react()],
};
