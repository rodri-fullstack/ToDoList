function isOverdue(task){
    if(!task.dueDate || task.completed) return false
    const today = new Date()
    const d = new Date(task.dueDate + 'T23:59:59')
    return d < today
  }
  
  export default function TaskItem({ task, onToggle, onEdit, onDelete }){
    const overdue = isOverdue(task)
    return (
      <li className="item">
        <button onClick={()=>onToggle(task.id)}>
          {task.completed ? '✅' : '⚪'}
        </button>
        <div>
          <h3 className={task.completed ? 'line' : ''}>{task.title}</h3>
          {task.description && <p>{task.description}</p>}
          {task.dueDate && <p>Vence: {task.dueDate} {overdue && !task.completed ? '(vencida)' : ''}</p>}
        </div>
        <div>
          <button onClick={()=>onEdit(task.id)}>✏️</button>
          <button onClick={()=>onDelete(task.id)}>🗑️</button>
        </div>
      </li>
    )
  }
  