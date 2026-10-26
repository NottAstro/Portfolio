import { supabase } from '@/lib/supabase'
import { uploadPublicImage } from '@/lib/storage'

export type Comment = {
  id: number
  name: string
  comment: string
  image_url: string | null
  likes: number
  is_pinned: boolean
  liked_by_admin: boolean
  replies: { username: string; message: string; created_at: string }[]
  created_at: string
}

export const COMMENT_LIMITS = {
  name: 60,
  comment: 1000,
  imageBytes: 5 * 1024 * 1024,
}

export const fetchCommentsService = async () => {
  const { data, error } = await supabase
    .from('comments')
    .select('*')
    .order('is_pinned', { ascending: false })
    .order('created_at', { ascending: false })

  if (error) throw error

  return (data || []) as Comment[]
}

// Adds one like atomically via the `increment_comment_likes` database function
// (see supabase/contact_and_comments.sql). Until that script has been run it
// falls back to a direct update, and throws if the database rejected it.
export const likeCommentService = async (id: number, currentLikes: number) => {
  const { data, error } = await supabase.rpc('increment_comment_likes', {
    comment_id: id,
  })

  if (!error) return data as number

  if (error.code !== 'PGRST202') throw error

  const newLikes = (currentLikes || 0) + 1

  const { data: rows, error: updateError } = await supabase
    .from('comments')
    .update({ likes: newLikes })
    .eq('id', id)
    .select('id')

  if (updateError) throw updateError
  if (!rows?.length) throw new Error('Likes are not enabled for visitors yet.')

  return newLikes
}

export const uploadCommentImageService = (image: File) => {
  const safeName = image.name.toLowerCase().replace(/[^a-z0-9.]+/g, '-').slice(-60)

  return uploadPublicImage('comments', `${Date.now()}-${safeName}`, image)
}

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
        name: name.trim().slice(0, COMMENT_LIMITS.name),
        comment: comment.trim().slice(0, COMMENT_LIMITS.comment),
        image_url: imageUrl,
        likes: 0,
        replies: [],
        is_pinned: false,
      },
    ])
    .select()
    .single()

  if (error) throw error

  return data as Comment
}
