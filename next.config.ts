import type { NextConfig } from "next";

// Set in the deploy workflow when this is a GitHub Pages *project* repo
// (served at https://<user>.github.io/<repo>/, not the root domain).
// Leave unset for local dev or a <user>.github.io repo.
const basePath = process.env.NEXT_PUBLIC_BASE_PATH || undefined;

const nextConfig: NextConfig = {
  output: "export",
  basePath,
  assetPrefix: basePath,
  // The built-in next/image optimizer needs a Node server, which
  // GitHub Pages doesn't have.
  images: {
    unoptimized: true,
  },
};

export default nextConfig;
