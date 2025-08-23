import { useAuth } from '../contexts/AuthContext'

export default function UserProfile({ onClose }) {
  const { currentUser, logout, switchToGuest } = useAuth()

  const handleLogout = () => {
    logout()
    onClose()
  }

  const handleSwitchToGuest = () => {
    switchToGuest()
    onClose()
  }

  return (
    <div className="user-profile">
      <div className="profile-header">
        <h2>Perfil de Usuario</h2>
        <button 
          type="button" 
          className="close-btn"
          onClick={onClose}
          aria-label="Cerrar"
        >
          ✕
        </button>
      </div>

      <div className="profile-info">
        <div className="profile-avatar">
          👤
        </div>
        <div className="profile-details">
          <h3>{currentUser.username}</h3>
          {currentUser.email && <p className="profile-email">{currentUser.email}</p>}
          {currentUser.isGuest && <p className="profile-status">Usuario invitado</p>}
          {!currentUser.isGuest && (
            <p className="profile-status">
              Miembro desde {new Date(currentUser.createdAt).toLocaleDateString()}
            </p>
          )}
        </div>
      </div>

      <div className="profile-actions">
        {!currentUser.isGuest && (
          <button 
            type="button" 
            className="btn btn-secondary"
            onClick={handleLogout}
          >
            Cerrar Sesión
          </button>
        )}
        
        {!currentUser.isGuest && (
          <button 
            type="button" 
            className="btn btn-outline"
            onClick={handleSwitchToGuest}
          >
            Cambiar a Invitado
          </button>
        )}
      </div>
    </div>
  )
}
