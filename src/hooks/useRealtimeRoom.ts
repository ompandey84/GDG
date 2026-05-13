// =============================================
// Hook: useRealtimeRoom
// Subscribe to room status changes & broadcast events
// =============================================

'use client';

import { useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabase/client';
import type { Room } from '@/types';

interface UseRealtimeRoomProps {
  roomId: string | null;
  onRoomUpdate: (room: Room) => void;
  onBroadcast?: (event: string, payload: Record<string, unknown>) => void;
}

export function useRealtimeRoom({ roomId, onRoomUpdate, onBroadcast }: UseRealtimeRoomProps) {
  const broadcastEvent = useCallback(
    (event: string, payload: Record<string, unknown>) => {
      if (!roomId) return;
      const channel = supabase.channel(`room:${roomId}`);
      channel.send({
        type: 'broadcast',
        event,
        payload,
      });
    },
    [roomId]
  );

  useEffect(() => {
    if (!roomId) return;

    // Subscribe to room table changes
    const roomChannel = supabase
      .channel(`room-changes:${roomId}`)
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'rooms',
          filter: `id=eq.${roomId}`,
        },
        (payload) => {
          onRoomUpdate(payload.new as Room);
        }
      )
      .subscribe();

    // Subscribe to broadcast events
    const broadcastChannel = supabase
      .channel(`room:${roomId}`)
      .on('broadcast', { event: '*' }, (payload) => {
        if (onBroadcast) {
          onBroadcast(payload.event, payload.payload as Record<string, unknown>);
        }
      })
      .subscribe();

    return () => {
      supabase.removeChannel(roomChannel);
      supabase.removeChannel(broadcastChannel);
    };
  }, [roomId, onRoomUpdate, onBroadcast]);

  return { broadcastEvent };
}
