import { useSyncExternalStore } from 'react'
import { dismissToast, getToasts, subscribeToasts } from '../../lib/toast'
import { Icon } from './Icon'
import './ui.css'

const TONE_ICON = { success: 'check', error: 'alert', info: 'info' } as const

export function Toaster() {
  const toasts = useSyncExternalStore(subscribeToasts, getToasts)
  return (
    <section className="toaster" aria-live="polite" aria-label="Notifications">
      {toasts.map((t) => (
        <div key={t.id} className="toast" data-tone={t.tone} role="status">
          <span className="toast__icon">
            <Icon name={TONE_ICON[t.tone]} size={16} />
          </span>
          <div className="toast__body">
            <p className="toast__title">{t.title}</p>
            {t.description && <p className="toast__desc">{t.description}</p>}
          </div>
          <button type="button" className="toast__close" aria-label="Dismiss" onClick={() => dismissToast(t.id)}>
            <Icon name="x" size={14} />
          </button>
        </div>
      ))}
    </section>
  )
}
