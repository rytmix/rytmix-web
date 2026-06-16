"use client";

import { Button } from "@/components/ui/button";

/**
 * Phase 0 placeholder home page.
 *
 * Intentionally minimal — its only job is to confirm the app builds, deploys,
 * and renders (Tailwind + shadcn/ui working). Real UI (search, player, the
 * Web Audio visualizer) arrives in Phase 1.
 *
 * Client-rendered (`"use client"`) per the project's core constraint: core UI
 * fetches from the API on the client, so the same build works as a static
 * export for the Tauri desktop app (Phase 4).
 */
export default function Home() {
  return (
    <main className="flex flex-1 flex-col items-center justify-center gap-6 p-8 text-center">
      <h1 className="text-4xl font-semibold tracking-tight sm:text-5xl">Rytmix</h1>
      <p className="max-w-md text-balance text-muted-foreground">
        Web-first music streaming, rebuilt. The app is wired up and deploying —
        search, the player, and the visualizer land in Phase 1.
      </p>
      <Button disabled>Coming soon</Button>
    </main>
  );
}
