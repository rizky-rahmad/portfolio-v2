"use client"

import { m } from "framer-motion"
import { useInView } from "framer-motion"
import { useRef } from "react"
import { Briefcase, Calendar, MapPin, Building2, CheckCircle2 } from "lucide-react"

const experiences = [
  {
    title: "Full Stack Developer",
    company: "PT Unicorn",
    location: "Ubud, Bali, Indonesia",
    period: "Jun 2026 – Present",
    type: "Full-time",
    responsibilities: [
      "Channelflow: co-developed an omnichannel inbox for WhatsApp, Instagram, Email and TikTok where an AI agent answers customers in their own language and completes bookings end to end — ~3,500 bookings and ~17,700 messages a month in production.",
      "Shipped LLM guardrails: the agent writes ~400 replies a day and hands the conversation to a human on sensitive or low-confidence cases, with a second model verifying before it continues.",
      "Contributed to the message pipeline's reliability: queued processing with retries, handoff to a human after a crash, voice-note transcription and photo understanding.",
      "Co-developed a staff Android app (Expo) with day, list and month views and analytics, and a real-time voice agent (LiveKit) now in pilot.",
      "PeopleOS: contributed to an HR platform used by 154 employees on web and Android for hiring, training, scheduling, GPS clock-in and leave — focus on the mobile app and approval workflows.",
      "Unicorn CMS: developing a multi-brand drag-and-drop website builder — 20+ elements, per-device layouts, version history, SEO and tracking, covered by end-to-end tests.",
    ],
    skills: ["Next.js", "Hono", "Mastra", "BullMQ", "PostgreSQL", "Drizzle", "React Native (Expo)", "LiveKit", "Playwright"],
  },
  {
    title: "Website Developer & IT Support",
    company: "Aceh Besar Prosecutor's Office",
    location: "Aceh Besar, Indonesia",
    period: "2022 – 2024",
    type: "Full-time",
    responsibilities: [
      "Provided comprehensive technical support and troubleshooting for 40+ staff members, ensuring system reliability.",
      "Maintained and updated the institutional website using WordPress and Elementor via regular content updates.",
      "Produced high-quality digital assets (banners, videos, infographics) aligned with institutional branding.",
    ],
    skills: ["WordPress", "Elementor", "Technical Support", "Digital Assets", "Troubleshooting"],
  },
  {
    title: "Office Administrator & IT Support",
    company: "DS&AI Syiah Kuala University",
    location: "Banda Aceh, Indonesia",
    period: "2021",
    type: "Contract",
    responsibilities: [
      "Digitized legacy documents using Google Drive and Spreadsheets, ensuring data persistence and preventing loss.",
      "Delivered efficient IT support and resolved technical issues within a 24-hour window.",
    ],
    skills: ["Google Workspace", "Data Digitization", "IT Support", "Document Management"],
  },
  {
    title: "Website Developer",
    company: "AGC-Scopus 2019 – The 2nd Aceh Global Conference",
    location: "Banda Aceh, Indonesia",
    period: "2019",
    type: "Project",
    responsibilities: [
      "Designed and managed the conference website for 100+ attendees, with live updates during the event.",
    ],
    skills: ["Web Design", "Content Management"],
  },
]

export function Experience() {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, margin: "-100px" })

  return (
    <section id="experience" className="py-20 sm:py-32 relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute inset-0 -z-10">
        <div className="absolute top-0 left-0 w-96 h-96 bg-primary/5 rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-primary/5 rounded-full blur-3xl" />
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
            Work History
          </span>
          <h2 className="mt-3 text-3xl sm:text-4xl md:text-5xl font-bold text-foreground text-balance">
            Professional Experience
          </h2>
          <p className="mt-4 text-muted-foreground text-lg max-w-2xl mx-auto text-pretty">
            From IT support to shipping AI products that run in production.
          </p>
        </m.div>

        {/* Experience Timeline */}
        <div className="relative max-w-4xl mx-auto">
          {/* Timeline center line */}
          <div className="absolute left-0 md:left-1/2 top-0 bottom-0 w-px bg-border transform md:-translate-x-1/2 hidden md:block" />

          {experiences.map((exp, index) => (
            <m.div
              key={`${exp.company}-${exp.period}`}
              initial={{ opacity: 0, y: 50 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.6, delay: 0.2 + index * 0.2 }}
              className={`relative mb-12 md:mb-16 ${
                index % 2 === 0 
                  ? 'md:pr-[50%] md:text-right' 
                  : 'md:pl-[50%] md:ml-auto'
              }`}
            >
              {/* Timeline dot */}
              <div className="absolute left-0 md:left-1/2 top-8 transform md:-translate-x-1/2 hidden md:flex items-center justify-center z-10">
                <div className="w-12 h-12 rounded-full bg-card border-2 border-primary flex items-center justify-center">
                  <Briefcase className="w-5 h-5 text-primary" />
                </div>
              </div>

              {/* Content Card */}
              <div className={`bg-card rounded-2xl border border-border p-6 sm:p-8 hover:border-primary/30 transition-all ${
                index % 2 === 0 ? 'md:mr-8' : 'md:ml-8'
              }`}>
                {/* Mobile icon */}
                <div className="flex items-center gap-3 mb-4 md:hidden">
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                    <Briefcase className="w-5 h-5 text-primary" />
                  </div>
                  <span className="px-3 py-1 text-xs font-medium rounded-full bg-primary/10 text-primary">
                    {exp.type}
                  </span>
                </div>

                <div className={`hidden md:flex items-center gap-3 mb-4 ${
                  index % 2 === 0 ? 'justify-end' : 'justify-start'
                }`}>
                  <span className="px-3 py-1 text-xs font-medium rounded-full bg-primary/10 text-primary">
                    {exp.type}
                  </span>
                </div>

                <h3 className={`text-xl sm:text-2xl font-bold text-foreground ${
                  index % 2 === 0 ? '' : ''
                }`}>
                  {exp.title}
                </h3>

                <div className={`flex items-center gap-2 mt-2 ${
                  index % 2 === 0 ? 'md:justify-end' : 'md:justify-start'
                }`}>
                  <Building2 className="w-4 h-4 text-primary" />
                  <span className="text-primary font-medium">{exp.company}</span>
                </div>

                <div className={`flex flex-wrap items-center gap-4 mt-3 text-sm text-muted-foreground ${
                  index % 2 === 0 ? 'md:justify-end' : 'md:justify-start'
                }`}>
                  <span className="flex items-center gap-1.5">
                    <Calendar className="w-4 h-4" />
                    {exp.period}
                  </span>
                  <span className="flex items-center gap-1.5">
                    <MapPin className="w-4 h-4" />
                    {exp.location}
                  </span>
                </div>

                <ul className="mt-6 space-y-3 text-left">
                  {exp.responsibilities.map((resp, i) => (
                    <li 
                      key={i} 
                      className="flex items-start gap-3 text-muted-foreground"
                    >
                      <CheckCircle2 className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                      <span className="text-sm leading-relaxed">{resp}</span>
                    </li>
                  ))}
                </ul>

                <div className={`flex flex-wrap gap-2 mt-6 ${
                  index % 2 === 0 ? 'md:justify-end' : 'md:justify-start'
                }`}>
                  {exp.skills.map((skill) => (
                    <span
                      key={skill}
                      className="px-3 py-1 text-xs rounded-full bg-secondary text-secondary-foreground"
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
            </m.div>
          ))}
        </div>
      </div>
    </section>
  )
}
