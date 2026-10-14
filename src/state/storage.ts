import type { Credentials } from '../types'
import type { ChatState } from './chatReducer'
import { initialChatState } from './chatReducer'

const CREDS_KEY = 'max-chat:credentials'
const chatsKey = (idInstance: string) => `max-chat:chats:${idInstance}`

function safeParse<T>(raw: string | null): T | null {
  if (!raw) return null
  try {
    return JSON.parse(raw) as T
  } catch {
    return null
  }
}

export function loadCredentials(): Credentials | null {
  const creds = safeParse<Credentials>(localStorage.getItem(CREDS_KEY))
  return creds?.idInstance && creds?.apiTokenInstance ? creds : null
}

export function saveCredentials(creds: Credentials): void {
  localStorage.setItem(CREDS_KEY, JSON.stringify(creds))
}

export function clearCredentials(): void {
  localStorage.removeItem(CREDS_KEY)
}

export function loadChats(idInstance: string): ChatState {
  const state = safeParse<ChatState>(localStorage.getItem(chatsKey(idInstance)))
  return state && Array.isArray(state.chats) ? state : initialChatState
}

export function saveChats(idInstance: string, state: ChatState): void {
  try {
    localStorage.setItem(chatsKey(idInstance), JSON.stringify(state))
  } catch {
    // переполнение localStorage — история не критична, молча пропускаем
  }
}
