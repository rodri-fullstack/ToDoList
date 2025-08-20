export default function Modal({ open, title, onClose, children }){
    if(!open) return null
    return (
      <div className="modal" onClick={onClose}>
        <div className="modal-card" onClick={(e)=>e.stopPropagation()}>
          <div className="row between">
            <h2>{title}</h2>
            <button onClick={onClose}>✖</button>
          </div>
          {children}
        </div>
      </div>
    )
  }
  