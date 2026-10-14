import { useState, type FormEvent } from 'react'
import { normalizePhone } from '../utils/phone'
import { CloseIcon } from './Icons'

interface Props {
  onCreate: (phone: string) => Promise<void>
  onClose: () => void
}

export function NewChatDialog({ onCreate, onClose }: Props) {
  const [value, setValue] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleSubmit(event: FormEvent) {
    event.preventDefault()
    setError(null)

    const phone = normalizePhone(value)
    if (!phone) {
      setError('Введите номер в международном формате, например +7 999 123-45-67.')
      return
    }

    setLoading(true)
    try {
      await onCreate(phone)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Не удалось создать чат.')
      setLoading(false)
    }
  }

  return (
    <div className="modal-backdrop" onMouseDown={onClose}>
      <form
        className="modal"
        role="dialog"
        aria-modal="true"
        aria-label="Новый чат"
        onMouseDown={(e) => e.stopPropagation()}
        onSubmit={handleSubmit}
        onKeyDown={(e) => e.key === 'Escape' && onClose()}
      >
        <header className="modal-header">
          <h2>Новый чат</h2>
          <button
            type="button"
            className="icon-btn"
            onClick={onClose}
            aria-label="Закрыть"
          >
            <CloseIcon />
          </button>
        </header>

        <label className="field">
          <span>Номер телефона получателя</span>
          <input
            type="tel"
            value={value}
            onChange={(e) => setValue(e.target.value)}
            placeholder="+7 999 123-45-67"
            autoComplete="off"
            autoFocus
            required
          />
        </label>

        {error && (
          <div className="alert" role="alert">
            {error}
          </div>
        )}

        <button className="btn-primary" type="submit" disabled={loading}>
          {loading ? 'Проверяем номер…' : 'Начать чат'}
        </button>
      </form>
    </div>
  )
}
