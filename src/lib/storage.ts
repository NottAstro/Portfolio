import { supabase } from '@/lib/supabase'

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
