'use client';

import { useState, useEffect } from 'react';
import { supabase } from './lib/supabaseClient';

interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
  membershipType: 'day' | 'week' | 'month';
  startDate: string;
  endDate: string;
  isActive: boolean;
}

interface UserManagementProps {
  onPageChange: (page: string) => void;
  readOnly?: boolean;
}

export default function UserManagement({ onPageChange, readOnly = false }: UserManagementProps) {
  const [users, setUsers] = useState<User[]>([]);
  const [showUserForm, setShowUserForm] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<'all' | 'active' | 'inactive'>('all');
  const [isClient, setIsClient] = useState(false);
  const [isClosingAddModal, setIsClosingAddModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [showMembershipOverlay, setShowMembershipOverlay] = useState(false);
  const [overlayEnter, setOverlayEnter] = useState(false);
  const [loadingUsers, setLoadingUsers] = useState(false);
  const [showRenewalForm, setShowRenewalForm] = useState(false);
  const [userToRenew, setUserToRenew] = useState<User | null>(null);
  const [renewalData, setRenewalData] = useState({
    membershipType: 'month' as 'day' | 'week' | 'month',
    startDate: new Date().toISOString().split('T')[0]
  });
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [userToDelete, setUserToDelete] = useState<User | null>(null);

  const [newUser, setNewUser] = useState({
    name: '',
    email: '',
    phone: '',
    membershipType: 'month' as 'day' | 'week' | 'month',
    startDate: new Date().toISOString().split('T')[0], // Fecha de hoy por defecto
    endDate: '' // Se calculará automáticamente
  });

  // Inicializar fecha final cuando se carga el componente
  useEffect(() => {
    const today = new Date().toISOString().split('T')[0];
    const calculatedEndDate = calculateEndDate(today, newUser.membershipType);
    setNewUser(prev => ({ ...prev, endDate: calculatedEndDate }));
  }, []);

  // Función para calcular fecha final basada en fecha de inicio y tipo de membresía
  const calculateEndDate = (startDate: string, membershipType: 'day' | 'week' | 'month'): string => {
    const start = new Date(startDate);
    const end = new Date(start);
    
    switch (membershipType) {
      case 'day':
        end.setDate(start.getDate() + 1);
        break;
      case 'week':
        end.setDate(start.getDate() + 7);
        break;
      case 'month':
        // Agregar exactamente un mes, manejando casos especiales
        const currentMonth = start.getMonth();
        const currentYear = start.getFullYear();
        const nextMonth = currentMonth === 11 ? 0 : currentMonth + 1;
        const nextYear = currentMonth === 11 ? currentYear + 1 : currentYear;
        end.setFullYear(nextYear, nextMonth, start.getDate());
        
        // Si el día no existe en el próximo mes (ej: 31 de enero -> 28/29 de febrero)
        if (end.getDate() !== start.getDate()) {
          end.setDate(0); // Último día del mes anterior
        }
        break;
    }
    
    return end.toISOString().split('T')[0];
  };

  // Cargar datos desde Supabase
  useEffect(() => {
    setIsClient(true);
    loadUsersFromSupabase();
    // Suscripción en tiempo real a cambios en la tabla usuarios
    const channel = supabase
      .channel('usuarios-changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'usuarios' }, () => {
        // Recargar cuando haya INSERT/UPDATE/DELETE
        loadUsersFromSupabase();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  // Función para verificar y actualizar el estado de usuarios basado en fecha de vencimiento
  const updateUserStatusBasedOnMembership = (userList: User[]) => {
    const now = new Date();
    return userList.map(user => {
      const endDate = new Date(user.endDate);
      const isExpired = endDate < now;
      return {
        ...user,
        isActive: !isExpired
      };
    });
  };

  const loadUsersFromSupabase = async () => {
    setLoadingUsers(true);
    try {
      const { data, error } = await supabase
        .from('usuarios')
        .select('*')
        .order('id', { ascending: false });
      
      if (error) {
        console.error('❌ Error cargando usuarios:', error);
        alert(`Error cargando usuarios: ${error.message}`);
        // Fallback a localStorage si hay error
        const savedUsers = localStorage.getItem('gymUsers');
        if (savedUsers) {
          setUsers(JSON.parse(savedUsers));
        }
        return;
      }
      
      if (data) {
        // Convertir datos de Supabase al formato esperado por la UI
        const convertedUsers: User[] = data.map((user: any) => {
          // Determinar tipo de membresía basado en el pago
          let membershipType: 'day' | 'week' | 'month' = 'month';
          if (user.pago === 50) membershipType = 'day';
          else if (user.pago === 300) membershipType = 'week';
          else if (user.pago === 800) membershipType = 'month';
          
          // Usar fechas existentes si están disponibles, sino calcular nuevas
          let startDate, endDate;
          
          if (user['fecha-inicio'] && user['fecha-final']) {
            // Usar las cadenas de fecha de la BD directamente para evitar issues de zona horaria
            startDate = user['fecha-inicio'];
            endDate = user['fecha-final'];
          } else if (user.start_date && user.end_date) {
            // Fallback a nombres antiguos de columnas
            startDate = user.start_date;
            endDate = user.end_date;
          } else if (user.fecha_inicio && user.fecha_final) {
            // Fallback a nombres con underscore
            startDate = user.fecha_inicio;
            endDate = user.fecha_final;
          } else if (user.fechaInicio && user.fechaFinal) {
            // Fallback a camelCase
            startDate = user.fechaInicio;
            endDate = user.fechaFinal;
          } else {
            // Calcular fechas nuevas basadas en el tipo de membresía
            const start = new Date();
            const end = new Date(start);
            
            switch (membershipType) {
              case 'day':
                end.setDate(start.getDate() + 1);
                break;
              case 'week':
                end.setDate(start.getDate() + 7);
                break;
              case 'month':
                end.setMonth(start.getMonth() + 1);
                break;
            }
            startDate = start.toISOString().split('T')[0];
            endDate = end.toISOString().split('T')[0];
          }
          
          const convertedUser = {
            id: user.id.toString(),
            name: user.nombre,
            email: user.email,
            phone: user.telefono || '',
            membershipType,
            startDate: typeof startDate === 'string' ? startDate : new Date(startDate).toISOString().split('T')[0],
            endDate: typeof endDate === 'string' ? endDate : new Date(endDate).toISOString().split('T')[0],
            isActive: user.is_active !== undefined ? user.is_active : true
          };
          
          return convertedUser;
        });
        
        // Actualizar estado de usuarios basado en fechas de vencimiento
        const usersWithUpdatedStatus = updateUserStatusBasedOnMembership(convertedUsers);
        setUsers(usersWithUpdatedStatus);
        
        // También guardar en localStorage como backup
        localStorage.setItem('gymUsers', JSON.stringify(convertedUsers));
      } else {
        setUsers([]);
      }
    } catch (e) {
      console.error('Excepción cargando usuarios:', e);
      alert(`Error de conexión: ${e}`);
      // Fallback a localStorage
      const savedUsers = localStorage.getItem('gymUsers');
      if (savedUsers) setUsers(JSON.parse(savedUsers));
    } finally {
      setLoadingUsers(false);
    }
  };

  // Guardar datos en localStorage
  useEffect(() => {
    if (isClient) {
      localStorage.setItem('gymUsers', JSON.stringify(users));
    }
  }, [users, isClient]);

  const addUser = async () => {
    if (readOnly) return;
    if (!newUser.name || !newUser.email) return;
    
    // Validar fechas
    const startDate = new Date(newUser.startDate);
    const endDate = new Date(newUser.endDate);
    
    if (endDate <= startDate) {
      alert('La fecha de vencimiento debe ser posterior a la fecha de inicio');
      return;
    }
    
    const user: User = {
      id: Date.now().toString(),
      name: newUser.name,
      email: newUser.email,
      phone: newUser.phone,
      membershipType: newUser.membershipType,
      startDate: startDate.toISOString().split('T')[0],
      endDate: endDate.toISOString().split('T')[0],
      isActive: true
    };
    
    // Calcular pago segn tipo de membresa
    const membershipPriceMap: Record<'day' | 'week' | 'month', number> = {
      day: 50,
      week: 300,
      month: 800
    };

    try {
      const userData = {
        nombre: newUser.name,
        email: newUser.email,
        telefono: newUser.phone,
        pago: membershipPriceMap[newUser.membershipType],
        'fecha-inicio': startDate.toISOString().split('T')[0],
        'fecha-final': endDate.toISOString().split('T')[0]
      };
      
      const { data: insertedData, error } = await supabase
        .from('usuarios')
        .insert([userData])
        .select(); // Esto nos devuelve los datos insertados
      
      if (error) {
        console.error('❌ Error insertando en Supabase:', error);
        alert(`No se pudo guardar en la base de datos. Detalle: ${error.message || 'desconocido'}`);
        return;
      }
      // Recargar usuarios desde Supabase para mostrar los datos actualizados
      await loadUsersFromSupabase();
      setNewUser({ name: '', email: '', phone: '', membershipType: 'month', startDate: new Date().toISOString().split('T')[0], endDate: '' });
      setShowUserForm(false);
    } catch (e: any) {
      console.error('Excepcin insertando en Supabase:', e);
      alert(`Ocurri un error al guardar. Detalle: ${e?.message || e}`);
    }
  };

  const submitAddUserWithTransition = async () => {
    if (readOnly) return;
    if (!newUser.name || !newUser.email) return;
    setIsClosingAddModal(true);
    setTimeout(async () => {
      await addUser();
      setIsClosingAddModal(false);
    }, 200);
  };

  const handleAddFormKeyDown: React.KeyboardEventHandler<HTMLInputElement | HTMLSelectElement> = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      submitAddUserWithTransition();
    }
  };

  const updateUser = async () => {
    if (readOnly) return;
    if (!editingUser) return;
    
    // Validar fechas
    const startDate = new Date(editingUser.startDate);
    const endDate = new Date(editingUser.endDate);
    
    if (endDate <= startDate) {
      alert('La fecha de vencimiento debe ser posterior a la fecha de inicio');
      return;
    }

    // Calcular pago según tipo de membresía
    const membershipPriceMap: Record<'day' | 'week' | 'month', number> = {
      day: 50,
      week: 300,
      month: 800
    };

    try {
      const { data: updatedRows, error } = await supabase
        .from('usuarios')
        .update({
          nombre: editingUser.name,
          email: editingUser.email,
          telefono: editingUser.phone,
          pago: membershipPriceMap[editingUser.membershipType],
          'fecha-inicio': startDate.toISOString().split('T')[0],
          'fecha-final': endDate.toISOString().split('T')[0]
        })
        .eq('id', editingUser.id)
        .select();

      if (error) {
        console.error('❌ Error actualizando usuario:', error);
        alert(`Error al actualizar usuario: ${error.message}`);
        return;
      }

      if (!updatedRows || updatedRows.length === 0) {
        alert('No se actualizó ningún registro. Revisa políticas RLS o permisos.');
        return;
      }

      // Recargar desde la base de datos para reflejar el estado real
      await loadUsersFromSupabase();
      setEditingUser(null);
      
      alert('✅ Usuario actualizado exitosamente');
    } catch (e: any) {
      console.error('❌ Error actualizando usuario:', e);
      alert(`Error al actualizar: ${e?.message || e}`);
    }
  };

  const openDeleteConfirm = (userId: string) => {
    if (readOnly) return;
    
    const user = users.find(u => u.id === userId);
    if (!user) return;

    setUserToDelete(user);
    setShowDeleteConfirm(true);
  };

  const confirmDelete = async () => {
    if (!userToDelete) return;

    try {
      const { data: deletedRows, error } = await supabase
        .from('usuarios')
        .delete()
        .eq('id', userToDelete.id)
        .select();

      if (error) {
        console.error('❌ Error eliminando usuario:', error);
        alert(`Error al eliminar usuario: ${error.message}`);
        return;
      }

      if (!deletedRows || deletedRows.length === 0) {
        alert('No se eliminó ningún registro. Revisa políticas RLS o permisos.');
        return;
      }

      // Recargar desde la base de datos para reflejar el estado real
      await loadUsersFromSupabase();
      setShowDeleteConfirm(false);
      setUserToDelete(null);
      alert('✅ Usuario eliminado exitosamente');
    } catch (e: any) {
      console.error('❌ Error eliminando usuario:', e);
      alert(`Error al eliminar: ${e?.message || e}`);
    }
  };

  // Función eliminada: toggleUserStatus - ahora el estado se maneja automáticamente

  const openRenewalForm = (userId: string) => {
    if (readOnly) return;
    const user = users.find(u => u.id === userId);
    if (!user) return;

    setUserToRenew(user);
    setRenewalData({
      membershipType: user.membershipType,
      startDate: new Date().toISOString().split('T')[0]
    });
    setShowRenewalForm(true);
  };

  const processRenewal = async () => {
    if (!userToRenew) return;

    const startDate = new Date(renewalData.startDate);
    const endDate = calculateEndDate(renewalData.startDate, renewalData.membershipType);

    // Calcular pago según tipo de membresía
    const membershipPriceMap: Record<'day' | 'week' | 'month', number> = {
      day: 50,
      week: 300,
      month: 800
    };

    try {
      const { data: updatedRows, error } = await supabase
        .from('usuarios')
        .update({
          pago: membershipPriceMap[renewalData.membershipType],
          'fecha-inicio': startDate.toISOString().split('T')[0],
          'fecha-final': endDate
        })
        .eq('id', userToRenew.id)
        .select();

      if (error) {
        console.error('❌ Error actualizando membresía:', error);
        alert(`Error al renovar membresía: ${error.message || 'Error desconocido'}`);
        return;
      }

      if (!updatedRows || updatedRows.length === 0) {
        alert('No se actualizó ningún registro al renovar. Revisa RLS o el id.');
        return;
      }

      // Recargar desde la base de datos para reflejar el estado real
      await loadUsersFromSupabase();

      alert('✅ Membresía renovada exitosamente');
      setShowRenewalForm(false);
      setUserToRenew(null);
    } catch (e: any) {
      console.error('❌ Error renovando membresía:', e);
      alert(`Error al renovar: ${e?.message || e}`);
    }
  };

  // Filtrar y ordenar usuarios por relevancia
  const filteredUsers = users
    .filter(user => {
      const matchesFilter = filterType === 'all' || 
                           (filterType === 'active' && user.isActive) ||
                           (filterType === 'inactive' && !user.isActive);
      
      if (!searchTerm.trim()) return matchesFilter;
      
      const term = searchTerm.toLowerCase();
      const name = user.name.toLowerCase();
      const email = user.email.toLowerCase();
      const phone = user.phone?.toString().toLowerCase() || '';
      
      // Calcular puntuación de relevancia
      let score = 0;
      
      // Coincidencia exacta en ID (MÁXIMA PRIORIDAD)
      if (user.id === term) score += 200;
      // ID empieza con el término
      else if (user.id.startsWith(term)) score += 180;
      // ID contiene el término
      else if (user.id.includes(term)) score += 160;
      
      // Coincidencia exacta en nombre
      if (name === term) score += 100;
      // Nombre empieza con el término
      else if (name.startsWith(term)) score += 80;
      // Nombre contiene el término
      else if (name.includes(term)) score += 60;
      
      // Coincidencia exacta en email
      if (email === term) score += 90;
      // Email empieza con el término
      else if (email.startsWith(term)) score += 70;
      // Email contiene el término
      else if (email.includes(term)) score += 50;
      
      // Coincidencia en teléfono (menor prioridad)
      if (phone.includes(term)) score += 30;
      
      return score > 0 && matchesFilter;
    })
    .map(user => {
      const term = searchTerm.toLowerCase();
      const name = user.name.toLowerCase();
      const email = user.email.toLowerCase();
      const phone = user.phone?.toString().toLowerCase() || '';
      
      let score = 0;
      
      // Coincidencia exacta en ID (MÁXIMA PRIORIDAD)
      if (user.id === term) score += 200;
      else if (user.id.startsWith(term)) score += 180;
      else if (user.id.includes(term)) score += 160;
      
      if (name === term) score += 100;
      else if (name.startsWith(term)) score += 80;
      else if (name.includes(term)) score += 60;
      
      if (email === term) score += 90;
      else if (email.startsWith(term)) score += 70;
      else if (email.includes(term)) score += 50;
      
      if (phone.includes(term)) score += 30;
      
      return { ...user, relevanceScore: score };
    })
    .sort((a, b) => b.relevanceScore - a.relevanceScore);


  const activeUsers = users.filter(user => user.isActive).length;
  const expiredUsers = users.filter(user => new Date(user.endDate) < new Date()).length;

  const openMembershipOverlay = (user: User) => {
    setSelectedUser(user);
    setShowMembershipOverlay(true);
    // Pequeño delay para activar la transición de entrada
    setTimeout(() => setOverlayEnter(true), 50);
  };

  const closeMembershipOverlay = () => {
    setOverlayEnter(false);
    setTimeout(() => {
      setShowMembershipOverlay(false);
      setSelectedUser(null);
      // Limpiar la búsqueda al cerrar el overlay
      setSearchTerm('');
    }, 300);
  };

  const handleSearchKeyDown: React.KeyboardEventHandler<HTMLInputElement> = (e) => {
    if (e.key !== 'Enter') return;
    e.preventDefault();
    const term = searchTerm.trim().toLowerCase();
    
    if (!term) return;

    // Usar el primer resultado de la búsqueda filtrada (ya ordenado por relevancia)
    if (filteredUsers.length > 0) {
      const firstMatch = filteredUsers[0];
      openMembershipOverlay(firstMatch);
    } else {
      // Si hay término de búsqueda pero no se encuentra nada
      alert(`No se encontró ningún usuario con: "${term}"`);
    }
  };

  if (!isClient) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-xl text-gray-600">Cargando...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Gestión de Usuarios</h1>
              <p className="text-gray-600 mt-2">Administra miembros y membresías</p>
            </div>
            <div className="flex gap-3">
              <button
                onClick={loadUsersFromSupabase}
                disabled={loadingUsers}
                className="bg-gray-600 hover:bg-gray-700 disabled:bg-gray-400 text-white px-4 py-3 rounded-lg font-semibold transition-colors"
              >
                {loadingUsers ? '⏳ Cargando...' : '🔄 Recargar'}
              </button>
              {!readOnly && (
                <button
                  onClick={() => setShowUserForm(true)}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-semibold transition-colors"
                >
                  + Nuevo Usuario
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-3 bg-blue-100 rounded-lg">
                <span className="text-2xl">👥</span>
              </div>
              <div className="ml-4">
                <p className="text-sm text-gray-600">Total Usuarios</p>
                <p className="text-2xl font-bold text-gray-900">{users.length}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-3 bg-green-100 rounded-lg">
                <span className="text-2xl">✅</span>
              </div>
              <div className="ml-4">
                <p className="text-sm text-gray-600">Activos</p>
                <p className="text-2xl font-bold text-gray-900">{activeUsers}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-3 bg-red-100 rounded-lg">
                <span className="text-2xl">⏰</span>
              </div>
              <div className="ml-4">
                <p className="text-sm text-gray-600">Vencidos</p>
                <p className="text-2xl font-bold text-gray-900">{expiredUsers}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <input
                  type="text"
                  placeholder="Buscar por nombre, email, teléfono o ID..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  onKeyDown={handleSearchKeyDown}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                {searchTerm.trim() && (
                  <div className="absolute right-3 top-1/2 transform -translate-y-1/2 text-sm text-gray-500">
                    {filteredUsers.length} resultado{filteredUsers.length !== 1 ? 's' : ''}
                  </div>
                )}
              </div>
              {searchTerm.trim() && filteredUsers.length > 0 && (
                <div className="mt-2 text-sm text-blue-600">
                  💡 Presiona Enter para seleccionar el primer resultado (resaltado en azul)
                </div>
              )}
            </div>
            <div>
              <select
                value={filterType}
                onChange={(e) => setFilterType(e.target.value as 'all' | 'active' | 'inactive')}
                className="p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="all">Todos</option>
                <option value="active">Activos</option>
                <option value="inactive">Inactivos</option>
              </select>
            </div>
          </div>
        </div>

        {/* Users Table */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          {loadingUsers && (
            <div className="p-6 text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2"></div>
              <p className="text-gray-600">Cargando usuarios...</p>
            </div>
          )}
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    ID
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Usuario
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Membresía
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Fechas
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Estado
                  </th>
                  {!readOnly && (
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Acciones
                    </th>
                  )}
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredUsers.map((user, index) => (
                  <tr 
                    key={user.id} 
                    className={`hover:bg-gray-50 ${
                      index === 0 && searchTerm.trim() 
                        ? 'bg-blue-50 border-l-4 border-blue-500' 
                        : ''
                    }`}
                  >
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        #{user.id}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm font-medium text-gray-900">{user.name}</div>
                        <div className="text-sm text-gray-500">{user.email}</div>
                        <div className="text-sm text-gray-500">{user.phone}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800 capitalize">
                        {user.membershipType}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      <div>Inicio: {user.startDate}</div>
                      <div>Vence: {user.endDate}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                        user.isActive 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {user.isActive ? 'Activo' : 'Inactivo'}
                      </span>
                    </td>
                    {!readOnly && (
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex space-x-2">
                          <button
                            onClick={() => setEditingUser(user)}
                            className="text-blue-600 hover:text-blue-900"
                          >
                            Editar
                          </button>
                          <button
                            onClick={() => openRenewalForm(user.id)}
                            className="text-purple-600 hover:text-purple-900"
                          >
                            Renovar
                          </button>
                          <button
                            onClick={() => openDeleteConfirm(user.id)}
                            className="text-red-600 hover:text-red-900"
                          >
                            Eliminar
                          </button>
                        </div>
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {filteredUsers.length === 0 && users.length === 0 && (
          <div className="text-center py-12">
            <div className="bg-white rounded-lg shadow p-8">
              <div className="text-6xl mb-4">👥</div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">No hay usuarios registrados</h3>
              <p className="text-gray-500 mb-4">Los usuarios registrados aparecerán aquí</p>
              <button
                onClick={loadUsersFromSupabase}
                disabled={loadingUsers}
                className="bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white px-6 py-3 rounded-lg font-semibold transition-colors"
              >
                {loadingUsers ? '⏳ Cargando...' : '🔄 Recargar Datos'}
              </button>
            </div>
          </div>
        )}

        {filteredUsers.length === 0 && users.length > 0 && (
          <div className="text-center py-12">
            <div className="bg-white rounded-lg shadow p-8">
              <div className="text-6xl mb-4">🔍</div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">No se encontraron resultados</h3>
              <p className="text-gray-500 mb-4">Intenta con otros términos de búsqueda</p>
              <button
                onClick={() => setSearchTerm('')}
                className="bg-gray-600 hover:bg-gray-700 text-white px-6 py-3 rounded-lg font-semibold transition-colors"
              >
                Limpiar búsqueda
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Add User Modal */}
      {!readOnly && showUserForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className={`bg-white rounded-lg p-8 w-full max-w-md mx-4 transform transition-all duration-200 ${isClosingAddModal ? 'scale-95 opacity-0' : 'scale-100 opacity-100'}`}> 
            <h3 className="text-xl font-semibold mb-6">Registrar Nuevo Usuario</h3>
            <div className="space-y-4">
              <input
                type="text"
                placeholder="Nombre completo"
                value={newUser.name}
                onChange={(e) => setNewUser({...newUser, name: e.target.value})}
                onKeyDown={handleAddFormKeyDown}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              <input
                type="email"
                placeholder="Email"
                value={newUser.email}
                onChange={(e) => setNewUser({...newUser, email: e.target.value})}
                onKeyDown={handleAddFormKeyDown}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              <input
                type="tel"
                placeholder="Teléfono"
                value={newUser.phone}
                onChange={(e) => setNewUser({...newUser, phone: e.target.value})}
                onKeyDown={handleAddFormKeyDown}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Fecha de Inicio</label>
                <input
                  type="date"
                  value={newUser.startDate}
                  onChange={(e) => {
                    const newStartDate = e.target.value;
                    const calculatedEndDate = calculateEndDate(newStartDate, newUser.membershipType);
                    setNewUser({
                      ...newUser, 
                      startDate: newStartDate,
                      endDate: calculatedEndDate
                    });
                  }}
                  onKeyDown={handleAddFormKeyDown}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  title="Fecha de inicio de la membresía"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Tipo de Membresía</label>
                <select
                  value={newUser.membershipType}
                  onChange={(e) => {
                    const newMembershipType = e.target.value as 'day' | 'week' | 'month';
                    const calculatedEndDate = calculateEndDate(newUser.startDate, newMembershipType);
                    setNewUser({
                      ...newUser, 
                      membershipType: newMembershipType,
                      endDate: calculatedEndDate
                    });
                  }}
                  onKeyDown={handleAddFormKeyDown}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="day">Día - $50 MXN</option>
                  <option value="week">Semana - $300 MXN</option>
                  <option value="month">Mes - $800 MXN</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Fecha de Vencimiento</label>
                <input
                  type="date"
                  value={newUser.endDate}
                  onChange={(e) => setNewUser({...newUser, endDate: e.target.value})}
                  onKeyDown={handleAddFormKeyDown}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  title="Fecha de vencimiento de la membresía"
                />
                <p className="text-xs text-gray-500 mt-1">Se calcula automáticamente, pero puedes modificarla manualmente</p>
              </div>
            </div>
            <div className="flex gap-3 mt-6">
              <button
                onClick={submitAddUserWithTransition}
                className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-lg font-semibold transition-colors"
              >
                Registrar
              </button>
              <button
                onClick={() => setShowUserForm(false)}
                className="flex-1 bg-gray-600 hover:bg-gray-700 text-white py-3 rounded-lg font-semibold transition-colors"
              >
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit User Modal */}
      {editingUser && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-8 w-full max-w-md mx-4">
            <h3 className="text-xl font-semibold mb-6">Editar Usuario</h3>
            <div className="space-y-4">
              <input
                type="text"
                placeholder="Nombre completo"
                value={editingUser.name}
                onChange={(e) => setEditingUser({...editingUser, name: e.target.value})}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              <input
                type="email"
                placeholder="Email"
                value={editingUser.email}
                onChange={(e) => setEditingUser({...editingUser, email: e.target.value})}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              <input
                type="tel"
                placeholder="Teléfono"
                value={editingUser.phone}
                onChange={(e) => setEditingUser({...editingUser, phone: e.target.value})}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Fecha de Inicio</label>
                <input
                  type="date"
                  value={editingUser.startDate}
                  onChange={(e) => setEditingUser({...editingUser, startDate: e.target.value})}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  title="Fecha de inicio de la membresía"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Fecha de Vencimiento</label>
                <input
                  type="date"
                  value={editingUser.endDate}
                  onChange={(e) => setEditingUser({...editingUser, endDate: e.target.value})}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  title="Fecha de vencimiento de la membresía"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Tipo de Membresía</label>
                <select
                  value={editingUser.membershipType}
                  onChange={(e) => setEditingUser({...editingUser, membershipType: e.target.value as 'day' | 'week' | 'month'})}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="day">Día - $50 MXN</option>
                  <option value="week">Semana - $300 MXN</option>
                  <option value="month">Mes - $800 MXN</option>
                </select>
              </div>
            </div>
            <div className="flex gap-3 mt-6">
              <button
                onClick={updateUser}
                className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-lg font-semibold transition-colors"
              >
                Actualizar
              </button>
              <button
                onClick={() => setEditingUser(null)}
                className="flex-1 bg-gray-600 hover:bg-gray-700 text-white py-3 rounded-lg font-semibold transition-colors"
              >
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Membership Info Overlay */}
      {showMembershipOverlay && selectedUser && (
        <div
          className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50"
          onClick={closeMembershipOverlay}
        >
          <div
            className={`bg-white rounded-xl p-6 w-full max-w-2xl mx-4 transform transition-all duration-300 ${overlayEnter ? 'scale-100 opacity-100' : 'scale-95 opacity-0'}`}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold text-gray-900">Información del Usuario</h3>
              <button 
                onClick={closeMembershipOverlay} 
                className="text-gray-400 hover:text-gray-600 text-3xl font-bold transition-colors hover:bg-gray-100 rounded-full w-10 h-10 flex items-center justify-center"
              >
                ×
              </button>
            </div>

            {(() => {
              const now = Date.now();
              const end = new Date(selectedUser.endDate).getTime();
              const start = new Date(selectedUser.startDate).getTime();
              const remainingMs = end - now;
              const dayMs = 24 * 60 * 60 * 1000;
              const hourMs = 60 * 60 * 1000;
              const remainingDays = Math.ceil(remainingMs / dayMs);
              const remainingHours = Math.ceil(remainingMs / hourMs);
              const expired = remainingMs <= 0;
              const isExpiringSoon = remainingDays <= 3 && !expired;

              return (
                <div className="space-y-4">
                  {/* Información del Usuario */}
                  <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-4">
                    <div className="text-center">
                      <div className="text-sm text-gray-500 mb-1">ID: #{selectedUser.id}</div>
                      <div className="text-xl font-bold text-gray-900 mb-1">{selectedUser.name}</div>
                      <div className="text-sm text-gray-600 mb-1">{selectedUser.email}</div>
                      <div className="text-sm text-gray-600 mb-3">{selectedUser.phone}</div>
                      <div className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${
                        selectedUser.isActive 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {selectedUser.isActive ? '✅ Activo' : '❌ Inactivo'}
                      </div>
                    </div>
                  </div>

                  {/* Estado de Membresía */}
                  <div className={`rounded-lg p-4 text-center ${
                    expired 
                      ? 'bg-red-50 border border-red-200' 
                      : isExpiringSoon 
                        ? 'bg-yellow-50 border border-yellow-200'
                        : 'bg-green-50 border border-green-200'
                  }`}>
                    <div className={`text-3xl font-extrabold tracking-tight mb-2 ${
                      expired ? 'text-red-600' : isExpiringSoon ? 'text-yellow-600' : 'text-green-600'
                    }`}>
                      {expired ? 'VENCIDA' : `${remainingDays} día${remainingDays === 1 ? '' : 's'} restantes`}
                    </div>
                    
                    {!expired && (
                      <div className="text-sm text-gray-600 mb-2">
                        ≈ {remainingHours} horas restantes
                      </div>
                    )}

                    {isExpiringSoon && !expired && (
                      <div className="bg-yellow-100 text-yellow-800 px-2 py-1 rounded text-xs font-semibold mb-2">
                        ⚠️ Por vencer
                      </div>
                    )}

                    {expired && (
                      <div className="bg-red-100 text-red-800 px-2 py-1 rounded text-xs font-semibold mb-2">
                        🚫 Vencida
                      </div>
                    )}
                  </div>

                  {/* Detalles de la Membresía */}
                  <div className="grid grid-cols-3 gap-3">
                    <div className="bg-gray-50 rounded-lg p-3 text-center">
                      <div className="text-lg mb-1">📅</div>
                      <div className="text-xs text-gray-500 mb-1">Inicio</div>
                      <div className="text-sm font-bold text-gray-900">
                        {selectedUser.startDate}
                      </div>
                    </div>
                    
                    <div className="bg-gray-50 rounded-lg p-3 text-center">
                      <div className="text-lg mb-1">⏰</div>
                      <div className="text-xs text-gray-500 mb-1">Vence</div>
                      <div className="text-sm font-bold text-gray-900">
                        {selectedUser.endDate}
                      </div>
                    </div>
                    
                    <div className="bg-gray-50 rounded-lg p-3 text-center">
                      <div className="text-lg mb-1">🏷️</div>
                      <div className="text-xs text-gray-500 mb-1">Tipo</div>
                      <div className="text-sm font-bold text-gray-900 capitalize">
                        {selectedUser.membershipType === 'day' ? 'Día' : 
                         selectedUser.membershipType === 'week' ? 'Semana' : 'Mes'}
                      </div>
                      <div className="text-xs text-gray-600">
                        {selectedUser.membershipType === 'day' ? '$50' : 
                         selectedUser.membershipType === 'week' ? '$300' : '$800'}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })()}
          </div>
        </div>
      )}

      {/* Formulario de Renovación de Membresía */}
      {showRenewalForm && userToRenew && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-8 w-full max-w-md mx-4">
            <h3 className="text-xl font-semibold mb-6">Renovar Membresía</h3>
            <div className="space-y-4">
              <div className="bg-gray-50 rounded-lg p-4 mb-4">
                <h4 className="font-semibold text-gray-900 mb-2">Usuario:</h4>
                <p className="text-gray-700">{userToRenew.name}</p>
                <p className="text-sm text-gray-600">{userToRenew.email}</p>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Fecha de Inicio de la Renovación
                </label>
                <input
                  type="date"
                  value={renewalData.startDate}
                  onChange={(e) => setRenewalData({...renewalData, startDate: e.target.value})}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Tipo de Membresía
                </label>
                <select
                  value={renewalData.membershipType}
                  onChange={(e) => setRenewalData({...renewalData, membershipType: e.target.value as 'day' | 'week' | 'month'})}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="day">Día - $50 MXN</option>
                  <option value="week">Semana - $300 MXN</option>
                  <option value="month">Mes - $800 MXN</option>
                </select>
              </div>
              
              <div className="bg-blue-50 rounded-lg p-4">
                <h4 className="font-semibold text-blue-900 mb-2">Nueva fecha de vencimiento:</h4>
                <p className="text-blue-800">
                  {calculateEndDate(renewalData.startDate, renewalData.membershipType)}
                </p>
              </div>
            </div>
            
            <div className="flex gap-3 mt-6">
              <button
                onClick={processRenewal}
                className="flex-1 bg-purple-600 hover:bg-purple-700 text-white py-3 rounded-lg font-semibold transition-colors"
              >
                Renovar Membresía
              </button>
              <button
                onClick={() => {
                  setShowRenewalForm(false);
                  setUserToRenew(null);
                }}
                className="flex-1 bg-gray-600 hover:bg-gray-700 text-white py-3 rounded-lg font-semibold transition-colors"
              >
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal de Confirmación de Eliminación */}
      {showDeleteConfirm && userToDelete && (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-8 w-full max-w-md mx-4 transform transition-all duration-300">
            <div className="text-center">
              {/* Icono de advertencia */}
              <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-red-100 mb-4">
                <span className="text-3xl">⚠️</span>
              </div>
              
              {/* Título */}
              <h3 className="text-xl font-bold text-gray-900 mb-4">
                ¿Eliminar Usuario?
              </h3>
              
              {/* Información del usuario */}
              <div className="bg-gray-50 rounded-lg p-4 mb-6">
                <div className="text-sm text-gray-500 mb-1">ID: #{userToDelete.id}</div>
                <div className="text-lg font-semibold text-gray-900 mb-2">
                  {userToDelete.name}
                </div>
                <div className="text-sm text-gray-600 mb-1">
                  📧 {userToDelete.email}
                </div>
                <div className="text-sm text-gray-600">
                  📱 {userToDelete.phone || 'Sin teléfono'}
                </div>
              </div>
              
              {/* Mensaje de advertencia */}
              <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
                <div className="text-red-800 font-semibold mb-2">
                  ⚠️ Advertencia
                </div>
                <div className="text-sm text-red-700">
                  Esta acción eliminará permanentemente al usuario de la base de datos. 
                  <strong> No se puede deshacer.</strong>
                </div>
              </div>
              
              {/* Botones */}
              <div className="flex gap-3">
                <button
                  onClick={() => {
                    setShowDeleteConfirm(false);
                    setUserToDelete(null);
                  }}
                  className="flex-1 bg-gray-600 hover:bg-gray-700 text-white py-3 rounded-lg font-semibold transition-colors"
                >
                  Cancelar
                </button>
                <button
                  onClick={confirmDelete}
                  className="flex-1 bg-red-600 hover:bg-red-700 text-white py-3 rounded-lg font-semibold transition-colors"
                >
                  Eliminar Usuario
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
