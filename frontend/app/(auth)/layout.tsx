import Link from "next/link";
import Image from "next/image";

/**
 * Auth layout — centered card layout for login/register pages
 * Dark gradient background matching the landing page theme
 */
export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-zinc-950 via-zinc-900 to-black flex flex-col">
      {/* Grid overlay for industrial effect */}
      <div className="fixed inset-0 bg-[linear-gradient(rgba(255,255,255,.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,.02)_1px,transparent_1px)] bg-[size:50px_50px] [mask-image:radial-gradient(ellipse_80%_50%_at_50%_0%,#000_70%,transparent_110%)]" />

      <div className="relative flex flex-col flex-1">
        {/* Header */}
        <header className="border-b border-zinc-800/50 bg-black/20 backdrop-blur-xl">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="flex h-16 items-center">
              <Link href="/" className="flex items-center gap-3 group">
                <div className="relative h-8 w-8 overflow-hidden rounded-lg shadow-[0_0_15px_rgba(56,189,248,0.2)]">
                  <Image
                    src="https://res.cloudinary.com/dcetlwlfb/image/upload/v1778802318/logo.png_vewfv3.png"
                    alt="AluMate Logo"
                    fill
                    className="object-cover"
                  />
                </div>
                <span className="text-xl font-bold bg-gradient-to-r from-zinc-100 to-zinc-400 bg-clip-text text-transparent">
                  AluMate
                </span>
              </Link>
            </div>
          </div>
        </header>

        {/* Centered content */}
        <main className="flex flex-1 items-center justify-center px-4 py-12">
          <div className="w-full max-w-md">{children}</div>
        </main>

        {/* Footer */}
        <footer className="border-t border-zinc-800/50 bg-black/20 backdrop-blur-xl">
          <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
            <p className="text-center text-sm text-zinc-500">
              &copy; 2026 AluMate. Aluminium Fabrication & Service Management
              System
            </p>
          </div>
        </footer>
      </div>
    </div>
  );
}
