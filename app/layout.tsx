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
  title: 'Rahmad Rizki | Full Stack Developer | Software Engineer | Forward Deployed Engineer',
  description: 'Full Stack Developer building web, mobile, and AI applications. Interested in Full Stack Developer, Software Engineer, and Forward Deployed Engineer opportunities.',
  keywords: ['Full Stack Developer', 'Software Engineer', 'Forward Deployed Engineer', 'React', 'Next.js', 'Node.js', 'AI', 'Indonesia'],
  authors: [{ name: 'Rahmad Rizki' }],
  creator: 'Rahmad Rizki',
  openGraph: {
    title: 'Rahmad Rizki | Full Stack Developer | Software Engineer | Forward Deployed Engineer',
    description: 'Full Stack Developer building web, mobile, and AI applications. Interested in Full Stack Developer, Software Engineer, and Forward Deployed Engineer opportunities.',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Rahmad Rizki | Full Stack Developer | Software Engineer | Forward Deployed Engineer',
    description: 'Full Stack Developer building web, mobile, and AI applications. Interested in Full Stack Developer, Software Engineer, and Forward Deployed Engineer opportunities.',
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