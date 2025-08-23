import { useState, useRef, useEffect } from 'react'

export default function TaskForm({ onSubmit, onCancel, defaultValues }) {
  const [title, setTitle] = useState(defaultValues?.title ?? '')
  const [description, setDescription] = useState(defaultValues?.description ?? '')
  const [category, setCategory] = useState(defaultValues?.category ?? 'general')
  const [dueDate, setDueDate] = useState(defaultValues?.dueDate ? formatDateForInput(defaultValues.dueDate) : '')
  const [showCalendar, setShowCalendar] = useState(false)
  const [selectedDate, setSelectedDate] = useState(defaultValues?.dueDate ? new Date(defaultValues.dueDate) : null)
  const [currentMonth, setCurrentMonth] = useState(new Date())
  const calendarRef = useRef(null)

  // Función para convertir fecha ISO a formato yyyy-mm-dd para el input date
  function formatDateForInput(isoDate) {
    if (!isoDate) return ''
    const date = new Date(isoDate)
    const year = date.getFullYear()
    const month = String(date.getMonth() + 1).padStart(2, '0')
    const day = String(date.getDate()).padStart(2, '0')
    return `${year}-${month}-${day}`
  }

  // Función para convertir formato yyyy-mm-dd a ISO
  function parseDateInput(dateString) {
    if (!dateString) return null
    return dateString // El input date ya devuelve formato ISO
  }

  // Función para obtener la fecha mínima (hoy)
  function getMinDate() {
    const today = new Date()
    const year = today.getFullYear()
    const month = String(today.getMonth() + 1).padStart(2, '0')
    const day = String(today.getDate()).padStart(2, '0')
    return `${year}-${month}-${day}`
  }

  // Función para formatear fecha para mostrar
  function formatDisplayDate(isoDate) {
    if (!isoDate) return ''
    const date = new Date(isoDate)
    const today = new Date()
    const tomorrow = new Date(today)
    tomorrow.setDate(tomorrow.getDate() + 1)
    
    // Si es hoy
    if (date.toDateString() === today.toDateString()) {
      return 'Hoy'
    }
    
    // Si es mañana
    if (date.toDateString() === tomorrow.toDateString()) {
      return 'Mañana'
    }
    
    // Formato estándar
    return date.toLocaleDateString('es-ES', { 
      weekday: 'short', 
      day: 'numeric', 
      month: 'short' 
    })
  }

  // Función para generar días del mes (empezando en lunes)
  function generateDays() {
    const year = currentMonth.getFullYear()
    const month = currentMonth.getMonth()
    const firstDay = new Date(year, month, 1)
    const lastDay = new Date(year, month + 1, 0)
    
    // Calcular el primer día de la semana (lunes = 1, domingo = 0)
    let firstDayOfWeek = firstDay.getDay()
    if (firstDayOfWeek === 0) firstDayOfWeek = 7 // Domingo se convierte en 7
    
    const startDate = new Date(firstDay)
    startDate.setDate(startDate.getDate() - (firstDayOfWeek - 1)) // Retroceder hasta el lunes
    
    const days = []
    const today = new Date()
    
    for (let i = 0; i < 42; i++) {
      const date = new Date(startDate)
      date.setDate(startDate.getDate() + i)
      
      const isCurrentMonth = date.getMonth() === month
      const isToday = date.toDateString() === today.toDateString()
      const isSelected = selectedDate && date.toDateString() === selectedDate.toDateString()
      const isPast = date < new Date(today.getFullYear(), today.getMonth(), today.getDate())
      
      days.push({
        date,
        isCurrentMonth,
        isToday,
        isSelected,
        isPast
      })
    }
    
    return days
  }

  // Función para seleccionar fecha
  function selectDate(date) {
    if (date < new Date(new Date().getFullYear(), new Date().getMonth(), new Date().getDate())) {
      return // No permitir fechas pasadas
    }
    
    setSelectedDate(date)
    const year = date.getFullYear()
    const month = String(date.getMonth() + 1).padStart(2, '0')
    const day = String(date.getDate()).padStart(2, '0')
    setDueDate(`${year}-${month}-${day}`)
    setShowCalendar(false) // Cerrar el calendario al seleccionar fecha
  }

  // Función para cambiar mes
  function changeMonth(direction) {
    setCurrentMonth(prev => {
      const newMonth = new Date(prev)
      newMonth.setMonth(prev.getMonth() + direction)
      return newMonth
    })
  }

  // Cerrar calendario al hacer clic fuera
  useEffect(() => {
    function handleClickOutside(event) {
      if (calendarRef.current && !calendarRef.current.contains(event.target)) {
        setShowCalendar(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  // Cerrar con tecla Escape
  useEffect(() => {
    function handleEsc(event){
      if(event.key === 'Escape'){
        setShowCalendar(false)
      }
    }
    document.addEventListener('keydown', handleEsc)
    return () => document.removeEventListener('keydown', handleEsc)
  }, [])



  function handleSubmit(e){
    e.preventDefault()
    if(!title.trim()) return
    // Asegurarse de que los valores se pasan correctamente
    const formData = { 
      title: title.trim(), 
      description: description || '', 
      category: category || 'general',
      dueDate: parseDateInput(dueDate),
      dueTime: null // Siempre null ya que no manejamos hora
    }
    onSubmit(formData)
    if(!defaultValues){ setTitle(''); setDescription(''); setCategory('general'); setDueDate('') }
  }

  return (
    <form onSubmit={handleSubmit} className="form">
      <div className="form-group">
        <input 
          className="input" 
          placeholder="Título" 
          value={title} 
          onChange={(e)=>setTitle(e.target.value)} 
          required 
        />
      </div>
      <div className="form-group">
        <textarea 
          className="textarea" 
          placeholder="Descripción" 
          value={description} 
          onChange={(e)=>setDescription(e.target.value)} 
        />
      </div>
      <div className="form-group select-group">
        <label className="label" htmlFor="category-select">Categoría</label>
        <select 
          id="category-select"
          className="input" 
          value={category || 'general'} 
          onChange={(e)=>setCategory(e.target.value)}
        >
          <option value="general">General</option>
          <option value="trabajo">Trabajo</option>
          <option value="personal">Personal</option>
          <option value="estudio">Estudio</option>
          <option value="hogar">Hogar</option>
          <option value="salud">Salud</option>
          <option value="finanzas">Finanzas</option>
        </select>
      </div>
      <div className="form-group">
        <label className="label" htmlFor="date-picker">Fecha límite</label>
        <div className="date-container">
          <div className="date-input-group">
            <div className="date-picker-container">
              <button
                type="button"
                className="display-btn date-display"
                onClick={() => setShowCalendar(true)}
                aria-haspopup="dialog"
                aria-expanded={showCalendar}
              >
                <span className="display-icon">📅</span>
                <span className="display-text">
                  {dueDate ? formatDisplayDate(dueDate) : 'Seleccionar fecha'}
                </span>
              </button>

              {showCalendar && (
                <div className="picker-overlay" onClick={() => setShowCalendar(false)}>
                  <div className="picker-modal calendar-modal" ref={calendarRef} onClick={(e)=>e.stopPropagation()}>
                    <div className="calendar-header">
                      <button 
                        type="button" 
                        className="month-nav"
                        onClick={() => changeMonth(-1)}
                      >
                        ◀
                      </button>
                      <h4 className="current-month">
                        {currentMonth.toLocaleDateString('es-ES', { month: 'long', year: 'numeric' })}
                      </h4>
                      <button 
                        type="button" 
                        className="month-nav"
                        onClick={() => changeMonth(1)}
                      >
                        ▶
                      </button>
                    </div>
                    
                    <div className="calendar-weekdays">
                      <span>Lun</span>
                      <span>Mar</span>
                      <span>Mié</span>
                      <span>Jue</span>
                      <span>Vie</span>
                      <span>Sáb</span>
                      <span>Dom</span>
                    </div>
                    
                    <div className="calendar-days">
                      {generateDays().map((day, index) => (
                        <button
                          key={index}
                          type="button"
                          className={`calendar-day ${day.isCurrentMonth ? 'current-month' : 'other-month'} ${day.isToday ? 'today' : ''} ${day.isSelected ? 'selected' : ''} ${day.isPast ? 'past' : ''}`}
                          onClick={() => selectDate(day.date)}
                          disabled={day.isPast}
                        >
                          {day.date.getDate()}
                        </button>
                      ))}
                    </div>

                    <div className="picker-actions">
                      <button type="button" className="btn cancel-btn" onClick={() => setShowCalendar(false)}>Cancelar</button>
                      <button type="button" className="btn primary confirm-btn" onClick={() => setShowCalendar(false)}>Listo</button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
        
        <div className="date-help">
          <span className="help-text">💡 Selecciona una fecha para establecer un recordatorio</span>
        </div>
      </div>
      <div className="form-actions">
        <button type="submit" className="btn primary">Guardar</button>
        {onCancel && <button type="button" className="btn" onClick={onCancel}>Cancelar</button>}
      </div>
    </form>
  )
}
