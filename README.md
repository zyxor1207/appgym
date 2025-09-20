# 💪 PowerGym - Sistema de Gestión para Gimnasio

Un sistema completo de gestión para gimnasios desarrollado con Next.js, TypeScript y Tailwind CSS.

## 🚀 Características

### 📱 Página Principal (Landing Page)
- **Diseño moderno y atractivo** con gradientes y animaciones
- **Información del gimnasio** y servicios
- **Planes de membresía** (Día, Semana, Mes)
- **Formularios de contacto** y registro
- **Diseño responsive** para móviles y desktop

### ⚙️ Sistema Administrativo
- **Dashboard principal** con estadísticas en tiempo real
- **Gestión de usuarios** y membresías
- **Punto de venta (POS)** para productos y suplementos
- **Control de inventario** con alertas de stock
- **Reportes de ventas** y análisis

## 🛠️ Tecnologías Utilizadas

- **Next.js 15** - Framework de React
- **TypeScript** - Tipado estático
- **Tailwind CSS** - Framework de CSS
- **React Hooks** - Gestión de estado
- **LocalStorage** - Persistencia de datos

## 📦 Instalación

1. **Clona el repositorio:**
```bash
git clone https://github.com/tu-usuario/powergym.git
cd powergym
```

2. **Instala las dependencias:**
```bash
npm install
```

3. **Ejecuta el proyecto:**
```bash
npm run dev
```

4. **Abre tu navegador:**
```
http://localhost:3000
```

## 🎯 Funcionalidades del Sistema

### 👥 Gestión de Usuarios
- Registro de miembros con información completa
- Control de membresías (día/semana/mes)
- Activación/desactivación de usuarios
- Renovación de membresías
- Búsqueda y filtros avanzados

### 🛒 Punto de Venta
- Catálogo de productos (agua, proteínas, suplementos)
- Carrito de compras interactivo
- Cálculo automático de totales con IVA (16%)
- Control de stock en tiempo real
- Registro de ventas con cliente opcional

### 📦 Control de Inventario
- Gestión completa de productos
- Alertas de stock bajo
- Actualización de precios y stock
- Categorización de productos
- Estadísticas de inventario

### 📊 Dashboard y Reportes
- Estadísticas en tiempo real
- Métricas de rendimiento
- Historial de ventas
- Análisis por período

## 🎨 Diseño

- **Interfaz moderna** con gradientes y efectos visuales
- **Diseño responsive** para todos los dispositivos
- **Navegación intuitiva** entre módulos
- **Modales interactivos** para formularios
- **Alertas visuales** para notificaciones

## 🔧 Estructura del Proyecto

```
appgym/
├── app/                    # Páginas de Next.js
│   ├── page.tsx           # Página principal
│   ├── layout.tsx         # Layout global
│   └── globals.css        # Estilos globales
├── components/            # Componentes React
│   ├── Hero.tsx          # Landing page
│   ├── AdminSystem.tsx   # Sistema administrativo
│   ├── AdminDashboard.tsx # Dashboard principal
│   ├── UserManagement.tsx # Gestión de usuarios
│   ├── PointOfSale.tsx   # Punto de venta
│   └── InventoryManagement.tsx # Control de inventario
├── public/               # Archivos estáticos
└── package.json         # Dependencias del proyecto
```

## 🚀 Uso del Sistema

### Para Clientes
1. Visita la página principal
2. Explora los planes de membresía
3. Usa el formulario de contacto
4. Regístrate para una membresía

### Para Administradores
1. Haz clic en el botón ⚙️ (esquina inferior derecha)
2. Accede al sistema administrativo
3. Gestiona usuarios, inventario y ventas
4. Revisa reportes y estadísticas

## 📱 Responsive Design

El sistema está optimizado para:
- **Desktop** (1024px+)
- **Tablet** (768px - 1023px)
- **Mobile** (320px - 767px)

## 🔒 Características de Seguridad

- Validación de datos en formularios
- Control de acceso al sistema administrativo
- Persistencia segura de datos en localStorage
- Validaciones de stock y precios

## 🎯 Próximas Mejoras

- [ ] Autenticación de usuarios
- [ ] Base de datos real (PostgreSQL/MongoDB)
- [ ] Sistema de notificaciones
- [ ] Reportes avanzados con gráficos
- [ ] Integración con sistemas de pago
- [ ] App móvil nativa

## 📄 Licencia

Este proyecto está bajo la Licencia MIT. Ver el archivo `LICENSE` para más detalles.

## 👨‍💻 Desarrollador

Desarrollado con ❤️ para la gestión eficiente de gimnasios.

---

**PowerGym** - Transformando la gestión de gimnasios, un entrenamiento a la vez. 💪