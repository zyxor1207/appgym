'use client';

import { useEffect } from 'react';
import { supabase } from './lib/supabaseClient';

export default function SupabaseProbe() {
  useEffect(() => {
    (async () => {
      try {
        const { data, error } = await supabase.from('productos').select('*').limit(1);
        console.log('[SupabaseProbe] select productos →', { data, error });
      } catch (e) {
        console.error('[SupabaseProbe] error connecting to Supabase', e);
      }
    })();
  }, []);

  return null;
}


