import { useEffect, useReducer } from 'react'
import { chatReducer } from '../state/chatReducer'
import { loadChats, saveChats } from '../state/storage'

/** Состояние чатов с сохранением в localStorage (отдельно для каждого инстанса). */
export function useChats(idInstance: string) {
  const [state, dispatch] = useReducer(chatReducer, idInstance, loadChats)

  useEffect(() => {
    saveChats(idInstance, state)
  }, [idInstance, state])

  return { chats: state.chats, dispatch }
}
