import { useState } from 'react'

export default function TaskForm({ onSubmit, onCancel, defaultValues }) {
  const [title, setTitle] = useState(defaultValues?.title ?? '')
  const [description, setDescription] = useState(defaultValues?.description ?? '')
  const [dueDate, setDueDate] = useState(defaultValues?.dueDate ?? '')

  function handleSubmit(e){
    e.preventDefault()
    if(!title.trim()) return
    onSubmit({ title: title.trim(), description, dueDate })
    if(!defaultValues){ setTitle(''); setDescription(''); setDueDate('') }
  }

  return (
    <form onSubmit={handleSubmit}>
      <input placeholder="Título" value={title} onChange={(e)=>setTitle(e.target.value)} required />
      <textarea placeholder="Descripción" value={description} onChange={(e)=>setDescription(e.target.value)} />
      <input type="date" value={dueDate} onChange={(e)=>setDueDate(e.target.value)} />
      <button type="submit">Guardar</button>
      {onCancel && <button type="button" onClick={onCancel}>Cancelar</button>}
    </form>
  )
}
