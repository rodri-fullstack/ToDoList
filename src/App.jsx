import { useMemo, useState } from 'react'
import TaskList from './components/TaskList'
import TaskForm from './components/TaskForm'
import Modal from './components/Modal'
import useLocalStorage from './hooks/useLocalStorage'

export default function App() {
  const [tasks, setTasks] = useLocalStorage('todo.tasks.v2', [])
  const [query, setQuery] = useState('')
  const [filter, setFilter] = useState('all')
  const [sortBy, setSortBy] = useState('updatedDesc')
  const [editingId, setEditingId] = useState(null)

  const filteredSorted = useMemo(() => {
    const q = query.trim().toLowerCase()
    let data = [...tasks]

    if (filter === 'active') data = data.filter(t => !t.completed)
    if (filter === 'completed') data = data.filter(t => t.completed)

    if (q) {
      data = data.filter(t =>
        t.title.toLowerCase().includes(q) || (t.description || '').toLowerCase().includes(q)
      )
    }

    data.sort((a, b) => {
      if (sortBy === 'updatedDesc') return b.updatedAt.localeCompare(a.updatedAt)
      if (sortBy === 'createdDesc') return b.createdAt.localeCompare(a.createdAt)
      if (sortBy === 'dueAsc') {
        const ad = a.dueDate ?? '9999-12-31'
        const bd = b.dueDate ?? '9999-12-31'
        return ad.localeCompare(bd)
      }
      if (sortBy === 'status') {
        return Number(a.completed) - Number(b.completed)
      }
      return 0
    })

    return data
  }, [tasks, filter, query, sortBy])

  function addTask(input) {
    const now = new Date().toISOString()
    const newTask = {
      id: crypto.randomUUID?.() || `${Date.now().toString(36)}-${Math.random().toString(36).slice(2,8)}`,
      title: input.title,
      description: input.description,
      completed: false,
      createdAt: now,
      updatedAt: now,
      dueDate: input.dueDate ?? null,
    }
    setTasks(prev => [newTask, ...prev])
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

  return (
    <div className="container">
      <header className="toolbar">
        <h1>ToDo List</h1>
        <span className="muted">Persistencia: localStorage</span>
      </header>

      <section className="card">
        <div className="card-title">
          <span className="accent">＋</span>
          <h2>Nueva tarea</h2>
        </div>
        <TaskForm onSubmit={addTask} />
      </section>

      <section className="controls">
        <div className="segmented">
          <button className={filter==='all'? 'active':''} onClick={() => setFilter('all')}>Todas</button>
          <button className={filter==='active'? 'active':''} onClick={() => setFilter('active')}>Pendientes</button>
          <button className={filter==='completed'? 'active':''} onClick={() => setFilter('completed')}>Completadas</button>
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

          <div className="sort">
            <span>↕</span>
            <select value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
              <option value="updatedDesc">Actualización</option>
              <option value="createdDesc">Creación</option>
              <option value="dueAsc">Vencimiento</option>
              <option value="status">Estado</option>
            </select>
          </div>
        </div>
      </section>

      <section className="list">
        <TaskList tasks={filteredSorted} onToggle={toggleTask} onEdit={setEditingId} onDelete={deleteTask} />
        <p className="muted small">
          Total: {tasks.length} · Pendientes: {tasks.filter(t=>!t.completed).length} · Completadas: {tasks.filter(t=>t.completed).length}
        </p>
      </section>

      <Modal open={!!editingTask} title="Editar tarea" onClose={() => setEditingId(null)}>
        {editingTask && (
          <TaskForm
            defaultValues={editingTask}
            onSubmit={(input) => saveEdit(editingTask.id, input)}
            onCancel={() => setEditingId(null)}
          />
        )}
      </Modal>
    </div>
  )
}
