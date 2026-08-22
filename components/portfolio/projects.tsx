"use client";

import { m } from "framer-motion";
import { useInView } from "framer-motion";
import { useRef, useState } from "react";
import { ExternalLink, Github, Layers, ArrowRight } from "lucide-react";
import Image from "next/image";

// Tambahan Tipe Data untuk memperbaiki error TypeScript
type FeaturedProject = {
  title: string;
  description: string;
  image: string;
  liveUrl?: string;
  githubUrl?: string;
  stack: string[];
  featured: boolean;
};

// Terapkan tipe data ke array
const featuredProjects: FeaturedProject[] = [
  {
    title: "Barakah Qurban — Premium Landing Page",
    description:
      "Modern landing page for a Qurban cattle provider. Features smooth reveal-on-scroll animations, an elegant glassmorphism design, and a fully responsive interface.",
    image: "/images/projects/barakah-qurban.jpg",
    liveUrl: "https://barakah-qurban.vercel.app",
    githubUrl: "https://github.com/rizky-rahmad/barakah-qurban",
    stack: ["Next.js", "React 19", "TypeScript", "Tailwind CSS v4", "Radix UI"],
    featured: true,
  },
  {
    title: "SIKEMAS - Complaint Management System",
    description:
      "Managed platform for BPSDM Aceh with multi-role RBAC, audit logs, and automated ticket dispatching. A comprehensive system for handling institutional complaints efficiently.",
    image: "/images/projects/sikemas.jpg",
    liveUrl: "https://sikemasbpsdm.web.id",
    stack: [
      "React (Vite)",
      "Bootstrap 5",
      "Node.js",
      "Express",
      "PostgreSQL",
      "JWT",
      "Google OAuth 2.0",
    ],
    featured: true,
  },
  {
    title: "Attendance System - Online Platform",
    description:
      "Full-stack engine with server-side filtering and geolocation check-in validation for large employee datasets. Built for scalability and reliability.",
    image: "/images/projects/attendance.jpg",
    stack: [
      "React (Vite)",
      "Bootstrap 5",
      "Node.js",
      "Express",
      "PostgreSQL",
      "JWT",
    ],
    featured: true,
  },
];

const portfolioProjects = [
  {
    title: "E-Commerce Dashboard",
    category: "Web Application",
    image: "/images/projects/ecommerce.jpg",
  },
  {
    title: "AI Chat Interface",
    category: "AI Integration",
    image: "/images/projects/ai-chat.jpg",
  },
  {
    title: "Analytics Platform",
    category: "Data Visualization",
    image: "/images/projects/analytics.jpg",
  },
  {
    title: "Mobile App Landing",
    category: "Landing Page",
    image: "/images/projects/mobile-landing.jpg",
  },
];

export function Projects() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });
  const [hoveredProject, setHoveredProject] = useState<number | null>(null);

  return (
    <section
      id="projects"
      className="py-20 sm:py-32 relative overflow-hidden bg-secondary/20"
    >
      {/* Background decoration */}
      <div className="absolute inset-0 -z-10">
        <div className="absolute top-1/4 right-0 w-150 h-150 bg-primary/3 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 left-0 w-150 h-150 bg-primary/3 rounded-full blur-3xl" />
      </div>

      <div ref={ref} className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <m.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <span className="text-primary text-sm font-semibold tracking-wider uppercase">
            Portfolio
          </span>
          <h2 className="mt-3 text-3xl sm:text-4xl md:text-5xl font-bold text-foreground text-balance">
            Featured Projects
          </h2>
          <p className="mt-4 text-muted-foreground text-lg max-w-2xl mx-auto text-pretty">
            A selection of production-ready projects showcasing full-stack
            development expertise and real-world problem solving.
          </p>
        </m.div>

        {/* Featured Projects */}
        <div className="space-y-8 mb-20">
          {featuredProjects
            .filter((p) => p.featured)
            .map((project, index) => (
              <m.div
                key={project.title}
                initial={{ opacity: 0, y: 50 }}
                animate={isInView ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.6, delay: 0.2 + index * 0.2 }}
                className={`grid lg:grid-cols-2 gap-8 items-center ${
                  index % 2 === 1 ? "lg:flex-row-reverse" : ""
                }`}
              >
                {/* Project Image */}
                <div
                  className={`relative group ${index % 2 === 1 ? "lg:order-2" : ""}`}
                >
                  <div className="relative aspect-video rounded-2xl overflow-hidden bg-card border border-border">
                    <Image
                      src={project.image}
                      alt={project.title}
                      fill
                      sizes="(max-width: 1024px) 100vw, 50vw"
                      className="object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-linear-to-t from-background/80 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

                    {/* Overlay links */}
                    <div className="absolute inset-0 flex items-center justify-center gap-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                      {project.liveUrl && (
                        <a
                          href={project.liveUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          aria-label={`Open the ${project.title} website`}
                          className="p-3 rounded-full bg-primary text-primary-foreground hover:bg-primary/90 transition-colors"
                        >
                          <ExternalLink className="w-5 h-5" />
                        </a>
                      )}
                      {project.githubUrl && (
                        <a
                          href={project.githubUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          aria-label={`View the ${project.title} source on GitHub`}
                          className="p-3 rounded-full bg-card text-foreground hover:bg-secondary transition-colors"
                        >
                          <Github className="w-5 h-5" />
                        </a>
                      )}
                    </div>
                  </div>

                  {/* Decorative elements */}
                  <div className="absolute -inset-2 bg-primary/10 rounded-2xl -z-10 blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                </div>

                {/* Project Info */}
                <div className={index % 2 === 1 ? "lg:order-1" : ""}>
                  <div className="flex items-center gap-2 mb-4">
                    <Layers className="w-5 h-5 text-primary" />
                    <span className="text-primary text-sm font-medium">
                      Featured Project
                    </span>
                  </div>
                  <h3 className="text-2xl sm:text-3xl font-bold text-foreground mb-4">
                    {project.title}
                  </h3>
                  <p className="text-muted-foreground leading-relaxed mb-6">
                    {project.description}
                  </p>

                  {/* Tech Stack */}
                  <div className="flex flex-wrap gap-2 mb-6">
                    {project.stack.map((tech) => (
                      <span
                        key={tech}
                        className="px-3 py-1.5 text-sm rounded-lg bg-card border border-border text-foreground hover:border-primary/30 transition-colors"
                      >
                        {tech}
                      </span>
                    ))}
                  </div>

                  {/* Links */}
                  <div className="flex items-center gap-4">
                    {project.liveUrl && (
                      <a
                        href={project.liveUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 text-primary font-medium hover:underline"
                      >
                        <span>Live Demo</span>
                        <ExternalLink className="w-4 h-4" />
                      </a>
                    )}
                    {project.githubUrl && (
                      <a
                        href={project.githubUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors"
                      >
                        <Github className="w-4 h-4" />
                        <span>Source Code</span>
                      </a>
                    )}
                  </div>
                </div>
              </m.div>
            ))}
        </div>

        {/* Other Projects 
        <m.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, delay: 0.6 }}
          className="mb-12"
        >
          <h3 className="text-2xl font-bold text-foreground mb-8">
            Other Notable Projects
          </h3>

          // Project Cards 
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {featuredProjects
              .filter((p) => !p.featured)
              .map((project, index) => (
                <m.div
                  key={project.title}
                  initial={{ opacity: 0, y: 30 }}
                  animate={isInView ? { opacity: 1, y: 0 } : {}}
                  transition={{ duration: 0.5, delay: 0.7 + index * 0.1 }}
                  className="group bg-card rounded-2xl border border-border overflow-hidden hover:border-primary/30 transition-all"
                >
                  <div className="relative aspect-video">
                    <Image
                      src={project.image}
                      alt={project.title}
                      fill
                      className="object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-linear-to-t from-card to-transparent" />
                  </div>
                  <div className="p-6">
                    <h4 className="text-lg font-bold text-foreground group-hover:text-primary transition-colors">
                      {project.title}
                    </h4>
                    <p className="mt-2 text-sm text-muted-foreground line-clamp-2">
                      {project.description}
                    </p>
                    <div className="flex flex-wrap gap-1.5 mt-4">
                      {project.stack.slice(0, 3).map((tech) => (
                        <span
                          key={tech}
                          className="px-2 py-1 text-xs rounded bg-secondary text-secondary-foreground"
                        >
                          {tech}
                        </span>
                      ))}
                      {project.stack.length > 3 && (
                        <span className="px-2 py-1 text-xs rounded bg-secondary text-muted-foreground">
                          +{project.stack.length - 3}
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-3 mt-4 pt-4 border-t border-border">
                      {project.githubUrl && (
                        <a
                          href={project.githubUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-primary transition-colors"
                        >
                          <Github className="w-4 h-4" />
                          <span>View Code</span>
                        </a>
                      )}
                    </div>
                  </div>
                </m.div>
              ))}
          </div>
        </m.div>
        */}

        {/* Portfolio Gallery */}
        {/* <m.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, delay: 0.8 }}
        >
          <div className="flex items-center justify-between mb-8">
            <h3 className="text-2xl font-bold text-foreground">Project Gallery</h3>
            <a
              href="https://github.com/rizky-rahmad"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 text-primary font-medium hover:underline"
            >
              <span>View All on GitHub</span>
              <ArrowRight className="w-4 h-4" />
            </a>
          </div>
          
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {portfolioProjects.map((project, index) => (
              <m.div
                key={project.title}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={isInView ? { opacity: 1, scale: 1 } : {}}
                transition={{ duration: 0.4, delay: 0.9 + index * 0.1 }}
                onMouseEnter={() => setHoveredProject(index)}
                onMouseLeave={() => setHoveredProject(null)}
                className="relative aspect-square rounded-xl overflow-hidden group cursor-pointer"
              >
                <Image
                  src={project.image}
                  alt={project.title}
                  fill
                  className="object-cover transition-transform duration-500 group-hover:scale-110"
                />
                <div className={`absolute inset-0 bg-gradient-to-t from-background via-background/50 to-transparent transition-opacity duration-300 ${
                  hoveredProject === index ? 'opacity-100' : 'opacity-0'
                }`} />
                <div className={`absolute inset-0 flex flex-col items-center justify-center text-center p-4 transition-opacity duration-300 ${
                  hoveredProject === index ? 'opacity-100' : 'opacity-0'
                }`}>
                  <span className="text-xs text-primary font-medium mb-1">{project.category}</span>
                  <h4 className="text-sm font-bold text-foreground">{project.title}</h4>
                </div>
              </m.div>
            ))}
          </div>
        </m.div> */}
      </div>
    </section>
  );
}
