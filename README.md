## Gestor de Tareas

Una aplicación web moderna y responsiva para gestionar tareas personales y profesionales, construida con React y Vite.

### Características principales

- ✨ **Interfaz moderna y intuitiva** con diseño responsivo
- 📱 **Completamente adaptada a móviles** y tablets
- 🎨 **Tema personalizable** con variables CSS
- 💾 **Persistencia de datos** usando localStorage
- 🔍 **Búsqueda y filtrado** avanzado de tareas
- 📊 **Estadísticas visuales** del progreso
- 🏷️ **Sistema de categorías** para organizar tareas
- 📅 **Gestión de fechas** con calendario interactivo
- ⏰ **Selector de hora** con opciones rápidas
- 🎯 **Filtros múltiples** por estado y categoría
- 📝 **Edición en línea** de tareas existentes
- 🗑️ **Eliminación segura** con confirmación
- 🎉 **Efectos visuales** y animaciones
- ♿ **Accesibilidad** mejorada con ARIA labels

### Tecnologías utilizadas

- **React 18** - Biblioteca de interfaz de usuario
- **Vite** - Herramienta de construcción rápida
- **CSS3** - Estilos modernos con variables y animaciones
- **LocalStorage** - Persistencia de datos en el navegador
- **ES6+** - Características modernas de JavaScript

### Instalación y uso

1. **Clonar el repositorio:**
   ```bash
   git clone <url-del-repositorio>
   cd lista-tareas
   ```

2. **Instalar dependencias:**
   ```bash
   npm install
   ```

3. **Ejecutar en modo desarrollo:**
   ```bash
   npm run dev
   ```

4. **Construir para producción:**
   ```bash
   npm run build
   ```

### Estructura del proyecto

```
src/
├── components/          # Componentes React reutilizables
│   ├── Modal.jsx       # Modal para formularios
│   ├── Tabs.jsx        # Sistema de pestañas
│   ├── TaskForm.jsx    # Formulario de creación/edición
│   ├── TaskItem.jsx    # Elemento individual de tarea
│   └── TaskList.jsx    # Lista de tareas
├── hooks/               # Hooks personalizados
│   └── useLocalStorage.js  # Hook para localStorage
├── App.jsx             # Componente principal
├── main.jsx            # Punto de entrada
└── styles.css          # Estilos globales
```

### Funcionalidades detalladas

#### Gestión de tareas
- **Crear tareas** con título, descripción y categoría
- **Editar tareas** existentes en tiempo real
- **Marcar como completadas** con efectos visuales
- **Eliminar tareas** con confirmación de seguridad
- **Fechas límite** con calendario interactivo
- **Horarios específicos** con selector de hora

#### Organización
- **Categorías predefinidas**: General, Trabajo, Personal, Estudio, Hogar, Salud, Finanzas
- **Filtros por estado**: Todas, Pendientes, Completadas
- **Filtros por categoría** para organizar mejor
- **Búsqueda de texto** en títulos y descripciones
- **Ordenamiento múltiple** por fecha, estado y creación

#### Interfaz de usuario
- **Pestañas organizadas**: Tareas, Nueva Tarea, Estadísticas
- **Diseño responsivo** que se adapta a cualquier dispositivo
- **Animaciones suaves** y efectos visuales
- **Iconos descriptivos** para mejor comprensión
- **Colores temáticos** por categoría

#### Persistencia de datos
- **Almacenamiento local** en el navegador
- **Clave de almacenamiento**: `lista-tareas.v2`
- **Formato JSON** para fácil exportación/importación
- **Versionado** para futuras actualizaciones

### Personalización

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

### Contribuir

1. Fork el proyecto
2. Crea una rama para tu feature (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abre un Pull Request

### Licencia

Este proyecto está bajo la Licencia MIT. Ver el archivo `LICENSE` para más detalles.

### Contacto

Para preguntas o sugerencias, por favor abre un issue en el repositorio.

---

**Desarrollado con ❤️ usando React y Vite**

