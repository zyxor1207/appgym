'use client';

import { useEffect, useState } from 'react';
import { supabase } from './lib/supabaseClient';

export default function SupabaseProbe() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    
    // Solo ejecutar la prueba después de que el componente esté montado
    const testConnection = async () => {
      try {
        const { data, error } = await supabase.from('productos').select('*').limit(1);
        console.log('[SupabaseProbe] select productos →', { data, error });
      } catch (e) {
        console.error('[SupabaseProbe] error connecting to Supabase', e);
      }
    };

    // Ejecutar con un pequeño delay para evitar problemas de hidratación
    const timeoutId = setTimeout(testConnection, 100);
    
    return () => clearTimeout(timeoutId);
  }, []);

  // No renderizar nada hasta que esté montado
  if (!mounted) {
    return null;
  }

  return null;
}


