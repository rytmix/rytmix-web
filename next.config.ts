import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Kept deliberately export-compatible. The app is fully client-rendered and
  // talks to the remote API, so no server is required at runtime.
  //
  // Phase 4 (Tauri desktop) will turn this into a static export by adding:
  //   output: "export",
  //   images: { unoptimized: true },  // <Image> optimization needs a server
  // and Tauri's tauri.conf.json will point `frontendDist` at the generated `out/`.
  //
  // We do NOT enable `output: "export"` yet — on Vercel we keep the normal build
  // so PR preview deployments work during Phases 0–3.
};

export default nextConfig;
