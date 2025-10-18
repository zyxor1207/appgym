'use client';

import { useState, useEffect } from 'react';
import { supabase } from './lib/supabaseClient';
import ValidationAlert from './ValidationAlert';

interface Product {
  id: number;
  nombre: string;
  precio: number;
  stock: number;
  categoria: string;
}

interface NewProduct {
  nombre: string;
  precio: number;
  stock: number;
  categoria: string;
}

interface InventoryManagementProps {
  onPageChange: (page: string) => void;
}

export default function InventoryManagement({ onPageChange }: InventoryManagementProps) {
  // Categorías predefinidas
  const predefinedCategories = [
    'Agua',
    'Proteínas',
    'Suplementos',
    'Bebidas Energéticas',
    'Snacks Saludables',
    'Ropa Deportiva',
    'Accesorios',
    'Vitaminas',
    'Creatina',
    'BCAA',
    'Pre-entreno',
    'Otros'
  ];

  const [products, setProducts] = useState<Product[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [isClient, setIsClient] = useState(false);
  const [loading, setLoading] = useState(true);
  const [showAddProduct, setShowAddProduct] = useState(false);
  const [showEditProduct, setShowEditProduct] = useState(false);
  const [showStockModal, setShowStockModal] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [newProduct, setNewProduct] = useState<NewProduct>({
    nombre: '',
    precio: 0,
    stock: 0,
    categoria: ''
  });
  const [stockUpdate, setStockUpdate] = useState({ type: 'add', quantity: 0 });
  const [notification, setNotification] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  const [showAddValidationAlert, setShowAddValidationAlert] = useState(false);
  const [showEditValidationAlert, setShowEditValidationAlert] = useState(false);
  const [showStockValidationAlert, setShowStockValidationAlert] = useState(false);

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

  // Función para validar formulario de agregar producto
  const validateAddProductForm = (): boolean => {
    const { nombre, precio, stock, categoria } = newProduct;
    
    if (!nombre || typeof nombre !== 'string' || !nombre.trim()) return false;
    if (precio <= 0) return false;
    if (stock < 0) return false;
    if (!categoria || typeof categoria !== 'string' || !categoria.trim()) return false;
    
    return true;
  };

  // Función para validar formulario de editar producto
  const validateEditProductForm = (): boolean => {
    if (!editingProduct) return false;
    
    const { nombre, precio, stock, categoria } = editingProduct;
    
    if (!nombre || typeof nombre !== 'string' || !nombre.trim()) return false;
    if (precio <= 0) return false;
    if (stock < 0) return false;
    if (!categoria || typeof categoria !== 'string' || !categoria.trim()) return false;
    
    return true;
  };

  // Función para validar formulario de actualizar stock
  const validateStockForm = (): boolean => {
    const { quantity } = stockUpdate;
    
    if (quantity <= 0) return false;
    
    return true;
  };

  // Funciones para manejar productos
  const addProduct = async () => {
    // Validar formulario antes de proceder
    if (!validateAddProductForm()) {
      setShowAddValidationAlert(true);
      return;
    }

    try {
      const { data, error } = await supabase
        .from('productos')
        .insert([newProduct])
        .select();

      if (error) throw error;
      
      setProducts([...products, data[0]]);
      setNewProduct({ nombre: '', precio: 0, stock: 0, categoria: '' });
      setShowAddProduct(false);
      showNotification('success', 'Producto agregado exitosamente');
    } catch (error) {
      console.error('Error adding product:', error);
      showNotification('error', 'Error al agregar producto');
    }
  };

  const updateStock = async () => {
    if (!selectedProduct) return;

    // Validar formulario antes de proceder
    if (!validateStockForm()) {
      setShowStockValidationAlert(true);
      return;
    }

    try {
      const newStock = stockUpdate.type === 'add' 
        ? selectedProduct.stock + stockUpdate.quantity
        : selectedProduct.stock - stockUpdate.quantity;

      if (newStock < 0) {
        showNotification('error', 'No se puede tener stock negativo');
        return;
      }

      const { error } = await supabase
        .from('productos')
        .update({ stock: newStock })
        .eq('id', selectedProduct.id);

      if (error) throw error;

      setProducts(products.map(p => 
        p.id === selectedProduct.id ? { ...p, stock: newStock } : p
      ));
      
      setShowStockModal(false);
      setSelectedProduct(null);
      setStockUpdate({ type: 'add', quantity: 0 });
      showNotification('success', 'Stock actualizado exitosamente');
    } catch (error) {
      console.error('Error updating stock:', error);
      showNotification('error', 'Error al actualizar stock');
    }
  };

  const editProduct = async () => {
    if (!editingProduct) return;

    // Validar formulario antes de proceder
    if (!validateEditProductForm()) {
      setShowEditValidationAlert(true);
      return;
    }

    try {
      const { error } = await supabase
        .from('productos')
        .update({
          nombre: editingProduct.nombre,
          precio: editingProduct.precio,
          categoria: editingProduct.categoria
        })
        .eq('id', editingProduct.id);

      if (error) throw error;

      setProducts(products.map(p => 
        p.id === editingProduct.id ? editingProduct : p
      ));
      
      setShowEditProduct(false);
      setEditingProduct(null);
      showNotification('success', 'Producto actualizado exitosamente');
    } catch (error) {
      console.error('Error updating product:', error);
      showNotification('error', 'Error al actualizar producto');
    }
  };

  const deleteProduct = async (productId: number) => {
    if (!confirm('¿Estás seguro de que quieres eliminar este producto?')) return;

    try {
      const { error } = await supabase
        .from('productos')
        .delete()
        .eq('id', productId);

      if (error) throw error;

      setProducts(products.filter(p => p.id !== productId));
      showNotification('success', 'Producto eliminado exitosamente');
    } catch (error) {
      console.error('Error deleting product:', error);
      showNotification('error', 'Error al eliminar producto');
    }
  };

  // Filtrar productos
  const filteredProducts = products.filter(product => {
    const matchesSearch = product.nombre.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || product.categoria === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  // Obtener categorías únicas (incluyendo las predefinidas y las que ya existen en productos)
  const existingCategories = Array.from(new Set(products.map(p => p.categoria)));
  const allCategories = ['all', ...predefinedCategories, ...existingCategories.filter(cat => !predefinedCategories.includes(cat))];

  // Estadísticas
  const totalProducts = products.length;
  const lowStockProducts = products.filter(product => product.stock < 10);
  const outOfStockProducts = products.filter(product => product.stock === 0);
  const totalStockValue = products.reduce((total, product) => total + (product.precio * product.stock), 0);

  if (!isClient || loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-xl text-gray-600">Cargando inventario...</p>
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
              <h1 className="text-3xl font-bold text-gray-900">Gestión de Inventario</h1>
              <p className="text-gray-600 mt-2">Administra productos y controla el stock</p>
            </div>
            <button
              onClick={() => setShowAddProduct(true)}
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-semibold transition-colors"
            >
              + Agregar Producto
            </button>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6 mb-6 md:mb-8">
          <div className="bg-white rounded-lg shadow p-4 md:p-6">
            <div className="flex items-center">
              <div className="p-2 md:p-3 bg-blue-100 rounded-lg">
                <span className="text-lg md:text-2xl">📦</span>
              </div>
              <div className="ml-2 md:ml-4">
                <p className="text-xs md:text-sm text-gray-600">Total Productos</p>
                <p className="text-lg md:text-2xl font-bold text-gray-900">{totalProducts}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow p-4 md:p-6">
            <div className="flex items-center">
              <div className="p-2 md:p-3 bg-yellow-100 rounded-lg">
                <span className="text-lg md:text-2xl">⚠️</span>
              </div>
              <div className="ml-2 md:ml-4">
                <p className="text-xs md:text-sm text-gray-600">Stock Bajo</p>
                <p className="text-lg md:text-2xl font-bold text-gray-900">{lowStockProducts.length}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow p-4 md:p-6">
            <div className="flex items-center">
              <div className="p-2 md:p-3 bg-red-100 rounded-lg">
                <span className="text-lg md:text-2xl">❌</span>
              </div>
              <div className="ml-2 md:ml-4">
                <p className="text-xs md:text-sm text-gray-600">Sin Stock</p>
                <p className="text-lg md:text-2xl font-bold text-gray-900">{outOfStockProducts.length}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow p-4 md:p-6">
            <div className="flex items-center">
              <div className="p-2 md:p-3 bg-green-100 rounded-lg">
                <span className="text-lg md:text-2xl">💰</span>
              </div>
              <div className="ml-2 md:ml-4">
                <p className="text-xs md:text-sm text-gray-600">Valor Total</p>
                <p className="text-lg md:text-2xl font-bold text-gray-900">${totalStockValue.toFixed(2)}</p>
              </div>
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

        {/* Filters */}
        <div className="bg-white rounded-lg shadow p-4 md:p-6 mb-4 md:mb-6">
          <div className="flex flex-col gap-4">
            <div className="flex-1">
              <input
                type="text"
                placeholder="Buscar productos..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full p-2 md:p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm md:text-base"
              />
            </div>
            <div className="w-full sm:w-auto">
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="w-full sm:w-auto p-2 md:p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm md:text-base"
              >
                <option value="all">Todas las categorías</option>
                {allCategories.filter(cat => cat !== 'all').map(category => (
                  <option key={category} value={category}>
                    {category}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Products Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
                {filteredProducts.map(product => (
            <div key={product.id} className="bg-white rounded-lg shadow p-4 md:p-6 hover:shadow-lg transition-shadow">
              <div className="flex justify-between items-start mb-3 md:mb-4">
                <div className="flex-1 min-w-0">
                  <h3 className="text-base md:text-lg font-semibold text-gray-900 mb-1 truncate">{product.nombre}</h3>
                  <p className="text-xs md:text-sm text-gray-500 capitalize">{product.categoria}</p>
                </div>
                <div className="flex gap-1">
                  <button
                    onClick={() => {
                      setSelectedProduct(product);
                      setShowStockModal(true);
                    }}
                    className="bg-yellow-600 hover:bg-yellow-700 text-white px-2 py-1 md:px-3 rounded text-xs font-semibold transition-colors"
                    title="Gestionar Stock"
                  >
                    📦
                  </button>
                        <button
                          onClick={() => {
                      setEditingProduct({...product});
                      setShowEditProduct(true);
                    }}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-2 py-1 md:px-3 rounded text-xs font-semibold transition-colors"
                    title="Editar Producto"
                  >
                    ✏️
                  </button>
                  <button
                    onClick={() => deleteProduct(product.id)}
                    className="bg-red-600 hover:bg-red-700 text-white px-2 py-1 md:px-3 rounded text-xs font-semibold transition-colors"
                    title="Eliminar Producto"
                  >
                    🗑️
                        </button>
                      </div>
              </div>
              
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Precio:</span>
                  <span className="text-lg font-bold text-green-600">${product.precio}</span>
                </div>
                
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Stock:</span>
                  <span className={`px-2 py-1 rounded text-sm font-semibold ${
                          product.stock === 0 
                            ? 'bg-red-100 text-red-800' 
                            : product.stock < 10 
                            ? 'bg-yellow-100 text-yellow-800'
                            : 'bg-green-100 text-green-800'
                        }`}>
                    {product.stock} unidades
                        </span>
        </div>

                <div className="flex justify-between items-center pt-2 border-t border-gray-200">
                  <span className="text-sm text-gray-600">Valor total:</span>
                  <span className="text-sm font-semibold text-gray-900">
                    ${(product.precio * product.stock).toFixed(2)}
                  </span>
              </div>
            </div>
                </div>
              ))}
            </div>

        {filteredProducts.length === 0 && (
          <div className="text-center py-12">
            <span className="text-6xl mb-4 block">📦</span>
            <p className="text-gray-500 text-lg">No se encontraron productos</p>
            <p className="text-gray-400 text-sm mt-2">Agrega productos para comenzar a gestionar tu inventario</p>
          </div>
        )}
      </div>

      {/* Modal para agregar producto */}
      {showAddProduct && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h3 className="text-lg font-semibold mb-4">Agregar Nuevo Producto</h3>
            
            <ValidationAlert
              show={showAddValidationAlert}
              onClose={() => setShowAddValidationAlert(false)}
              title="Campos Obligatorios Incompletos"
              fields={[
                "Nombre del producto",
                "Precio (mayor a $0)",
                "Stock inicial (mayor o igual a 0)",
                "Categoría"
              ]}
            />
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Nombre *</label>
              <input
                type="text"
                  value={newProduct.nombre}
                  onChange={(e) => setNewProduct({...newProduct, nombre: e.target.value})}
                  className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                placeholder="Nombre del producto"
                required
              />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Precio *</label>
              <input
                type="number"
                  step="0.01"
                  min="0"
                  value={newProduct.precio === 0 ? '' : newProduct.precio}
                  onChange={(e) => {
                    const value = e.target.value;
                    setNewProduct({...newProduct, precio: value === '' ? 0 : parseFloat(value)});
                  }}
                  className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="0.00"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Stock Inicial *</label>
              <input
                type="number"
                  min="0"
                  value={newProduct.stock === 0 ? '' : newProduct.stock}
                  onChange={(e) => {
                    const value = e.target.value;
                    setNewProduct({...newProduct, stock: value === '' ? 0 : parseInt(value)});
                  }}
                  className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="0"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Categoría *</label>
              <select
                  value={newProduct.categoria}
                  onChange={(e) => setNewProduct({...newProduct, categoria: e.target.value})}
                  className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  required
                >
                  <option value="">Selecciona una categoría</option>
                  {predefinedCategories.map(category => (
                    <option key={category} value={category}>
                      {category}
                    </option>
                  ))}
              </select>
              </div>
            </div>
            <div className="flex gap-3 mt-6">
              <button
                onClick={() => {
                  setShowAddProduct(false);
                  setNewProduct({ nombre: '', precio: 0, stock: 0, categoria: '' });
                }}
                className="flex-1 bg-gray-300 hover:bg-gray-400 text-gray-700 py-2 rounded-lg font-semibold transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={addProduct}
                className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-lg font-semibold transition-colors"
              >
                Agregar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal para editar producto */}
      {showEditProduct && editingProduct && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h3 className="text-lg font-semibold mb-4">Editar Producto</h3>
            
            <ValidationAlert
              show={showEditValidationAlert}
              onClose={() => setShowEditValidationAlert(false)}
              title="Campos Obligatorios Incompletos"
              fields={[
                "Nombre del producto",
                "Precio (mayor a $0)",
                "Stock (mayor o igual a 0)",
                "Categoría"
              ]}
            />
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Nombre *</label>
              <input
                type="text"
                  value={editingProduct.nombre}
                  onChange={(e) => setEditingProduct({...editingProduct, nombre: e.target.value})}
                  className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                placeholder="Nombre del producto"
                required
              />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Precio *</label>
              <input
                type="number"
                  step="0.01"
                  min="0"
                  value={editingProduct.precio === 0 ? '' : editingProduct.precio}
                  onChange={(e) => {
                    const value = e.target.value;
                    setEditingProduct({...editingProduct, precio: value === '' ? 0 : parseFloat(value)});
                  }}
                  className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="0.00"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Categoría *</label>
              <select
                  value={editingProduct.categoria}
                  onChange={(e) => setEditingProduct({...editingProduct, categoria: e.target.value})}
                  className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  required
                >
                  <option value="">Selecciona una categoría</option>
                  {predefinedCategories.map(category => (
                    <option key={category} value={category}>
                      {category}
                    </option>
                  ))}
              </select>
              </div>
              <div className="p-3 bg-gray-50 border border-gray-200 rounded-lg">
                <p className="text-sm text-gray-600">
                  Stock actual: <span className="font-semibold">{editingProduct.stock}</span>
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  Para cambiar el stock, usa el botón "Gestionar Stock"
                </p>
              </div>
            </div>
            <div className="flex gap-3 mt-6">
              <button
                onClick={() => {
                  setShowEditProduct(false);
                  setEditingProduct(null);
                }}
                className="flex-1 bg-gray-300 hover:bg-gray-400 text-gray-700 py-2 rounded-lg font-semibold transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={editProduct}
                className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-lg font-semibold transition-colors"
              >
                Guardar Cambios
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal para gestionar stock */}
      {showStockModal && selectedProduct && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h3 className="text-lg font-semibold mb-4">Gestionar Stock - {selectedProduct.nombre}</h3>
            
            <ValidationAlert
              show={showStockValidationAlert}
              onClose={() => setShowStockValidationAlert(false)}
              title="Campos Obligatorios Incompletos"
              fields={[
                "Cantidad (mayor a 0)"
              ]}
            />
            <div className="mb-4">
              <p className="text-sm text-gray-600">Stock actual: <span className="font-semibold">{selectedProduct.stock}</span></p>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Tipo de operación</label>
                <select
                  value={stockUpdate.type}
                  onChange={(e) => setStockUpdate({...stockUpdate, type: e.target.value as 'add' | 'subtract'})}
                  className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                >
                  <option value="add">Agregar stock</option>
                  <option value="subtract">Restar stock</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Cantidad *</label>
                <input
                  type="number"
                  min="1"
                  value={stockUpdate.quantity === 0 ? '' : stockUpdate.quantity}
                  onChange={(e) => {
                    const value = e.target.value;
                    setStockUpdate({...stockUpdate, quantity: value === '' ? 0 : parseInt(value)});
                  }}
                  className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="Cantidad"
                  required
                />
              </div>
              {stockUpdate.type === 'subtract' && (
                <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                  <p className="text-sm text-yellow-800">
                    Stock resultante: {selectedProduct.stock - stockUpdate.quantity}
                  </p>
                </div>
              )}
              {stockUpdate.type === 'add' && (
                <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
                  <p className="text-sm text-green-800">
                    Stock resultante: {selectedProduct.stock + stockUpdate.quantity}
                  </p>
                </div>
              )}
            </div>
            <div className="flex gap-3 mt-6">
              <button
                onClick={() => {
                  setShowStockModal(false);
                  setSelectedProduct(null);
                  setStockUpdate({ type: 'add', quantity: 0 });
                }}
                className="flex-1 bg-gray-300 hover:bg-gray-400 text-gray-700 py-2 rounded-lg font-semibold transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={updateStock}
                className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-lg font-semibold transition-colors"
              >
                Actualizar Stock
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
