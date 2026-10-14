import { useState, type FormEvent } from 'react'
import { DEFAULT_API_URL, getStateInstance } from '../api/greenApi'
import type { Credentials } from '../types'
import { ChatBubbleIcon } from './Icons'

interface Props {
  onLogin: (creds: Credentials) => void
}

export function LoginScreen({ onLogin }: Props) {
  const [idInstance, setIdInstance] = useState('')
  const [apiTokenInstance, setApiTokenInstance] = useState('')
  const [apiUrl, setApiUrl] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleSubmit(event: FormEvent) {
    event.preventDefault()
    setError(null)

    const creds: Credentials = {
      idInstance: idInstance.trim(),
      apiTokenInstance: apiTokenInstance.trim(),
      apiUrl: apiUrl.trim() || undefined,
    }

    if (!/^\d+$/.test(creds.idInstance)) {
      setError('idInstance должен состоять только из цифр.')
      return
    }

    setLoading(true)
    try {
      const state = await getStateInstance(creds)
      if (state !== 'authorized') {
        setError(
          `Инстанс не авторизован (состояние: ${state}). Отсканируйте QR-код в личном кабинете GREEN-API.`,
        )
        return
      }
      onLogin(creds)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Не удалось войти.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="login">
      <form className="login-card" onSubmit={handleSubmit}>
        <div className="login-logo">
          <ChatBubbleIcon width={32} height={32} />
        </div>
        <h1>Вход в чат MAX</h1>
        <p className="muted">
          Введите данные инстанса из личного кабинета{' '}
          <a href="https://console.green-api.com" target="_blank" rel="noreferrer">
            GREEN-API
          </a>
        </p>

        <label className="field">
          <span>idInstance</span>
          <input
            value={idInstance}
            onChange={(e) => setIdInstance(e.target.value)}
            inputMode="numeric"
            autoComplete="off"
            placeholder="3100000000"
            required
            autoFocus
          />
        </label>

        <label className="field">
          <span>apiTokenInstance</span>
          <input
            type="password"
            value={apiTokenInstance}
            onChange={(e) => setApiTokenInstance(e.target.value)}
            autoComplete="off"
            placeholder="••••••••••••••••"
            required
          />
        </label>

        <details className="advanced">
          <summary>Дополнительно</summary>
          <label className="field">
            <span>apiUrl (необязательно)</span>
            <input
              value={apiUrl}
              onChange={(e) => setApiUrl(e.target.value)}
              autoComplete="off"
              placeholder={DEFAULT_API_URL}
            />
          </label>
        </details>

        {error && (
          <div className="alert" role="alert">
            {error}
          </div>
        )}

        <button className="btn-primary" type="submit" disabled={loading}>
          {loading ? 'Проверяем…' : 'Войти'}
        </button>
      </form>
    </main>
  )
}
