import React from 'react'

export default function Modal({ open, title, onClose, children }){
  // Si no está abierto, no renderizar nada
  if(!open) return null
  
  // Prevenir scroll del body cuando el modal está abierto
  React.useEffect(() => {
    if (!open) return
    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = previousOverflow || ''
    }
  }, [open])
  
  return (
    <div className="modal" onClick={onClose}>
      <div className="modal-card" onClick={(e)=>e.stopPropagation()}>
        <div className="row between">
          <h2>{title}</h2>
          <button 
            className="close-btn" 
            onClick={onClose}
            aria-label="Cerrar"
          >
            ✖
          </button>
        </div>
        {children}
      </div>
    </div>
  )
}
  