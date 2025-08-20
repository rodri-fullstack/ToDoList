import TaskItem from './TaskItem'

export default function TaskList({ tasks, onToggle, onEdit, onDelete }){
  // Verificar que tasks es un array
  if(!tasks || !Array.isArray(tasks) || !tasks.length){
    return <div className="empty">No hay tareas aún.</div>
  }
  
  return (
    <ul className="task-list">
      {tasks.map(t => (
        <TaskItem 
          key={t.id} 
          task={t} 
          onToggle={onToggle} 
          onEdit={onEdit} 
          onDelete={onDelete} 
        />
      ))}
    </ul>
  )
}
