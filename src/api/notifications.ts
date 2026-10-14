import type { IncomingMessage } from '../types'

type Obj = Record<string, unknown>

const isObject = (value: unknown): value is Obj =>
  typeof value === 'object' && value !== null

const asString = (value: unknown): string | undefined =>
  typeof value === 'string' && value.length > 0
    ? value
    : typeof value === 'number'
      ? String(value)
      : undefined

/** Достаёт текст из messageData, если тип сообщения текстовый. */
function extractText(messageData: Obj): string | null {
  const type = messageData.typeMessage

  if (type === 'textMessage' && isObject(messageData.textMessageData)) {
    return asString(messageData.textMessageData.textMessage) ?? null
  }
  if (
    type === 'extendedTextMessage' &&
    isObject(messageData.extendedTextMessageData)
  ) {
    return asString(messageData.extendedTextMessageData.text) ?? null
  }
  return null
}

/**
 * Превращает тело уведомления GREEN-API во входящее сообщение.
 * Возвращает null для всего, что не является входящим текстовым сообщением
 * (статусы, исходящие, файлы и т.д.).
 */
export function parseIncomingMessage(body: unknown): IncomingMessage | null {
  if (!isObject(body) || body.typeWebhook !== 'incomingMessageReceived') {
    return null
  }

  const { senderData, messageData } = body
  if (!isObject(senderData) || !isObject(messageData)) return null

  const chatId = asString(senderData.chatId)
  const id = asString(body.idMessage)
  if (!chatId || !id) return null

  const text = extractText(messageData)
  if (text === null) return null

  const timestampSeconds =
    typeof body.timestamp === 'number' ? body.timestamp : Date.now() / 1000

  const chatTitle =
    asString(senderData.chatName) ??
    asString(senderData.senderContactName) ??
    asString(senderData.senderName) ??
    chatId

  return {
    chatId,
    chatTitle,
    message: {
      id,
      text,
      direction: 'incoming',
      timestamp: Math.round(timestampSeconds * 1000),
    },
  }
}
