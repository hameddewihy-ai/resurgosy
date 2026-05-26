import { supabase, isConfigured } from '../lib/supabase';

// Fire-and-forget — email is supplementary to in-app notifications
export const sendEmail = ({ to, subject, html }) => {
  if (!isConfigured || !to || !subject || !html) return;
  supabase.functions.invoke('send-email', { body: { to, subject, html } }).catch(() => {});
};
