import TaskItem from './TaskItem'

export default function TaskList({ tasks, onToggle, onEdit, onDelete }){
  if(!tasks.length){
    return <div>No hay tareas aún.</div>
  }
  return (
    <ul>
      {tasks.map(t => (
        <TaskItem key={t.id} task={t} onToggle={onToggle} onEdit={onEdit} onDelete={onDelete} />
      ))}
    </ul>
  )
}
