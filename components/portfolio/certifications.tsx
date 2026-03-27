"use client"

import { motion, AnimatePresence } from "framer-motion"
import { useInView } from "framer-motion"
import { useRef, useState, useEffect } from "react"
import { Award, ExternalLink, Calendar, CheckCircle2, X, ZoomIn } from "lucide-react"
import Image from "next/image"

// Highlighted Certification
const featuredCertification = {
  title: "Microsoft Certified: Azure AI Fundamentals AI-900",
  issuer: "Microsoft",
  date: "Recent",
  description: "Demonstrated foundational knowledge of machine learning (ML) and artificial intelligence (AI) concepts and related Microsoft Azure services.",
  skills: ["Artificial Intelligence", "Machine Learning", "Azure Cognitive Services", "Computer Vision"],
  image: "/images/certificates/azure_ai900.jpg",
  credentialUrl: "https://www.credly.com/badges/eaf57898-688e-412f-a1c0-557491c336f5/linked_in_profile",
}

// Other Certifications / Webinars
const otherCertifications = [
  {
    title: "Fullstack Web Development Bootcamp",
    issuer: "Udemy",
    date: "2025",
    image: "/images/certificates/sertifikat_udemy.jpg",
  },
  {
    title: "From Code to Cloud: Building and Deploying REST APIs with Google Cloud",
    issuer: "Google Developer Group",
    date: "2026",
    image: "/images/certificates/Sertifikat_Tech_Talk_2.jpg",
  },
]

export function Certifications() {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, margin: "-100px" })
  
  // State untuk mengontrol modal gambar
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  // Mencegah background scroll saat modal terbuka
  useEffect(() => {
    if (selectedImage) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [selectedImage]);

  return (
    <section id="certifications" className="py-20 sm:py-32 relative overflow-hidden bg-background">
      {/* Background decoration */}
      <div className="absolute inset-0 -z-10">
        <div className="absolute top-1/2 left-1/4 w-[500px] h-[500px] bg-primary/5 rounded-full blur-3xl -translate-y-1/2" />
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
            Achievements
          </span>
          <h2 className="mt-3 text-3xl sm:text-4xl md:text-5xl font-bold text-foreground text-balance">
            Licenses & Certifications
          </h2>
          <p className="mt-4 text-muted-foreground text-lg max-w-2xl mx-auto text-pretty">
            Continuous learning and professional validations to stay ahead in the tech industry.
          </p>
        </motion.div>

        {/* Featured Certification (Azure AI-900) */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="mb-16 md:mb-24"
        >
          <div className="relative rounded-3xl overflow-hidden bg-card border border-primary/20 shadow-lg shadow-primary/5">
            <div className="absolute top-0 right-0 p-32 bg-primary/5 blur-[100px] rounded-full" />
            
            <div className="grid md:grid-cols-2 gap-8 items-center p-6 sm:p-10 relative z-10">
              <div className="order-2 md:order-1">
                <div className="flex items-center gap-2 mb-4">
                  <div className="p-2 rounded-lg bg-primary/10 text-primary">
                    <Award className="w-6 h-6" />
                  </div>
                  <span className="text-primary font-semibold tracking-wide uppercase text-sm">
                    Latest Achievement
                  </span>
                </div>
                
                <h3 className="text-2xl sm:text-3xl font-bold text-foreground mb-4 leading-tight">
                  {featuredCertification.title}
                </h3>
                
                <div className="flex items-center gap-4 text-sm text-muted-foreground mb-6">
                  <span className="font-medium text-foreground">{featuredCertification.issuer}</span>
                  <span className="flex items-center gap-1.5">
                    <Calendar className="w-4 h-4" />
                    {featuredCertification.date}
                  </span>
                </div>
                
                <p className="text-muted-foreground leading-relaxed mb-6">
                  {featuredCertification.description}
                </p>

                <div className="flex flex-wrap gap-2 mb-8">
                  {featuredCertification.skills.map((skill) => (
                    <span
                      key={skill}
                      className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-full bg-secondary text-secondary-foreground"
                    >
                      <CheckCircle2 className="w-3.5 h-3.5 text-primary" />
                      {skill}
                    </span>
                  ))}
                </div>

                {featuredCertification.credentialUrl !== "#" && (
                  <a
                    href={featuredCertification.credentialUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 px-5 py-2.5 bg-primary text-primary-foreground rounded-lg font-medium text-sm hover:bg-primary/90 transition-colors"
                  >
                    <span>Show Credential</span>
                    <ExternalLink className="w-4 h-4" />
                  </a>
                )}
              </div>

              {/* Featured Certificate Image - Clickable */}
              <div 
                className="order-1 md:order-2 relative aspect-[4/3] md:aspect-auto md:h-full min-h-[250px] rounded-2xl overflow-hidden border border-border bg-muted/30 group cursor-pointer"
                onClick={() => setSelectedImage(featuredCertification.image)}
              >
                <Image
                  src={featuredCertification.image}
                  alt={featuredCertification.title}
                  fill
                  className="object-cover transition-transform duration-500 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                    <div className="p-3 bg-white/10 rounded-full backdrop-blur-sm border border-white/20 text-white shadow-lg">
                        <ZoomIn className="w-8 h-8" />
                    </div>
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Other Training & Webinars Grid */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, delay: 0.4 }}
        >
          <h3 className="text-2xl font-bold text-foreground mb-8">Training & Webinars</h3>
          
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {otherCertifications.map((cert, index) => (
              <motion.div
                key={cert.title}
                initial={{ opacity: 0, y: 30 }}
                animate={isInView ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.5, delay: 0.5 + index * 0.1 }}
                className="group bg-card rounded-2xl border border-border overflow-hidden hover:border-primary/30 transition-all shadow-sm hover:shadow-md cursor-pointer"
                onClick={() => setSelectedImage(cert.image)}
              >
                <div className="relative aspect-[4/3] bg-muted overflow-hidden">
                  <Image
                    src={cert.image}
                    alt={cert.title}
                    fill
                    className="object-cover transition-transform duration-500 group-hover:scale-110"
                  />
                  <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                    <div className="p-2 bg-white/10 rounded-full backdrop-blur-sm border border-white/20 text-white shadow-lg">
                        <ZoomIn className="w-6 h-6" />
                    </div>
                  </div>
                </div>
                <div className="p-5">
                  <h4 className="text-base font-bold text-foreground group-hover:text-primary transition-colors line-clamp-2 mb-2">
                    {cert.title}
                  </h4>
                  <div className="flex items-center justify-between mt-auto pt-2">
                    <span className="text-xs font-medium text-muted-foreground">{cert.issuer}</span>
                    <span className="text-xs text-muted-foreground bg-secondary px-2 py-1 rounded-md">{cert.date}</span>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>

      {/* ---- MODAL POP-UP ---- */}
      <AnimatePresence>
        {selectedImage && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setSelectedImage(null)}
            className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 p-4 md:p-10 backdrop-blur-sm cursor-zoom-out"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              className="relative max-w-7xl max-h-[90vh] bg-card rounded-xl overflow-hidden shadow-2xl border border-border"
              onClick={(e) => e.stopPropagation()} // Supaya klik gambar tidak menutup modal
            >
              <button
                onClick={() => setSelectedImage(null)}
                className="absolute top-4 right-4 z-10 p-2 bg-black/50 text-white rounded-full hover:bg-black/80 transition-colors backdrop-blur-sm border border-white/10"
                aria-label="Close modal"
              >
                <X className="w-6 h-6" />
              </button>

              <div className="relative w-full h-full flex items-center justify-center p-2 bg-muted/20">
                <Image
                  src={selectedImage}
                  alt="Sertifikat Full View"
                  width={1600}
                  height={1200}
                  className="object-contain max-w-full max-h-[85vh] rounded-lg"
                  quality={100}
                  priority
                />
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  )
}