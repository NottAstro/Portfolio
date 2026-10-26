'use client'

import { useState } from 'react'
import useRealtimeTable from '@/hooks/useRealtimeTable'
import {
  Comment,
  fetchCommentsService,
  createCommentService,
  likeCommentService,
  uploadCommentImageService,
} from '@/lib/commentService'

const likedKey = (id: number) => `liked-${id}`

// Comments this visitor already liked (remembered in localStorage)
const readLikedIds = (items: Comment[]) =>
  new Set(items.map((item) => item.id).filter((id) => localStorage.getItem(likedKey(id))))

export default function useComments() {
  const [comments, setComments] = useState<Comment[]>([])
  const [loading, setLoading] = useState(false)
  const [loadError, setLoadError] = useState(false)
  const [likedIds, setLikedIds] = useState<Set<number>>(new Set())

  useRealtimeTable('comments', 'comments-live', async () => {
    try {
      const items = await fetchCommentsService()
      setComments(items)
      setLikedIds(readLikedIds(items))
      setLoadError(false)
    } catch (err) {
      console.error(err)
      setLoadError(true)
    }
  })

  // Throws with a readable message when posting fails
  const addComment = async ({
    name,
    comment,
    image,
  }: {
    name: string
    comment: string
    image: File | null
  }) => {
    setLoading(true)

    try {
      let imageUrl: string | null = null

      if (image) {
        try {
          imageUrl = await uploadCommentImageService(image)
        } catch (err) {
          console.error(err)
          throw new Error('The image could not be uploaded. Try a smaller image or post without it.')
        }
      }

      try {
        const newComment = await createCommentService({ name, comment, imageUrl })

        // Instant UI update (without waiting for realtime)
        setComments((prev) => [newComment, ...prev.filter((item) => item.id !== newComment.id)])
      } catch (err) {
        console.error(err)
        throw new Error('Your comment could not be posted. Please try again.')
      }
    } finally {
      setLoading(false)
    }
  }

  const likeComment = async (id: number, currentLikes: number) => {
    if (likedIds.has(id)) return

    // Optimistic: show the like straight away, roll back if it fails
    setLikedIds((prev) => new Set(prev).add(id))
    setComments((prev) =>
      prev.map((item) => (item.id === id ? { ...item, likes: (item.likes || 0) + 1 } : item))
    )

    try {
      const newLikes = await likeCommentService(id, currentLikes)

      localStorage.setItem(likedKey(id), 'true')
      setComments((prev) =>
        prev.map((item) => (item.id === id ? { ...item, likes: newLikes } : item))
      )
    } catch (err) {
      console.error(err)
      setLikedIds((prev) => {
        const next = new Set(prev)
        next.delete(id)
        return next
      })
      setComments((prev) =>
        prev.map((item) => (item.id === id ? { ...item, likes: currentLikes || 0 } : item))
      )
    }
  }

  return {
    comments,
    loading,
    loadError,
    likedIds,
    addComment,
    likeComment,
  }
}
