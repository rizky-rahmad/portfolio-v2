"use client"

import { motion } from "framer-motion"
import { useInView } from "framer-motion"
import { useRef } from "react"
import { MapPin, Phone, Mail, Calendar, Code2, Cpu, Database, Cloud } from "lucide-react"

const skills = [
  {
    category: "Frontend",
    icon: Code2,
    items: ["React (Vite)", "Next.js", "HTML5/CSS3", "Tailwind CSS", "Bootstrap 5", "JavaScript (ES6+)"],
  },
  {
    category: "Backend",
    icon: Database,
    items: ["Node.js", "Express.js", "RESTful APIs", "JWT Auth", "Redis", "PostgreSQL"],
  },
  {
    category: "Cloud & DevOps",
    icon: Cloud,
    items: ["Microsoft Azure", "Docker", "CI/CD", "Cloudflare", "Supabase"],
  },
  {
    category: "AI & Tools",
    icon: Cpu,
    items: ["OpenAI GPT-4", "Google Gemini", "Azure Cognitive Services", "Prompt Engineering", "LLM Integration"],
  },
]

const bioInfo = [
  { 
    icon: MapPin, 
    label: "Location", 
    value: "Central Jakarta, Indonesia",
    href: "https://www.google.com/maps/search/Central+Jakarta+Indonesia",
    isExternal: true
  },
  { 
    icon: Phone, 
    label: "Phone", 
    value: "+62 823 6543 4655",
    href: "https://wa.me/6282365434655",
    isExternal: true
  },
  { 
    icon: Mail, 
    label: "Email", 
    value: "rizky.business7@gmail.com",
    href: "mailto:rizky.business7@gmail.com",
    isExternal: false
  },
  { 
    icon: Calendar, 
    label: "Experience", 
    value: "3+ Years",
    href: null,
    isExternal: false
  },
]

export function About() {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, margin: "-100px" })

  return (
    <section id="about" className="py-20 sm:py-32 relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute inset-0 -z-10">
        <div className="absolute top-0 right-0 w-96 h-96 bg-primary/5 rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-primary/5 rounded-full blur-3xl" />
      </div>

      <div ref={ref} className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <span className="text-primary text-sm font-semibold tracking-wider uppercase">
            About Me
          </span>
          <h2 className="mt-3 text-3xl sm:text-4xl md:text-5xl font-bold text-foreground text-balance">
            Crafting Digital Experiences
          </h2>
          <p className="mt-4 text-muted-foreground text-lg max-w-2xl mx-auto text-pretty">
            Result-oriented Full Stack Developer with a passion for building robust web solutions and integrating AI to optimize workflows.
          </p>
        </motion.div>

        <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-start">
          {/* Bio Card */}
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={isInView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <div className="bg-card rounded-2xl border border-border p-6 sm:p-8">
              <h3 className="text-xl sm:text-2xl font-bold text-foreground mb-6">
                Professional Summary
              </h3>
              <p className="text-muted-foreground leading-relaxed mb-8">
                I am a result-oriented Full Stack Developer with hands-on experience delivering functional web solutions for institutional clients using both <span className="text-foreground font-medium">Agile and Waterfall methodologies</span>. My expertise spans building robust backend systems with <span className="text-foreground font-medium">Node.js and Express.js</span>, creating responsive frontends with <span className="text-foreground font-medium">React and Next.js</span>, and managing efficient databases with <span className="text-foreground font-medium">PostgreSQL and Redis</span>.
              </p>
              <p className="text-muted-foreground leading-relaxed mb-8">
                As a <span className="text-foreground font-medium">Microsoft Certified Azure AI Professional</span>, I am proficient in leveraging tools like <span className="text-foreground font-medium">GPT-4, Gemini, and Azure Cognitive Services</span> to optimize development workflows and actively participate in AI-integrated hackathons to drive innovation.
              </p>

              {/* Bio Info Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {bioInfo.map((info, index) => {
                  const Component = info.href ? motion.a : motion.div
                  const linkProps = info.href ? {
                    href: info.href,
                    target: info.isExternal ? "_blank" : undefined,
                    rel: info.isExternal ? "noopener noreferrer" : undefined,
                  } : {}
                  
                  return (
                    <Component
                      key={info.label}
                      {...linkProps}
                      initial={{ opacity: 0, y: 20 }}
                      animate={isInView ? { opacity: 1, y: 0 } : {}}
                      transition={{ duration: 0.4, delay: 0.4 + index * 0.1 }}
                      className={`flex items-start gap-2 p-3 rounded-lg bg-secondary/50 hover:bg-secondary transition-colors group overflow-hidden ${info.href ? 'cursor-pointer hover:border-primary/30 border border-transparent' : ''}`}
                    >
                      <div className="p-2 rounded-lg bg-primary/10 group-hover:bg-primary/20 transition-colors flex-shrink-0">
                        <info.icon className="w-4 h-4 text-primary" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-xs text-muted-foreground">{info.label}</p>
                        <p className="text-sm font-medium text-foreground truncate group-hover:text-primary transition-colors">{info.value}</p>
                      </div>
                    </Component>
                  )
                })}
              </div>
            </div>

            {/* Interests */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.6, delay: 0.6 }}
              className="mt-6 bg-card rounded-2xl border border-border p-6 sm:p-8"
            >
              <h3 className="text-lg font-bold text-foreground mb-4">Interests & Future Goals</h3>
              <div className="flex flex-wrap gap-2">
                {["Machine Learning", "Computer Vision", "NLP", "Hackathons", "Java (Spring Boot)", "PHP (Laravel)"].map((interest) => (
                  <span
                    key={interest}
                    className="px-3 py-1.5 text-sm rounded-full bg-primary/10 text-primary border border-primary/20 hover:bg-primary/20 transition-colors"
                  >
                    {interest}
                  </span>
                ))}
              </div>
            </motion.div>
          </motion.div>

          {/* Skills Grid */}
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            animate={isInView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="space-y-4"
          >
            <h3 className="text-xl sm:text-2xl font-bold text-foreground mb-6">
              Technical Expertise
            </h3>
            {skills.map((skillGroup, groupIndex) => (
              <motion.div
                key={skillGroup.category}
                initial={{ opacity: 0, y: 20 }}
                animate={isInView ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.4, delay: 0.5 + groupIndex * 0.1 }}
                className="bg-card rounded-xl border border-border p-5 hover:border-primary/30 transition-all group"
              >
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-2 rounded-lg bg-primary/10 group-hover:bg-primary/20 transition-colors">
                    <skillGroup.icon className="w-5 h-5 text-primary" />
                  </div>
                  <h4 className="font-semibold text-foreground">{skillGroup.category}</h4>
                </div>
                <div className="flex flex-wrap gap-2">
                  {skillGroup.items.map((skill) => (
                    <span
                      key={skill}
                      className="px-3 py-1.5 text-sm rounded-lg bg-secondary text-secondary-foreground hover:bg-secondary/80 transition-colors"
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              </motion.div>
            ))}

            {/* Methodologies */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.4, delay: 0.9 }}
              className="bg-card rounded-xl border border-border p-5"
            >
              <h4 className="font-semibold text-foreground mb-3">Methodologies</h4>
              <div className="flex flex-wrap gap-2">
                {["Agile (Scrum)", "Waterfall", "SDLC", "Technical Support"].map((method) => (
                  <span
                    key={method}
                    className="px-3 py-1.5 text-sm rounded-lg bg-secondary text-secondary-foreground"
                  >
                    {method}
                  </span>
                ))}
              </div>
            </motion.div>
          </motion.div>
        </div>
      </div>
    </section>
  )
}