'use client';

import { useState, useEffect } from 'react';

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

interface PointOfSaleProps {
  onPageChange: (page: string) => void;
}

export default function PointOfSale({ onPageChange }: PointOfSaleProps) {
  const [products, setProducts] = useState<Product[]>([
    { id: '1', name: 'Agua 500ml', price: 15, stock: 100, category: 'water' },
    { id: '2', name: 'Proteína Whey', price: 350, stock: 25, category: 'protein' },
    { id: '3', name: 'Creatina', price: 280, stock: 15, category: 'supplements' },
    { id: '4', name: 'Agua 1L', price: 25, stock: 80, category: 'water' },
    { id: '5', name: 'BCAA', price: 420, stock: 20, category: 'supplements' },
    { id: '6', name: 'Pre-entreno', price: 380, stock: 12, category: 'supplements' },
    { id: '7', name: 'Proteína Caseína', price: 450, stock: 8, category: 'protein' },
    { id: '8', name: 'Glutamina', price: 320, stock: 18, category: 'supplements' },
    { id: '9', name: 'Multivitamínico', price: 250, stock: 30, category: 'supplements' },
    { id: '10', name: 'Proteína Vegetal', price: 380, stock: 15, category: 'protein' }
  ]);
  
  const [sales, setSales] = useState<Sale[]>([]);
  const [cart, setCart] = useState<{ productId: string; quantity: number }[]>([]);
  const [customerName, setCustomerName] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<'all' | 'water' | 'protein' | 'supplements'>('all');
  const [isClient, setIsClient] = useState(false);

  // Cargar datos del localStorage
  useEffect(() => {
    setIsClient(true);
    const savedSales = localStorage.getItem('gymSales');
    if (savedSales) setSales(JSON.parse(savedSales));
  }, []);

  // Guardar datos en localStorage
  useEffect(() => {
    if (isClient) {
      localStorage.setItem('gymSales', JSON.stringify(sales));
    }
  }, [sales, isClient]);

  const addToCart = (productId: string) => {
    const existingItem = cart.find(item => item.productId === productId);
    const product = products.find(p => p.id === productId);
    
    if (!product || product.stock <= 0) return;
    
    if (existingItem) {
      if (existingItem.quantity < product.stock) {
        setCart(cart.map(item => 
          item.productId === productId 
            ? { ...item, quantity: item.quantity + 1 }
            : item
        ));
      }
    } else {
      setCart([...cart, { productId, quantity: 1 }]);
    }
  };

  const removeFromCart = (productId: string) => {
    setCart(cart.filter(item => item.productId !== productId));
  };

  const updateCartQuantity = (productId: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(productId);
      return;
    }
    
    const product = products.find(p => p.id === productId);
    if (product && quantity <= product.stock) {
      setCart(cart.map(item => 
        item.productId === productId 
          ? { ...item, quantity }
          : item
      ));
    }
  };

  const calculateTotal = () => {
    return cart.reduce((total, item) => {
      const product = products.find(p => p.id === item.productId);
      return total + (product ? product.price * item.quantity : 0);
    }, 0);
  };

  const calculateTax = () => {
    return calculateTotal() * 0.16; // 16% IVA
  };

  const calculateFinalTotal = () => {
    return calculateTotal() + calculateTax();
  };

  const processSale = () => {
    if (cart.length === 0) return;
    
    const saleItems = cart.map(item => {
      const product = products.find(p => p.id === item.productId);
      return {
        productId: item.productId,
        quantity: item.quantity,
        price: product ? product.price : 0
      };
    });
    
    const sale: Sale = {
      id: Date.now().toString(),
      products: saleItems,
      total: calculateFinalTotal(),
      date: new Date().toISOString(),
      customerName: customerName || undefined
    };
    
    // Actualizar inventario
    setProducts(products.map(product => {
      const cartItem = cart.find(item => item.productId === product.id);
      if (cartItem) {
        return { ...product, stock: product.stock - cartItem.quantity };
      }
      return product;
    }));
    
    setSales([...sales, sale]);
    setCart([]);
    setCustomerName('');
    
    // Mostrar confirmación
    alert(`Venta procesada exitosamente!\nTotal: $${sale.total.toFixed(2)} MXN`);
  };

  const clearCart = () => {
    if (cart.length > 0 && confirm('¿Estás seguro de que quieres limpiar el carrito?')) {
      setCart([]);
      setCustomerName('');
    }
  };

  // Filtrar productos
  const filteredProducts = products.filter(product => {
    const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || product.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const todaySales = sales.filter(sale => 
    new Date(sale.date).toDateString() === new Date().toDateString()
  );
  const todayRevenue = todaySales.reduce((total, sale) => total + sale.total, 0);

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
              <h1 className="text-3xl font-bold text-gray-900">Punto de Venta</h1>
              <p className="text-gray-600 mt-2">Vende productos y suplementos</p>
            </div>
            <div className="text-right">
              <p className="text-sm text-gray-600">Ventas de hoy</p>
              <p className="text-2xl font-bold text-green-600">${todayRevenue.toFixed(2)} MXN</p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Productos */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-semibold">Productos Disponibles</h2>
                <div className="flex gap-4">
                  <input
                    type="text"
                    placeholder="Buscar productos..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                  <select
                    value={selectedCategory}
                    onChange={(e) => setSelectedCategory(e.target.value as 'all' | 'water' | 'protein' | 'supplements')}
                    className="p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="all">Todas las categorías</option>
                    <option value="water">Agua</option>
                    <option value="protein">Proteínas</option>
                    <option value="supplements">Suplementos</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-h-96 overflow-y-auto">
                {filteredProducts.map(product => (
                  <div key={product.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <h3 className="font-semibold text-gray-900">{product.name}</h3>
                        <p className="text-sm text-gray-500 capitalize">{product.category}</p>
                      </div>
                      <span className="text-lg font-bold text-green-600">${product.price}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className={`text-sm px-2 py-1 rounded ${
                        product.stock < 10 
                          ? 'bg-red-100 text-red-800' 
                          : 'bg-green-100 text-green-800'
                      }`}>
                        Stock: {product.stock}
                      </span>
                      <button
                        onClick={() => addToCart(product.id)}
                        disabled={product.stock <= 0}
                        className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-white px-4 py-2 rounded-lg text-sm font-semibold transition-colors"
                      >
                        {product.stock <= 0 ? 'Sin Stock' : 'Agregar'}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Carrito */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow p-6 sticky top-8">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-semibold">Carrito de Compras</h2>
                {cart.length > 0 && (
                  <button
                    onClick={clearCart}
                    className="text-red-600 hover:text-red-800 text-sm"
                  >
                    Limpiar
                  </button>
                )}
              </div>

              <div className="mb-4">
                <input
                  type="text"
                  placeholder="Nombre del cliente (opcional)"
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div className="space-y-3 max-h-64 overflow-y-auto mb-6">
                {cart.map(item => {
                  const product = products.find(p => p.id === item.productId);
                  if (!product) return null;
                  
                  return (
                    <div key={item.productId} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div className="flex-1">
                        <p className="font-medium text-gray-900">{product.name}</p>
                        <p className="text-sm text-gray-500">${product.price} c/u</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => updateCartQuantity(item.productId, item.quantity - 1)}
                          className="bg-red-500 hover:bg-red-600 text-white w-8 h-8 rounded-lg flex items-center justify-center text-sm"
                        >
                          -
                        </button>
                        <span className="w-8 text-center font-medium">{item.quantity}</span>
                        <button
                          onClick={() => updateCartQuantity(item.productId, item.quantity + 1)}
                          className="bg-green-500 hover:bg-green-600 text-white w-8 h-8 rounded-lg flex items-center justify-center text-sm"
                        >
                          +
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>

              {cart.length > 0 && (
                <div className="border-t border-gray-200 pt-4">
                  <div className="space-y-2 mb-4">
                    <div className="flex justify-between text-sm">
                      <span>Subtotal:</span>
                      <span>${calculateTotal().toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>IVA (16%):</span>
                      <span>${calculateTax().toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between text-lg font-bold border-t border-gray-200 pt-2">
                      <span>Total:</span>
                      <span className="text-green-600">${calculateFinalTotal().toFixed(2)} MXN</span>
                    </div>
                  </div>
                  
                  <button
                    onClick={processSale}
                    className="w-full bg-green-600 hover:bg-green-700 text-white py-3 rounded-lg font-semibold transition-colors"
                  >
                    Procesar Venta
                  </button>
                </div>
              )}

              {cart.length === 0 && (
                <div className="text-center py-8 text-gray-500">
                  <span className="text-4xl mb-2 block">🛒</span>
                  <p>El carrito está vacío</p>
                  <p className="text-sm">Agrega productos para comenzar</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Resumen de ventas del día */}
        {todaySales.length > 0 && (
          <div className="mt-8 bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold mb-4">Ventas de Hoy</h3>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Hora
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Cliente
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Productos
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Total
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {todaySales.slice(0, 10).map(sale => (
                    <tr key={sale.id}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {new Date(sale.date).toLocaleTimeString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {sale.customerName || 'Cliente general'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {sale.products.length} producto(s)
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        ${sale.total.toFixed(2)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
