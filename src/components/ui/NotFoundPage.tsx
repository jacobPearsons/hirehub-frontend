import { Link } from 'react-router-dom'

export function NotFoundPage() {
  return (
    <main className="min-h-screen flex items-center justify-center bg-canvas px-4 relative overflow-hidden">
      <div className="absolute inset-0 opacity-30" aria-hidden="true">
        <img
          src="/not-found-bg.png"
          alt=""
          className="w-full h-full object-cover"
          loading="eager"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-canvas/60 via-canvas/20 to-canvas/80" />
      </div>
      <div className="relative text-center">
        <h1 className="text-5xl md:text-[56px] font-medium text-ink mb-4">404</h1>
        <p className="text-lg text-ink-muted mb-6">Page not found</p>
        <Link
          to="/"
          className="text-accent hover:underline text-sm font-medium focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ink/30 rounded-md"
        >
          Go home
        </Link>
      </div>
    </main>
  )
}
