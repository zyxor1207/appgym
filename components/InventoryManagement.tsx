'use client';

import { useState, useEffect } from 'react';

interface Product {
  id: string;
  name: string;
  price: number;
  stock: number;
  category: 'water' | 'protein' | 'supplements';
}

interface InventoryManagementProps {
  onPageChange: (page: string) => void;
}

export default function InventoryManagement({ onPageChange }: InventoryManagementProps) {
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

  const [showAddForm, setShowAddForm] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<'all' | 'water' | 'protein' | 'supplements'>('all');
  const [isClient, setIsClient] = useState(false);

  const [newProduct, setNewProduct] = useState({
    name: '',
    price: 0,
    stock: 0,
    category: 'supplements' as 'water' | 'protein' | 'supplements'
  });

  // Cargar datos del localStorage
  useEffect(() => {
    setIsClient(true);
    const savedProducts = localStorage.getItem('gymProducts');
    if (savedProducts) setProducts(JSON.parse(savedProducts));
  }, []);

  // Guardar datos en localStorage
  useEffect(() => {
    if (isClient) {
      localStorage.setItem('gymProducts', JSON.stringify(products));
    }
  }, [products, isClient]);

  const addProduct = () => {
    if (!newProduct.name || newProduct.price <= 0 || newProduct.stock < 0) return;
    
    const product: Product = {
      id: Date.now().toString(),
      ...newProduct
    };
    
    setProducts([...products, product]);
    setNewProduct({ name: '', price: 0, stock: 0, category: 'supplements' });
    setShowAddForm(false);
  };

  const updateProduct = () => {
    if (!editingProduct) return;
    
    const updatedProducts = products.map(product => 
      product.id === editingProduct.id ? editingProduct : product
    );
    setProducts(updatedProducts);
    setEditingProduct(null);
  };

  const deleteProduct = (productId: string) => {
    if (confirm('¿Estás seguro de que quieres eliminar este producto?')) {
      setProducts(products.filter(product => product.id !== productId));
    }
  };

  const updateStock = (productId: string, newStock: number) => {
    if (newStock < 0) return;
    
    setProducts(products.map(product => 
      product.id === productId ? { ...product, stock: newStock } : product
    ));
  };

  const updatePrice = (productId: string, newPrice: number) => {
    if (newPrice <= 0) return;
    
    setProducts(products.map(product => 
      product.id === productId ? { ...product, price: newPrice } : product
    ));
  };

  // Filtrar productos
  const filteredProducts = products.filter(product => {
    const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || product.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  // Estadísticas
  const totalProducts = products.length;
  const lowStockProducts = products.filter(product => product.stock < 10);
  const outOfStockProducts = products.filter(product => product.stock === 0);
  const totalStockValue = products.reduce((total, product) => total + (product.price * product.stock), 0);

  // Productos por categoría
  const productsByCategory = products.reduce((acc, product) => {
    if (!acc[product.category]) {
      acc[product.category] = 0;
    }
    acc[product.category]++;
    return acc;
  }, {} as Record<string, number>);

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
              <h1 className="text-3xl font-bold text-gray-900">Gestión de Inventario</h1>
              <p className="text-gray-600 mt-2">Administra productos y controla el stock</p>
            </div>
            <button
              onClick={() => setShowAddForm(true)}
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-semibold transition-colors"
            >
              + Agregar Producto
            </button>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-3 bg-blue-100 rounded-lg">
                <span className="text-2xl">📦</span>
              </div>
              <div className="ml-4">
                <p className="text-sm text-gray-600">Total Productos</p>
                <p className="text-2xl font-bold text-gray-900">{totalProducts}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-3 bg-yellow-100 rounded-lg">
                <span className="text-2xl">⚠️</span>
              </div>
              <div className="ml-4">
                <p className="text-sm text-gray-600">Stock Bajo</p>
                <p className="text-2xl font-bold text-gray-900">{lowStockProducts.length}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-3 bg-red-100 rounded-lg">
                <span className="text-2xl">❌</span>
              </div>
              <div className="ml-4">
                <p className="text-sm text-gray-600">Sin Stock</p>
                <p className="text-2xl font-bold text-gray-900">{outOfStockProducts.length}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-3 bg-green-100 rounded-lg">
                <span className="text-2xl">💰</span>
              </div>
              <div className="ml-4">
                <p className="text-sm text-gray-600">Valor Total</p>
                <p className="text-2xl font-bold text-gray-900">${totalStockValue.toFixed(2)}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <input
                type="text"
                placeholder="Buscar productos..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <div>
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value as 'all' | 'water' | 'protein' | 'supplements')}
                className="p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="all">Todas las categorías</option>
                <option value="water">Agua</option>
                <option value="protein">Proteínas</option>
                <option value="supplements">Suplementos</option>
              </select>
            </div>
          </div>
        </div>

        {/* Products Table */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Producto
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Categoría
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Precio
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Stock
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Valor
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Acciones
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredProducts.map(product => (
                  <tr key={product.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{product.name}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800 capitalize">
                        {product.category}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <span className="text-sm text-gray-900">${product.price}</span>
                        <button
                          onClick={() => {
                            const newPrice = parseFloat(prompt(`Nuevo precio para ${product.name}:`) || '0');
                            if (newPrice > 0) updatePrice(product.id, newPrice);
                          }}
                          className="ml-2 text-blue-600 hover:text-blue-800 text-xs"
                        >
                          Editar
                        </button>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <span className={`text-sm px-2 py-1 rounded ${
                          product.stock === 0 
                            ? 'bg-red-100 text-red-800' 
                            : product.stock < 10 
                            ? 'bg-yellow-100 text-yellow-800'
                            : 'bg-green-100 text-green-800'
                        }`}>
                          {product.stock}
                        </span>
                        <button
                          onClick={() => {
                            const newStock = parseInt(prompt(`Nuevo stock para ${product.name}:`) || '0');
                            if (newStock >= 0) updateStock(product.id, newStock);
                          }}
                          className="ml-2 text-blue-600 hover:text-blue-800 text-xs"
                        >
                          Editar
                        </button>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      ${(product.price * product.stock).toFixed(2)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex space-x-2">
                        <button
                          onClick={() => setEditingProduct(product)}
                          className="text-blue-600 hover:text-blue-900"
                        >
                          Editar
                        </button>
                        <button
                          onClick={() => deleteProduct(product.id)}
                          className="text-red-600 hover:text-red-900"
                        >
                          Eliminar
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {filteredProducts.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-500 text-lg">No se encontraron productos</p>
          </div>
        )}

        {/* Low Stock Alert */}
        {lowStockProducts.length > 0 && (
          <div className="mt-8 bg-yellow-50 border border-yellow-200 rounded-lg p-6">
            <div className="flex items-center">
              <span className="text-2xl mr-3">⚠️</span>
              <div>
                <h3 className="text-lg font-semibold text-yellow-800">Productos con Stock Bajo</h3>
                <p className="text-yellow-600">Los siguientes productos necesitan reabastecimiento:</p>
              </div>
            </div>
            <div className="mt-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {lowStockProducts.map(product => (
                <div key={product.id} className="bg-white p-4 rounded-lg border border-yellow-200">
                  <p className="font-medium text-gray-900">{product.name}</p>
                  <p className="text-sm text-yellow-600">Stock: {product.stock} unidades</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Add Product Modal */}
      {showAddForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-8 w-full max-w-md mx-4">
            <h3 className="text-xl font-semibold mb-6">Agregar Nuevo Producto</h3>
            <div className="space-y-4">
              <input
                type="text"
                placeholder="Nombre del producto"
                value={newProduct.name}
                onChange={(e) => setNewProduct({...newProduct, name: e.target.value})}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              <input
                type="number"
                placeholder="Precio"
                value={newProduct.price || ''}
                onChange={(e) => setNewProduct({...newProduct, price: parseFloat(e.target.value) || 0})}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              <input
                type="number"
                placeholder="Stock inicial"
                value={newProduct.stock || ''}
                onChange={(e) => setNewProduct({...newProduct, stock: parseInt(e.target.value) || 0})}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              <select
                value={newProduct.category}
                onChange={(e) => setNewProduct({...newProduct, category: e.target.value as 'water' | 'protein' | 'supplements'})}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="water">Agua</option>
                <option value="protein">Proteína</option>
                <option value="supplements">Suplementos</option>
              </select>
            </div>
            <div className="flex gap-3 mt-6">
              <button
                onClick={addProduct}
                className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-lg font-semibold transition-colors"
              >
                Agregar
              </button>
              <button
                onClick={() => setShowAddForm(false)}
                className="flex-1 bg-gray-600 hover:bg-gray-700 text-white py-3 rounded-lg font-semibold transition-colors"
              >
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Product Modal */}
      {editingProduct && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-8 w-full max-w-md mx-4">
            <h3 className="text-xl font-semibold mb-6">Editar Producto</h3>
            <div className="space-y-4">
              <input
                type="text"
                placeholder="Nombre del producto"
                value={editingProduct.name}
                onChange={(e) => setEditingProduct({...editingProduct, name: e.target.value})}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              <input
                type="number"
                placeholder="Precio"
                value={editingProduct.price}
                onChange={(e) => setEditingProduct({...editingProduct, price: parseFloat(e.target.value) || 0})}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              <input
                type="number"
                placeholder="Stock"
                value={editingProduct.stock}
                onChange={(e) => setEditingProduct({...editingProduct, stock: parseInt(e.target.value) || 0})}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              <select
                value={editingProduct.category}
                onChange={(e) => setEditingProduct({...editingProduct, category: e.target.value as 'water' | 'protein' | 'supplements'})}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="water">Agua</option>
                <option value="protein">Proteína</option>
                <option value="supplements">Suplementos</option>
              </select>
            </div>
            <div className="flex gap-3 mt-6">
              <button
                onClick={updateProduct}
                className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-lg font-semibold transition-colors"
              >
                Actualizar
              </button>
              <button
                onClick={() => setEditingProduct(null)}
                className="flex-1 bg-gray-600 hover:bg-gray-700 text-white py-3 rounded-lg font-semibold transition-colors"
              >
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
