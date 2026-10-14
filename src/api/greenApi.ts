import type { Credentials } from '../types'

export const DEFAULT_API_URL: string =
  import.meta.env.VITE_GREEN_API_URL || 'https://api.green-api.com'

export class GreenApiError extends Error {
  readonly status?: number

  constructor(message: string, status?: number) {
    super(message)
    this.name = 'GreenApiError'
    this.status = status
  }
}

export interface ReceivedNotification {
  receiptId: number
  body: unknown
}

export interface CheckAccountResult {
  exist: boolean
  chatId: string
}

export function buildUrl(
  creds: Credentials,
  method: string,
  suffix = '',
): string {
  const host = (creds.apiUrl?.trim() || DEFAULT_API_URL).replace(/\/+$/, '')
  const id = encodeURIComponent(creds.idInstance.trim())
  const token = encodeURIComponent(creds.apiTokenInstance.trim())
  return `${host}/waInstance${id}/${method}/${token}${suffix}`
}

async function request<T>(
  url: string,
  init: RequestInit = {},
): Promise<T> {
  let response: Response
  try {
    response = await fetch(url, init)
  } catch (error) {
    if (error instanceof DOMException && error.name === 'AbortError') {
      throw error
    }
    throw new GreenApiError(
      'Не удалось связаться с GREEN-API. Проверьте подключение к интернету.',
    )
  }

  const text = await response.text()

  if (!response.ok) {
    throw new GreenApiError(describeHttpError(response.status, text), response.status)
  }

  if (!text.trim()) return null as T
  try {
    return JSON.parse(text) as T
  } catch {
    throw new GreenApiError('GREEN-API вернул ответ в неожиданном формате.')
  }
}

function describeHttpError(status: number, body: string): string {
  if (status === 401 || status === 403) {
    return 'Неверные idInstance или apiTokenInstance (либо доступ ограничен).'
  }
  if (status === 429) return 'Слишком много запросов. Повторите чуть позже.'
  if (status === 466) return 'Превышен лимит запросов тарифа GREEN-API.'
  const details = body.trim().slice(0, 200)
  return details
    ? `Ошибка GREEN-API (${status}): ${details}`
    : `Ошибка GREEN-API (${status}).`
}

/** Проверка учётных данных: возвращает состояние инстанса (например, "authorized"). */
export async function getStateInstance(creds: Credentials): Promise<string> {
  const data = await request<{ stateInstance?: string }>(
    buildUrl(creds, 'getStateInstance'),
  )
  return data?.stateInstance ?? 'unknown'
}

/** Проверка наличия аккаунта MAX по номеру телефона. */
export async function checkAccount(
  creds: Credentials,
  phoneNumber: string,
): Promise<CheckAccountResult> {
  const data = await request<{
    exist?: boolean
    chatId?: string
    status?: boolean
    reason?: string
  }>(buildUrl(creds, 'checkAccount'), {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ phoneNumber: Number(phoneNumber) }),
  })

  if (data?.status === false) {
    throw new GreenApiError(data.reason || 'Не удалось проверить номер.')
  }
  return { exist: Boolean(data?.exist), chatId: data?.chatId ?? '' }
}

/** SendMessage — отправка текстового сообщения. Возвращает idMessage. */
export async function sendMessage(
  creds: Credentials,
  chatId: string,
  message: string,
): Promise<string> {
  const data = await request<{ idMessage?: string }>(
    buildUrl(creds, 'sendMessage'),
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ chatId, message }),
    },
  )
  if (!data?.idMessage) {
    throw new GreenApiError('GREEN-API не вернул идентификатор сообщения.')
  }
  return data.idMessage
}

/**
 * ReceiveNotification — получение одного уведомления из очереди.
 * Запрос «висит» до receiveTimeout секунд; если уведомлений нет — вернётся null.
 */
export async function receiveNotification(
  creds: Credentials,
  signal?: AbortSignal,
  receiveTimeout = 5,
): Promise<ReceivedNotification | null> {
  const data = await request<ReceivedNotification | null>(
    buildUrl(creds, 'receiveNotification', `?receiveTimeout=${receiveTimeout}`),
    { signal },
  )
  if (!data || typeof data.receiptId !== 'number') return null
  return data
}

/** DeleteNotification — подтверждение обработки уведомления. */
export async function deleteNotification(
  creds: Credentials,
  receiptId: number,
): Promise<void> {
  await request(buildUrl(creds, 'deleteNotification', `/${receiptId}`), {
    method: 'DELETE',
  })
}
