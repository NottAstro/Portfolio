import { supabase } from '@/lib/supabase'

// Unique, URL-safe storage name for an uploaded file, e.g. "1730000000000-my-photo.png"
export const storageFileName = (file: File, prefix = '') =>
  `${prefix}${Date.now()}-${Math.random().toString(36).slice(2, 8)}-${file.name
    .toLowerCase()
    .replace(/[^a-z0-9.]+/g, '-')
    .slice(-60)}`

// Uploads a file to a public Supabase Storage bucket and returns its URL.
export const uploadPublicImage = async (
  bucket: string,
  fileName: string,
  file: File
) => {
  const { error } = await supabase.storage.from(bucket).upload(fileName, file)

  if (error) throw error

  return supabase.storage.from(bucket).getPublicUrl(fileName).data.publicUrl
}
