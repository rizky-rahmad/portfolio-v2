"use client"

import { motion } from "framer-motion"
import { useInView } from "framer-motion"
import { useRef } from "react"
import { GraduationCap, Calendar, MapPin, Award, Lightbulb } from "lucide-react"

const education = [
  {
    degree: "Bachelor of Computer Science",
    institution: "Bina Nusantara (BINUS) Online",
    location: "Jakarta, Indonesia",
    period: "Nov 2025 – Present",
    description: "Top-up Program (Continuation from D3 to S1) focused on Advanced Software Engineering and Distributed Systems.",
    highlights: ["Advanced Software Engineering", "Distributed Systems", "Top-up Program"],
    current: true,
  },
  {
    degree: "Diploma III in Informatics Management",
    institution: "Syiah Kuala University",
    location: "Banda Aceh, Indonesia",
    period: "2016 – 2021",
    description: "Focus on Data Structures, Algorithms, and Relational Database Systems (RDBMS).",
    highlights: ["GPA: 3.18/4.00", "Data Structures", "Algorithms", "RDBMS"],
    current: false,
  },
]

const hackathons = [
  {
    title: "AI Innovation Hackathons",
    description: "Actively participating in AI-driven Hackathons, focusing on building MVP solutions that integrate NLP for workflow optimization. Specialized in creating rapid prototypes with Dockerized microservices.",
    skills: ["NLP Integration", "MVP Development", "Dockerized Microservices", "Rapid Prototyping"],
  },
]

export function Education() {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, margin: "-100px" })

  return (
    <section id="education" className="py-20 sm:py-32 relative overflow-hidden bg-secondary/20">
      {/* Background decoration */}
      <div className="absolute inset-0 -z-10">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-primary/3 rounded-full blur-3xl" />
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
            Education & Learning
          </span>
          <h2 className="mt-3 text-3xl sm:text-4xl md:text-5xl font-bold text-foreground text-balance">
            Academic Background
          </h2>
          <p className="mt-4 text-muted-foreground text-lg max-w-2xl mx-auto text-pretty">
            Continuous learning and growth through formal education and hands-on hackathon experiences.
          </p>
        </motion.div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Education Timeline */}
          <div className="lg:col-span-2 space-y-6">
            <motion.h3
              initial={{ opacity: 0, x: -20 }}
              animate={isInView ? { opacity: 1, x: 0 } : {}}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="flex items-center gap-3 text-xl font-bold text-foreground"
            >
              <GraduationCap className="w-6 h-6 text-primary" />
              Education
            </motion.h3>

            <div className="relative space-y-6">
              {/* Timeline line */}
              <div className="absolute left-4 top-8 bottom-8 w-px bg-border hidden sm:block" />

              {education.map((edu, index) => (
                <motion.div
                  key={edu.degree}
                  initial={{ opacity: 0, y: 30 }}
                  animate={isInView ? { opacity: 1, y: 0 } : {}}
                  transition={{ duration: 0.5, delay: 0.3 + index * 0.2 }}
                  className="relative sm:pl-12"
                >
                  {/* Timeline dot */}
                  <div className="absolute left-0 top-6 hidden sm:flex items-center justify-center">
                    <div className={`w-8 h-8 rounded-full border-2 flex items-center justify-center ${
                      edu.current 
                        ? 'border-primary bg-primary/20' 
                        : 'border-border bg-card'
                    }`}>
                      <div className={`w-3 h-3 rounded-full ${
                        edu.current ? 'bg-primary' : 'bg-muted-foreground'
                      }`} />
                    </div>
                  </div>

                  <div className={`bg-card rounded-2xl border p-6 hover:border-primary/30 transition-all ${
                    edu.current ? 'border-primary/50' : 'border-border'
                  }`}>
                    {edu.current && (
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-medium mb-4">
                        <span className="relative flex h-2 w-2">
                          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
                          <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
                        </span>
                        Currently Enrolled
                      </span>
                    )}

                    <h4 className="text-lg sm:text-xl font-bold text-foreground">
                      {edu.degree}
                    </h4>
                    <p className="text-primary font-medium mt-1">{edu.institution}</p>

                    <div className="flex flex-wrap items-center gap-4 mt-3 text-sm text-muted-foreground">
                      <span className="flex items-center gap-1.5">
                        <Calendar className="w-4 h-4" />
                        {edu.period}
                      </span>
                      <span className="flex items-center gap-1.5">
                        <MapPin className="w-4 h-4" />
                        {edu.location}
                      </span>
                    </div>

                    <p className="mt-4 text-muted-foreground leading-relaxed">
                      {edu.description}
                    </p>

                    <div className="flex flex-wrap gap-2 mt-4">
                      {edu.highlights.map((highlight) => (
                        <span
                          key={highlight}
                          className="px-3 py-1 text-xs rounded-full bg-secondary text-secondary-foreground"
                        >
                          {highlight}
                        </span>
                      ))}
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>

          {/* Hackathons & Inventions */}
          <div className="space-y-6">
            <motion.h3
              initial={{ opacity: 0, x: 20 }}
              animate={isInView ? { opacity: 1, x: 0 } : {}}
              transition={{ duration: 0.6, delay: 0.4 }}
              className="flex items-center gap-3 text-xl font-bold text-foreground"
            >
              <Lightbulb className="w-6 h-6 text-primary" />
              Inventions & Hackathons
            </motion.h3>

            {hackathons.map((hackathon, index) => (
              <motion.div
                key={hackathon.title}
                initial={{ opacity: 0, y: 30 }}
                animate={isInView ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.5, delay: 0.5 + index * 0.2 }}
                className="bg-card rounded-2xl border border-border p-6 hover:border-primary/30 transition-all"
              >
                <div className="flex items-start gap-4">
                  <div className="p-3 rounded-xl bg-primary/10">
                    <Award className="w-6 h-6 text-primary" />
                  </div>
                  <div className="flex-1">
                    <h4 className="text-lg font-bold text-foreground">{hackathon.title}</h4>
                    <p className="mt-2 text-muted-foreground text-sm leading-relaxed">
                      {hackathon.description}
                    </p>
                    <div className="flex flex-wrap gap-2 mt-4">
                      {hackathon.skills.map((skill) => (
                        <span
                          key={skill}
                          className="px-2.5 py-1 text-xs rounded-full bg-primary/10 text-primary border border-primary/20"
                        >
                          {skill}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}

            {/* Languages */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.5, delay: 0.7 }}
              className="bg-card rounded-2xl border border-border p-6"
            >
              <h4 className="text-lg font-bold text-foreground mb-4">Languages</h4>
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between mb-2">
                    <span className="text-sm font-medium text-foreground">English</span>
                    <span className="text-sm text-muted-foreground">Proficient</span>
                  </div>
                  <div className="h-2 bg-secondary rounded-full overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={isInView ? { width: "85%" } : {}}
                      transition={{ duration: 1, delay: 0.8 }}
                      className="h-full bg-primary rounded-full"
                    />
                  </div>
                </div>
                <div>
                  <div className="flex justify-between mb-2">
                    <span className="text-sm font-medium text-foreground">Bahasa Indonesia</span>
                    <span className="text-sm text-muted-foreground">Native</span>
                  </div>
                  <div className="h-2 bg-secondary rounded-full overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={isInView ? { width: "100%" } : {}}
                      transition={{ duration: 1, delay: 0.9 }}
                      className="h-full bg-primary rounded-full"
                    />
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  )
}
