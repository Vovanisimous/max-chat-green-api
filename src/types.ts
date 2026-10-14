export interface Credentials {
  idInstance: string
  apiTokenInstance: string
  /** Необязательный хост API. По умолчанию https://api.green-api.com */
  apiUrl?: string
}

export type MessageDirection = 'incoming' | 'outgoing'
export type MessageStatus = 'sending' | 'sent' | 'failed'

export interface Message {
  id: string
  text: string
  direction: MessageDirection
  /** Unix time в миллисекундах */
  timestamp: number
  status?: MessageStatus
}

export interface Chat {
  /** chatId в терминах GREEN-API (для MAX — числовой идентификатор) */
  chatId: string
  title: string
  phone?: string
  messages: Message[]
  unread: number
  updatedAt: number
}

/** Входящее текстовое сообщение, разобранное из уведомления GREEN-API */
export interface IncomingMessage {
  chatId: string
  chatTitle: string
  message: Message
}
