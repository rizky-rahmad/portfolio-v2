import type { Metadata, Viewport } from 'next'
import { Inter, JetBrains_Mono } from 'next/font/google'
import { Analytics } from '@vercel/analytics/next'
import './globals.css'

const inter = Inter({ 
  subsets: ["latin"],
  variable: '--font-inter'
});

const jetbrainsMono = JetBrains_Mono({ 
  subsets: ["latin"],
  variable: '--font-jetbrains-mono'
});

export const metadata: Metadata = {
  title: 'Rahmad Rizki | Full Stack Developer & AI Specialist',
  description: 'Result-oriented Full Stack Developer with expertise in React, Next.js, Node.js, and AI implementation. Building robust web solutions with modern technologies.',
  keywords: ['Full Stack Developer', 'React', 'Next.js', 'Node.js', 'AI', 'Web Developer', 'Indonesia'],
  authors: [{ name: 'Rahmad Rizki' }],
  creator: 'Rahmad Rizki',
  openGraph: {
    title: 'Rahmad Rizki | Full Stack Developer & AI Specialist',
    description: 'Result-oriented Full Stack Developer with expertise in React, Next.js, Node.js, and AI implementation.',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Rahmad Rizki | Full Stack Developer & AI Specialist',
    description: 'Result-oriented Full Stack Developer with expertise in React, Next.js, Node.js, and AI implementation.',
  },
}

export const viewport: Viewport = {
  themeColor: '#0a0a0f',
  width: 'device-width',
  initialScale: 1,
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" className="scroll-smooth">
      <body className={`${inter.variable} ${jetbrainsMono.variable} font-sans antialiased bg-background text-foreground`}>
        {children}
        <Analytics />
      </body>
    </html>
  )
}
