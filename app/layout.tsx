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
  title: 'Rahmad Rizki | Full Stack Software Engineer · AI in Production',
  description: 'Full Stack Software Engineer shipping AI products to production: an omnichannel AI agent for customer conversations and bookings, an HR platform and a multi-brand website builder. Next.js, React Native, Node.js, PostgreSQL.',
  keywords: ['Full Stack Developer', 'React', 'Next.js', 'Node.js', 'AI', 'Web Developer', 'Indonesia'],
  authors: [{ name: 'Rahmad Rizki' }],
  creator: 'Rahmad Rizki',
  openGraph: {
    title: 'Rahmad Rizki | Full Stack Software Engineer · AI in Production',
    description: 'Full Stack Software Engineer shipping AI products to production. Next.js, React Native, Node.js, PostgreSQL.',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Rahmad Rizki | Full Stack Software Engineer · AI in Production',
    description: 'Full Stack Software Engineer shipping AI products to production. Next.js, React Native, Node.js, PostgreSQL.',
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