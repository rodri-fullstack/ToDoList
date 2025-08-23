import { render, screen, fireEvent } from '@testing-library/react'
import { describe, it, expect, vi } from 'vitest'
import UserProfile from './UserProfile'
import { AuthProvider } from '../contexts/AuthContext'

// Mock the useAuth hook
const mockLogout = vi.fn()
const mockSwitchToGuest = vi.fn()

vi.mock('../contexts/AuthContext', async () => {
  const actual = await vi.importActual('../contexts/AuthContext')
  return {
    ...actual,
    useAuth: () => ({
      currentUser: {
        id: 'test-user-123',
        username: 'TestUser',
        email: 'test@example.com',
        isGuest: false,
        createdAt: '2024-01-01T00:00:00.000Z'
      },
      logout: mockLogout,
      switchToGuest: mockSwitchToGuest
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

describe('UserProfile Component', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders user profile information', () => {
    renderWithAuth(<UserProfile onClose={vi.fn()} />)
    
    expect(screen.getByText('Perfil de Usuario')).toBeInTheDocument()
    expect(screen.getByText('TestUser')).toBeInTheDocument()
    expect(screen.getByText('test@example.com')).toBeInTheDocument()
    expect(screen.getByText(/Miembro desde/)).toBeInTheDocument()
  })

  it('displays logout button for non-guest users', () => {
    renderWithAuth(<UserProfile onClose={vi.fn()} />)
    
    expect(screen.getByRole('button', { name: 'Cerrar Sesión' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Cambiar a Invitado' })).toBeInTheDocument()
  })

  it('handles logout action', () => {
    const onClose = vi.fn()
    renderWithAuth(<UserProfile onClose={onClose} />)
    
    const logoutButton = screen.getByRole('button', { name: 'Cerrar Sesión' })
    fireEvent.click(logoutButton)
    
    expect(mockLogout).toHaveBeenCalled()
    expect(onClose).toHaveBeenCalled()
  })

  it('handles switch to guest action', () => {
    const onClose = vi.fn()
    renderWithAuth(<UserProfile onClose={onClose} />)
    
    const switchButton = screen.getByRole('button', { name: 'Cambiar a Invitado' })
    fireEvent.click(switchButton)
    
    expect(mockSwitchToGuest).toHaveBeenCalled()
    expect(onClose).toHaveBeenCalled()
  })

  it('closes modal when close button is clicked', () => {
    const onClose = vi.fn()
    renderWithAuth(<UserProfile onClose={onClose} />)
    
    const closeButton = screen.getByLabelText('Cerrar')
    fireEvent.click(closeButton)
    
    expect(onClose).toHaveBeenCalled()
  })

  it('displays guest user information correctly', () => {
    // Mock guest user
    vi.mocked(vi.importMock('../contexts/AuthContext')).useAuth = () => ({
      currentUser: {
        id: 'guest',
        username: 'Invitado',
        email: '',
        isGuest: true
      },
      logout: mockLogout,
      switchToGuest: mockSwitchToGuest
    })

    renderWithAuth(<UserProfile onClose={vi.fn()} />)
    
    expect(screen.getByText('Invitado')).toBeInTheDocument()
    expect(screen.getByText('Usuario invitado')).toBeInTheDocument()
    
    // Guest users shouldn't see logout or switch buttons
    expect(screen.queryByRole('button', { name: 'Cerrar Sesión' })).not.toBeInTheDocument()
    expect(screen.queryByRole('button', { name: 'Cambiar a Invitado' })).not.toBeInTheDocument()
  })
})
