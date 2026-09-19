import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// Deployed to GitHub Pages at
// https://dangervalentine.github.io/react-redux-simon-says/ via the workflow
// in .github/workflows/deploy.yml, which uploads ./dist as a Pages artifact.
//
// `base` is relative rather than the repo subpath so the bundle resolves
// wherever it is served from — the built site works from the Pages subpath,
// from `npm run preview`, and from a plain file server without edits.
//
// https://vitejs.dev/config/
export default defineConfig({
  base: './',
  plugins: [react()],
  server: {
    port: 3000,
  },
});
