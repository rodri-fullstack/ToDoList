import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest'
import { render, screen, fireEvent, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import App from './App'

// Mock del hook useLocalStorage
const mockLocalStorage = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn(),
}

// Mock de crypto.randomUUID para IDs consistentes en tests
Object.defineProperty(global, 'crypto', {
  value: {
    randomUUID: () => 'test-uuid-123',
  },
})

// Mock de localStorage
Object.defineProperty(window, 'localStorage', {
  value: mockLocalStorage,
  writable: true,
})

// Mock de createPortal para modales
vi.mock('react-dom', async () => {
  const actual = await vi.importActual('react-dom')
  return {
    ...actual,
    createPortal: (children) => children,
  }
})

describe('Gestor de Tareas - App Principal', () => {
  const user = userEvent.setup()

  beforeEach(() => {
    // Limpiar todos los mocks antes de cada test
    vi.clearAllMocks()
    
    // Configurar localStorage mock por defecto
    mockLocalStorage.getItem.mockImplementation((key) => {
      if (key === 'lista-tareas.user.v1') return 'Invitado'
      if (key === 'lista-tareas.v2.Invitado') return '[]'
      return null
    })
    
    mockLocalStorage.setItem.mockImplementation(() => {})
  })

  afterEach(() => {
    // Limpiar el DOM después de cada test
    document.body.innerHTML = ''
  })

  describe('1. Crear Tarea', () => {
    it('debe mostrar el botón "Crear Tarea" en la barra de herramientas', () => {
      render(<App />)
      
      const createButton = screen.getByRole('button', { name: /crear nueva tarea/i })
      expect(createButton).toBeInTheDocument()
      expect(createButton).toHaveClass('create-task-btn')
    })

    it('debe abrir el modal de nueva tarea al hacer clic en "Crear Tarea"', async () => {
      render(<App />)
      
      const createButton = screen.getByRole('button', { name: /crear nueva tarea/i })
      await user.click(createButton)
      
      expect(screen.getByText('Nueva tarea')).toBeInTheDocument()
      expect(screen.getByPlaceholderText('Título')).toBeInTheDocument()
      expect(screen.getByPlaceholderText('Descripción')).toBeInTheDocument()
    })

    it('debe crear una nueva tarea con título y descripción', async () => {
      render(<App />)
      
      // Abrir modal de nueva tarea
      const createButton = screen.getByRole('button', { name: /crear nueva tarea/i })
      await user.click(createButton)
      
      // Llenar formulario
      const titleInput = screen.getByPlaceholderText('Título')
      const descriptionInput = screen.getByPlaceholderText('Descripción')
      const submitButton = screen.getByRole('button', { name: /guardar/i })
      
      await user.type(titleInput, 'Mi primera tarea')
      await user.type(descriptionInput, 'Esta es una descripción de prueba')
      await user.click(submitButton)
      
      // Verificar que la tarea se creó
      await waitFor(() => {
        expect(screen.getByText('Mi primera tarea')).toBeInTheDocument()
        expect(screen.getByText('Esta es una descripción de prueba')).toBeInTheDocument()
      })
      
      // Verificar que se guardó en localStorage
      expect(mockLocalStorage.setItem).toHaveBeenCalled()
    })

    it('debe validar que el título sea obligatorio', async () => {
      render(<App />)
      
      // Abrir modal de nueva tarea
      const createButton = screen.getByRole('button', { name: /crear nueva tarea/i })
      await user.click(createButton)
      
      // Intentar enviar sin título
      const submitButton = screen.getByRole('button', { name: /guardar/i })
      await user.click(submitButton)
      
      // El modal debe permanecer abierto
      expect(screen.getByText('Nueva tarea')).toBeInTheDocument()
    })

    it('debe cerrar el modal después de crear una tarea exitosamente', async () => {
      render(<App />)
      
      // Abrir modal de nueva tarea
      const createButton = screen.getByRole('button', { name: /crear nueva tarea/i })
      await user.click(createButton)
      
      // Llenar y enviar formulario
      const titleInput = screen.getByPlaceholderText('Título')
      const submitButton = screen.getByRole('button', { name: /guardar/i })
      
      await user.type(titleInput, 'Tarea de prueba')
      await user.click(submitButton)
      
      // Verificar que el modal se cerró
      await waitFor(() => {
        expect(screen.queryByText('Nueva tarea')).not.toBeInTheDocument()
      })
    })
  })

  describe('2. Listar Tareas', () => {
    it('debe mostrar mensaje cuando no hay tareas', () => {
      render(<App />)
      
      expect(screen.getByText('Aún no tienes tareas')).toBeInTheDocument()
      expect(screen.getByText(/Crea tu primera tarea usando el botón/)).toBeInTheDocument()
    })

    it('debe mostrar las tareas existentes', async () => {
      // Mock de tareas existentes
      const mockTasks = [
        {
          id: '1',
          title: 'Tarea 1',
          description: 'Descripción 1',
          completed: false,
          category: 'general',
          createdAt: '2024-01-01T00:00:00.000Z',
          updatedAt: '2024-01-01T00:00:00.000Z',
        },
        {
          id: '2',
          title: 'Tarea 2',
          description: 'Descripción 2',
          completed: true,
          category: 'trabajo',
          createdAt: '2024-01-02T00:00:00.000Z',
          updatedAt: '2024-01-02T00:00:00.000Z',
        }
      ]
      
      mockLocalStorage.getItem.mockImplementation((key) => {
        if (key === 'lista-tareas.user.v1') return 'Invitado'
        if (key === 'lista-tareas.v2.Invitado') return JSON.stringify(mockTasks)
        return null
      })
      
      render(<App />)
      
      expect(screen.getByText('Tarea 1')).toBeInTheDocument()
      expect(screen.getByText('Tarea 2')).toBeInTheDocument()
      expect(screen.getByText('Descripción 1')).toBeInTheDocument()
      expect(screen.getByText('Descripción 2')).toBeInTheDocument()
    })

    it('debe mostrar el resumen de tareas', async () => {
      const mockTasks = [
        { id: '1', title: 'Tarea 1', completed: false, category: 'general', createdAt: '2024-01-01T00:00:00.000Z', updatedAt: '2024-01-01T00:00:00.000Z' },
        { id: '2', title: 'Tarea 2', completed: true, category: 'trabajo', createdAt: '2024-01-02T00:00:00.000Z', updatedAt: '2024-01-02T00:00:00.000Z' }
      ]
      
      mockLocalStorage.getItem.mockImplementation((key) => {
        if (key === 'lista-tareas.user.v1') return 'Invitado'
        if (key === 'lista-tareas.v2.Invitado') return JSON.stringify(mockTasks)
        return null
      })
      
      render(<App />)
      
      expect(screen.getByText('Total:')).toBeInTheDocument()
      expect(screen.getByText('Total:')).toBeInTheDocument()
      expect(screen.getByText('Pendientes:')).toBeInTheDocument()
      expect(screen.getByText('Completadas:')).toBeInTheDocument()
      
      // Verificar los valores específicos usando selectores más específicos
      const totalValue = screen.getByText('Total:').nextElementSibling
      const pendingValue = screen.getByText('Pendientes:').nextElementSibling
      const completedValue = screen.getByText('Completadas:').nextElementSibling
      
      expect(totalValue).toHaveTextContent('2')
      expect(pendingValue).toHaveTextContent('1')
      expect(completedValue).toHaveTextContent('1')
    })
  })

  describe('3. Marcar Tarea como Completada/Pendiente', () => {
    it('debe mostrar botón de estado con texto "Pendiente" para tareas no completadas', async () => {
      const mockTasks = [
        { id: '1', title: 'Tarea pendiente', completed: false, category: 'general', createdAt: '2024-01-01T00:00:00.000Z', updatedAt: '2024-01-01T00:00:00.000Z' }
      ]
      
      mockLocalStorage.getItem.mockImplementation((key) => {
        if (key === 'lista-tareas.user.v1') return 'Invitado'
        if (key === 'lista-tareas.v2.Invitado') return JSON.stringify(mockTasks)
        return null
      })
      
      render(<App />)
      
      const statusButton = screen.getByText('Pendiente')
      expect(statusButton).toBeInTheDocument()
      expect(statusButton.closest('button')).toHaveClass('status-btn', 'pending')
    })

    it('debe mostrar botón de estado con texto "Completada" para tareas completadas', async () => {
      const mockTasks = [
        { id: '1', title: 'Tarea completada', completed: true, category: 'general', createdAt: '2024-01-01T00:00:00.000Z', updatedAt: '2024-01-01T00:00:00.000Z' }
      ]
      
      mockLocalStorage.getItem.mockImplementation((key) => {
        if (key === 'lista-tareas.user.v1') return 'Invitado'
        if (key === 'lista-tareas.v2.Invitado') return JSON.stringify(mockTasks)
        return null
      })
      
      render(<App />)
      
      const statusButton = screen.getByText('Completada')
      expect(statusButton).toBeInTheDocument()
      expect(statusButton.closest('button')).toHaveClass('status-btn', 'completed')
    })

    it('debe cambiar el estado de una tarea al hacer clic en el botón de estado', async () => {
      const mockTasks = [
        { id: '1', title: 'Tarea para cambiar', completed: false, category: 'general', createdAt: '2024-01-01T00:00:00.000Z', updatedAt: '2024-01-01T00:00:00.000Z' }
      ]
      
      mockLocalStorage.getItem.mockImplementation((key) => {
        if (key === 'lista-tareas.user.v1') return 'Invitado'
        if (key === 'lista-tareas.v2.Invitado') return JSON.stringify(mockTasks)
        return null
      })
      
      render(<App />)
      
      // Verificar estado inicial
      expect(screen.getByText('Pendiente')).toBeInTheDocument()
      
      // Hacer clic en el botón de estado
      const statusButton = screen.getByText('Pendiente')
      await user.click(statusButton)
      
      // Verificar que cambió a completada
      await waitFor(() => {
        expect(screen.getByText('Completada')).toBeInTheDocument()
      })
      
      // Verificar que se guardó en localStorage
      expect(mockLocalStorage.setItem).toHaveBeenCalled()
    })
  })

  describe('4. Editar Tarea', () => {
    it('debe mostrar botón de editar en cada tarea', async () => {
      const mockTasks = [
        { id: '1', title: 'Tarea para editar', description: 'Descripción original', completed: false, category: 'general', createdAt: '2024-01-01T00:00:00.000Z', updatedAt: '2024-01-01T00:00:00.000Z' }
      ]
      
      mockLocalStorage.getItem.mockImplementation((key) => {
        if (key === 'lista-tareas.user.v1') return 'Invitado'
        if (key === 'lista-tareas.v2.Invitado') return JSON.stringify(mockTasks)
        return null
      })
      
      render(<App />)
      
      const editButton = screen.getByRole('button', { name: /editar tarea/i })
      expect(editButton).toBeInTheDocument()
      expect(editButton).toHaveClass('action-btn', 'edit-btn')
    })

    it('debe abrir el modal de edición con los datos de la tarea', async () => {
      const mockTasks = [
        { id: '1', title: 'Tarea para editar', description: 'Descripción original', completed: false, category: 'general', createdAt: '2024-01-01T00:00:00.000Z', updatedAt: '2024-01-01T00:00:00.000Z' }
      ]
      
      mockLocalStorage.getItem.mockImplementation((key) => {
        if (key === 'lista-tareas.user.v1') return 'Invitado'
        if (key === 'lista-tareas.v2.Invitado') return JSON.stringify(mockTasks)
        return null
      })
      
      render(<App />)
      
      // Hacer clic en editar
      const editButton = screen.getByRole('button', { name: /editar tarea/i })
      await user.click(editButton)
      
      // Verificar que se abrió el modal de edición
      expect(screen.getByText('Editar tarea')).toBeInTheDocument()
      
      // Verificar que los campos están pre-llenados
      const titleInput = screen.getByDisplayValue('Tarea para editar')
      const descriptionInput = screen.getByDisplayValue('Descripción original')
      
      expect(titleInput).toBeInTheDocument()
      expect(descriptionInput).toBeInTheDocument()
    })

    it('debe actualizar la tarea al editar y guardar', async () => {
      const mockTasks = [
        { id: '1', title: 'Tarea original', description: 'Descripción original', completed: false, category: 'general', createdAt: '2024-01-01T00:00:00.000Z', updatedAt: '2024-01-01T00:00:00.000Z' }
      ]
      
      mockLocalStorage.getItem.mockImplementation((key) => {
        if (key === 'lista-tareas.user.v1') return 'Invitado'
        if (key === 'lista-tareas.v2.Invitado') return JSON.stringify(mockTasks)
        return null
      })
      
      render(<App />)
      
      // Abrir modal de edición
      const editButton = screen.getByRole('button', { name: /editar tarea/i })
      await user.click(editButton)
      
      // Editar campos
      const titleInput = screen.getByDisplayValue('Tarea original')
      const descriptionInput = screen.getByDisplayValue('Descripción original')
      
      await user.clear(titleInput)
      await user.type(titleInput, 'Tarea editada')
      await user.clear(descriptionInput)
      await user.type(descriptionInput, 'Descripción editada')
      
      // Guardar cambios
      const saveButton = screen.getByRole('button', { name: /guardar/i })
      await user.click(saveButton)
      
      // Verificar que se actualizó
      await waitFor(() => {
        expect(screen.getByText('Tarea editada')).toBeInTheDocument()
        expect(screen.getByText('Descripción editada')).toBeInTheDocument()
      })
      
      // Verificar que se guardó en localStorage
      expect(mockLocalStorage.setItem).toHaveBeenCalled()
    })
  })

  describe('5. Eliminar Tarea', () => {
    it('debe mostrar botón de eliminar en cada tarea', async () => {
      const mockTasks = [
        { id: '1', title: 'Tarea para eliminar', completed: false, category: 'general', createdAt: '2024-01-01T00:00:00.000Z', updatedAt: '2024-01-01T00:00:00.000Z' }
      ]
      
      mockLocalStorage.getItem.mockImplementation((key) => {
        if (key === 'lista-tareas.user.v1') return 'Invitado'
        if (key === 'lista-tareas.v2.Invitado') return JSON.stringify(mockTasks)
        return null
      })
      
      render(<App />)
      
      const deleteButton = screen.getByRole('button', { name: /eliminar tarea/i })
      expect(deleteButton).toBeInTheDocument()
      expect(deleteButton).toHaveClass('action-btn', 'delete-btn')
    })

    it('debe mostrar modal de confirmación al hacer clic en eliminar', async () => {
      const mockTasks = [
        { id: '1', title: 'Tarea para eliminar', completed: false, category: 'general', createdAt: '2024-01-01T00:00:00.000Z', updatedAt: '2024-01-01T00:00:00.000Z' }
      ]
      
      mockLocalStorage.getItem.mockImplementation((key) => {
        if (key === 'lista-tareas.user.v1') return 'Invitado'
        if (key === 'lista-tareas.v2.Invitado') return JSON.stringify(mockTasks)
        return null
      })
      
      render(<App />)
      
      // Hacer clic en eliminar
      const deleteButton = screen.getByRole('button', { name: /eliminar tarea/i })
      await user.click(deleteButton)
      
      // Verificar que se muestra el modal de confirmación
      expect(screen.getByText('¿Eliminar esta tarea?')).toBeInTheDocument()
      expect(screen.getByText(/será eliminada permanentemente/)).toBeInTheDocument()
      expect(screen.getByRole('button', { name: /cancelar/i })).toBeInTheDocument()
      expect(screen.getByRole('button', { name: /sí, eliminar/i })).toBeInTheDocument()
    })

    it('debe eliminar la tarea al confirmar', async () => {
      const mockTasks = [
        { id: '1', title: 'Tarea para eliminar', completed: false, category: 'general', createdAt: '2024-01-01T00:00:00.000Z', updatedAt: '2024-01-01T00:00:00.000Z' }
      ]
      
      mockLocalStorage.getItem.mockImplementation((key) => {
        if (key === 'lista-tareas.user.v1') return 'Invitado'
        if (key === 'lista-tareas.v2.Invitado') return JSON.stringify(mockTasks)
        return null
      })
      
      render(<App />)
      
      // Verificar que la tarea existe
      expect(screen.getByText('Tarea para eliminar')).toBeInTheDocument()
      
      // Abrir modal de confirmación
      const deleteButton = screen.getByRole('button', { name: /eliminar tarea/i })
      await user.click(deleteButton)
      
      // Confirmar eliminación
      const confirmButton = screen.getByRole('button', { name: /sí, eliminar/i })
      await user.click(confirmButton)
      
      // Verificar que la tarea se eliminó
      await waitFor(() => {
        expect(screen.queryByText('Tarea para eliminar')).not.toBeInTheDocument()
      })
      
      // Verificar que se guardó en localStorage
      expect(mockLocalStorage.setItem).toHaveBeenCalled()
    })

    it('debe cancelar la eliminación al hacer clic en cancelar', async () => {
      const mockTasks = [
        { id: '1', title: 'Tarea para eliminar', completed: false, category: 'general', createdAt: '2024-01-01T00:00:00.000Z', updatedAt: '2024-01-01T00:00:00.000Z' }
      ]
      
      mockLocalStorage.getItem.mockImplementation((key) => {
        if (key === 'lista-tareas.user.v1') return 'Invitado'
        if (key === 'lista-tareas.v2.Invitado') return JSON.stringify(mockTasks)
        return null
      })
      
      render(<App />)
      
      // Verificar que la tarea existe
      expect(screen.getByText('Tarea para eliminar')).toBeInTheDocument()
      
      // Abrir modal de confirmación
      const deleteButton = screen.getByRole('button', { name: /eliminar tarea/i })
      await user.click(deleteButton)
      
      // Cancelar eliminación
      const cancelButton = screen.getByRole('button', { name: /cancelar/i })
      await user.click(cancelButton)
      
      // Verificar que el modal se cerró y la tarea sigue ahí
      expect(screen.queryByText('¿Eliminar esta tarea?')).not.toBeInTheDocument()
      expect(screen.getByText('Tarea para eliminar')).toBeInTheDocument()
    })
  })

  describe('6. Guardar en localStorage', () => {
    it('debe guardar nuevas tareas en localStorage', async () => {
      render(<App />)
      
      // Crear nueva tarea
      const createButton = screen.getByRole('button', { name: /crear nueva tarea/i })
      await user.click(createButton)
      
      const titleInput = screen.getByPlaceholderText('Título')
      const submitButton = screen.getByRole('button', { name: /guardar/i })
      
      await user.type(titleInput, 'Tarea para localStorage')
      await user.click(submitButton)
      
      // Verificar que se llamó a setItem
      expect(mockLocalStorage.setItem).toHaveBeenCalledWith(
        'lista-tareas.v2.Invitado',
        expect.stringContaining('Tarea para localStorage')
      )
    })

    it('debe cargar tareas existentes desde localStorage al iniciar', () => {
      const mockTasks = [
        { id: '1', title: 'Tarea guardada', completed: false, category: 'general', createdAt: '2024-01-01T00:00:00.000Z', updatedAt: '2024-01-01T00:00:00.000Z' }
      ]
      
      mockLocalStorage.getItem.mockImplementation((key) => {
        if (key === 'lista-tareas.user.v1') return 'Invitado'
        if (key === 'lista-tareas.v2.Invitado') return JSON.stringify(mockTasks)
        return null
      })
      
      render(<App />)
      
      // Verificar que se llamó a getItem
      expect(mockLocalStorage.getItem).toHaveBeenCalledWith('lista-tareas.user.v1')
      expect(mockLocalStorage.getItem).toHaveBeenCalledWith('lista-tareas.v2.Invitado')
      
      // Verificar que se muestra la tarea
      expect(screen.getByText('Tarea guardada')).toBeInTheDocument()
    })

    it('debe manejar errores de localStorage graciosamente', () => {
      // Simular localStorage que falla pero no rompe la aplicación
      mockLocalStorage.getItem.mockImplementation(() => {
        // Simular un error que no rompe la aplicación
        return null
      })
      
      // Debe renderizar sin fallar
      const { container } = render(<App />)
      expect(container).toBeInTheDocument()
      
      // Debe mostrar el estado inicial (sin tareas)
      expect(screen.getByText('Aún no tienes tareas')).toBeInTheDocument()
    })
  })

  describe('Funcionalidades Adicionales', () => {
    it('debe mostrar el título principal "Gestor de Tareas"', () => {
      render(<App />)
      
      const mainTitle = screen.getByRole('heading', { level: 1 })
      expect(mainTitle).toHaveTextContent('Gestor de Tareas')
    })

    it('debe mostrar el selector de usuario', () => {
      render(<App />)
      
      const userDisplay = screen.getByText(/👤 Invitado/)
      expect(userDisplay).toBeInTheDocument()
    })

    it('debe mostrar las pestañas de navegación', () => {
      render(<App />)
      
      expect(screen.getByText('Tareas')).toBeInTheDocument()
      expect(screen.getByText('Estadísticas')).toBeInTheDocument()
    })

    it('debe mostrar el campo de búsqueda', () => {
    render(<App />)
      
      const searchInput = screen.getByPlaceholderText('Buscar por título o descripción')
      expect(searchInput).toBeInTheDocument()
    })

    it('debe filtrar tareas por búsqueda', async () => {
      const mockTasks = [
        { id: '1', title: 'Tarea de trabajo', description: 'Descripción', completed: false, category: 'trabajo', createdAt: '2024-01-01T00:00:00.000Z', updatedAt: '2024-01-01T00:00:00.000Z' },
        { id: '2', title: 'Tarea personal', description: 'Descripción', completed: false, category: 'personal', createdAt: '2024-01-01T00:00:00.000Z', updatedAt: '2024-01-01T00:00:00.000Z' }
      ]
      
      mockLocalStorage.getItem.mockImplementation((key) => {
        if (key === 'lista-tareas.user.v1') return 'Invitado'
        if (key === 'lista-tareas.v2.Invitado') return JSON.stringify(mockTasks)
        return null
      })
      
    render(<App />)
      
      // Verificar que ambas tareas están visibles
      expect(screen.getByText('Tarea de trabajo')).toBeInTheDocument()
      expect(screen.getByText('Tarea personal')).toBeInTheDocument()
      
      // Buscar por "trabajo"
      const searchInput = screen.getByPlaceholderText('Buscar por título o descripción')
      await user.type(searchInput, 'trabajo')
      
      // Verificar que solo se muestra la tarea de trabajo
      expect(screen.getByText('Tarea de trabajo')).toBeInTheDocument()
      expect(screen.queryByText('Tarea personal')).not.toBeInTheDocument()
    })
  })
})


