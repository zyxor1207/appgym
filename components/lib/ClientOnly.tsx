'use client';

import { useClientOnly } from './useClientOnly';

interface ClientOnlyProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

// Componente que solo renderiza su contenido en el cliente
export function ClientOnly({ children, fallback = null }: ClientOnlyProps) {
  const hasMounted = useClientOnly();

  if (!hasMounted) {
    return <>{fallback}</>;
  }

  return <>{children}</>;
}
