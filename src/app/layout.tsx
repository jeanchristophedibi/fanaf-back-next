import type { Metadata } from 'next'
import '../index.css'

export const metadata: Metadata = {
  title: 'FANAF 2026 - Back Office',
  description: 'Système de gestion pour le Festival de l\'Assurance en Afrique',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="fr">
      <body>{children}</body>
    </html>
  )
}

