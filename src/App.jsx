import { useMemo, useState, useEffect, useRef } from 'react'
import TaskList from './components/TaskList'
import TaskForm from './components/TaskForm'
import Modal from './components/Modal'
import Tabs from './components/Tabs'
import useLocalStorage from './hooks/useLocalStorage'
import { filterAndSortTasks } from './utils/tasks'

export default function App() {
  // Usuario actual (autenticación básica por perfil)
  const [userId, setUserId] = useLocalStorage('lista-tareas.user.v1', 'Invitado')
  const storageKey = `lista-tareas.v2.${userId}`
  const [tasks, setTasks] = useLocalStorage(storageKey, [])
  const [query, setQuery] = useState('')
  const [filter, setFilter] = useState('all')
  const [categoryFilter, setCategoryFilter] = useState('all')
  const [sortBy, setSortBy] = useState('updatedDesc')
  const [editingId, setEditingId] = useState(null)
  const [activeTab, setActiveTab] = useState('tasks')
  const [timeTick, setTimeTick] = useState(Date.now())

  // Estados para el selector de usuario
  const [showUserDropdown, setShowUserDropdown] = useState(false)
  const userSelectRef = useRef(null)

  // Estado para el modal de nueva tarea
  const [showNewTaskModal, setShowNewTaskModal] = useState(false)
  
  // Estado para mostrar indicador de atención para usuarios nuevos
  const [showAttention, setShowAttention] = useState(false)

  // Tick temporal para actualizar filtros relativos al tiempo (vencidas/por vencer)
  useEffect(() => {
    const id = setInterval(() => setTimeTick(Date.now()), 60 * 1000)
    return () => clearInterval(id)
  }, [])

  // Utilidades de fecha para contadores rápidos (con hora actual)
  const parseTaskDue = (t) => {
    if (!t || !t.dueDate) return null
    const [y, m, d] = t.dueDate.split('-').map(Number)
    const [hh, mm] = (t.dueTime || '23:59').split(':').map(Number)
    return new Date(y, (m || 1) - 1, d || 1, hh || 0, mm || 0)
  }
  // (Se eliminan contadores especiales de vencimientos)

  const filteredSorted = useMemo(() => {
    return filterAndSortTasks(tasks, { filter, categoryFilter, query, sortBy })
  }, [tasks, filter, categoryFilter, query, sortBy, timeTick])

  // Cierres seguros para modales (restauran scroll)
  function closeEditingModal(){
    setEditingId(null)
    try{ document.body.style.overflow = '' }catch{}
  }
  function closeNewTaskModal(){
    setShowNewTaskModal(false)
    try{ document.body.style.overflow = '' }catch{}
  }

  // Función para cambiar de usuario
  function handleUserChange(user) {
    setUserId(user)
    setShowUserDropdown(false)
  }

  // Efecto para cerrar el dropdown de usuario al hacer clic fuera
  useEffect(() => {
    function handleClickOutside(event) {
      if (userSelectRef.current && !userSelectRef.current.contains(event.target)) {
        setShowUserDropdown(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  // Efecto para mostrar indicador de atención en la primera visita
  useEffect(() => {
    const hasSeenApp = localStorage.getItem('lista-tareas.hasSeenApp')
    if (!hasSeenApp && tasks.length === 0) {
      setShowAttention(true)
      // Ocultar después de 5 segundos
      setTimeout(() => setShowAttention(false), 5000)
      localStorage.setItem('lista-tareas.hasSeenApp', 'true')
    }
  }, [tasks.length])

  function addTask(input) {
    // Verificar que input contiene los datos necesarios
    if (!input || !input.title) return;
    
    const now = new Date().toISOString()
    const newTask = {
      id: crypto.randomUUID?.() || `${Date.now().toString(36)}-${Math.random().toString(36).slice(2,8)}`,
      title: input.title,
      description: input.description || '',
      category: input.category || 'general',
      completed: false,
      createdAt: now,
      updatedAt: now,
      dueDate: input.dueDate || null,
      dueTime: input.dueTime || null,
    }
    // Añadir la nueva tarea al principio del array
    setTasks(prev => [newTask, ...prev])
    
    // Log para depuración
    console.log('Nueva tarea añadida:', newTask)
  }

  function toggleTask(id) {
    setTasks(prev =>
      prev.map(t => t.id === id ? { ...t, completed: !t.completed, updatedAt: new Date().toISOString() } : t)
    )
  }

  function saveEdit(id, input) {
    setTasks(prev =>
      prev.map(t => t.id === id ? { ...t, ...input, updatedAt: new Date().toISOString() } : t)
    )
    setEditingId(null)
  }

  function deleteTask(id) {
    setTasks(prev => prev.filter(t => t.id !== id))
  }

  const editingTask = tasks.find(t => t.id === editingId) || null

  // Definir las pestañas disponibles
  const tabs = [
    { id: 'tasks', label: 'Tareas', icon: '📋' },
    { id: 'stats', label: 'Estadísticas', icon: '📊' },
  ]

  // Renderizar el contenido según la pestaña activa
  const renderTabContent = () => {
    switch (activeTab) {
      case 'stats':
        return (
          <section className="card">
            <div className="card-title">
              <span className="accent">📊</span>
              <h2>Estadísticas</h2>
            </div>
            <div className="stats-container">
              <div className="stat-item">
                <h3>Total</h3>
                <p className="stat-value total">{tasks.length}</p>
              </div>
              <div className="stat-item">
                <h3>Pendientes</h3>
                <p className="stat-value pending">{tasks.filter(t=>!t.completed).length}</p>
              </div>
              <div className="stat-item">
                <h3>Completadas</h3>
                <p className="stat-value completed">{tasks.filter(t=>t.completed).length}</p>
              </div>
            </div>
            
            <div className="category-stats">
              <h3>Por Categorías</h3>
              <div className="category-grid">
                {['general', 'trabajo', 'personal', 'estudio', 'hogar', 'salud', 'finanzas'].map(cat => {
                  const catTasks = tasks.filter(t => t.category === cat)
                  const completed = catTasks.filter(t => t.completed).length
                  const pending = catTasks.filter(t => !t.completed).length
                  const total = catTasks.length
                  
                  if (total === 0) return null
                  
                  return (
                    <div key={cat} className="category-stat">
                      <h4 className={`category-${cat}`}>{cat.charAt(0).toUpperCase() + cat.slice(1)}</h4>
                      <div className="category-numbers">
                        <span className="total-num">{total}</span>
                        <span className="pending-num">{pending}</span>
                        <span className="completed-num">{completed}</span>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          </section>
        )
      case 'tasks':
      default:
        return (
          <>
            <section className="controls">
              <div className="segmented">
                <button className={filter==='all'? 'active':''} onClick={() => setFilter('all')}>
                  Todas <span className="counter">{tasks.length}</span>
                </button>
                <button className={filter==='active'? 'active':''} onClick={() => setFilter('active')}>
                  Pendientes <span className="counter pending">{tasks.filter(t=>!t.completed).length}</span>
                </button>
                <button className={filter==='completed'? 'active':''} onClick={() => setFilter('completed')}>
                  Completadas <span className="counter completed">{tasks.filter(t=>t.completed).length}</span>
                </button>
                {/* Se removieron filtros de vencimientos */}
              </div>

              <div className="category-filter">
                <label>Categoría:</label>
                <select value={categoryFilter} onChange={(e) => setCategoryFilter(e.target.value)}>
                  <option value="all">Todas las categorías</option>
                  <option value="general">General</option>
                  <option value="trabajo">Trabajo</option>
                  <option value="personal">Personal</option>
                  <option value="estudio">Estudio</option>
                  <option value="hogar">Hogar</option>
                  <option value="salud">Salud</option>
                  <option value="finanzas">Finanzas</option>
                </select>
              </div>

              <div className="actions">
                <div className="search">
                  <span>🔎</span>
                  <input
                    placeholder="Buscar por título o descripción"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                  />
                </div>

                {/* Control de orden eliminado por solicitud */}

                {/* Se removió ventana de período */}
              </div>
            </section>

            <section className="list">
              {filteredSorted.length > 0 ? (
                <>
                  <TaskList tasks={filteredSorted} onToggle={toggleTask} onEdit={setEditingId} onDelete={deleteTask} />
                  <div className="task-summary">
                    <div className="summary-item">
                      <span className="label">Total:</span>
                      <span className="value total">{tasks.length}</span>
                    </div>
                    <div className="summary-item">
                      <span className="label">Pendientes:</span>
                      <span className="value pending">{tasks.filter(t=>!t.completed).length}</span>
                    </div>
                    <div className="summary-item">
                      <span className="label">Completadas:</span>
                      <span className="value completed">{tasks.filter(t=>t.completed).length}</span>
                    </div>
                    {/* Resumen de vencimientos removido */}
                    {categoryFilter !== 'all' && (
                      <div className="summary-item">
                        <span className="label">Categoría:</span>
                        <span className="value category">{categoryFilter.charAt(0).toUpperCase() + categoryFilter.slice(1)}</span>
                      </div>
                    )}
                  </div>
                </>
              ) : (
                <div className="empty-state">
                  <div className="empty-icon">📝</div>
                  {tasks.length === 0 && filter === 'all' && categoryFilter === 'all' && !query ? (
                    <>
                      <h3>Aún no tienes tareas</h3>
                      <p>✨ Crea tu primera tarea usando el botón "Crear Tarea" en la parte superior</p>
                    </>
                  ) : (
                    <>
                      <h3>No se encontraron tareas</h3>
                      <p>Ajusta los filtros o limpia la búsqueda.</p>
                      <button
                        type="button"
                        className="btn"
                        onClick={() => { setFilter('all'); setCategoryFilter('all'); setQuery(''); }}
                      >
                        Limpiar filtros
                      </button>
                    </>
                  )}
                </div>
              )}
            </section>
          </>
        )
    }
  }

  return (
    <div className="container">
      <header className="toolbar">
        <div className="toolbar-main">
          <h1>Gestor de Tareas</h1>
          <button 
            className="create-task-btn"
            onClick={() => setShowNewTaskModal(true)}
            aria-label="Crear nueva tarea"
            title="Crear nueva tarea"
          >
            <span className="create-icon">➕</span>
            <span className="create-text">Crear Tarea</span>
          </button>
        </div>
        <div className="user-switcher">
          <button 
            className="user-display"
            onClick={() => setShowUserDropdown(!showUserDropdown)}
            ref={userSelectRef}
          >
            👤 {userId}
            <span className="dropdown-arrow">▼</span>
          </button>
          {showUserDropdown && (
            <div className="user-dropdown">
              {['Invitado', 'Usuario 1', 'Usuario 2'].map(user => (
                <button
                  key={user}
                  className={`user-option ${userId === user ? 'active' : ''}`}
                  onClick={() => handleUserChange(user)}
                >
                  {user}
                </button>
              ))}
            </div>
          )}
        </div>
      </header>

      <Tabs activeTab={activeTab} onTabChange={setActiveTab} tabs={tabs} />
      
      {renderTabContent()}

      <Modal open={!!editingTask} title="Editar tarea" onClose={closeEditingModal}>
        {editingTask && (
          <TaskForm
            defaultValues={editingTask}
            onSubmit={(input) => saveEdit(editingTask.id, input)}
            onCancel={closeEditingModal}
          />
        )}
      </Modal>



      {/* Modal para nueva tarea */}
      <Modal open={showNewTaskModal} title="Nueva tarea" onClose={closeNewTaskModal}>
        <TaskForm 
          onSubmit={(input) => {
            addTask(input)
            closeNewTaskModal()
          }}
          onCancel={closeNewTaskModal}
        />
      </Modal>
    </div>
  )
}
