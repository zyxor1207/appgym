'use client';

import { useState, useEffect } from 'react';
import AdminNav from './AdminNav';
import AdminDashboard from './AdminDashboard';
import UserManagement from './UserManagement';
import PointOfSale from './PointOfSale';
import InventoryManagement from './InventoryManagement';
import { supabase } from './lib/supabaseClient';

export default function AdminSystem() {
  const [currentPage, setCurrentPage] = useState('dashboard');

  const renderPage = () => {
    switch (currentPage) {
      case 'dashboard':
        return <AdminDashboard onPageChange={setCurrentPage} />;
      case 'users':
        return <UserManagement onPageChange={setCurrentPage} readOnly={false} />;
      case 'pos':
        return <PointOfSale onPageChange={setCurrentPage} />;
      case 'inventory':
        return <InventoryManagement onPageChange={setCurrentPage} />;
      case 'sales':
        return <SalesReport onPageChange={setCurrentPage} />;
      default:
        return <AdminDashboard onPageChange={setCurrentPage} />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <AdminNav currentPage={currentPage} onPageChange={setCurrentPage} />
      {renderPage()}
    </div>
  );
}

// Componente para reportes de ventas con Supabase
function SalesReport({ onPageChange }: { onPageChange: (page: string) => void }) {
  const [sales, setSales] = useState<any[]>([]);
  const [mounted, setMounted] = useState(false);
  const [loading, setLoading] = useState(true);
  const [notification, setNotification] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  useEffect(() => {
    setMounted(true);
    loadSales();
  }, []);

  const showNotification = (type: 'success' | 'error', message: string) => {
    setNotification({ type, message });
    setTimeout(() => setNotification(null), 3000);
  };

  const loadSales = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('ventas')
        .select('*')
        .order('fecha', { ascending: false });
      
      if (error) {
        console.error('Error loading sales:', error);
        showNotification('error', `Error al cargar ventas: ${error.message}`);
        return;
      }
      
      setSales(data || []);
    } catch (error) {
      console.error('Error loading sales:', error);
      showNotification('error', 'Error inesperado al cargar ventas');
    } finally {
      setLoading(false);
    }
  };

  if (!mounted) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-xl text-gray-600">Cargando...</p>
        </div>
      </div>
    );
  }

  const todaySales = sales.filter(sale => 
    new Date(sale.fecha).toDateString() === new Date().toDateString()
  );
  const todayRevenue = todaySales.reduce((total, sale) => total + (sale.total || 0), 0);

  const weeklySales = sales.filter(sale => {
    const saleDate = new Date(sale.fecha);
    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);
    return saleDate >= weekAgo;
  });
  const weeklyRevenue = weeklySales.reduce((total, sale) => total + (sale.total || 0), 0);

  const monthlySales = sales.filter(sale => {
    const saleDate = new Date(sale.fecha);
    const currentDate = new Date();
    return saleDate.getMonth() === currentDate.getMonth() && 
           saleDate.getFullYear() === currentDate.getFullYear();
  });
  const monthlyRevenue = monthlySales.reduce((total, sale) => total + (sale.total || 0), 0);

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Notificación */}
      {notification && (
        <div className={`fixed top-4 right-4 z-50 p-4 rounded-lg shadow-lg ${
          notification.type === 'success' ? 'bg-green-500' : 'bg-red-500'
        } text-white`}>
          {notification.message}
        </div>
      )}

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">📊 Historial de Ventas y Membresías</h1>
              <p className="text-gray-600 mt-2">Análisis de ventas, membresías y rendimiento</p>
            </div>
            <div className="flex gap-3">
              <button
                onClick={loadSales}
                disabled={loading}
                className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white px-4 py-2 rounded-lg font-semibold transition-colors"
              >
                {loading ? 'Cargando...' : '🔄 Actualizar'}
              </button>
              <button
                onClick={() => onPageChange('pos')}
                className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg font-semibold transition-colors"
              >
                💰 Nueva Venta
              </button>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6 mb-6 md:mb-8">
          <div className="bg-white rounded-lg shadow p-4 md:p-6">
            <div className="flex items-center">
              <div className="p-2 md:p-3 bg-green-100 rounded-lg">
                <span className="text-lg md:text-2xl">💰</span>
              </div>
              <div className="ml-2 md:ml-4">
                <p className="text-xs md:text-sm text-gray-600">Operaciones Hoy</p>
                <p className="text-lg md:text-2xl font-bold text-gray-900">{todaySales.length}</p>
                <p className="text-xs md:text-sm text-green-600">${todayRevenue.toFixed(2)} MXN</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow p-4 md:p-6">
            <div className="flex items-center">
              <div className="p-2 md:p-3 bg-blue-100 rounded-lg">
                <span className="text-lg md:text-2xl">📊</span>
              </div>
              <div className="ml-2 md:ml-4">
                <p className="text-xs md:text-sm text-gray-600">Esta Semana</p>
                <p className="text-lg md:text-2xl font-bold text-gray-900">{weeklySales.length}</p>
                <p className="text-xs md:text-sm text-blue-600">${weeklyRevenue.toFixed(2)} MXN</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow p-4 md:p-6">
            <div className="flex items-center">
              <div className="p-2 md:p-3 bg-purple-100 rounded-lg">
                <span className="text-lg md:text-2xl">📅</span>
              </div>
              <div className="ml-2 md:ml-4">
                <p className="text-xs md:text-sm text-gray-600">Este Mes</p>
                <p className="text-lg md:text-2xl font-bold text-gray-900">{monthlySales.length}</p>
                <p className="text-xs md:text-sm text-purple-600">${monthlyRevenue.toFixed(2)} MXN</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-4 md:p-6">
            <div className="flex items-center">
              <div className="p-2 md:p-3 bg-orange-100 rounded-lg">
                <span className="text-lg md:text-2xl">👥</span>
              </div>
              <div className="ml-2 md:ml-4">
                <p className="text-xs md:text-sm text-gray-600">Membresías</p>
                <p className="text-lg md:text-2xl font-bold text-gray-900">
                  {sales.filter(sale => {
                    const primerProducto = Array.isArray(sale.productos) && sale.productos.length > 0 ? sale.productos[0] : null;
                    return primerProducto?.tipo_operacion === 'nueva_membresia' || primerProducto?.tipo_operacion === 'renovacion';
                  }).length}
                </p>
                <p className="text-xs md:text-sm text-orange-600">
                  ${sales.filter(sale => {
                    const primerProducto = Array.isArray(sale.productos) && sale.productos.length > 0 ? sale.productos[0] : null;
                    return primerProducto?.tipo_operacion === 'nueva_membresia' || primerProducto?.tipo_operacion === 'renovacion';
                  }).reduce((sum, sale) => sum + (sale.total || 0), 0).toFixed(2)} MXN
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow">
          <div className="p-6 border-b border-gray-200">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-semibold">Historial Completo de Operaciones</h3>
              <div className="flex items-center gap-4">
                <span className="text-sm text-gray-600">
                  Total de operaciones: <span className="font-semibold text-green-600">{sales.length}</span>
                </span>
                <span className="text-sm text-gray-600">
                  Total ingresos: <span className="font-semibold text-green-600">
                    ${sales.reduce((sum, sale) => sum + (sale.total || 0), 0).toFixed(2)} MXN
                  </span>
                </span>
              </div>
            </div>
          </div>
          
          {loading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600 mx-auto mb-4"></div>
              <p className="text-gray-600">Cargando historial de ventas...</p>
            </div>
          ) : sales.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <span className="text-4xl mb-2 block">📈</span>
              <p className="text-lg">No hay ventas registradas</p>
              <p className="text-sm">Las ventas aparecerán aquí una vez que realices la primera transacción</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-3 md:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      ID
                    </th>
                    <th className="px-3 md:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Fecha
                    </th>
                    <th className="px-3 md:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Tipo
                    </th>
                    <th className="px-3 md:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Cliente/Usuario
                    </th>
                    <th className="px-3 md:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden sm:table-cell">
                      Detalles
                    </th>
                    <th className="px-3 md:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Total
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {sales.map((sale, index) => {
                    const getTipoOperacion = () => {
                      // Verificar si es una membresía revisando el primer producto
                      const primerProducto = Array.isArray(sale.productos) && sale.productos.length > 0 ? sale.productos[0] : null;
                      const tipoOperacion = primerProducto?.tipo_operacion;
                      
                      if (tipoOperacion === 'nueva_membresia') {
                        return (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                            🆕 Nueva Membresía
                          </span>
                        );
                      } else if (tipoOperacion === 'renovacion') {
                        return (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                            🔄 Renovación
                          </span>
                        );
                      } else {
                        return (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                            🛒 Venta Productos
                          </span>
                        );
                      }
                    };

                    const getDetalles = () => {
                      // Verificar si es una membresía revisando el primer producto
                      const primerProducto = Array.isArray(sale.productos) && sale.productos.length > 0 ? sale.productos[0] : null;
                      const tipoOperacion = primerProducto?.tipo_operacion;
                      
                      if (tipoOperacion === 'nueva_membresia' || tipoOperacion === 'renovacion') {
                        const tipoMembresia = primerProducto?.tipo_membresia === 'day' ? 'Diaria' : 
                                            primerProducto?.tipo_membresia === 'week' ? 'Semanal' : 'Mensual';
                        return (
                          <div className="space-y-1">
                            <div className="bg-orange-50 text-orange-800 px-2 py-1 rounded text-xs">
                              Membresía {tipoMembresia}
                            </div>
                            {primerProducto?.fecha_inicio && primerProducto?.fecha_final && (
                              <div className="text-xs text-gray-500">
                                {primerProducto.fecha_inicio} - {primerProducto.fecha_final}
                              </div>
                            )}
                          </div>
                        );
                      } else {
                        return (
                          <div className="max-w-xs">
                            {Array.isArray(sale.productos) ? (
                              <div className="space-y-1">
                                {sale.productos.slice(0, 2).map((producto: any, idx: number) => (
                                  <div key={idx} className="bg-blue-50 text-blue-800 px-2 py-1 rounded text-xs">
                                    {typeof producto === 'string' ? producto : `${producto.productName} (${producto.quantity}x)`}
                                  </div>
                                ))}
                                {sale.productos.length > 2 && (
                                  <div className="text-xs text-gray-500">
                                    +{sale.productos.length - 2} más...
                                  </div>
                                )}
                              </div>
                            ) : (
                              <span className="text-gray-400 italic">Sin productos</span>
                            )}
                          </div>
                        );
                      }
                    };

                    return (
                      <tr key={sale.id || index} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                          #{sale.id}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {new Date(sale.fecha).toLocaleString('es-MX', {
                            year: 'numeric',
                            month: '2-digit',
                            day: '2-digit',
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {getTipoOperacion()}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {sale.cliente_nombre || (
                            <span className="text-gray-400 italic">Cliente general</span>
                          )}
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-500">
                          {getDetalles()}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          <span className="font-semibold text-green-600">
                            ${(sale.total || 0).toFixed(2)} MXN
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
