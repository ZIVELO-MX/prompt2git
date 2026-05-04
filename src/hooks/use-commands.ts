'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { createClient } from '@/lib/supabase/client'
import type { Command } from '@/types'

const PAGE_SIZE = 50

export function useCommands() {
  const [commands, setCommands]   = useState<Command[]>([])
  const [loading, setLoading]     = useState(true)
  const [hasMore, setHasMore]     = useState(false)
  const supabase                  = useRef(createClient()).current

  const load = useCallback(async (reset = true) => {
    if (reset) setLoading(true)

    const offset = reset ? 0 : commands.length
    const { data, error } = await supabase
      .from('commands')
      .select('*')
      .order('created_at', { ascending: false })
      .range(offset, offset + PAGE_SIZE - 1)

    if (!error && data) {
      const typed = data as unknown as Command[]
      setCommands(prev => reset ? typed : [...prev, ...typed])
      setHasMore(data.length === PAGE_SIZE)
    }

    if (reset) setLoading(false)
  }, [supabase, commands.length])

  useEffect(() => {
    load(true)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const append = useCallback((cmd: Command) => {
    setCommands(prev => {
      if (prev.find(c => c.id === cmd.id)) return prev
      return [cmd, ...prev]
    })
  }, [])

  const clear = useCallback(async () => {
    await supabase.from('commands').delete().neq('id', '')
    setCommands([])
  }, [supabase])

  const loadMore = useCallback(() => load(false), [load])

  return { commands, loading, hasMore, append, clear, refresh: () => load(true), loadMore }
}
