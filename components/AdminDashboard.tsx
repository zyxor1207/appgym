'use client';

import { useState, useEffect } from 'react';
import { supabase } from './lib/supabaseClient';

// Tipos de datos
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

interface Product {
  id: string;
  name: string;
  price: number;
  stock: number;
  category: 'water' | 'protein' | 'supplements';
}

interface Sale {
  id: string;
  products: { productId: string; quantity: number; price: number }[];
  total: number;
  date: string;
  customerName?: string;
}

interface AdminDashboardProps {
  onPageChange: (page: string) => void;
}

export default function AdminDashboard({ onPageChange }: AdminDashboardProps) {
  const [users, setUsers] = useState<User[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [sales, setSales] = useState<Sale[]>([]);
  const [isClient, setIsClient] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  // Cargar datos desde Supabase
  useEffect(() => {
    setIsClient(true);
    loadUsersFromSupabase();
    loadSalesFromSupabase();
    loadProductsFromSupabase();
    
    // Actualizar datos cada 30 segundos
    const interval = setInterval(() => {
      loadUsersFromSupabase();
      loadSalesFromSupabase();
      loadProductsFromSupabase();
    }, 30000);
    
    return () => clearInterval(interval);
  }, []);

  const refreshData = async () => {
    setRefreshing(true);
    await Promise.all([
      loadUsersFromSupabase(),
      loadSalesFromSupabase(),
      loadProductsFromSupabase()
    ]);
    setRefreshing(false);
  };

  const loadUsersFromSupabase = async () => {
    try {
      const { data, error } = await supabase
        .from('usuarios')
        .select('*')
        .order('id', { ascending: false });
      
      if (error) {
        console.error('Error cargando usuarios:', error);
        // Fallback a localStorage si hay error
        const savedUsers = localStorage.getItem('gymUsers');
        if (savedUsers) setUsers(JSON.parse(savedUsers));
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
            // Si ya existen fechas en la base de datos, usarlas
            startDate = new Date(user['fecha-inicio']);
            endDate = new Date(user['fecha-final']);
          } else if (user.start_date && user.end_date) {
            // Fallback a nombres antiguos de columnas
            startDate = new Date(user.start_date);
            endDate = new Date(user.end_date);
          } else {
            // Calcular fechas nuevas basadas en el tipo de membresía
            startDate = new Date();
            endDate = new Date();
            
            switch (membershipType) {
              case 'day':
                endDate.setDate(startDate.getDate() + 1);
                break;
              case 'week':
                endDate.setDate(startDate.getDate() + 7);
                break;
              case 'month':
                // Agregar exactamente un mes, manejando casos especiales
                const currentMonth = startDate.getMonth();
                const currentYear = startDate.getFullYear();
                const nextMonth = currentMonth === 11 ? 0 : currentMonth + 1;
                const nextYear = currentMonth === 11 ? currentYear + 1 : currentYear;
                endDate.setFullYear(nextYear, nextMonth, startDate.getDate());
                
                // Si el día no existe en el próximo mes (ej: 31 de enero -> 28/29 de febrero)
                if (endDate.getDate() !== startDate.getDate()) {
                  endDate.setDate(0); // Último día del mes anterior
                }
                break;
            }
          }
          
          return {
            id: user.id.toString(),
            name: user.nombre,
            email: user.email,
            phone: user.telefono || '',
            membershipType,
            startDate: startDate.toISOString().split('T')[0],
            endDate: endDate.toISOString().split('T')[0],
            isActive: user.is_active !== undefined ? user.is_active : true
          };
        });
        
        setUsers(convertedUsers);
        // También guardar en localStorage como backup
        localStorage.setItem('gymUsers', JSON.stringify(convertedUsers));
      }
    } catch (e) {
      console.error('Excepción cargando usuarios:', e);
      // Fallback a localStorage
      const savedUsers = localStorage.getItem('gymUsers');
      if (savedUsers) setUsers(JSON.parse(savedUsers));
    }
  };

  const loadSalesFromSupabase = async () => {
    try {
      const { data, error } = await supabase
        .from('ventas')
        .select('*')
        .order('fecha', { ascending: false });
      
      if (error) {
        console.error('Error cargando ventas:', error);
        // Fallback a localStorage si hay error
        if (typeof window !== 'undefined') {
          const savedSales = localStorage.getItem('gymSales');
          if (savedSales) setSales(JSON.parse(savedSales));
        }
        return;
      }
      
      if (data) {
        // Convertir datos de Supabase al formato esperado por la UI
        const convertedSales: Sale[] = data.map((sale: any) => ({
          id: sale.id.toString(),
          products: Array.isArray(sale.productos) ? 
            sale.productos.map((producto: any) => ({
              productId: typeof producto === 'string' ? '1' : producto.productId?.toString() || '1',
              quantity: typeof producto === 'string' ? 1 : producto.quantity || 1,
              price: typeof producto === 'string' ? 0 : producto.price || 0
            })) : [],
          total: sale.total || 0,
          date: sale.fecha,
          customerName: sale.cliente_nombre
        }));
        
        setSales(convertedSales);
        // También guardar en localStorage como backup
        if (typeof window !== 'undefined') {
          localStorage.setItem('gymSales', JSON.stringify(convertedSales));
        }
      }
    } catch (e) {
      console.error('Excepción cargando ventas:', e);
      // Fallback a localStorage
      if (typeof window !== 'undefined') {
        const savedSales = localStorage.getItem('gymSales');
        if (savedSales) setSales(JSON.parse(savedSales));
      }
    }
  };

  const loadProductsFromSupabase = async () => {
    try {
      const { data, error } = await supabase
        .from('productos')
        .select('*')
        .order('nombre');
      
      if (error) {
        console.error('Error cargando productos:', error);
        return;
      }
      
      if (data) {
        // Convertir datos de Supabase al formato esperado por la UI
        const convertedProducts: Product[] = data.map((product: any) => ({
          id: product.id.toString(),
          name: product.nombre,
          price: product.precio,
          stock: product.stock,
          category: product.categoria as 'water' | 'protein' | 'supplements'
        }));
        
        setProducts(convertedProducts);
      }
    } catch (e) {
      console.error('Excepción cargando productos:', e);
    }
  };

  // Guardar datos en localStorage
  useEffect(() => {
    if (isClient) {
      localStorage.setItem('gymUsers', JSON.stringify(users));
    }
  }, [users, isClient]);

  useEffect(() => {
    if (isClient) {
      localStorage.setItem('gymSales', JSON.stringify(sales));
    }
  }, [sales, isClient]);

  // Estadísticas
  const activeUsers = users.filter(user => user.isActive).length;
  const todaySales = sales.filter(sale => 
    new Date(sale.date).toDateString() === new Date().toDateString()
  );
  const todayRevenue = todaySales.reduce((total, sale) => total + sale.total, 0);
  const lowStockProducts = products.filter(product => product.stock < 10);
  const totalProducts = products.length;
  const totalStockValue = products.reduce((total, product) => total + (product.price * product.stock), 0);
  
  // Miembros recientes (solo activos, ordenados por fecha de registro más reciente)
  const recentActiveUsers = users
    .filter(user => user.isActive)
    .sort((a, b) => new Date(b.startDate).getTime() - new Date(a.startDate).getTime())
    .slice(0, 5);
  
  // Ventas recientes (últimas 5 ventas)
  const recentSales = sales.slice(0, 5);

  // Ventas por categoría
  const salesByCategory = products.reduce((acc, product) => {
    const categorySales = sales.reduce((total, sale) => {
      const productSales = sale.products.filter(p => p.productId === product.id);
      return total + productSales.reduce((sum, p) => sum + (p.price * p.quantity), 0);
    }, 0);
    
    if (!acc[product.category]) {
      acc[product.category] = 0;
    }
    acc[product.category] += categorySales;
    return acc;
  }, {} as Record<string, number>);

  if (!isClient) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-xl text-gray-600">Cargando Dashboard...</p>
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
              <h1 className="text-3xl font-bold text-gray-900">Dashboard Administrativo</h1>
              <p className="text-gray-600 mt-2">Resumen general del gimnasio</p>
            </div>
            <button
              onClick={refreshData}
              disabled={refreshing}
              className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white px-4 py-2 rounded-lg font-semibold transition-colors flex items-center gap-2"
            >
              {refreshing ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  Actualizando...
                </>
              ) : (
                <>
                  🔄 Actualizar Datos
                </>
              )}
            </button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-3 bg-blue-100 rounded-lg">
                <span className="text-2xl">👥</span>
              </div>
              <div className="ml-4">
                <p className="text-sm text-gray-600">Miembros Activos</p>
                <p className="text-2xl font-bold text-gray-900">{activeUsers}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-3 bg-green-100 rounded-lg">
                <span className="text-2xl">💰</span>
              </div>
              <div className="ml-4">
                <p className="text-sm text-gray-600">Ventas Hoy</p>
                <p className="text-2xl font-bold text-gray-900">{todaySales.length}</p>
                <p className="text-sm text-green-600">${todayRevenue.toFixed(2)} MXN</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-3 bg-yellow-100 rounded-lg">
                <span className="text-2xl">📦</span>
              </div>
              <div className="ml-4">
                <p className="text-sm text-gray-600">Productos</p>
                <p className="text-2xl font-bold text-gray-900">{totalProducts}</p>
                <p className="text-sm text-gray-500">Valor: ${totalStockValue.toFixed(2)}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-3 bg-red-100 rounded-lg">
                <span className="text-2xl">⚠️</span>
              </div>
              <div className="ml-4">
                <p className="text-sm text-gray-600">Stock Bajo</p>
                <p className="text-2xl font-bold text-gray-900">{lowStockProducts.length}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <button
            onClick={() => onPageChange('users')}
            className="bg-blue-600 hover:bg-blue-700 text-white p-6 rounded-lg text-left transition-colors"
          >
            <div className="flex items-center mb-3">
              <span className="text-3xl mr-3">👤</span>
              <h3 className="text-xl font-semibold">Gestión de Usuarios</h3>
            </div>
            <p className="text-blue-100">Registrar y administrar miembros</p>
          </button>
          
          <button
            onClick={() => onPageChange('pos')}
            className="bg-green-600 hover:bg-green-700 text-white p-6 rounded-lg text-left transition-colors"
          >
            <div className="flex items-center mb-3">
              <span className="text-3xl mr-3">🛒</span>
              <h3 className="text-xl font-semibold">Punto de Venta</h3>
            </div>
            <p className="text-green-100">Vender productos y suplementos</p>
          </button>
          
          <button
            onClick={() => onPageChange('inventory')}
            className="bg-purple-600 hover:bg-purple-700 text-white p-6 rounded-lg text-left transition-colors"
          >
            <div className="flex items-center mb-3">
              <span className="text-3xl mr-3">📊</span>
              <h3 className="text-xl font-semibold">Control de Inventario</h3>
            </div>
            <p className="text-purple-100">Administrar productos y stock</p>
          </button>
        </div>

        {/* Recent Activity */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Recent Members */}
          <div className="bg-white rounded-lg shadow">
            <div className="p-6 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">Miembros Recientes</h3>
            </div>
            <div className="p-6">
              {recentActiveUsers.length > 0 ? (
                <div className="space-y-4">
                  {recentActiveUsers.map(user => (
                    <div key={user.id} className="flex items-center justify-between">
                      <div>
                        <p className="font-medium text-gray-900">{user.name}</p>
                        <p className="text-sm text-gray-500">{user.email}</p>
                      </div>
                      <div className="text-right">
                        <span className="px-2 py-1 rounded text-xs bg-green-100 text-green-800">
                          Activo
                        </span>
                        <p className="text-xs text-gray-500 mt-1 capitalize">{user.membershipType}</p>
                        <p className="text-xs text-gray-400 mt-1">
                          Registrado: {new Date(user.startDate).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500 text-center py-4">No hay miembros activos registrados</p>
              )}
            </div>
          </div>

          {/* Recent Sales */}
          <div className="bg-white rounded-lg shadow">
            <div className="p-6 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">Ventas Recientes</h3>
            </div>
            <div className="p-6">
              {recentSales.length > 0 ? (
                <div className="space-y-4">
                  {recentSales.map(sale => (
                    <div key={sale.id} className="flex items-center justify-between">
                      <div>
                        <p className="font-medium text-gray-900">
                          {sale.customerName || 'Cliente general'}
                        </p>
                        <p className="text-sm text-gray-500">
                          {sale.products.length} producto(s)
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold text-gray-900">${sale.total.toFixed(2)}</p>
                        <p className="text-xs text-gray-500">
                          {new Date(sale.date).toLocaleDateString()}
                        </p>
                        <p className="text-xs text-gray-400">
                          {new Date(sale.date).toLocaleTimeString()}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500 text-center py-4">No hay ventas registradas</p>
              )}
            </div>
          </div>
        </div>

        {/* Low Stock Alert */}
        {lowStockProducts.length > 0 && (
          <div className="mt-8 bg-red-50 border border-red-200 rounded-lg p-6">
            <div className="flex items-center">
              <span className="text-2xl mr-3">⚠️</span>
              <div>
                <h3 className="text-lg font-semibold text-red-800">Productos con Stock Bajo</h3>
                <p className="text-red-600">Los siguientes productos necesitan reabastecimiento:</p>
              </div>
            </div>
            <div className="mt-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {lowStockProducts.map(product => (
                <div key={product.id} className="bg-white p-4 rounded-lg border border-red-200">
                  <p className="font-medium text-gray-900">{product.name}</p>
                  <p className="text-sm text-red-600">Stock: {product.stock} unidades</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
