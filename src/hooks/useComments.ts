'use client'

import { useState } from 'react'
import useRealtimeTable from '@/hooks/useRealtimeTable'
import {
  fetchCommentsService,
  createCommentService,
  likeCommentService,
  uploadCommentImageService,
} from '@/lib/commentService'

export default function useComments() {
  const [comments, setComments] = useState<any[]>([])
  const [loading, setLoading] = useState(false)

  useRealtimeTable('comments', 'comments-live', async () => {
    try {
      setComments(await fetchCommentsService())
    } catch (err) {
      console.error(err)
    }
  })

  const addComment = async ({
    name,
    comment,
    image,
  }: {
    name: string
    comment: string
    image: File | null
  }) => {
    if (!name.trim() || !comment.trim()) return

    setLoading(true)

    try {
      const imageUrl = image
        ? await uploadCommentImageService(image)
        : null

      const newComment = await createCommentService({
        name,
        comment,
        imageUrl,
      })

      // Instant UI update (without waiting for realtime)
      setComments((prev) => [newComment, ...prev])
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const likeComment = async (id: number, currentLikes: number) => {
    if (localStorage.getItem(`liked-${id}`)) return

    try {
      const newLikes = await likeCommentService(id, currentLikes)

      localStorage.setItem(`liked-${id}`, 'true')

      setComments((prev) =>
        prev.map((item) =>
          item.id === id ? { ...item, likes: newLikes } : item
        )
      )
    } catch (err) {
      console.error(err)
    }
  }

  return {
    comments,
    loading,
    addComment,
    likeComment,
  }
}
