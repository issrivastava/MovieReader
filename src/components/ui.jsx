// Minimal shared UI — light theme: flat surfaces, one accent, clear states.
// Hierarchy: label (12px semibold) > input > hint/error (13px).
import React from 'react'

export function Field({ label, htmlFor, error, hint, children }) {
  return (
    <div>
      {label && (
        <label htmlFor={htmlFor} className="mb-1.5 block text-[13px] font-semibold text-zinc-800">
          {label}
        </label>
      )}
      {children}
      {error
        ? <p id={`${htmlFor}-error`} role="alert" className="mt-1.5 text-[13px] text-red-700">{error}</p>
        : hint
          ? <p className="mt-1.5 text-[13px] text-zinc-500">{hint}</p>
          : null}
    </div>
  )
}

export function TextInput({ id, error, className = '', ...props }) {
  return (
    <input
      id={id}
      aria-invalid={Boolean(error)}
      aria-describedby={error ? `${id}-error` : undefined}
      className={`w-full rounded-lg border bg-white px-3 py-2.5 text-[15px] text-zinc-900 placeholder:text-zinc-400 outline-none transition-colors ${
        error ? 'border-red-500' : 'border-zinc-300 hover:border-zinc-400 focus:border-rose-600'
      } ${className}`}
      {...props}
    />
  )
}

export function Button({ variant = 'primary', className = '', ...props }) {
  const base = 'inline-flex w-full items-center justify-center rounded-lg px-4 py-2.5 text-[15px] font-semibold transition-colors disabled:cursor-not-allowed disabled:opacity-50'
  const styles = {
    primary: 'bg-rose-600 text-white hover:bg-rose-700',
    secondary: 'border border-zinc-300 bg-white text-zinc-900 hover:border-rose-300 hover:bg-rose-50/50',
    ghost: 'text-zinc-600 hover:text-rose-700 hover:bg-rose-50',
  }
  return <button className={`${base} ${styles[variant]} ${className}`} {...props} />
}

export function Alert({ tone = 'error', children }) {
  const styles = {
    error: 'border-red-300 bg-red-50 text-red-800',
    success: 'border-emerald-300 bg-emerald-50 text-emerald-800',
    info: 'border-sky-300 bg-sky-50 text-sky-800',
    note: 'border-dashed border-amber-300 bg-amber-50 text-amber-800',
  }
  const role = tone === 'error' ? 'alert' : 'status'
  return <div role={role} className={`rounded-lg border px-3 py-2.5 text-sm leading-relaxed ${styles[tone]}`}>{children}</div>
}

export function CardSkeleton() {
  return (
    <div aria-hidden="true" className="overflow-hidden rounded-lg border border-zinc-200 bg-white">
      <div className="skeleton skeleton-pulse aspect-[2/3] w-full" />
      <div className="space-y-2 p-3">
        <div className="skeleton skeleton-pulse h-4 w-3/4" />
        <div className="skeleton skeleton-pulse h-3 w-1/2" />
        <div className="skeleton skeleton-pulse h-9 w-full" />
      </div>
    </div>
  )
}

export function EmptyState({ title, body, action }) {
  return (
    <div className="mx-auto max-w-md rounded-lg border border-zinc-200 bg-white px-6 py-12 text-center">
      <h2 className="text-lg font-semibold text-zinc-900">{title}</h2>
      <p className="mx-auto mt-2 max-w-sm text-sm leading-relaxed text-zinc-600">{body}</p>
      {action && <div className="mt-6">{action}</div>}
    </div>
  )
}

export function ConfirmState({ title, body }) {
  return (
    <div role="status" className="rounded-lg border border-emerald-300 bg-emerald-50 px-4 py-3">
      <p className="text-sm font-semibold text-emerald-800">{title}</p>
      {body && <p className="mt-1 text-sm text-emerald-700">{body}</p>}
    </div>
  )
}
