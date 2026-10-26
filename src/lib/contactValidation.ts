// Shared by the contact form (instant feedback) and /api/contact (enforcement).

export const CONTACT_LIMITS = {
  name: 80,
  email: 254,
  message: 3000,
}

export type ContactInput = {
  name: string
  email: string
  message: string
}

export type ContactErrors = Partial<Record<keyof ContactInput, string>>

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/

export function validateContact({ name, email, message }: ContactInput): ContactErrors {
  const errors: ContactErrors = {}

  if (!name.trim()) errors.name = 'Please enter your name.'
  else if (name.trim().length > CONTACT_LIMITS.name) errors.name = 'Name is too long.'

  if (!email.trim()) errors.email = 'Please enter your email.'
  else if (!EMAIL_PATTERN.test(email.trim()) || email.length > CONTACT_LIMITS.email)
    errors.email = 'Please enter a valid email address.'

  if (message.trim().length < 10) errors.message = 'Please write at least 10 characters.'
  else if (message.trim().length > CONTACT_LIMITS.message)
    errors.message = `Please keep it under ${CONTACT_LIMITS.message} characters.`

  return errors
}
