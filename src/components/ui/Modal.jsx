import { useEffect } from 'react'

export function Modal({ open, onClose, title, children }) {
  useEffect(() => {
    if (!open) return
    const onKey = (e) => {
      if (e.key === 'Escape') onClose?.()
    }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [open, onClose])

  if (!open) return null

  return (
    <div
      className="fixed inset-0 z-[80] flex items-center justify-center bg-black/65 px-4"
      role="dialog"
      aria-modal="true"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) onClose?.()
      }}
    >
      <div className="w-full max-w-lg rounded-2xl bg-white p-7 text-center shadow-2xl dark:bg-zinc-900">
        <div className="mx-auto relative mb-4 h-14 w-14">
          <span className="absolute inset-0 rounded-full border-2 border-orange-400 animate-pulseRing" />
          <span className="relative z-10 grid h-14 w-14 place-content-center rounded-full bg-orange-500 text-2xl text-white">
            ✓
          </span>
        </div>
        <h4 className="text-2xl font-semibold">{title}</h4>
        <div className="mt-3 text-zinc-600 dark:text-zinc-300">{children}</div>
        <button
          type="button"
          onClick={onClose}
          className="mt-6 rounded-full bg-orange-500 px-8 py-2 font-medium text-white hover:bg-orange-400"
        >
          Continue
        </button>
      </div>
    </div>
  )
}

