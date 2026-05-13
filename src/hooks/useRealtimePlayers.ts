// =============================================
// Hook: useRealtimePlayers
// Subscribe to player list changes for a room
// =============================================

'use client';

import { useEffect, useState, useCallback } from 'react';
import { supabase } from '@/lib/supabase/client';
import type { Player } from '@/types';

export function useRealtimePlayers(roomId: string | null) {
  const [players, setPlayers] = useState<Player[]>([]);

  const fetchPlayers = useCallback(async () => {
    if (!roomId) return;
    const { data } = await supabase
      .from('players')
      .select('*')
      .eq('room_id', roomId)
      .order('score', { ascending: false });

    if (data) setPlayers(data as Player[]);
  }, [roomId]);

  useEffect(() => {
    if (!roomId) return;

    // Initial fetch
    fetchPlayers();

    // Subscribe to changes
    const channel = supabase
      .channel(`players:${roomId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'players',
          filter: `room_id=eq.${roomId}`,
        },
        () => {
          // Re-fetch all players on any change to keep sorted order
          fetchPlayers();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [roomId, fetchPlayers]);

  return { players, refetchPlayers: fetchPlayers };
}
