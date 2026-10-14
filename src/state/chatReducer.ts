import type { Chat, Message } from '../types'

export interface ChatState {
  chats: Chat[]
}

export type ChatAction =
  | { type: 'chat/ensure'; chatId: string; title: string; phone?: string }
  | {
      type: 'message/add'
      chatId: string
      title: string
      message: Message
      /** Если чат сейчас открыт — не увеличиваем счётчик непрочитанных */
      isActive: boolean
    }
  | {
      type: 'message/update'
      chatId: string
      id: string
      patch: Partial<Pick<Message, 'id' | 'status'>>
    }
  | { type: 'chat/read'; chatId: string }

export const initialChatState: ChatState = { chats: [] }

const byRecent = (a: Chat, b: Chat) => b.updatedAt - a.updatedAt

export function chatReducer(state: ChatState, action: ChatAction): ChatState {
  switch (action.type) {
    case 'chat/ensure': {
      const existing = state.chats.find((c) => c.chatId === action.chatId)
      if (existing) {
        if (!action.phone || existing.phone === action.phone) return state
        return {
          chats: state.chats.map((c) =>
            c.chatId === action.chatId ? { ...c, phone: action.phone } : c,
          ),
        }
      }
      const chat: Chat = {
        chatId: action.chatId,
        title: action.title,
        phone: action.phone,
        messages: [],
        unread: 0,
        updatedAt: Date.now(),
      }
      return { chats: [chat, ...state.chats] }
    }

    case 'message/add': {
      const existing = state.chats.find((c) => c.chatId === action.chatId)

      if (existing?.messages.some((m) => m.id === action.message.id)) {
        return state // дубликат (повторная доставка уведомления)
      }

      const isIncoming = action.message.direction === 'incoming'
      const unreadDelta = isIncoming && !action.isActive ? 1 : 0

      const next: Chat = existing
        ? {
            ...existing,
            messages: [...existing.messages, action.message],
            unread: existing.unread + unreadDelta,
            updatedAt: action.message.timestamp,
          }
        : {
            chatId: action.chatId,
            title: action.title,
            messages: [action.message],
            unread: unreadDelta,
            updatedAt: action.message.timestamp,
          }

      const others = state.chats.filter((c) => c.chatId !== action.chatId)
      return { chats: [next, ...others].sort(byRecent) }
    }

    case 'message/update': {
      return {
        chats: state.chats.map((chat) =>
          chat.chatId !== action.chatId
            ? chat
            : {
                ...chat,
                messages: chat.messages.map((m) =>
                  m.id === action.id ? { ...m, ...action.patch } : m,
                ),
              },
        ),
      }
    }

    case 'chat/read': {
      const target = state.chats.find((c) => c.chatId === action.chatId)
      if (!target || target.unread === 0) return state
      return {
        chats: state.chats.map((c) =>
          c.chatId === action.chatId ? { ...c, unread: 0 } : c,
        ),
      }
    }

    default:
      return state
  }
}
