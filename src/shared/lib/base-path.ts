/**
 * GitHub Pages project-repo prefix (e.g. "/angar.github.io").
 * Empty for local dev and for a user/org page repo (root domain).
 * Set via NEXT_PUBLIC_BASE_PATH in the deploy workflow — must match
 * next.config.ts's `basePath` exactly.
 */
export const BASE_PATH = process.env.NEXT_PUBLIC_BASE_PATH ?? "";

/** Prefixes a root-relative public asset path (e.g. "/media/x.svg") with BASE_PATH. */
export function withBasePath(path: string): string {
  if (!path.startsWith("/")) return path;
  return `${BASE_PATH}${path}`;
}
