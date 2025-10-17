import { useEffect, useState } from 'react';

// Hook para renderizar contenido solo en el cliente
export function useClientOnly() {
  const [hasMounted, setHasMounted] = useState(false);

  useEffect(() => {
    // Usar requestAnimationFrame para asegurar que se ejecute después de la hidratación
    const timer = requestAnimationFrame(() => {
      setHasMounted(true);
    });

    return () => cancelAnimationFrame(timer);
  }, []);

  return hasMounted;
}
