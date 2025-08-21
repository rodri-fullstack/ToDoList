import { useState, useEffect, useRef } from 'react'
import { createPortal } from 'react-dom'

// Helpers de fecha: usar fecha y hora exactas seleccionadas por el usuario
function getDueDateTime(task){
  if(!task || !task.dueDate) return null
  const [y, m, d] = task.dueDate.split('-').map(Number)
  const [hh, mm] = (task.dueTime || '23:59').split(':').map(Number)
  return new Date(y, (m || 1)-1, d || 1, hh || 0, mm || 0)
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
      }
    }
  }
  
  // Función para mostrar confeti
  function showConfetti() {
    const colors = ['#10b981', '#3b82f6', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4']
    
    for (let i = 0; i < 50; i++) {
      setTimeout(() => {
        const confetti = document.createElement('div')
        confetti.className = 'confetti'
        confetti.style.left = Math.random() * 100 + 'vw'
        confetti.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)]
        confetti.style.animationDelay = Math.random() * 3 + 's'
        confetti.style.animationDuration = Math.random() * 3 + 2 + 's'
        
        document.body.appendChild(confetti)
        
        // Remover confeti después de la animación
        setTimeout(() => {
          if (confetti.parentNode) {
            confetti.parentNode.removeChild(confetti)
          }
        }, 5000)
      }, i * 100)
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
            {task.dueTime && (
              <span className="due-time"> a las {task.dueTime}</span>
            )}
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
  