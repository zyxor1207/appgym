'use client';

import { useState, useEffect } from 'react';

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
  const [products, setProducts] = useState<Product[]>([
    { id: '1', name: 'Agua 500ml', price: 15, stock: 100, category: 'water' },
    { id: '2', name: 'Proteína Whey', price: 350, stock: 25, category: 'protein' },
    { id: '3', name: 'Creatina', price: 280, stock: 15, category: 'supplements' },
    { id: '4', name: 'Agua 1L', price: 25, stock: 80, category: 'water' },
    { id: '5', name: 'BCAA', price: 420, stock: 20, category: 'supplements' },
    { id: '6', name: 'Pre-entreno', price: 380, stock: 12, category: 'supplements' },
    { id: '7', name: 'Proteína Caseína', price: 450, stock: 8, category: 'protein' },
    { id: '8', name: 'Glutamina', price: 320, stock: 18, category: 'supplements' }
  ]);
  const [sales, setSales] = useState<Sale[]>([]);
  const [isClient, setIsClient] = useState(false);

  // Cargar datos del localStorage
  useEffect(() => {
    setIsClient(true);
    const savedUsers = localStorage.getItem('gymUsers');
    const savedSales = localStorage.getItem('gymSales');
    
    if (savedUsers) setUsers(JSON.parse(savedUsers));
    if (savedSales) setSales(JSON.parse(savedSales));
  }, []);

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
          <h1 className="text-3xl font-bold text-gray-900">Dashboard Administrativo</h1>
          <p className="text-gray-600 mt-2">Resumen general del gimnasio</p>
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
              {users.slice(0, 5).length > 0 ? (
                <div className="space-y-4">
                  {users.slice(0, 5).map(user => (
                    <div key={user.id} className="flex items-center justify-between">
                      <div>
                        <p className="font-medium text-gray-900">{user.name}</p>
                        <p className="text-sm text-gray-500">{user.email}</p>
                      </div>
                      <div className="text-right">
                        <span className={`px-2 py-1 rounded text-xs ${
                          user.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                        }`}>
                          {user.isActive ? 'Activo' : 'Inactivo'}
                        </span>
                        <p className="text-xs text-gray-500 mt-1 capitalize">{user.membershipType}</p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500 text-center py-4">No hay miembros registrados</p>
              )}
            </div>
          </div>

          {/* Recent Sales */}
          <div className="bg-white rounded-lg shadow">
            <div className="p-6 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">Ventas Recientes</h3>
            </div>
            <div className="p-6">
              {sales.slice(0, 5).length > 0 ? (
                <div className="space-y-4">
                  {sales.slice(0, 5).map(sale => (
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
