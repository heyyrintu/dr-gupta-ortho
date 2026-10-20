/**
 * The site's base path. "/" in production (the real domain); "/<repo>/" for the GitHub Pages preview,
 * where the build runs with BASE_PATH set (see vite.config.ts and .github/workflows/pages.yml).
 * Use `asset()` for any hard-coded file under public/ (images, models, logo) so it works under both.
 */
export const BASE = import.meta.env.BASE_URL;

/** Router basename: "" for "/", "/repo" for "/repo/". */
export const BASENAME = BASE.replace(/\/$/, '');

export const asset = (path: string) => BASE + path.replace(/^\//, '');
