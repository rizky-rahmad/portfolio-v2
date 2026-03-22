"use client"

import { motion } from "framer-motion"
import { Github, Linkedin, Instagram, Mail, Heart, ArrowUp } from "lucide-react"

const socialLinks = [
  {
    icon: Github,
    href: "https://github.com/rizky-rahmad",
    label: "GitHub",
  },
  {
    icon: Linkedin,
    href: "https://linkedin.com/in/rahmad-rizki-1728a6186",
    label: "LinkedIn",
  },
  {
    icon: Instagram,
    href: "https://instagram.com/rahmad.rizki",
    label: "Instagram",
  },
  {
    icon: Mail,
    href: "mailto:rizky.business7@gmail.com",
    label: "Email",
  },
]

const quickLinks = [
  { label: "About", href: "#about" },
  { label: "Education", href: "#education" },
  { label: "Experience", href: "#experience" },
  { label: "Projects", href: "#projects" },
  { label: "Contact", href: "#contact" },
]

export function Footer() {
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" })
  }

  const handleNavClick = (href: string) => {
    const element = document.querySelector(href)
    if (element) {
      element.scrollIntoView({ behavior: "smooth" })
    }
  }

  return (
    <footer className="relative bg-card border-t border-border">
      {/* Background decoration */}
      <div className="absolute inset-0 -z-10 overflow-hidden">
        <div className="absolute bottom-0 left-1/4 w-96 h-96 bg-primary/5 rounded-full blur-3xl" />
      </div>

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Main Footer Content */}
        <div className="py-12 sm:py-16">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10 lg:gap-8">
            {/* Brand Column */}
            <div className="lg:col-span-2">
              <a
                href="#"
                onClick={(e) => {
                  e.preventDefault()
                  scrollToTop()
                }}
                className="inline-flex items-center gap-2 group"
              >
                <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center border border-primary/20 group-hover:bg-primary/20 transition-colors">
                  <span className="text-primary font-bold text-xl">R</span>
                </div>
                <div>
                  <span className="text-foreground font-bold text-xl">Rahmad Rizki</span>
                </div>
              </a>
              <p className="mt-4 text-muted-foreground max-w-md leading-relaxed">
                Full Stack Web Developer & AI Implementation Specialist based in Jakarta, Indonesia. Building robust web solutions with modern technologies and AI integration.
              </p>

              {/* Social Links */}
              <div className="flex items-center gap-3 mt-6">
                {socialLinks.map((social) => (
                  <motion.a
                    key={social.label}
                    href={social.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    whileHover={{ scale: 1.1, y: -2 }}
                    whileTap={{ scale: 0.9 }}
                    className="p-2.5 rounded-lg bg-secondary border border-border hover:bg-primary/10 hover:border-primary/30 transition-all group"
                    aria-label={social.label}
                  >
                    <social.icon className="w-5 h-5 text-muted-foreground group-hover:text-primary transition-colors" />
                  </motion.a>
                ))}
              </div>
            </div>

            {/* Quick Links */}
            <div>
              <h4 className="font-semibold text-foreground mb-4">Quick Links</h4>
              <ul className="space-y-3">
                {quickLinks.map((link) => (
                  <li key={link.label}>
                    <a
                      href={link.href}
                      onClick={(e) => {
                        e.preventDefault()
                        handleNavClick(link.href)
                      }}
                      className="text-muted-foreground hover:text-primary transition-colors"
                    >
                      {link.label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>

            {/* Contact Info */}
            <div>
              <h4 className="font-semibold text-foreground mb-4">Contact</h4>
              <ul className="space-y-3 text-muted-foreground">
                <li>
                  <a 
                    href="mailto:rizky.business7@gmail.com" 
                    className="hover:text-primary transition-colors"
                  >
                    rizky.business7@gmail.com
                  </a>
                </li>
                <li>
                  <a 
                    href="https://wa.me/6282365434655" 
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hover:text-primary transition-colors"
                  >
                    +62 823 6543 4655
                  </a>
                </li>
                <li>Central Jakarta, Indonesia</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="py-6 border-t border-border">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <p className="text-sm text-muted-foreground flex items-center gap-1">
              © {new Date().getFullYear()} Rahmad Rizki. Built with
              <Heart className="w-4 h-4 text-primary inline" />
              using Next.js & Tailwind CSS.
            </p>

            {/* Back to Top */}
            <motion.button
              onClick={scrollToTop}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="inline-flex items-center gap-2 px-4 py-2 text-sm text-muted-foreground hover:text-primary transition-colors"
            >
              <span>Back to Top</span>
              <ArrowUp className="w-4 h-4" />
            </motion.button>
          </div>
        </div>
      </div>
    </footer>
  )
}
