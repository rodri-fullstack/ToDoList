import { useState, useRef, useEffect } from 'react'

export default function TaskForm({ onSubmit, onCancel, defaultValues }) {
  const [title, setTitle] = useState(defaultValues?.title ?? '')
  const [description, setDescription] = useState(defaultValues?.description ?? '')
  const [category, setCategory] = useState(defaultValues?.category ?? 'general')
  const [dueDate, setDueDate] = useState(defaultValues?.dueDate ? formatDateForInput(defaultValues.dueDate) : '')
  const [dueTime, setDueTime] = useState(defaultValues?.dueTime ?? '')
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

  // Función para generar días del mes
  function generateDays() {
    const year = currentMonth.getFullYear()
    const month = currentMonth.getMonth()
    const firstDay = new Date(year, month, 1)
    const lastDay = new Date(year, month + 1, 0)
    const startDate = new Date(firstDay)
    startDate.setDate(startDate.getDate() - firstDay.getDay())
    
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
    // No cerrar el modal aquí, para permitir elegir la hora
  }

  // Función para cambiar mes
  function changeMonth(direction) {
    setCurrentMonth(prev => {
      const newMonth = new Date(prev)
      newMonth.setMonth(prev.getMonth() + direction)
      return newMonth
    })
  }

  // Función para seleccionar hora rápida
  function selectQuickTime(time) {
    setDueTime(time)
    // Cerrar automáticamente tras elegir hora rápida
    setShowCalendar(false)
  }

  // Utilidades para personalizar la hora de forma interactiva
  function parseTime(value){
    const [hStr, mStr] = (value || '09:00').split(':')
    const h = Math.max(0, Math.min(23, parseInt(hStr ?? '9', 10) || 0))
    const m = Math.max(0, Math.min(59, parseInt(mStr ?? '0', 10) || 0))
    return { h, m }
  }
  function formatTime(parts){
    const h = String(parts.h).padStart(2, '0')
    const m = String(parts.m).padStart(2, '0')
    return `${h}:${m}`
  }
  function adjustTime(deltaH, deltaM){
    const { h, m } = parseTime(dueTime)
    let newH = (h + deltaH + 24) % 24
    let totalM = m + deltaM
    if (totalM >= 60){ newH = (newH + Math.floor(totalM / 60)) % 24; totalM = totalM % 60 }
    if (totalM < 0){ const borrow = Math.ceil(Math.abs(totalM)/60); newH = (newH - borrow + 24)%24; totalM = (totalM % 60 + 60) % 60 }
    setDueTime(formatTime({ h: newH, m: totalM }))
  }
  const stepMinutes = 5
  const incHour = () => adjustTime(1, 0)
  const decHour = () => adjustTime(-1, 0)
  const incMinute = () => adjustTime(0, stepMinutes)
  const decMinute = () => adjustTime(0, -stepMinutes)
  const setMinutes = (min) => { const { h } = parseTime(dueTime); setDueTime(formatTime({ h, m: min })); setShowCalendar(false) }

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
      dueTime: dueTime || null
    }
    onSubmit(formData)
    if(!defaultValues){ setTitle(''); setDescription(''); setCategory('general'); setDueDate(''); setDueTime('') }
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
      <div className="form-group">
        <label className="label">Categoría</label>
        <select 
          className="input" 
          value={category} 
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
        <label className="label">Fecha y hora límite</label>
        <div className="date-time-container">
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
                  {dueDate ? `${formatDisplayDate(dueDate)}${dueTime ? ` · ${dueTime}` : ''}` : 'Seleccionar'}
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
                      <span>Dom</span>
                      <span>Lun</span>
                      <span>Mar</span>
                      <span>Mié</span>
                      <span>Jue</span>
                      <span>Vie</span>
                      <span>Sáb</span>
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

                    <div className="time-picker-header">
                      <h4>Personalizar la hora</h4>
                      <p className="time-helper">Elige una hora rápida o ajusta manualmente</p>
                    </div>
                    <div className="quick-times">
                      <div className="quick-time-grid">
                        {['09:00','10:00','11:00','12:00','13:00','14:00','15:00','16:00','17:00','18:00','19:00','20:00'].map(time => (
                          <button key={time} type="button" className="quick-time-btn" onClick={() => selectQuickTime(time)}>
                            {time}
                          </button>
                        ))}
                      </div>
                    </div>
                    <div className="custom-time">
                      <div className="time-stepper" role="group" aria-label="Ajustar hora">
                        <div className="step-group">
                          <button type="button" className="step-btn" onClick={decHour} aria-label="Disminuir hora">−</button>
                          <div className="time-display-box" aria-live="polite">{parseTime(dueTime).h.toString().padStart(2,'0')}</div>
                          <button type="button" className="step-btn" onClick={incHour} aria-label="Aumentar hora">+</button>
                        </div>
                        <div className="step-sep">:</div>
                        <div className="step-group">
                          <button type="button" className="step-btn" onClick={decMinute} aria-label="Disminuir minutos">−</button>
                          <div className="time-display-box" aria-live="polite">{parseTime(dueTime).m.toString().padStart(2,'0')}</div>
                          <button type="button" className="step-btn" onClick={incMinute} aria-label="Aumentar minutos">+</button>
                        </div>
                      </div>
                      <div className="time-actions">
                        <button type="button" className="btn primary ok-btn" onClick={()=>setShowCalendar(false)}>OK</button>
                      </div>
                      <input type="time" className="input custom-time-input" value={dueTime} onChange={(e)=>setDueTime(e.target.value)} />
                    </div>

                    <div className="picker-actions">
                      <button type="button" className="btn" onClick={() => setShowCalendar(false)}>Cancelar</button>
                      <button type="button" className="btn primary" onClick={() => setShowCalendar(false)}>Listo</button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
        
        <div className="date-time-help">
          <span className="help-text">💡 Selecciona una fecha y hora para establecer un recordatorio</span>
        </div>
      </div>
      <div className="form-actions">
        <button type="submit" className="btn primary">Guardar</button>
        {onCancel && <button type="button" className="btn" onClick={onCancel}>Cancelar</button>}
      </div>
    </form>
  )
}
