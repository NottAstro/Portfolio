'use client'

import { motion, Variants } from 'framer-motion'
import {
  Send,
  User,
  Mail,
  MessageSquare,
  ArrowUpRight,
} from 'lucide-react'
import { FaLinkedinIn, FaGithub } from 'react-icons/fa'
import { EASE } from '@/lib/motion'

const fieldVariants: Variants = {
  hidden: {
    opacity: 0,
    y: 26,
  },
  show: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.6,
      ease: EASE,
    },
  },
}

// Each element fades up as it scrolls into view, staggered by `delay`
const fieldMotion = (delay: number) => ({
  variants: fieldVariants,
  initial: 'hidden',
  whileInView: 'show',
  viewport: { once: false },
  transition: { delay },
})

const hoverGrow = {
  scale: 1.06,
  transition: { duration: 0.12 },
}

const INPUT_CLASS =
  'w-full rounded-2xl border border-white/15 bg-black/20 pl-12 pr-4 py-4 outline-none transition duration-200 focus:border-white focus:ring-1 focus:ring-white/40'

const FIELDS = [
  { icon: User, placeholder: 'Your Name', delay: 0.1 },
  { icon: Mail, placeholder: 'Your Email', delay: 0.16 },
  { icon: MessageSquare, placeholder: 'Your Message', delay: 0.22, multiline: true },
]

const socialLinks = [
  {
    title: 'Github',
    user: '@NottAstro',
    icon: FaGithub,
    link: 'https://github.com/NottAstro',
    wide: true,
  },
  {
    title: 'LinkedIn',
    user: '@jainaaryan',
    icon: FaLinkedinIn,
    link: 'https://www.linkedin.com/in/jainaaryan0410',
  },
  {
    title: 'Email',
    user: 'Aaryan Jain',
    icon: Mail,
    link: 'https://mail.google.com/mail/?view=cm&to=aaryanjain7821@gmail.com',
  },
]

export default function ContactForm() {
  return (
    <motion.div
      initial={{ opacity: 0, x: -40 }}
      whileInView={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.8, ease: EASE }}
      viewport={{ once: false, amount: 0.2 }}
      className="rounded-[28px] border border-white/10 bg-white/[0.04] backdrop-blur-xl p-5 md:p-8 flex flex-col h-full"
    >
      {/* HEADER */}
      <motion.div {...fieldMotion(0.05)}>
        <h2 className="text-2xl md:text-3xl font-bold mb-3">
          Get in Touch
        </h2>

        <p className="text-sm text-white/50 mb-7">
          Feel free to reach out if you want to collaborate,
          discuss ideas, or simply say hello.
        </p>
      </motion.div>

      {/* FORM */}
      <div className="space-y-4">
        {FIELDS.map(({ icon: Icon, placeholder, delay, multiline }) => (
          <motion.div key={placeholder} {...fieldMotion(delay)}>
            <div className="relative">
              {multiline ? (
                <>
                  <Icon className="absolute left-4 top-5 text-white/40" />
                  <textarea
                    rows={5}
                    placeholder={placeholder}
                    className={`${INPUT_CLASS} resize-none`}
                  />
                </>
              ) : (
                <>
                  <Icon className="absolute left-4 top-1/2 -translate-y-1/2 text-white/40" />
                  <input placeholder={placeholder} className={INPUT_CLASS} />
                </>
              )}
            </div>
          </motion.div>
        ))}

        {/* BUTTON */}
        <motion.button
          {...fieldMotion(0.28)}
          whileHover={hoverGrow}
          whileTap={{ scale: 0.97 }}
          className="w-full rounded-2xl py-4 bg-white/10 border border-white/10 flex items-center justify-center gap-2"
        >
          <Send size={16} />
          Send Message
        </motion.button>
      </div>

      {/* SOCIAL */}
      <div className="border-t border-white/10 pt-5 mt-6">
        <motion.p
          {...fieldMotion(0.34)}
          className="text-sm text-white/55 mb-4"
        >
          Connect With Me
        </motion.p>

        {/* GRID */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {socialLinks.map((item, i) => {
            const Icon = item.icon

            return (
              <motion.a
                key={item.title}
                href={item.link}
                target="_blank"
                rel="noopener noreferrer"
                {...fieldMotion(0.42 + i * 0.05)}
                whileHover={hoverGrow}
                className={`group relative overflow-hidden rounded-2xl border border-white/10 bg-black/20 p-3 flex items-center justify-between${item.wide ? ' sm:col-span-2 p-4' : ''}`}
              >
                <div className="absolute inset-0 bg-white/[0.04] translate-x-[-100%] group-hover:translate-x-0 transition-transform duration-700 ease-out" />

                <div className="relative z-10 flex items-center gap-3">
                  <Icon />

                  <div>
                    <p className="text-sm">{item.title}</p>
                    <p className="text-[11px] text-white/35">
                      {item.user}
                    </p>
                  </div>
                </div>

                <div className="relative z-10 opacity-0 group-hover:opacity-100 transition">
                  <div className="w-6 h-6 rounded-md bg-white/10 flex items-center justify-center">
                    <ArrowUpRight size={12} />
                  </div>
                </div>
              </motion.a>
            )
          })}
        </div>
      </div>
    </motion.div>
  )
}
