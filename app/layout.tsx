import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Asian Economies Dashboard',
  description: 'Track GDP growth and economic indicators of top 20 Asian countries over 5 years',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <nav className="sticky top-0 z-50 bg-slate-900/90 backdrop-blur border-b border-slate-700/60 px-4 py-3">
          <div className="max-w-7xl mx-auto flex items-center justify-between">
            <a href="/" className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-amber-500 flex items-center justify-center text-slate-900 font-bold text-sm">
                A
              </div>
              <span className="font-semibold text-white text-lg">Asian Economies</span>
              <span className="hidden sm:inline text-slate-400 text-sm">| GDP Growth Dashboard</span>
            </a>
            <div className="flex items-center gap-4 text-sm text-slate-400">
              <a href="/" className="hover:text-white transition-colors">Countries</a>
              <a href="/compare" className="hover:text-white transition-colors">Compare</a>
              <a href="/inr-compare" className="hover:text-amber-400 transition-colors flex items-center gap-1">
                <span>🇮🇳</span> INR vs All
              </a>
              <span className="text-slate-600">|</span>
              <span className="text-amber-400 text-xs font-medium">2020 – May 2026</span>
            </div>
          </div>
        </nav>
        <main className="min-h-screen">
          {children}
        </main>
        <footer className="border-t border-slate-700/60 mt-16 py-8 text-center text-slate-500 text-sm">
          <p>Data based on IMF, World Bank, and national statistics sources. Values are approximate.</p>
          <p className="mt-1">© 2026 Asian Economies Dashboard</p>
        </footer>
      </body>
    </html>
  );
}
