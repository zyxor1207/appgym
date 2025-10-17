'use client';

import { useState, useEffect } from 'react';
import { supabase } from './lib/supabaseClient';

interface Product {
  id: number;
  nombre: string;
  precio: number;
  stock: number;
  categoria: string;
}


interface PointOfSaleProps {
  onPageChange: (page: string) => void;
}

export default function PointOfSale({ onPageChange }: PointOfSaleProps) {
  const [products, setProducts] = useState<Product[]>([]);
  const [cart, setCart] = useState<{ productId: number; quantity: number }[]>([]);
  const [customerName, setCustomerName] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [isClient, setIsClient] = useState(false);
  const [loading, setLoading] = useState(true);
  const [notification, setNotification] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  

  // Cargar productos desde Supabase
  useEffect(() => {
    setIsClient(true);
    loadProducts();
  }, []);


  const loadProducts = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('productos')
        .select('*')
        .order('nombre');
      
      if (error) throw error;
      setProducts(data || []);
    } catch (error) {
      console.error('Error loading products:', error);
      showNotification('error', 'Error al cargar productos');
    } finally {
      setLoading(false);
    }
  };


  const showNotification = (type: 'success' | 'error', message: string) => {
    setNotification({ type, message });
    setTimeout(() => setNotification(null), 3000);
  };



  const addToCart = (productId: number) => {
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

  const removeFromCart = (productId: number) => {
    setCart(cart.filter(item => item.productId !== productId));
  };

  const updateCartQuantity = (productId: number, quantity: number) => {
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
      return total + (product ? product.precio * item.quantity : 0);
    }, 0);
  };

  const calculateFinalTotal = () => {
    return calculateTotal();
  };

  const processSale = async () => {
    if (cart.length === 0) return;
    
    try {
      // Actualizar stock en la base de datos
      for (const item of cart) {
        const product = products.find(p => p.id === item.productId);
        if (product) {
          const newStock = product.stock - item.quantity;
          const { error } = await supabase
            .from('productos')
            .update({ stock: newStock })
            .eq('id', product.id);
          
          if (error) throw error;
        }
      }
      
      // Actualizar inventario local
      setProducts(products.map(product => {
        const cartItem = cart.find(item => item.productId === product.id);
        if (cartItem) {
          return { ...product, stock: product.stock - cartItem.quantity };
        }
        return product;
      }));
      
      const total = calculateFinalTotal();
      
      // Guardar venta en la base de datos
      const saleItems = cart.map(item => {
        const product = products.find(p => p.id === item.productId);
        return product ? {
          productId: product.id,
          productName: product.nombre,
          price: product.precio,
          quantity: item.quantity,
          subtotal: product.precio * item.quantity
        } : {
          productId: item.productId,
          productName: 'Producto no encontrado',
          price: 0,
          quantity: item.quantity,
          subtotal: 0
        };
      });

      console.log('Guardando venta en la base de datos...', {
        cliente_nombre: customerName || null,
        total: total,
        productos: saleItems
      });

      const { data: saleData, error: saleError } = await supabase
        .from('ventas')
        .insert([{
          cliente_nombre: customerName || null,
          total: total,
          productos: saleItems
        }])
        .select();

      if (saleError) {
        console.error('Error al guardar venta:', saleError);
        throw saleError;
      }

      console.log('Venta guardada exitosamente:', saleData);
      
      setCart([]);
      setCustomerName('');
      
      showNotification('success', `Venta procesada exitosamente! Total: $${total.toFixed(2)} MXN`);
    } catch (error) {
      console.error('Error processing sale:', error);
      showNotification('error', 'Error al procesar la venta');
    }
  };

  const clearCart = () => {
    if (cart.length > 0 && confirm('¿Estás seguro de que quieres limpiar el carrito?')) {
      setCart([]);
      setCustomerName('');
    }
  };

  // Filtrar productos
  const filteredProducts = products.filter(product => {
    const matchesSearch = product.nombre.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || product.categoria === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  // Obtener categorías únicas
  const categories = ['all', ...Array.from(new Set(products.map(p => p.categoria)))];

  if (!isClient || loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-xl text-gray-600">Cargando punto de venta...</p>
        </div>
      </div>
    );
  }

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
        {/* Header */}
        <div className="mb-8">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Punto de Venta</h1>
              <p className="text-gray-600 mt-2">Realiza ventas de productos y suplementos</p>
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => onPageChange('sales')}
                className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg font-semibold transition-colors"
              >
                📊 Ver Historial de Ventas
              </button>
            </div>
          </div>
        </div>

        {/* Resumen de inventario */}
        {products.filter(p => p.stock < 10).length > 0 && (
          <div className="mb-6 bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <div className="flex items-center">
              <span className="text-2xl mr-3">⚠️</span>
              <div>
                <h3 className="font-semibold text-yellow-800">Productos con Stock Bajo</h3>
                <p className="text-sm text-yellow-700">
                  {products.filter(p => p.stock < 10).length} producto(s) tienen menos de 10 unidades en stock
                </p>
              </div>
            </div>
            <div className="mt-3 flex flex-wrap gap-2">
              {products.filter(p => p.stock < 10).map(product => (
                <span key={product.id} className="bg-yellow-100 text-yellow-800 px-2 py-1 rounded text-sm">
                  {product.nombre} ({product.stock})
                </span>
              ))}
            </div>
          </div>
        )}


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
                    onChange={(e) => setSelectedCategory(e.target.value)}
                    className="p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="all">Todas las categorías</option>
                    {categories.filter(cat => cat !== 'all').map(category => (
                      <option key={category} value={category}>
                        {category}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-h-96 overflow-y-auto">
                {filteredProducts.map(product => (
                  <div key={product.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <h3 className="font-semibold text-gray-900">{product.nombre}</h3>
                        <p className="text-sm text-gray-500 capitalize">{product.categoria}</p>
                      </div>
                      <span className="text-lg font-bold text-green-600">${product.precio}</span>
                    </div>
                    <div className="flex justify-between items-center mb-2">
                      <span className={`text-sm px-2 py-1 rounded ${
                        product.stock < 10 
                          ? 'bg-red-100 text-red-800' 
                          : 'bg-green-100 text-green-800'
                      }`}>
                        Stock: {product.stock}
                      </span>
                    </div>
                    <div className="flex justify-center">
                      <button
                        onClick={() => addToCart(product.id)}
                        disabled={product.stock <= 0}
                        className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-white px-4 py-2 rounded-lg text-sm font-semibold transition-colors"
                      >
                        {product.stock <= 0 ? 'Sin Stock' : 'Agregar al Carrito'}
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
                        <p className="font-medium text-gray-900">{product.nombre}</p>
                        <p className="text-sm text-gray-500">${product.precio} c/u</p>
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


      </div>
    </div>
  );
}