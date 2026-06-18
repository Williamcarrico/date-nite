import { Heart } from 'lucide-react'
import Link from 'next/link'

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-background via-background to-muted">
      {/* Header */}
      <header className="p-6">
        <Link href="/" className="flex items-center gap-2 w-fit">
          <div className="w-10 h-10 rounded-2xl gradient-primary flex items-center justify-center shadow-playful">
            <Heart className="w-5 h-5 text-white" />
          </div>
          <span className="text-xl font-bold text-gradient-primary">Date Nite</span>
        </Link>
      </header>

      {/* Main content */}
      <main className="flex-1 flex items-center justify-center p-6">
        <div className="w-full max-w-md">
          {children}
        </div>
      </main>

      {/* Footer */}
      <footer className="p-6 text-center text-sm text-muted-foreground">
        <p>Never run out of date ideas again!</p>
      </footer>
    </div>
  )
}
