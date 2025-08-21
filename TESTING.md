# 🧪 Testing - Gestor de Tareas

Este documento describe cómo ejecutar y mantener los tests de la aplicación Gestor de Tareas.

## 📋 Dependencias Instaladas

Ya tienes todas las dependencias necesarias en tu `package.json`:

- **Vitest**: Framework de testing
- **React Testing Library**: Utilidades para testing de componentes React
- **@testing-library/user-event**: Simulación de interacciones de usuario
- **jsdom**: Entorno DOM para tests
- **@testing-library/jest-dom**: Matchers adicionales para assertions

## 🚀 Comandos de Testing

### Ejecutar Tests en Modo Watch
```bash
npm test
```
Los tests se ejecutarán en modo watch y se re-ejecutarán automáticamente cuando cambies archivos.

### Ejecutar Tests con UI
```bash
npm run test:ui
```
Abre una interfaz gráfica para ver los resultados de los tests.

### Ejecutar Tests Una Vez
```bash
npm run test:run
```
Ejecuta todos los tests una vez y termina.

## 📁 Estructura de Tests

```
src/
├── App.test.jsx          # Tests principales de la aplicación
├── test/
│   └── setup.js          # Configuración global de tests
└── vitest.config.js      # Configuración de Vitest
```

## 🧩 Funcionalidades Testeadas

### 1. ✅ Crear Tarea
- [x] Mostrar botón "Crear Tarea"
- [x] Abrir modal de nueva tarea
- [x] Crear tarea con título y descripción
- [x] Validar título obligatorio
- [x] Cerrar modal después de crear

### 2. ✅ Listar Tareas
- [x] Mostrar mensaje cuando no hay tareas
- [x] Mostrar tareas existentes
- [x] Mostrar resumen de tareas (total, pendientes, completadas)

### 3. ✅ Marcar Tarea como Completada/Pendiente
- [x] Mostrar estado "Pendiente" para tareas no completadas
- [x] Mostrar estado "Completada" para tareas completadas
- [x] Cambiar estado al hacer clic en botón

### 4. ✅ Editar Tarea
- [x] Mostrar botón de editar en cada tarea
- [x] Abrir modal de edición con datos pre-llenados
- [x] Actualizar tarea al editar y guardar

### 5. ✅ Eliminar Tarea
- [x] Mostrar botón de eliminar en cada tarea
- [x] Mostrar modal de confirmación
- [x] Eliminar tarea al confirmar
- [x] Cancelar eliminación

### 6. ✅ Guardar en localStorage
- [x] Guardar nuevas tareas en localStorage
- [x] Cargar tareas existentes desde localStorage
- [x] Manejar errores de localStorage graciosamente

### 7. ✅ Funcionalidades Adicionales
- [x] Mostrar título principal
- [x] Mostrar selector de usuario
- [x] Mostrar pestañas de navegación
- [x] Mostrar campo de búsqueda
- [x] Filtrar tareas por búsqueda

## 🔧 Configuración de Tests

### Mocks Implementados

- **localStorage**: Mock completo para simular almacenamiento
- **crypto.randomUUID**: ID consistente para tests
- **createPortal**: Para modales de React
- **APIs del navegador**: matchMedia, ResizeObserver, etc.

### Setup Global

El archivo `src/test/setup.js` configura:
- Jest DOM matchers
- Mocks de APIs del navegador
- Manejo de warnings de React
- Configuración de entorno de testing

## 📝 Escribir Nuevos Tests

### Estructura Recomendada

```javascript
describe('Nombre de la Funcionalidad', () => {
  beforeEach(() => {
    // Setup antes de cada test
  })

  afterEach(() => {
    // Cleanup después de cada test
  })

  it('debe hacer algo específico', async () => {
    // Arrange: Preparar datos
    // Act: Ejecutar acción
    // Assert: Verificar resultado
  })
})
```

### Patrones de Testing

1. **Renderizar componente**: `render(<Component />)`
2. **Buscar elementos**: `screen.getByRole()`, `screen.getByText()`, etc.
3. **Simular interacciones**: `user.click()`, `user.type()`
4. **Esperar cambios**: `waitFor(() => { expect() })`
5. **Verificar estado**: `expect(element).toBeInTheDocument()`

### Ejemplos de Assertions

```javascript
// Verificar que elemento existe
expect(screen.getByText('Texto')).toBeInTheDocument()

// Verificar que elemento no existe
expect(screen.queryByText('Texto')).not.toBeInTheDocument()

// Verificar clases CSS
expect(element).toHaveClass('clase1', 'clase2')

// Verificar contenido
expect(element).toHaveTextContent('Texto esperado')

// Verificar que función se llamó
expect(mockFunction).toHaveBeenCalledWith('argumento')
```

## 🐛 Troubleshooting

### Error: "Cannot find module 'jsdom'"
```bash
npm install jsdom --save-dev
```

### Error: "Testing Library matchers not found"
Verifica que `@testing-library/jest-dom` esté en `devDependencies`.

### Tests fallan por localStorage
Los mocks están configurados automáticamente. Si fallan, verifica que `vitest.config.js` esté configurado correctamente.

### Tests lentos
- Usa `test:run` en lugar de `test` para ejecución única
- Verifica que no haya tests que esperen tiempos reales
- Usa `vi.useFakeTimers()` para mocks de tiempo

## 📊 Cobertura de Tests

Para ver la cobertura de tests, puedes agregar este script a tu `package.json`:

```json
{
  "scripts": {
    "test:coverage": "vitest run --coverage"
  }
}
```

Y ejecutarlo con:
```bash
npm run test:coverage
```

## 🎯 Próximos Pasos

1. **Ejecuta los tests**: `npm test`
2. **Revisa la cobertura**: `npm run test:coverage`
3. **Añade tests para nuevos componentes**
4. **Mantén los tests actualizados** cuando cambies funcionalidades

## 📚 Recursos Adicionales

- [Documentación de Vitest](https://vitest.dev/)
- [React Testing Library](https://testing-library.com/docs/react-testing-library/intro/)
- [Jest DOM Matchers](https://github.com/testing-library/jest-dom)
- [User Event](https://testing-library.com/docs/user-event/intro/)
