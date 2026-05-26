import { useEffect, useRef } from 'react';
import { supabase, isConfigured } from '../lib/supabase';
import { formatDate } from '../utils/formatDate';

/**
 * Subscribes to Supabase Realtime for new inquiries addressed to `ownerId`.
 * Calls `onNew(normalizedInquiry)` for each INSERT event.
 */
export function useRealtimeInquiries(ownerId, onNew) {
  const onNewRef = useRef(onNew);
  onNewRef.current = onNew;

  useEffect(() => {
    if (!isConfigured || !ownerId) return;

    const channel = supabase
      .channel(`inquiries-owner-${ownerId}`)
      .on(
        'postgres_changes',
        {
          event:  'INSERT',
          schema: 'public',
          table:  'inquiries',
          filter: `owner_id=eq.${ownerId}`,
        },
        (payload) => {
          const q = payload.new;
          onNewRef.current({
            id:            q.id,
            senderName:    q.sender_name  || 'زائر',
            senderPhone:   q.sender_phone || '',
            propertyTitle: q.property_title,
            propertyId:    q.property_id,
            message:       q.message,
            date:          formatDate(q.created_at),
            status:        q.status || 'جديد',
            _realtime:     true,
          });
        }
      )
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [ownerId]);
}
