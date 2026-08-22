import type { Metadata, Viewport } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { MotionProvider } from '@/components/lazy-motion-provider'
import { LazyChatbot } from '@/components/chatbot/lazy-chatbot'

const inter = Inter({
  subsets: ["latin"],
  display: 'swap',
  variable: '--font-inter'
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
      <body className={`${inter.variable} font-sans antialiased bg-background text-foreground`}>
        <MotionProvider>
          {children}
          {/* Chatbot dimuat lazy (client-only) agar tidak membebani initial load */}
          <LazyChatbot />
        </MotionProvider>
      </body>
    </html>
  )
}