'use client'

import { useState } from 'react'
import { motion, Variants } from 'framer-motion'
import {
  Send,
  User,
  Mail,
  MessageSquare,
  ArrowUpRight,
  CheckCircle2,
  AlertCircle,
  Loader2,
} from 'lucide-react'
import { FaLinkedinIn, FaGithub } from 'react-icons/fa'
import { EASE } from '@/lib/motion'
import {
  CONTACT_LIMITS,
  ContactErrors,
  ContactInput,
  validateContact,
} from '@/lib/contactValidation'

const CONTACT_EMAIL = 'aaryanjain7821@gmail.com'

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
  'w-full rounded-2xl border bg-black/20 pl-12 pr-4 py-4 lg:py-3 outline-none transition duration-200 focus:border-white focus:ring-1 focus:ring-white/40 disabled:opacity-60'

const FIELDS: {
  key: keyof ContactInput
  icon: typeof User
  placeholder: string
  delay: number
  type?: string
  autoComplete: string
  multiline?: boolean
}[] = [
  { key: 'name', icon: User, placeholder: 'Your Name', delay: 0.1, autoComplete: 'name' },
  { key: 'email', icon: Mail, placeholder: 'Your Email', delay: 0.16, type: 'email', autoComplete: 'email' },
  { key: 'message', icon: MessageSquare, placeholder: 'Your Message', delay: 0.22, autoComplete: 'off', multiline: true },
]

const socialLinks = [
  {
    title: 'GitHub',
    user: '@NottAstro',
    icon: FaGithub,
    link: 'https://github.com/NottAstro',
    wide: true,
  },
  {
    title: 'LinkedIn',
    user: '@jainaaryan0410',
    icon: FaLinkedinIn,
    link: 'https://www.linkedin.com/in/jainaaryan0410',
  },
  {
    title: 'Email',
    user: CONTACT_EMAIL,
    icon: Mail,
    link: `mailto:${CONTACT_EMAIL}`,
  },
]

const EMPTY: ContactInput = { name: '', email: '', message: '' }

type Status =
  | { state: 'idle' }
  | { state: 'sending' }
  | { state: 'sent' }
  | { state: 'error'; message: string }

export default function ContactForm() {
  const [values, setValues] = useState<ContactInput>(EMPTY)
  const [errors, setErrors] = useState<ContactErrors>({})
  const [honeypot, setHoneypot] = useState('')
  const [status, setStatus] = useState<Status>({ state: 'idle' })

  const sending = status.state === 'sending'

  const update = (key: keyof ContactInput, value: string) => {
    setValues((prev) => ({ ...prev, [key]: value }))
    if (errors[key]) setErrors((prev) => ({ ...prev, [key]: undefined }))
    if (status.state === 'sent' || status.state === 'error') setStatus({ state: 'idle' })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (sending) return

    const found = validateContact(values)
    setErrors(found)
    if (Object.keys(found).length) return

    setStatus({ state: 'sending' })

    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...values, website: honeypot }),
      })
      const data = await res.json().catch(() => ({}))

      if (!res.ok) {
        if (data.errors) setErrors(data.errors)
        setStatus({ state: 'error', message: data.error || 'Something went wrong.' })
        return
      }

      setValues(EMPTY)
      setStatus({ state: 'sent' })
    } catch {
      setStatus({ state: 'error', message: 'Network error. Please check your connection.' })
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, x: -40 }}
      whileInView={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.8, ease: EASE }}
      viewport={{ once: false, amount: 0.2 }}
      className="rounded-[28px] border border-white/10 bg-white/[0.04] backdrop-blur-xl p-5 md:p-8 lg:p-6 flex flex-col h-full"
    >
      {/* HEADER */}
      <motion.div {...fieldMotion(0.05)}>
        <h2 className="text-2xl md:text-3xl lg:text-2xl font-bold mb-3 lg:mb-1.5">
          Get in Touch
        </h2>

        <p className="text-sm text-white/50 mb-7 lg:mb-4">
          Feel free to reach out if you want to collaborate,
          discuss ideas, or simply say hello.
        </p>
      </motion.div>

      {/* FORM (the message box stretches to fill spare height on desktop) */}
      <form
        onSubmit={handleSubmit}
        noValidate
        className="relative flex flex-col gap-4 lg:gap-3 lg:flex-1 lg:min-h-0"
      >
        {/* Hidden from people; spam bots fill it in */}
        <input
          type="text"
          name="website"
          value={honeypot}
          onChange={(e) => setHoneypot(e.target.value)}
          tabIndex={-1}
          autoComplete="off"
          aria-hidden="true"
          className="absolute -left-[9999px] w-px h-px opacity-0"
        />

        {FIELDS.map(({ key, icon: Icon, placeholder, delay, type, autoComplete, multiline }) => {
          const error = errors[key]
          const fieldClass = `${INPUT_CLASS} ${error ? 'border-red-400/70' : 'border-white/15'}`
          const shared = {
            id: `contact-${key}`,
            name: key,
            value: values[key],
            placeholder,
            autoComplete,
            maxLength: CONTACT_LIMITS[key],
            disabled: sending,
            'aria-label': placeholder,
            'aria-invalid': !!error,
            'aria-describedby': error ? `contact-${key}-error` : undefined,
          }

          return (
            <motion.div
              key={key}
              {...fieldMotion(delay)}
              className={multiline ? 'flex flex-col lg:flex-1 lg:min-h-[76px]' : undefined}
            >
              <div className={`relative ${multiline ? 'lg:flex-1 lg:min-h-0' : ''}`}>
                {multiline ? (
                  <>
                    <Icon className="absolute left-4 top-5 text-white/40" />
                    <textarea
                      {...shared}
                      rows={5}
                      onChange={(e) => update(key, e.target.value)}
                      className={`${fieldClass} resize-none lg:h-full`}
                    />
                  </>
                ) : (
                  <>
                    <Icon className="absolute left-4 top-1/2 -translate-y-1/2 text-white/40" />
                    <input
                      {...shared}
                      type={type || 'text'}
                      onChange={(e) => update(key, e.target.value)}
                      className={fieldClass}
                    />
                  </>
                )}
              </div>

              {error && (
                <p id={`contact-${key}-error`} className="mt-1.5 pl-2 text-xs text-red-300">
                  {error}
                </p>
              )}
            </motion.div>
          )
        })}

        {/* BUTTON */}
        <motion.button
          type="submit"
          disabled={sending}
          {...fieldMotion(0.28)}
          whileHover={sending ? undefined : hoverGrow}
          whileTap={sending ? undefined : { scale: 0.97 }}
          className="w-full rounded-2xl py-4 lg:py-3 bg-white/10 border border-white/10 flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-wait"
        >
          {sending ? <Loader2 size={16} className="animate-spin" /> : <Send size={16} />}
          {sending ? 'Sending...' : 'Send Message'}
        </motion.button>

        {/* RESULT */}
        <div aria-live="polite">
          {status.state === 'sent' && (
            <p className="flex items-center gap-2 text-sm text-emerald-300">
              <CheckCircle2 size={16} className="shrink-0" />
              Thanks! Your message was sent. I&apos;ll get back to you soon.
            </p>
          )}
          {status.state === 'error' && (
            <p className="flex items-start gap-2 text-sm text-red-300">
              <AlertCircle size={16} className="shrink-0 mt-0.5" />
              <span>
                {status.message} You can also email me at{' '}
                <a href={`mailto:${CONTACT_EMAIL}`} className="underline">
                  {CONTACT_EMAIL}
                </a>
                .
              </span>
            </p>
          )}
        </div>
      </form>

      {/* SOCIAL */}
      <div className="border-t border-white/10 pt-5 mt-6 lg:pt-4 lg:mt-4">
        <motion.p
          {...fieldMotion(0.34)}
          className="text-sm text-white/55 mb-4 lg:mb-3"
        >
          Connect With Me
        </motion.p>

        {/* GRID */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {socialLinks.map((item, i) => {
            const Icon = item.icon
            const external = item.link.startsWith('http')

            return (
              <motion.a
                key={item.title}
                href={item.link}
                {...(external && { target: '_blank', rel: 'noopener noreferrer' })}
                {...fieldMotion(0.42 + i * 0.05)}
                whileHover={hoverGrow}
                className={`group relative overflow-hidden rounded-2xl border border-white/10 bg-black/20 p-3 flex items-center justify-between${item.wide ? ' sm:col-span-2 p-4' : ''}`}
              >
                <div className="absolute inset-0 bg-white/[0.04] translate-x-[-100%] group-hover:translate-x-0 transition-transform duration-700 ease-out" />

                <div className="relative z-10 flex items-center gap-3 min-w-0">
                  <Icon className="shrink-0" />

                  <div className="min-w-0">
                    <p className="text-sm">{item.title}</p>
                    <p className="text-[11px] text-white/35 truncate" title={item.user}>
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
