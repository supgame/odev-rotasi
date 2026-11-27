import type { ReactNode } from 'react'

/** Oyun tarzı onay kutusu (tarayıcının confirm() penceresi yerine). */
export function Modal({ ribbon, title, children, onClose }: { ribbon?: string; title: string; children: ReactNode; onClose: () => void }) {
  return (
    <div className="modal-bg" onClick={onClose}>
      <div className="panel modal" role="dialog" aria-modal="true" aria-label={title} onClick={(e) => e.stopPropagation()}>
        {ribbon && <span className="ribbon gold">{ribbon}</span>}
        <h2>{title}</h2>
        {children}
      </div>
    </div>
  )
}
