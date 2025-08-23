import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { describe, it, expect, vi } from 'vitest'
import Login from './Login'
import { AuthProvider } from '../contexts/AuthContext'

// Mock the useAuth hook
const mockLogin = vi.fn()
const mockRegister = vi.fn()

vi.mock('../contexts/AuthContext', async () => {
  const actual = await vi.importActual('../contexts/AuthContext')
  return {
    ...actual,
    useAuth: () => ({
      login: mockLogin,
      register: mockRegister
    })
  }
})

const renderWithAuth = (component) => {
  return render(
    <AuthProvider>
      {component}
    </AuthProvider>
  )
}

describe('Login Component', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders login form by default', () => {
    renderWithAuth(<Login onClose={vi.fn()} />)
    
    expect(screen.getByText('Iniciar Sesión')).toBeInTheDocument()
    expect(screen.getByLabelText('Nombre de usuario')).toBeInTheDocument()
    expect(screen.getByLabelText('Contraseña')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Iniciar Sesión' })).toBeInTheDocument()
  })

  it('switches to registration mode', () => {
    renderWithAuth(<Login onClose={vi.fn()} />)
    
    const toggleButton = screen.getByText('¿No tienes cuenta? Regístrate')
    fireEvent.click(toggleButton)
    
    expect(screen.getByText('Registrarse')).toBeInTheDocument()
    expect(screen.getByLabelText('Email')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Registrarse' })).toBeInTheDocument()
  })

  it('handles login form submission', async () => {
    mockLogin.mockResolvedValueOnce({})
    const onClose = vi.fn()
    
    renderWithAuth(<Login onClose={onClose} />)
    
    fireEvent.change(screen.getByLabelText('Nombre de usuario'), {
      target: { value: 'testuser' }
    })
    fireEvent.change(screen.getByLabelText('Contraseña'), {
      target: { value: 'password123' }
    })
    
    fireEvent.click(screen.getByRole('button', { name: 'Iniciar Sesión' }))
    
    await waitFor(() => {
      expect(mockLogin).toHaveBeenCalledWith('testuser', 'password123')
      expect(onClose).toHaveBeenCalled()
    })
  })

  it('handles registration form submission', async () => {
    mockRegister.mockResolvedValueOnce({})
    const onClose = vi.fn()
    
    renderWithAuth(<Login onClose={onClose} />)
    
    // Switch to registration mode
    fireEvent.click(screen.getByText('¿No tienes cuenta? Regístrate'))
    
    fireEvent.change(screen.getByLabelText('Nombre de usuario'), {
      target: { value: 'newuser' }
    })
    fireEvent.change(screen.getByLabelText('Email'), {
      target: { value: 'newuser@example.com' }
    })
    fireEvent.change(screen.getByLabelText('Contraseña'), {
      target: { value: 'newpassword123' }
    })
    
    fireEvent.click(screen.getByRole('button', { name: 'Registrarse' }))
    
    await waitFor(() => {
      expect(mockRegister).toHaveBeenCalledWith('newuser', 'newuser@example.com', 'newpassword123')
      expect(onClose).toHaveBeenCalled()
    })
  })

  it('displays error message on authentication failure', async () => {
    const errorMessage = 'Usuario o contraseña incorrectos'
    mockLogin.mockRejectedValueOnce(new Error(errorMessage))
    
    renderWithAuth(<Login onClose={vi.fn()} />)
    
    fireEvent.change(screen.getByLabelText('Nombre de usuario'), {
      target: { value: 'testuser' }
    })
    fireEvent.change(screen.getByLabelText('Contraseña'), {
      target: { value: 'wrongpassword' }
    })
    
    fireEvent.click(screen.getByRole('button', { name: 'Iniciar Sesión' }))
    
    await waitFor(() => {
      expect(screen.getByText(errorMessage)).toBeInTheDocument()
    })
  })

  it('closes modal when close button is clicked', () => {
    const onClose = vi.fn()
    renderWithAuth(<Login onClose={onClose} />)
    
    const closeButton = screen.getByLabelText('Cerrar')
    fireEvent.click(closeButton)
    
    expect(onClose).toHaveBeenCalled()
  })
})
