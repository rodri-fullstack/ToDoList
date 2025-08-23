# 📋 Gestor de Tareas - Aplicación Web Completa

Una aplicación web moderna y responsiva para gestionar tareas personales y profesionales, construida con React, Vite y un sistema completo de autenticación.

## ✨ Características Principales

### 🔐 **Sistema de Autenticación Completo**
- **Registro de usuarios** con nombre de usuario, email y contraseña
- **Inicio de sesión** seguro para usuarios registrados
- **Modo invitado** para uso sin registro
- **Perfiles de usuario** con gestión de sesiones
- **Tareas separadas por usuario** - cada usuario ve solo sus propias tareas
- **Persistencia de sesiones** usando localStorage

### 📝 **Gestión Avanzada de Tareas**
- **Crear tareas** con título, descripción, categoría y fecha límite
- **Editar tareas** existentes en tiempo real
- **Marcar como completadas** con efectos visuales
- **Eliminar tareas** con confirmación de seguridad
- **Fechas límite** con calendario interactivo (solo fecha, sin tiempo)
- **Sistema de categorías** predefinidas y personalizables

### 🎯 **Organización y Filtros**
- **Categorías**: General, Trabajo, Personal, Estudio, Hogar, Salud, Finanzas
- **Filtros por estado**: Todas, Pendientes, Completadas
- **Filtros por categoría** para mejor organización
- **Búsqueda de texto** en títulos y descripciones
- **Ordenamiento múltiple**: Por fecha (ascendente/descendente), estado y creación

### 🎨 **Interfaz de Usuario Moderna**
- **Pestañas organizadas**: Tareas, Nueva Tarea, Estadísticas
- **Diseño responsivo** que se adapta a cualquier dispositivo
- **Animaciones suaves** y efectos visuales
- **Iconos descriptivos** para mejor comprensión
- **Colores temáticos** por categoría
- **Modales elegantes** para formularios y perfiles

### 💾 **Persistencia y Datos**
- **Almacenamiento local** en el navegador
- **Claves de almacenamiento** separadas por usuario
- **Formato JSON** para fácil exportación/importación
- **Versionado** para futuras actualizaciones

## 🚀 Tecnologías Utilizadas

- **React 18** - Biblioteca de interfaz de usuario moderna
- **Vite** - Herramienta de construcción rápida y eficiente
- **Context API** - Gestión de estado global para autenticación
- **CSS3** - Estilos modernos con variables y animaciones
- **LocalStorage** - Persistencia de datos en el navegador
- **ES6+** - Características modernas de JavaScript
- **Hooks personalizados** - Lógica reutilizable

## 📦 Instalación y Uso

### 1. **Clonar el repositorio:**
```bash
git clone <url-del-repositorio>
cd ToDoList
```

### 2. **Instalar dependencias:**
```bash
npm install
```

### 3. **Ejecutar en modo desarrollo:**
```bash
npm run dev
```

### 4. **Construir para producción:**
```bash
npm run build
```

### 5. **Ejecutar tests:**
```bash
npm test
```

## 🏗️ Estructura del Proyecto

```
src/
├── components/              # Componentes React reutilizables
│   ├── Modal.jsx           # Modal base para formularios
│   ├── Tabs.jsx            # Sistema de pestañas
│   ├── TaskForm.jsx        # Formulario de creación/edición
│   ├── TaskItem.jsx        # Elemento individual de tarea
│   ├── TaskList.jsx        # Lista de tareas
│   ├── Login.jsx           # Componente de autenticación
│   └── UserProfile.jsx     # Perfil de usuario
├── contexts/                # Contextos de React
│   └── AuthContext.jsx     # Contexto de autenticación
├── hooks/                   # Hooks personalizados
│   └── useLocalStorage.js  # Hook para localStorage
├── utils/                   # Utilidades y funciones
│   └── tasks.js            # Lógica de filtrado y ordenamiento
├── App.jsx                  # Componente principal
├── main.jsx                 # Punto de entrada
└── styles.css               # Estilos globales
```

## 🔧 Funcionalidades Detalladas

### **Sistema de Autenticación**
- **Registro**: Crear cuenta con nombre de usuario único, email y contraseña
- **Login**: Iniciar sesión con credenciales existentes
- **Modo Invitado**: Usar la aplicación sin registro (tareas temporales)
- **Perfil de Usuario**: Ver información de la cuenta y cerrar sesión
- **Persistencia**: Las sesiones se mantienen entre recargas del navegador

### **Gestión de Tareas**
- **Crear**: Título, descripción, categoría y fecha límite
- **Editar**: Modificar cualquier campo de la tarea
- **Completar**: Marcar tareas como terminadas
- **Eliminar**: Borrar tareas con confirmación
- **Fechas**: Solo selección de fecha (sin tiempo específico)

### **Organización Inteligente**
- **Categorías**: 7 categorías predefinidas para organizar tareas
- **Filtros**: Por estado (todas/pendientes/completadas) y categoría
- **Búsqueda**: Texto en tiempo real en títulos y descripciones
- **Ordenamiento**: Múltiples opciones de orden por fecha y estado

### **Interfaz de Usuario**
- **Pestañas**: Organización clara en Tareas, Nueva Tarea y Estadísticas
- **Responsivo**: Adaptable a móviles, tablets y escritorio
- **Modales**: Formularios elegantes para crear/editar tareas
- **Animaciones**: Transiciones suaves y efectos visuales

## 🎨 Personalización

La aplicación utiliza variables CSS para facilitar la personalización:

```css
:root {
  --primary: #4f46e5;        /* Color principal */
  --background: #f8fafc;     /* Fondo de la aplicación */
  --card: #ffffff;           /* Fondo de tarjetas */
  --text: #0f172a;           /* Color de texto principal */
  --radius: 12px;            /* Radio de bordes */
  --shadow: 0 8px 24px rgba(0,0,0,.1); /* Sombra por defecto */
}
```

## 🔐 Claves de Almacenamiento

La aplicación utiliza las siguientes claves en localStorage:
- `lista-tareas.currentUser` - Usuario actual autenticado
- `lista-tareas.users` - Base de datos de usuarios registrados
- `lista-tareas.v2.{userId}` - Tareas del usuario específico

## 🧪 Testing

El proyecto incluye tests completos usando Vitest y React Testing Library:
- Tests unitarios para componentes
- Tests para el contexto de autenticación
- Tests para utilidades y hooks
- Configuración de testing optimizada

## 📱 Compatibilidad

- **Navegadores**: Chrome, Firefox, Safari, Edge (versiones modernas)
- **Dispositivos**: Móviles, tablets y escritorio
- **Resoluciones**: Responsive design para todas las pantallas

## 🤝 Contribuir

1. Fork el proyecto
2. Crea una rama para tu feature (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abre un Pull Request

## 📄 Licencia

Este proyecto está bajo la Licencia MIT. Ver el archivo `LICENSE` para más detalles.

## 📞 Contacto

Para preguntas o sugerencias, por favor abre un issue en el repositorio.

---

**Desarrollado con ❤️ usando React, Vite y un sistema completo de autenticación**

*Última actualización: Diciembre 2024*

