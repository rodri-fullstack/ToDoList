import { useState, useEffect, useRef } from 'react'
import { createPortal } from 'react-dom'

// Helpers de fecha: usar solo fecha seleccionada por el usuario (sin hora)
function getDueDateTime(task){
  if(!task || !task.dueDate) return null
  const [y, m, d] = task.dueDate.split('-').map(Number)
  // Usar 23:59 como hora por defecto para determinar si está vencida
  return new Date(y, (m || 1)-1, d || 1, 23, 59)
}

function isOverdue(task) {
  const due = getDueDateTime(task)
  if(!due) return false
  return due.getTime() < Date.now()
}

// Mostrar fecha en formato dd-mm-yyyy a partir de yyyy-mm-dd
function formatDate(dateString) {
  if(!dateString) return ''
  const [y, m, d] = dateString.split('-')
  const dd = String(d || '').padStart(2, '0')
  const mm = String(m || '').padStart(2, '0')
  return `${dd}-${mm}-${y}`
}

export default function TaskItem({ task, onToggle, onEdit, onDelete }){
  // Verificar que task contiene los datos necesarios
  if (!task || !task.id) {
    console.error('TaskItem recibió una tarea inválida:', task)
    return null
  }
  
  const overdue = isOverdue(task)
  
  // Estado para el modal de confirmación
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  
  // Estado para animaciones
  const [isHovering, setIsHovering] = useState(false)
  const [isPressed, setIsPressed] = useState(false)
  
  // Efecto para manejar la tecla ESC
  const previousOverflowRef = useRef('')

  useEffect(() => {
    function handleEscape(e) {
      if (e.key === 'Escape' && showDeleteModal) {
        setShowDeleteModal(false)
      }
    }
    
    if (showDeleteModal) {
      document.addEventListener('keydown', handleEscape)
      // Prevenir scroll del body cuando el modal está abierto
      previousOverflowRef.current = document.body.style.overflow
      document.body.style.overflow = 'hidden'
    }
    
    return () => {
      document.removeEventListener('keydown', handleEscape)
      document.body.style.overflow = previousOverflowRef.current || ''
    }
  }, [showDeleteModal])
  
  // Función para manejar el toggle con efecto de confeti
  function handleToggle() {
    if (onToggle) {
      onToggle(task.id)
      
      // Si la tarea se está marcando como completada, mostrar confeti
      if (!task.completed) {
        showConfetti()
      } else {
        // Si se está marcando como pendiente, detener confeti abruptamente
        stopConfetti()
      }
    }
  }
  
  // Función para mostrar confeti por toda la pantalla
  function showConfetti() {
    const colors = ['#10b981', '#3b82f6', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4']
    
    // Crear contenedor de confeti para toda la pantalla
    const confettiContainer = document.createElement('div')
    confettiContainer.className = 'confetti-container'
    confettiContainer.style.position = 'fixed'
    confettiContainer.style.top = '0'
    confettiContainer.style.left = '0'
    confettiContainer.style.width = '100vw'
    confettiContainer.style.height = '100vh'
    confettiContainer.style.pointerEvents = 'none'
    confettiContainer.style.zIndex = '1000'
    confettiContainer.setAttribute('data-task-confetti', task.id)
    
    document.body.appendChild(confettiContainer)
    
    // Crear confetis de manera eficiente usando requestAnimationFrame
    const createConfetti = (index) => {
      if (index >= 20) return
      
      const confetti = document.createElement('div')
      confetti.className = 'confetti'
      confetti.style.position = 'absolute'
      confetti.style.left = Math.random() * 100 + 'vw'
      confetti.style.top = '-10px'
      confetti.style.width = '8px'
      confetti.style.height = '8px'
      confetti.style.borderRadius = '50%'
      confetti.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)]
      confetti.style.animationDelay = Math.random() * 0.3 + 's'
      confetti.style.animationDuration = Math.random() * 1 + 2 + 's'
      
      confettiContainer.appendChild(confetti)
      
      // Crear el siguiente confeti en el siguiente frame
      requestAnimationFrame(() => createConfetti(index + 1))
    }
    
    // Iniciar la creación de confetis
    createConfetti(0)
    
    // Remover el contenedor después de un tiempo
    setTimeout(() => {
      if (confettiContainer.parentNode) {
        confettiContainer.parentNode.removeChild(confettiContainer)
      }
    }, 4000)
  }
  
  // Función para detener confeti abruptamente
  function stopConfetti() {
    const confettiContainer = document.querySelector(`[data-task-confetti="${task.id}"]`)
    if (confettiContainer) {
      // Remover inmediatamente sin iterar
      confettiContainer.remove()
    }
  }
  
  // Función para mostrar el modal de confirmación
  function handleDeleteClick() {
    setShowDeleteModal(true)
  }
  
  // Función para confirmar la eliminación
  function confirmDelete() {
    if (onDelete) {
      onDelete(task.id)
      setShowDeleteModal(false)
    }
  }
  
  // Función para cancelar la eliminación
  function cancelDelete() {
    setShowDeleteModal(false)
  }
  
  // Función para cerrar modal al hacer clic fuera
  function handleOverlayClick(e) {
    if (e.target === e.currentTarget) {
      setShowDeleteModal(false)
    }
  }
  
  return (
    <li 
      className={`item ${task.completed ? 'completed' : ''}`} 
      data-task-id={task.id}
      onMouseEnter={() => setIsHovering(true)}
      onMouseLeave={() => setIsHovering(false)}
    >
      {/* Botón de estado a la izquierda */}
      <div className="status-toggle">
        <button 
          className={`status-btn ${task.completed ? 'completed' : 'pending'}`}
          onClick={handleToggle}
          onMouseDown={() => setIsPressed(true)}
          onMouseUp={() => setIsPressed(false)}
          onMouseLeave={() => setIsPressed(false)}
          aria-label={task.completed ? "Marcar como pendiente" : "Marcar como completada"}
        >
          <div className="status-icon">
            {task.completed ? (
              <>
                <span className="checkmark">✓</span>
                <div className="ripple-effect"></div>
              </>
            ) : (
              <span className="circle">○</span>
            )}
          </div>
          <span className="status-text">
            {task.completed ? 'Completada' : 'Pendiente'}
          </span>
        </button>
      </div>
      
      {/* Tarjeta de información en el centro */}
      <div className="task-card">
        <div className="task-header">
          <h3 className={`task-title ${task.completed ? 'line' : ''}`}>{task.title}</h3>
          <span className={`category-badge category-${task.category || 'general'}`}>
            {task.category ? task.category.charAt(0).toUpperCase() + task.category.slice(1) : 'General'}
          </span>
        </div>
        {task.description && <p className="task-description">{task.description}</p>}
        {task.dueDate && (
          <p className={`due-date ${overdue && !task.completed ? 'overdue' : ''}`}>
            <span className="due-icon">📅</span>
            Vence: {formatDate(task.dueDate)}
            {overdue && !task.completed && (
              <span className="overdue-badge"> ⚠️ Vencida</span>
            )}
          </p>
        )}
      </div>
      
      {/* Botones de acción a la derecha */}
      <div className="task-actions">
        <button 
          className="action-btn edit-btn" 
          onClick={() => onEdit && onEdit(task.id)}
          onMouseDown={() => setIsPressed(true)}
          onMouseUp={() => setIsPressed(false)}
          onMouseLeave={() => setIsPressed(false)}
          aria-label="Editar tarea"
          title="Editar tarea"
        >
          <span className="action-icon">✏️</span>
          <span className="action-label">Editar</span>
          <div className="action-ripple"></div>
        </button>
        <button 
          className="action-btn delete-btn" 
          onClick={handleDeleteClick}
          onMouseDown={() => setIsPressed(true)}
          onMouseUp={() => setIsPressed(false)}
          onMouseLeave={() => setIsPressed(false)}
          aria-label="Eliminar tarea"
          title="Eliminar tarea"
          data-task-id={task.id}
        >
          <span className="action-icon">🗑️</span>
          <span className="action-label">Eliminar</span>
          <div className="action-ripple"></div>
        </button>
      </div>

      {showDeleteModal && createPortal(
        <div className="delete-modal-overlay" onClick={handleOverlayClick}>
          <div className="delete-modal-content">
            <div className="modal-icon">⚠️</div>
            <h3>¿Eliminar esta tarea?</h3>
            <p>"{task.title}" será eliminada permanentemente. Esta acción no se puede deshacer.</p>
            <div className="modal-actions">
              <button className="modal-btn cancel-btn" onClick={cancelDelete}>
                Cancelar
              </button>
              <button className="modal-btn confirm-btn" onClick={confirmDelete}>
                Sí, eliminar
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}
    </li>
  )
}
  