import type { ReactNode } from 'react'

export function PageHeader({ title, description, actions }: { title: ReactNode; description?: ReactNode; actions?: ReactNode }) {
  return (
    <header className="page-header">
      <div>
        <h1 className="page-header__title">{title}</h1>
        {description && <p className="page-header__desc">{description}</p>}
      </div>
      {actions && <div className="page-header__actions">{actions}</div>}
    </header>
  )
}

/** A titled card used for each example on the demo pages. */
export function DemoCard({ title, description, children, value }: { title: string; description?: ReactNode; children: ReactNode; value?: unknown }) {
  return (
    <section className="card demo">
      <div className="demo__head">
        <h2 className="demo__title">{title}</h2>
        {description && <p className="demo__desc">{description}</p>}
      </div>
      <div className="demo__body">{children}</div>
      {value !== undefined && (
        <div className="demo__value">
          <span>value</span>
          <code>{JSON.stringify(value)}</code>
        </div>
      )}
    </section>
  )
}
