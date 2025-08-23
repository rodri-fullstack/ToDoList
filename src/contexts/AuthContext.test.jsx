import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { AuthProvider, useAuth } from './AuthContext'

// Test component that uses the auth context
function TestComponent() {
  const { currentUser, register, login, logout, switchToGuest } = useAuth()
  
  return (
    <div>
      <div data-testid="current-user">{currentUser.username}</div>
      <button onClick={() => register('testuser', 'test@example.com', 'password')}>
        Register
      </button>
      <button onClick={() => login('testuser', 'password')}>
        Login
      </button>
      <button onClick={logout}>
        Logout
      </button>
      <button onClick={switchToGuest}>
        Switch to Guest
      </button>
    </div>
  )
}

// Mock localStorage
const localStorageMock = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn()
}
Object.defineProperty(window, 'localStorage', {
  value: localStorageMock
})

describe('AuthContext', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    localStorageMock.getItem.mockReturnValue(null)
  })

  it('provides default guest user when no user is stored', () => {
    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    )
    
    expect(screen.getByTestId('current-user')).toHaveTextContent('Invitado')
  })

  it('registers a new user successfully', async () => {
    localStorageMock.getItem.mockImplementation((key) => {
      if (key === 'lista-tareas.users') return JSON.stringify([])
      if (key === 'lista-tareas.currentUser') return null
      return null
    })
    
    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    )
    
    const registerButton = screen.getByText('Register')
    fireEvent.click(registerButton)
    
    await waitFor(() => {
      expect(localStorageMock.setItem).toHaveBeenCalled()
    })
  })

  it('prevents duplicate username registration', async () => {
    const existingUsers = [
      { id: '1', username: 'testuser', email: 'existing@example.com', password: 'pass', isGuest: false }
    ]
    localStorageMock.getItem.mockImplementation((key) => {
      if (key === 'lista-tareas.users') return JSON.stringify(existingUsers)
      if (key === 'lista-tareas.currentUser') return null
      return null
    })
    
    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    )
    
    const registerButton = screen.getByText('Register')
    fireEvent.click(registerButton)
    
    // Should not update localStorage due to duplicate username
    await waitFor(() => {
      expect(localStorageMock.setItem).not.toHaveBeenCalled()
    })
  })

  it('prevents duplicate email registration', async () => {
    const existingUsers = [
      { id: '1', username: 'existinguser', email: 'test@example.com', password: 'pass', isGuest: false }
    ]
    localStorageMock.getItem.mockImplementation((key) => {
      if (key === 'lista-tareas.users') return JSON.stringify(existingUsers)
      if (key === 'lista-tareas.currentUser') return null
      return null
    })
    
    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    )
    
    const registerButton = screen.getByText('Register')
    fireEvent.click(registerButton)
    
    // Should not update localStorage due to duplicate email
    await waitFor(() => {
      expect(localStorageMock.setItem).not.toHaveBeenCalled()
    })
  })

  it('logs in existing user successfully', async () => {
    const existingUsers = [
      { id: '1', username: 'testuser', email: 'test@example.com', password: 'password', isGuest: false }
    ]
    localStorageMock.getItem.mockImplementation((key) => {
      if (key === 'lista-tareas.users') return JSON.stringify(existingUsers)
      if (key === 'lista-tareas.currentUser') return null
      return null
    })
    
    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    )
    
    const loginButton = screen.getByText('Login')
    fireEvent.click(loginButton)
    
    await waitFor(() => {
      expect(localStorageMock.setItem).toHaveBeenCalled()
    })
  })

  it('handles logout correctly', async () => {
    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    )
    
    const logoutButton = screen.getByText('Logout')
    fireEvent.click(logoutButton)
    
    await waitFor(() => {
      expect(localStorageMock.setItem).toHaveBeenCalled()
    })
  })

  it('switches to guest mode correctly', async () => {
    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    )
    
    const switchButton = screen.getByText('Switch to Guest')
    fireEvent.click(switchButton)
    
    await waitFor(() => {
      expect(localStorageMock.setItem).toHaveBeenCalled()
    })
  })

  it('throws error when useAuth is used outside provider', () => {
    expect(() => render(<TestComponent />)).toThrow('useAuth must be used within an AuthProvider')
  })
})
