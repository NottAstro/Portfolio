'use client'

import { useRef, useState } from 'react'
import { motion, AnimatePresence, Variants } from 'framer-motion'
import { Upload, Heart, Pin, X, CheckCircle2, AlertCircle } from 'lucide-react'
import useComments from '@/hooks/useComments'
import { COMMENT_LIMITS } from '@/lib/commentService'
import { EASE } from '@/lib/motion'

const containerVariants: Variants = {
  hidden: {},
  show: {
    transition: {
      staggerChildren: 0.06,
    },
  },
}

const itemVariants: Variants = {
  hidden: {
    opacity: 0,
    y: 20,
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

type Notice = { kind: 'success' | 'error'; text: string } | null

export default function CommentsSection() {
  const { comments, loading, loadError, likedIds, addComment, likeComment } =
    useComments()

  const [name, setName] = useState('')
  const [comment, setComment] = useState('')
  const [image, setImage] = useState<File | null>(null)
  const [preview, setPreview] = useState<string | null>(null)
  const [notice, setNotice] = useState<Notice>(null)
  const fileInput = useRef<HTMLInputElement>(null)

  const clearImage = () => {
    if (preview) URL.revokeObjectURL(preview)
    setImage(null)
    setPreview(null)
    if (fileInput.current) fileInput.current.value = ''
  }

  const handleImage = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = e.target.files?.[0]
    if (!file) return

    if (!file.type.startsWith('image/')) {
      clearImage()
      setNotice({ kind: 'error', text: 'Please choose an image file (JPG, PNG, GIF or WebP).' })
      return
    }

    if (file.size > COMMENT_LIMITS.imageBytes) {
      clearImage()
      setNotice({ kind: 'error', text: 'That image is larger than 5 MB. Please choose a smaller one.' })
      return
    }

    if (preview) URL.revokeObjectURL(preview)
    setImage(file)
    setPreview(URL.createObjectURL(file))
    setNotice(null)
  }

  const handleSubmit = async () => {
    if (loading) return

    if (!name.trim() || !comment.trim()) {
      setNotice({ kind: 'error', text: 'Please enter your name and a comment.' })
      return
    }

    try {
      await addComment({
        name,
        comment,
        image,
      })

      setName('')
      setComment('')
      clearImage()
      setNotice({ kind: 'success', text: 'Thanks! Your comment has been posted.' })
    } catch (err) {
      setNotice({
        kind: 'error',
        text: err instanceof Error ? err.message : 'Your comment could not be posted.',
      })
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, x: 40 }}
      whileInView={{ opacity: 1, x: 0 }}
      transition={{
        duration: 0.8,
        ease: EASE,
      }}
      viewport={{ once: false, amount: 0.2 }}
      className="rounded-[28px] md:rounded-[34px] border border-white/10 bg-white/5 backdrop-blur-xl p-5 md:p-8 lg:p-6 h-full flex flex-col"
    >
      {/* HEADER */}
      <div className="mb-5 md:mb-6 lg:mb-4 shrink-0">
        <h3 className="text-xl md:text-2xl font-semibold mb-1">
          Comments
        </h3>

        <p className="text-xs md:text-sm text-white/40">
          Share your thoughts below.
        </p>
      </div>

      {/* FORM */}
      <motion.div
        variants={containerVariants}
        initial="hidden"
        whileInView="show"
        viewport={{ once: false }}
        className="space-y-3 md:space-y-4 lg:space-y-3 mb-5 md:mb-6 lg:mb-4 shrink-0"
      >
        <motion.input
          variants={itemVariants}
          value={name}
          onChange={(e) => {
            setName(e.target.value)
            setNotice(null)
          }}
          placeholder="Your Name"
          aria-label="Your Name"
          autoComplete="name"
          maxLength={COMMENT_LIMITS.name}
          disabled={loading}
          className="w-full rounded-2xl border border-white/15 bg-black/20 px-4 py-3 md:py-4 lg:py-3 outline-none focus:border-white"
        />

        <motion.textarea
          variants={itemVariants}
          rows={4}
          value={comment}
          onChange={(e) => {
            setComment(e.target.value)
            setNotice(null)
          }}
          placeholder="Your Comment"
          aria-label="Your Comment"
          maxLength={COMMENT_LIMITS.comment}
          disabled={loading}
          className="w-full rounded-2xl border border-white/15 bg-black/20 px-4 py-3 md:py-4 lg:py-3 outline-none resize-none focus:border-white lg:h-[76px]"
        />

        <motion.label
          variants={itemVariants}
          className="rounded-2xl border border-dashed border-white/15 bg-black/20 p-3 md:p-4 lg:p-3 flex items-center gap-3 cursor-pointer"
        >
          <Upload size={16} />

          <span className="text-xs md:text-sm text-white/65 truncate">
            {image ? image.name : 'Upload Image'}
          </span>

          <span className="ml-auto text-[11px] text-white/30 shrink-0">
            Optional, max 5 MB
          </span>

          <input
            ref={fileInput}
            hidden
            type="file"
            accept="image/png,image/jpeg,image/gif,image/webp"
            onChange={handleImage}
            disabled={loading}
          />
        </motion.label>

        <AnimatePresence>
          {preview && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="relative"
            >
              <img
                src={preview}
                alt="Selected image preview"
                className="rounded-2xl h-36 md:h-44 lg:h-24 w-full object-cover border border-white/10"
              />
              <button
                type="button"
                onClick={clearImage}
                aria-label="Remove image"
                className="absolute top-2 right-2 w-7 h-7 rounded-full bg-black/70 border border-white/20 flex items-center justify-center hover:bg-black"
              >
                <X size={14} />
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        <motion.button
          variants={itemVariants}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={handleSubmit}
          disabled={loading}
          className="w-full rounded-2xl py-3 md:py-4 lg:py-3 bg-white/10 border border-white/10 transition-all disabled:opacity-60 disabled:cursor-wait"
        >
          {loading ? 'Posting...' : 'Post Comment'}
        </motion.button>

        <div aria-live="polite">
          {notice && (
            <p
              className={`flex items-center gap-2 text-sm ${
                notice.kind === 'success' ? 'text-emerald-300' : 'text-red-300'
              }`}
            >
              {notice.kind === 'success' ? (
                <CheckCircle2 size={16} className="shrink-0" />
              ) : (
                <AlertCircle size={16} className="shrink-0" />
              )}
              {notice.text}
            </p>
          )}
        </div>
      </motion.div>

      {/* COMMENTS LIST */}
      <motion.div
        variants={containerVariants}
        initial="hidden"
        whileInView="show"
        viewport={{ once: false }}
        className="rounded-[24px] md:rounded-[28px] border border-white/10 bg-black/20 p-3 h-[320px] md:h-[420px] lg:h-auto lg:flex-1 lg:min-h-[140px] overflow-y-auto custom-scroll"
      >
        {comments.length === 0 && (
          <p className="h-full min-h-[100px] flex items-center justify-center text-center text-sm text-white/35 px-4">
            {loadError
              ? 'Comments could not be loaded right now.'
              : 'No comments yet. Be the first to leave one!'}
          </p>
        )}

        <div className="space-y-3">
          <AnimatePresence initial={false}>
            {comments.map((item, i) => (
              <motion.div
                key={item.id || i}
                layout
                initial={{
                  opacity: 0,
                  y: 18,
                  scale: 0.96,
                  filter: 'blur(6px)',
                }}
                animate={{
                  opacity: 1,
                  y: 0,
                  scale: 1,
                  filter: 'blur(0px)',
                }}
                exit={{
                  opacity: 0,
                  y: -10,
                  scale: 0.96,
                }}
                transition={{
                  duration: 0.55,
                  ease: EASE,
                  layout: {
                    duration: 0.45,
                    ease: EASE,
                  },
                }}
                className={`rounded-[20px] md:rounded-[24px] border p-3 md:p-4 ${
                  item.is_pinned
                    ? 'border-purple-500/30 bg-purple-500/5'
                    : 'border-white/10 bg-white/[0.03]'
                }`}
              >
                <div className="flex gap-3">
                  <div className="w-9 h-9 md:w-10 md:h-10 rounded-full bg-white/10 flex items-center justify-center text-xs font-semibold shrink-0">
                    {item.name?.charAt(0)}
                  </div>

                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1 flex-wrap">
                      <p className="text-sm font-medium">
                        {item.name}
                      </p>

                      {item.is_pinned && (
                        <div className="flex items-center gap-1 px-2 py-[3px] rounded-full bg-purple-500/15 border border-purple-500/20 text-[10px] text-purple-300">
                          <Pin size={10} />
                          PINNED
                        </div>
                      )}
                    </div>

                    <p className="text-[12px] md:text-[13px] text-white/55">
                      {item.comment}
                    </p>

                    {item.image_url && (
                      <img
                        src={item.image_url}
                        alt="Comment"
                        loading="lazy"
                        decoding="async"
                        className="mt-3 rounded-xl w-full max-h-48 md:max-h-56 object-cover border border-white/10"
                      />
                    )}
                  </div>

                  <button
                    onClick={() =>
                      likeComment(item.id, item.likes)
                    }
                    disabled={likedIds.has(item.id)}
                    aria-label={likedIds.has(item.id) ? 'You liked this comment' : 'Like this comment'}
                    className={`flex items-center gap-1 text-[11px] transition-colors self-start ${
                      likedIds.has(item.id)
                        ? 'text-pink-400 cursor-default'
                        : 'text-white/40 hover:text-white'
                    }`}
                  >
                    <Heart size={13} fill={likedIds.has(item.id) ? 'currentColor' : 'none'} />
                    {item.likes || 0}
                  </button>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      </motion.div>
    </motion.div>
  )
}