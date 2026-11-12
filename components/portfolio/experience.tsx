"use client"

import { m } from "framer-motion"
import { useInView } from "framer-motion"
import { useRef } from "react"
import { Briefcase, Calendar, MapPin, Building2, CheckCircle2 } from "lucide-react"

const experiences = [
  {
    "title": "Full Stack Developer",
    "company": "PT Unicorn",
    "location": "Ubud, Bali, Indonesia",
    "period": "Jun 2026 – Present",
    "type": "Full-time",
    "responsibilities": [
      "Develops web, mobile, and AI applications for business operations, working with staff and managers to define product flows, test features, and support releases and follow-up improvements.",
      "Channelflow: Worked with staff and managers to define messaging and booking flows, test features with users, and follow up on feedback. Extended an existing inbox across WhatsApp, Instagram, email, and TikTok. The platform handles approximately 17,700 messages and 3,500 bookings per month.",
      "Developed AI messaging and booking features using semantic search, knowledge-base retrieval (RAG), and staff handoff. The AI agent generates an average of about 400 replies per day.",
      "Added WhatsApp voice-note transcription and role-based permissions and worked on message queues, retries, crash handoff, and photo understanding.",
      "Extended an existing Expo Android booking app supporting day, list, and month views, improved analytics and added over-the-air updates.",
      "Built a voice booking agent from the initial concept, defining conversation flows and testing calls. The pilot includes availability checks, booking tools, and caller confirmation before saving a reservation.",
      "PeopleOS: Developed web and mobile features for a platform used by 154 employees for hiring, training, scheduling, GPS clock-in, and leave. Work includes leave requests, approval flows, and leave-tracker exports.",
      "Developed AI interview authoring features and integration fixes, including controls for reviewing the interviewer’s script.",
      "Unicorn CMS: Built a drag-and-drop page builder from the initial concept, defining editor workflows and guiding implementation. Includes 20+ components, device-specific layouts, and version history.",
      "Added website imports, brand-domain publishing, SEO, and tracking, with end-to-end checks in Playwright."
    ],
    "skills": [
      "Next.js",
      "Hono",
      "Mastra",
      "BullMQ",
      "PostgreSQL",
      "Drizzle",
      "React Native (Expo)",
      "LiveKit",
      "Playwright"
    ]
  },
  {
    "title": "Full Stack Developer",
    "company": "BPSDM Aceh",
    "location": "Aceh, Indonesia",
    "period": "Sep 2025 – Nov 2025",
    "type": "Contract",
    "responsibilities": [
      "Built SIKEMAS (sikemasbpsdm.web.id), a complaint management platform with ticket tracking, role-based access, audit logs, and analytics.",
      "Developed an online attendance system with role-based access, one check-in per employee per day, and daily and monthly reports."
    ],
    "skills": [
      "React",
      "Node.js",
      "Express",
      "PostgreSQL"
    ]
  },
  {
    "title": "Website Developer & IT Support",
    "company": "Aceh Besar Prosecutor’s Office",
    "location": "Aceh Besar, Indonesia",
    "period": "2022 – 2024",
    "type": "Full-time",
    "responsibilities": [
      "Maintained the public WordPress website and produced digital assets, including banners, videos, and infographics.",
      "Provided technical support and troubleshooting for 40+ staff members."
    ],
    "skills": [
      "WordPress",
      "Technical Support",
      "Digital Assets"
    ]
  },
  {
    "title": "Office Administrator & IT Support",
    "company": "DS&AI Syiah Kuala University",
    "location": "Banda Aceh, Indonesia",
    "period": "2021",
    "type": "Contract",
    "responsibilities": [
      "Resolved staff and student IT issues within 24 hours and assisted with digital content."
    ],
    "skills": [
      "IT Support",
      "Digital Content"
    ]
  },
  {
    "title": "Website Developer",
    "company": "AGC-Scopus 2019 – The 2nd Aceh Global Conference",
    "location": "Banda Aceh, Indonesia",
    "period": "2019",
    "type": "Project",
    "responsibilities": [
      "Designed and managed the conference website for 100+ attendees, with live updates during the event."
    ],
    "skills": [
      "Web Design",
      "Content Management"
    ]
  }
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
            Experience in web, mobile, and AI applications, alongside IT support.
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
