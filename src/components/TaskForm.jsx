import { useState, useRef, useEffect } from 'react'

export default function TaskForm({ onSubmit, onCancel, defaultValues }) {
  const [title, setTitle] = useState(defaultValues?.title ?? '')
  const [description, setDescription] = useState(defaultValues?.description ?? '')
  const [category, setCategory] = useState(defaultValues?.category ?? 'general')
  const [dueDate, setDueDate] = useState(defaultValues?.dueDate ? formatDateForInput(defaultValues.dueDate) : '')
  const [dueTime, setDueTime] = useState(defaultValues?.dueTime ?? '')
  const [showCalendar, setShowCalendar] = useState(false)
  const [showTimePicker, setShowTimePicker] = useState(false)
  const [selectedDate, setSelectedDate] = useState(defaultValues?.dueDate ? new Date(defaultValues.dueDate) : null)
  const [currentMonth, setCurrentMonth] = useState(new Date())
  const calendarRef = useRef(null)
  const timePickerRef = useRef(null)

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
      if (timePickerRef.current && !timePickerRef.current.contains(event.target)) {
        setShowTimePicker(false)
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
        setShowTimePicker(false)
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
        <label className="label" htmlFor="date-time-picker">Fecha y hora límite</label>
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
                      <button 
                        type="button" 
                        className="time-adjust-btn"
                        onClick={() => setShowTimePicker(true)}
                        aria-label="Ajustar hora personalizada"
                      >
                        <span className="time-adjust-icon">⏰</span>
                        <span className="time-adjust-text">Ajustar hora personalizada</span>
                      </button>
                    </div>

                    <div className="picker-actions">
                      <button type="button" className="btn cancel-btn" onClick={() => setShowCalendar(false)}>Cancelar</button>
                      <button type="button" className="btn primary confirm-btn" onClick={() => setShowCalendar(false)}>Listo</button>
                    </div>
                  </div>
                </div>
              )}
              
              {/* Ventana modal del time picker */}
              {showTimePicker && (
                <div className="picker-overlay" onClick={() => setShowTimePicker(false)}>
                  <div className="picker-modal time-picker-modal" ref={timePickerRef} onClick={(e)=>e.stopPropagation()}>
                    <div className="time-picker-header">
                      <h4>Ajustar Hora Personalizada</h4>
                      <p className="time-helper">Selecciona la hora y minutos exactos</p>
                    </div>
                    
                    <div className="time-scroll-container">
                      <div className="time-scroll-section">
                        <h5>Hora</h5>
                        <div className="time-scroll" role="group" aria-label="Seleccionar hora">
                          {Array.from({length: 24}, (_, i) => (
                            <button 
                              key={i} 
                              type="button" 
                              className={`time-scroll-item ${parseTime(dueTime).h === i ? 'selected' : ''}`}
                              onClick={() => setDueTime(formatTime({ h: i, m: parseTime(dueTime).m }))}
                              aria-label={`Hora ${i}`}
                            >
                              {i.toString().padStart(2, '0')}
                            </button>
                          ))}
                        </div>
                      </div>
                      <div className="time-scroll-section">
                        <h5>Minutos</h5>
                        <div className="time-scroll" role="group" aria-label="Seleccionar minutos">
                          {Array.from({length: 60}, (_, i) => i % 5 === 0).map((_, i) => i * 5).map(minute => (
                            <button 
                              key={minute} 
                              type="button" 
                              className={`time-scroll-item ${parseTime(dueTime).m === minute ? 'selected' : ''}`}
                              onClick={() => setDueTime(formatTime({ h: parseTime(dueTime).h, m: minute }))}
                              aria-label={`Minuto ${minute}`}
                            >
                              {minute.toString().padStart(2, '0')}
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>
                    
                    <div className="picker-actions">
                      <button type="button" className="btn cancel-btn" onClick={() => setShowTimePicker(false)}>Cancelar</button>
                      <button type="button" className="btn primary confirm-btn" onClick={() => setShowTimePicker(false)}>Listo</button>
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
