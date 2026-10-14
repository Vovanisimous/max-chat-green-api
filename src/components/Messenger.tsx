import { useCallback, useEffect, useRef, useState } from 'react'
import { GreenApiError, checkAccount, sendMessage } from '../api/greenApi'
import { useChats } from '../hooks/useChats'
import { useNotifications } from '../hooks/useNotifications'
import type { Credentials, IncomingMessage, Message } from '../types'
import { formatPhone } from '../utils/phone'
import { ChatWindow } from './ChatWindow'
import { NewChatDialog } from './NewChatDialog'
import { Sidebar } from './Sidebar'

interface Props {
  creds: Credentials
  onLogout: () => void
}

let localCounter = 0
const localId = () => `local-${Date.now()}-${localCounter++}`

export function Messenger({ creds, onLogout }: Props) {
  const { chats, dispatch } = useChats(creds.idInstance)
  const [activeChatId, setActiveChatId] = useState<string | null>(null)
  const [showNewChat, setShowNewChat] = useState(false)

  const activeRef = useRef(activeChatId)
  useEffect(() => {
    activeRef.current = activeChatId
  }, [activeChatId])

  const activeChat = chats.find((c) => c.chatId === activeChatId) ?? null

  // Открытый чат считается прочитанным
  const unread = activeChat?.unread ?? 0
  useEffect(() => {
    if (activeChatId && unread > 0) {
      dispatch({ type: 'chat/read', chatId: activeChatId })
    }
  }, [activeChatId, unread, dispatch])

  const handleIncoming = useCallback(
    ({ chatId, chatTitle, message }: IncomingMessage) => {
      dispatch({
        type: 'message/add',
        chatId,
        title: chatTitle,
        message,
        isActive: activeRef.current === chatId,
      })
    },
    [dispatch],
  )

  const { status, error } = useNotifications({
    creds,
    onMessage: handleIncoming,
    onAuthError: onLogout,
  })

  /** Создание чата по номеру телефона (MAX: CheckAccount → chatId). */
  async function handleCreateChat(phone: string) {
    const result = await checkAccount(creds, phone)
    if (!result.exist || !result.chatId) {
      throw new GreenApiError('На этом номере не найден аккаунт MAX.')
    }

    dispatch({
      type: 'chat/ensure',
      chatId: result.chatId,
      title: formatPhone(phone),
      phone,
    })
    setActiveChatId(result.chatId)
    setShowNewChat(false)
  }

  async function deliver(chatId: string, tempId: string, text: string) {
    try {
      const idMessage = await sendMessage(creds, chatId, text)
      dispatch({
        type: 'message/update',
        chatId,
        id: tempId,
        patch: { id: idMessage, status: 'sent' },
      })
    } catch {
      dispatch({
        type: 'message/update',
        chatId,
        id: tempId,
        patch: { status: 'failed' },
      })
    }
  }

  function handleSend(chatId: string, text: string) {
    const tempId = localId()
    dispatch({
      type: 'message/add',
      chatId,
      title: '',
      isActive: true,
      message: {
        id: tempId,
        text,
        direction: 'outgoing',
        timestamp: Date.now(),
        status: 'sending',
      },
    })
    void deliver(chatId, tempId, text)
  }

  function handleRetry(chatId: string, message: Message) {
    dispatch({
      type: 'message/update',
      chatId,
      id: message.id,
      patch: { status: 'sending' },
    })
    void deliver(chatId, message.id, message.text)
  }

  return (
    <div className={`messenger${activeChat ? ' has-active' : ''}`}>
      <Sidebar
        chats={chats}
        activeChatId={activeChatId}
        idInstance={creds.idInstance}
        status={status}
        statusError={error}
        onSelect={setActiveChatId}
        onNewChat={() => setShowNewChat(true)}
        onLogout={onLogout}
      />
      <ChatWindow
        chat={activeChat}
        onSend={handleSend}
        onRetry={handleRetry}
        onBack={() => setActiveChatId(null)}
      />
      {showNewChat && (
        <NewChatDialog
          onCreate={handleCreateChat}
          onClose={() => setShowNewChat(false)}
        />
      )}
    </div>
  )
}
