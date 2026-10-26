import { supabase } from '@/lib/supabase'
import { uploadPublicImage } from '@/lib/storage'

export const fetchCommentsService = async () => {
  const { data, error } = await supabase
    .from('comments')
    .select('*')
    .order('is_pinned', { ascending: false })
    .order('created_at', { ascending: false })

  if (error) throw error

  return data || []
}

export const likeCommentService = async (
  id: number,
  currentLikes: number
) => {
  const newLikes = (currentLikes || 0) + 1

  const { error } = await supabase
    .from('comments')
    .update({ likes: newLikes })
    .eq('id', id)

  if (error) throw error

  return newLikes
}

export const uploadCommentImageService = (image: File) =>
  uploadPublicImage('comments', `${Date.now()}-${image.name}`, image)

export const createCommentService = async ({
  name,
  comment,
  imageUrl,
}: {
  name: string
  comment: string
  imageUrl: string | null
}) => {
  const { data, error } = await supabase
    .from('comments')
    .insert([
      {
        name,
        comment,
        image_url: imageUrl,
        likes: 0,
        replies: [],
        is_pinned: false,
      },
    ])
    .select()
    .single()

  if (error) throw error

  return data
}
