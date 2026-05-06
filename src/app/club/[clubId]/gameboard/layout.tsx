/**
 * Gameboard layout — forces light, high-contrast theme regardless of
 * the user's site-wide dark mode preference.
 *
 * Why a wrapper: the live court board is projected on a TV/monitor at
 * the badminton club, so legibility from across the gym matters more
 * than aesthetic continuity with the rest of the SaaS.
 *
 * `theme-board-light` sets the shadcn CSS-variable scope (background,
 * foreground, card, border…) to white-ink-on-paper values; everything
 * underneath using `bg-background` / `text-foreground` automatically
 * follows. See `src/app/globals.css`.
 */
export default function GameboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="theme-board-light bg-background text-foreground min-h-screen">
      {children}
    </div>
  )
}
