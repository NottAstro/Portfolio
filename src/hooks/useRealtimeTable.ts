'use client'

import { useEffect, useEffectEvent } from 'react'
import { supabase } from '@/lib/supabase'

// Calls `onChange` on mount and whenever any row in `table` changes.
export default function useRealtimeTable(
  table: string,
  channelName: string,
  onChange: () => void
) {
  const handleChange = useEffectEvent(onChange)

  useEffect(() => {
    handleChange()

    const channel = supabase
      .channel(channelName)
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table },
        () => handleChange()
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [table, channelName])
}
