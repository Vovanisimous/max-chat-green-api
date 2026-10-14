import { useEffect, useRef, useState } from 'react'
import {
  GreenApiError,
  deleteNotification,
  receiveNotification,
} from '../api/greenApi'
import { parseIncomingMessage } from '../api/notifications'
import type { Credentials, IncomingMessage } from '../types'

export type ConnectionStatus = 'connecting' | 'online' | 'error'

interface Options {
  creds: Credentials
  onMessage: (incoming: IncomingMessage) => void
  /** Вызывается при фатальной ошибке доступа (неверный токен) */
  onAuthError: () => void
}

const MIN_DELAY = 1_000
const MAX_DELAY = 15_000

function sleep(ms: number, signal: AbortSignal): Promise<void> {
  return new Promise((resolve) => {
    const timer = setTimeout(resolve, ms)
    signal.addEventListener(
      'abort',
      () => {
        clearTimeout(timer)
        resolve()
      },
      { once: true },
    )
  })
}

/**
 * Long-polling очереди уведомлений GREEN-API:
 * ReceiveNotification → обработка → DeleteNotification.
 */
export function useNotifications({ creds, onMessage, onAuthError }: Options) {
  const [status, setStatus] = useState<ConnectionStatus>('connecting')
  const [error, setError] = useState<string | null>(null)

  // Свежие колбэки без перезапуска цикла опроса
  const handlers = useRef({ onMessage, onAuthError })
  useEffect(() => {
    handlers.current = { onMessage, onAuthError }
  })

  const { idInstance, apiTokenInstance, apiUrl } = creds

  useEffect(() => {
    const controller = new AbortController()
    const { signal } = controller
    const current: Credentials = { idInstance, apiTokenInstance, apiUrl }

    async function poll() {
      let delay = MIN_DELAY

      while (!signal.aborted) {
        const startedAt = Date.now()
        try {
          const notification = await receiveNotification(current, signal)
          if (signal.aborted) return

          setStatus('online')
          setError(null)
          delay = MIN_DELAY

          if (!notification) {
            // Сервер ответил пустотой мгновенно — не крутим цикл вхолостую
            if (Date.now() - startedAt < 500) await sleep(MIN_DELAY, signal)
            continue
          }

          const incoming = parseIncomingMessage(notification.body)
          if (incoming) handlers.current.onMessage(incoming)

          // Подтверждаем обработку для любого уведомления, чтобы очередь не залипала
          await deleteNotification(current, notification.receiptId)
        } catch (err) {
          if (signal.aborted) return

          if (
            err instanceof GreenApiError &&
            (err.status === 401 || err.status === 403)
          ) {
            handlers.current.onAuthError()
            return
          }

          setStatus('error')
          setError(
            err instanceof Error ? err.message : 'Неизвестная ошибка получения',
          )
          await sleep(delay, signal)
          delay = Math.min(delay * 2, MAX_DELAY)
        }
      }
    }

    void poll()
    return () => controller.abort()
  }, [idInstance, apiTokenInstance, apiUrl])

  return { status, error }
}
