import { createContext, useContext } from 'react'
import useLocalStorage from '../hooks/useLocalStorage'

const AuthContext = createContext()

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

export function AuthProvider({ children }) {
  const defaultUser = { id: 'guest', username: 'Invitado', email: '', isGuest: true }
  const [currentUser, setCurrentUser] = useLocalStorage('lista-tareas.currentUser', defaultUser)
  const [users, setUsers] = useLocalStorage('lista-tareas.users', [defaultUser])

  const register = (username, email, password) => {
    // Check if username already exists
    if (users.find(user => user.username === username)) {
      throw new Error('El nombre de usuario ya existe')
    }

    // Check if email already exists (for non-guest users)
    if (email && users.find(user => user.email === email && !user.isGuest)) {
      throw new Error('El email ya está registrado')
    }

    const newUser = {
      id: crypto.randomUUID(),
      username,
      email,
      password, // In a real app, this should be hashed
      isGuest: false,
      createdAt: new Date().toISOString()
    }

    setUsers(prev => [...prev, newUser])
    setCurrentUser(newUser)
    
    return newUser
  }

  const login = (username, password) => {
    const user = users.find(u => u.username === username && u.password === password)
    if (!user) {
      throw new Error('Usuario o contraseña incorrectos')
    }

    setCurrentUser(user)
    return user
  }

  const logout = () => {
    const guestUser = { id: 'guest', username: 'Invitado', email: '', isGuest: true }
    setCurrentUser(guestUser)
  }

  const switchToGuest = () => {
    const guestUser = { id: 'guest', username: 'Invitado', email: '', isGuest: true }
    setCurrentUser(guestUser)
  }

  const value = {
    currentUser,
    users,
    register,
    login,
    logout,
    switchToGuest
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}
