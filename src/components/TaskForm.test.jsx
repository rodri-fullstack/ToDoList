import { describe, it, expect, beforeEach, vi } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import TaskForm from './TaskForm'

describe('TaskForm Component', () => {
  const user = userEvent.setup()
  const mockOnSubmit = vi.fn()
  const mockOnCancel = vi.fn()

  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('Formulario de Nueva Tarea', () => {
    it('debe renderizar todos los campos del formulario', () => {
      render(<TaskForm onSubmit={mockOnSubmit} onCancel={mockOnCancel} />)
      
      expect(screen.getByPlaceholderText('Título')).toBeInTheDocument()
      expect(screen.getByPlaceholderText('Descripción')).toBeInTheDocument()
      expect(screen.getByLabelText('Categoría')).toBeInTheDocument()
      expect(screen.getByRole('combobox', { name: /categoría/i })).toBeInTheDocument()
      expect(screen.getByRole('button', { name: /guardar/i })).toBeInTheDocument()
      expect(screen.getByRole('button', { name: /cancelar/i })).toBeInTheDocument()
    })

    it('debe tener valores por defecto correctos', () => {
      render(<TaskForm onSubmit={mockOnSubmit} onCancel={mockOnCancel} />)
      
      const titleInput = screen.getByPlaceholderText('Título')
      const descriptionInput = screen.getByPlaceholderText('Descripción')
      const categorySelect = screen.getByLabelText('Categoría')
      
      expect(titleInput.value).toBe('')
      expect(descriptionInput.value).toBe('')
      expect(categorySelect.value).toBe('general')
    })

    it('debe mostrar todas las opciones de categoría', () => {
      render(<TaskForm onSubmit={mockOnSubmit} onCancel={mockOnCancel} />)
      
      const categorySelect = screen.getByRole('combobox', { name: /categoría/i })
      const options = categorySelect.querySelectorAll('option')
      
      expect(options).toHaveLength(7)
      expect(options[0]).toHaveValue('general')
      expect(options[1]).toHaveValue('trabajo')
      expect(options[2]).toHaveValue('personal')
      expect(options[3]).toHaveValue('estudio')
      expect(options[4]).toHaveValue('hogar')
      expect(options[5]).toHaveValue('salud')
      expect(options[6]).toHaveValue('finanzas')
    })

    it('debe permitir escribir en el campo título', async () => {
      render(<TaskForm onSubmit={mockOnSubmit} onCancel={mockOnCancel} />)
      
      const titleInput = screen.getByPlaceholderText('Título')
      await user.type(titleInput, 'Mi nueva tarea')
      
      expect(titleInput.value).toBe('Mi nueva tarea')
    })

    it('debe permitir escribir en el campo descripción', async () => {
      render(<TaskForm onSubmit={mockOnSubmit} onCancel={mockOnCancel} />)
      
      const descriptionInput = screen.getByPlaceholderText('Descripción')
      await user.type(descriptionInput, 'Esta es una descripción detallada')
      
      expect(descriptionInput.value).toBe('Esta es una descripción detallada')
    })

    it('debe permitir cambiar la categoría', async () => {
      render(<TaskForm onSubmit={mockOnSubmit} onCancel={mockOnCancel} />)
      
      const categorySelect = screen.getByRole('combobox', { name: /categoría/i })
      await user.selectOptions(categorySelect, 'trabajo')
      
      expect(categorySelect.value).toBe('trabajo')
    })

    it('debe llamar onSubmit con los datos correctos al enviar', async () => {
      render(<TaskForm onSubmit={mockOnSubmit} onCancel={mockOnCancel} />)
      
      const titleInput = screen.getByPlaceholderText('Título')
      const descriptionInput = screen.getByPlaceholderText('Descripción')
      const categorySelect = screen.getByRole('combobox', { name: /categoría/i })
      const submitButton = screen.getByRole('button', { name: /guardar/i })
      
      await user.type(titleInput, 'Tarea de trabajo')
      await user.type(descriptionInput, 'Descripción de la tarea')
      await user.selectOptions(categorySelect, 'trabajo')
      await user.click(submitButton)
      
      expect(mockOnSubmit).toHaveBeenCalledWith({
        title: 'Tarea de trabajo',
        description: 'Descripción de la tarea',
        category: 'trabajo',
        dueDate: null,
        dueTime: null
      })
    })

    it('debe validar que el título sea obligatorio', async () => {
      render(<TaskForm onSubmit={mockOnSubmit} onCancel={mockOnCancel} />)
      
      const submitButton = screen.getByRole('button', { name: /guardar/i })
      await user.click(submitButton)
      
      // No debe llamar onSubmit si no hay título
      expect(mockOnSubmit).not.toHaveBeenCalled()
    })

    it('debe llamar onCancel al hacer clic en cancelar', async () => {
      render(<TaskForm onSubmit={mockOnSubmit} onCancel={mockOnCancel} />)
      
      const cancelButton = screen.getByRole('button', { name: /cancelar/i })
      await user.click(cancelButton)
      
      expect(mockOnCancel).toHaveBeenCalled()
    })

    it('debe limpiar el formulario después de enviar exitosamente', async () => {
      render(<TaskForm onSubmit={mockOnSubmit} onCancel={mockOnCancel} />)
      
      const titleInput = screen.getByPlaceholderText('Título')
      const descriptionInput = screen.getByPlaceholderText('Descripción')
      const submitButton = screen.getByRole('button', { name: /guardar/i })
      
      await user.type(titleInput, 'Tarea temporal')
      await user.type(descriptionInput, 'Descripción temporal')
      await user.click(submitButton)
      
      // El formulario debe limpiarse después del envío
      expect(titleInput.value).toBe('')
      expect(descriptionInput.value).toBe('')
    })
  })

  describe('Formulario de Edición', () => {
    const defaultValues = {
      title: 'Tarea existente',
      description: 'Descripción existente',
      category: 'personal',
      dueDate: '2024-01-15T00:00:00.000Z',
      dueTime: '14:30'
    }

    it('debe pre-llenar los campos con los valores por defecto', () => {
      render(
        <TaskForm 
          onSubmit={mockOnSubmit} 
          onCancel={mockOnCancel} 
          defaultValues={defaultValues}
        />
      )
      
      expect(screen.getByDisplayValue('Tarea existente')).toBeInTheDocument()
      expect(screen.getByDisplayValue('Descripción existente')).toBeInTheDocument()
      expect(screen.getByRole('combobox', { name: /categoría/i })).toHaveValue('personal')
    })

    it('debe mantener los valores existentes al editar', async () => {
      render(
        <TaskForm 
          onSubmit={mockOnSubmit} 
          onCancel={mockOnCancel} 
          defaultValues={defaultValues}
        />
      )
      
      const titleInput = screen.getByDisplayValue('Tarea existente')
      const descriptionInput = screen.getByDisplayValue('Descripción existente')
      
      await user.clear(titleInput)
      await user.type(titleInput, 'Tarea modificada')
      
      // La descripción debe mantenerse
      expect(descriptionInput.value).toBe('Descripción existente')
      
      // El título debe haberse modificado
      expect(titleInput.value).toBe('Tarea modificada')
    })

    it('debe enviar los datos modificados correctamente', async () => {
      render(
        <TaskForm 
          onSubmit={mockOnSubmit} 
          onCancel={mockOnCancel} 
          defaultValues={defaultValues}
        />
      )
      
      const titleInput = screen.getByDisplayValue('Tarea existente')
      const submitButton = screen.getByRole('button', { name: /guardar/i })
      
      await user.clear(titleInput)
      await user.type(titleInput, 'Tarea actualizada')
      await user.click(submitButton)
      
      expect(mockOnSubmit).toHaveBeenCalledWith(
        expect.objectContaining({
          title: 'Tarea actualizada',
          description: 'Descripción existente',
          category: 'personal',
          dueTime: '14:30'
        })
      )
    })

    it('debe manejar fechas y horas correctamente', async () => {
      render(
        <TaskForm 
          onSubmit={mockOnSubmit} 
          onCancel={mockOnCancel} 
          defaultValues={defaultValues}
        />
      )
      
      const submitButton = screen.getByRole('button', { name: /guardar/i })
      await user.click(submitButton)
      
      expect(mockOnSubmit).toHaveBeenCalledWith(
        expect.objectContaining({
          dueTime: '14:30'
        })
      )
    })
  })

  describe('Validaciones y Comportamiento', () => {
    it('debe permitir título con solo espacios en blanco', async () => {
      render(<TaskForm onSubmit={mockOnSubmit} onCancel={mockOnCancel} />)
      
      const titleInput = screen.getByPlaceholderText('Título')
      const submitButton = screen.getByRole('button', { name: /guardar/i })
      
      await user.type(titleInput, '   ')
      await user.click(submitButton)
      
      // No debe enviar si solo hay espacios
      expect(mockOnSubmit).not.toHaveBeenCalled()
    })

    it('debe permitir descripción vacía', async () => {
      render(<TaskForm onSubmit={mockOnSubmit} onCancel={mockOnCancel} />)
      
      const titleInput = screen.getByPlaceholderText('Título')
      const submitButton = screen.getByRole('button', { name: /guardar/i })
      
      await user.type(titleInput, 'Tarea sin descripción')
      await user.click(submitButton)
      
      expect(mockOnSubmit).toHaveBeenCalledWith(
        expect.objectContaining({
          title: 'Tarea sin descripción',
          description: ''
        })
      )
    })

    it('debe manejar caracteres especiales en el título', async () => {
      render(<TaskForm onSubmit={mockOnSubmit} onCancel={mockOnCancel} />)
      
      const titleInput = screen.getByPlaceholderText('Título')
      const submitButton = screen.getByRole('button', { name: /guardar/i })
      
      await user.type(titleInput, 'Tarea con símbolos: @#$%^&*()')
      await user.click(submitButton)
      
      expect(mockOnSubmit).toHaveBeenCalledWith(
        expect.objectContaining({
          title: 'Tarea con símbolos: @#$%^&*()'
        })
      )
    })

    it('debe manejar texto largo en descripción', async () => {
      render(<TaskForm onSubmit={mockOnSubmit} onCancel={mockOnCancel} />)
      
      const titleInput = screen.getByPlaceholderText('Título')
      const descriptionInput = screen.getByPlaceholderText('Descripción')
      const submitButton = screen.getByRole('button', { name: /guardar/i })
      
      const longDescription = 'A'.repeat(100) // Descripción larga pero no excesiva
      
      await user.type(titleInput, 'Tarea con descripción larga')
      await user.type(descriptionInput, longDescription)
      await user.click(submitButton)
      
      expect(mockOnSubmit).toHaveBeenCalledWith(
        expect.objectContaining({
          title: 'Tarea con descripción larga',
          description: longDescription
        })
      )
    })
  })

  describe('Accesibilidad', () => {
    it('debe tener labels apropiados para todos los campos', () => {
      render(<TaskForm onSubmit={mockOnSubmit} onCancel={mockOnCancel} />)
      
      expect(screen.getByText('Categoría')).toBeInTheDocument()
      expect(screen.getByText('Fecha y hora límite')).toBeInTheDocument()
    })

    it('debe tener botones con nombres descriptivos', () => {
      render(<TaskForm onSubmit={mockOnSubmit} onCancel={mockOnCancel} />)
      
      expect(screen.getByRole('button', { name: /guardar/i })).toBeInTheDocument()
      expect(screen.getByRole('button', { name: /cancelar/i })).toBeInTheDocument()
    })

    it('debe tener campos con placeholders descriptivos', () => {
      render(<TaskForm onSubmit={mockOnSubmit} onCancel={mockOnCancel} />)
      
      expect(screen.getByPlaceholderText('Título')).toBeInTheDocument()
      expect(screen.getByPlaceholderText('Descripción')).toBeInTheDocument()
    })
  })
})
