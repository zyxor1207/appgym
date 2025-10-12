'use client';

import UserManagement from '../../components/UserManagement';
import { useRouter } from 'next/navigation';

export default function UsuariosPage() {
  const router = useRouter();

  const handlePageChange = (page: string) => {
    if (page === 'home') {
      router.push('/');
    }
    // Puedes agregar más rutas según necesites
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-indigo-900 to-slate-900">
      <UserManagement onPageChange={handlePageChange} readOnly />
    </div>
  );
}
