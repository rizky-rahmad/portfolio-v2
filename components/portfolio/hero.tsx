"use client"

import { m } from "framer-motion"
import Image from "next/image"
import { ArrowDown, Github, Linkedin, Mail } from "lucide-react"
import { useState, useEffect } from "react"

export function Hero() {
  const [mounted, setMounted] = useState(false)
  useEffect(() => {
    setMounted(true)
  }, [])

  const handleScrollToAbout = () => {
    const element = document.getElementById("about")
    if (element) {
      element.scrollIntoView({ behavior: "smooth" })
    }
  }

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Background Image with Overlay */}
      <div className="absolute inset-0 z-0">
        <Image
          src="/images/hero-bg.jpg"
          alt=""
          fill
          priority
          sizes="100vw"
          className="object-cover"
        />
        {/* Dark overlay with opacity */}
        <div className="absolute inset-0 bg-background/70" />
        {/* Gradient overlay for depth */}
        <div className="absolute inset-0 bg-gradient-to-b from-background/50 via-transparent to-background" />
      </div>

      {/* Animated grid pattern */}
      <div className="absolute inset-0 z-0 opacity-20">
        <div
          className="absolute inset-0"
          style={{
            backgroundImage: `
              linear-gradient(rgba(100, 200, 200, 0.1) 1px, transparent 1px),
              linear-gradient(90deg, rgba(100, 200, 200, 0.1) 1px, transparent 1px)
            `,
            backgroundSize: '50px 50px'
          }}
        />
      </div>

      {/* Floating particles */}
      <div className="absolute inset-0 z-0 overflow-hidden">
        {mounted && [...Array(12)].map((_, i) => (
          <m.div
            key={i}
            className="absolute w-1 h-1 bg-primary/30 rounded-full"
            initial={{
              x: Math.random() * window.innerWidth, // Sekarang aman menggunakan window
              y: Math.random() * window.innerHeight,
            }}
            animate={{
              y: [null, Math.random() * -500],
              opacity: [0, 1, 0],
            }}
            transition={{
              duration: Math.random() * 10 + 10,
              repeat: Infinity,
              ease: "linear",
            }}
          />
        ))}
      </div>

      {/* Content */}
      <div className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 text-center">
        <div className="mb-6 animate-fade-up" style={{ animationDelay: "0.1s" }}>
          <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 text-primary text-sm font-medium">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
            </span>
            Available for new opportunities
          </span>
        </div>

        <h1
          className="animate-fade-up text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold tracking-tight text-balance"
        >
          <span className="text-foreground">{"Hi, I'm "}</span>
          <span className="text-primary">Rahmad Rizki</span>
        </h1>

        <p
          className="animate-fade-up mt-6 text-lg sm:text-xl md:text-2xl text-muted-foreground max-w-3xl mx-auto text-pretty"
          style={{ animationDelay: "0.2s" }}
        >
          <span className="text-foreground font-medium">Full Stack Web Developer</span> & <span className="text-foreground font-medium">AI Implementation Specialist</span>
          <br className="hidden sm:block" />
          <span className="text-base sm:text-lg md:text-xl">Building robust web solutions with modern technologies</span>
        </p>

        {/* CTA Buttons */}
        <div
          className="animate-fade-up mt-10 flex flex-col sm:flex-row items-center justify-center gap-4"
          style={{ animationDelay: "0.3s" }}
        >
          <m.a
            href="#projects"
            onClick={(e) => {
              e.preventDefault()
              document.getElementById("projects")?.scrollIntoView({ behavior: "smooth" })
            }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-4 bg-primary text-primary-foreground rounded-xl font-semibold text-lg hover:bg-primary/90 transition-all shadow-lg shadow-primary/25"
          >
            View My Work
          </m.a>
          <m.a
            href="#contact"
            onClick={(e) => {
              e.preventDefault()
              document.getElementById("contact")?.scrollIntoView({ behavior: "smooth" })
            }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-4 bg-secondary text-secondary-foreground rounded-xl font-semibold text-lg hover:bg-secondary/80 transition-all border border-border"
          >
            Get In Touch
          </m.a>
        </div>

        {/* Social Links */}
        <div
          className="animate-fade-up mt-12 flex items-center justify-center gap-4"
          style={{ animationDelay: "0.4s" }}
        >
          {[
            { icon: Github, href: "https://github.com/rizky-rahmad", label: "GitHub" },
            { icon: Linkedin, href: "https://linkedin.com/in/rahmad-rizki-1728a6186", label: "LinkedIn" },
            { icon: Mail, href: "mailto:rizky.business7@gmail.com", label: "Email" },
          ].map((social) => (
            <m.a
              key={social.label}
              href={social.href}
              target="_blank"
              rel="noopener noreferrer"
              whileHover={{ scale: 1.1, y: -2 }}
              whileTap={{ scale: 0.9 }}
              className="p-3 rounded-full bg-secondary/50 border border-border hover:bg-secondary hover:border-primary/50 transition-all group"
              aria-label={social.label}
            >
              <social.icon className="w-5 h-5 text-muted-foreground group-hover:text-primary transition-colors" />
            </m.a>
          ))}
        </div>
      </div>

      {/* Scroll Indicator */}
      <m.button
        onClick={handleScrollToAbout}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.5 }}
        className="absolute bottom-8 left-1/2 -translate-x-1/2 z-10 group"
        aria-label="Scroll to about section"
      >
        <m.div
          animate={{ y: [0, 10, 0] }}
          transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
          className="flex flex-col items-center gap-2"
        >
          <span className="text-xs text-muted-foreground uppercase tracking-widest group-hover:text-primary transition-colors">
            Scroll Down
          </span>
          <ArrowDown className="w-5 h-5 text-muted-foreground group-hover:text-primary transition-colors" />
        </m.div>
      </m.button>
    </section>
  )
}
