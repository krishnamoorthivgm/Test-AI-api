import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'NFS Growth AI',
  description: 'AI-Powered YouTube SEO Optimizer for NFS Creators',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>
        <div className="container">
          <header className="header">
            <h1>NFS Growth AI 🏁</h1>
            <div>
              <span className="badge badge-success">Live Engine</span>
            </div>
          </header>
          <main>
            {children}
          </main>
        </div>
      </body>
    </html>
  )
}
