import {
  Fragment,
  useEffect,
  useRef,
  useState,
  type FormEvent,
  type KeyboardEvent,
} from 'react'
import type { Chat, Message } from '../types'
import { formatDayLabel, formatTime, isSameDay } from '../utils/format'
import { formatPhone } from '../utils/phone'
import { Avatar } from './Avatar'
import {
  AlertIcon,
  BackIcon,
  CheckIcon,
  ChatBubbleIcon,
  ClockIcon,
  SendIcon,
} from './Icons'

const MAX_LENGTH = 4000

interface Props {
  chat: Chat | null
  onSend: (chatId: string, text: string) => void
  onRetry: (chatId: string, message: Message) => void
  onBack: () => void
}

export function ChatWindow({ chat, onSend, onRetry, onBack }: Props) {
  if (!chat) {
    return (
      <section className="chat chat-empty">
        <div className="chat-empty-card">
          <ChatBubbleIcon width={40} height={40} />
          <p>Выберите чат или начните новый</p>
        </div>
      </section>
    )
  }

  return (
    <ChatView
      key={chat.chatId}
      chat={chat}
      onSend={onSend}
      onRetry={onRetry}
      onBack={onBack}
    />
  )
}

function ChatView({
  chat,
  onSend,
  onRetry,
  onBack,
}: Props & { chat: Chat }) {
  const [draft, setDraft] = useState('')
  const listRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLTextAreaElement>(null)

  useEffect(() => {
    const el = listRef.current
    if (el) el.scrollTop = el.scrollHeight
  }, [chat.messages.length])

  useEffect(() => {
    inputRef.current?.focus()
  }, [])

  function submit(event?: FormEvent) {
    event?.preventDefault()
    const text = draft.trim()
    if (!text) return
    onSend(chat.chatId, text)
    setDraft('')
  }

  function handleKeyDown(event: KeyboardEvent<HTMLTextAreaElement>) {
    if (event.key === 'Enter' && !event.shiftKey && !event.nativeEvent.isComposing) {
      event.preventDefault()
      submit()
    }
  }

  return (
    <section className="chat">
      <header className="chat-header">
        <button
          className="icon-btn back-btn"
          onClick={onBack}
          aria-label="Назад к списку чатов"
        >
          <BackIcon />
        </button>
        <Avatar title={chat.title} seed={chat.chatId} size={40} />
        <div>
          <div className="chat-header-title">{chat.title}</div>
          {chat.phone && (
            <div className="chat-header-sub">{formatPhone(chat.phone)}</div>
          )}
        </div>
      </header>

      <div className="messages" ref={listRef}>
        {chat.messages.length === 0 && (
          <div className="messages-empty">Напишите первое сообщение</div>
        )}

        {chat.messages.map((message, index) => {
          const prev = chat.messages[index - 1]
          const showDay = !prev || !isSameDay(prev.timestamp, message.timestamp)
          return (
            <Fragment key={message.id}>
              {showDay && (
                <div className="day-label">
                  <span>{formatDayLabel(message.timestamp)}</span>
                </div>
              )}
              <div className={`bubble-row ${message.direction}`}>
                <div className={`bubble ${message.direction}`}>
                  <span className="bubble-text">{message.text}</span>
                  <span className="bubble-meta">
                    {formatTime(message.timestamp)}
                    {message.direction === 'outgoing' && (
                      <StatusIcon message={message} onRetry={() => onRetry(chat.chatId, message)} />
                    )}
                  </span>
                </div>
              </div>
            </Fragment>
          )
        })}
      </div>

      <form className="composer" onSubmit={submit}>
        <textarea
          ref={inputRef}
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Сообщение"
          rows={1}
          maxLength={MAX_LENGTH}
        />
        <button
          className="send-btn"
          type="submit"
          disabled={!draft.trim()}
          aria-label="Отправить"
        >
          <SendIcon />
        </button>
      </form>
    </section>
  )
}

function StatusIcon({
  message,
  onRetry,
}: {
  message: Message
  onRetry: () => void
}) {
  if (message.status === 'sending') {
    return <ClockIcon className="status-icon" aria-label="Отправляется" />
  }
  if (message.status === 'failed') {
    return (
      <button
        type="button"
        className="retry-btn"
        onClick={onRetry}
        title="Не отправлено. Нажмите, чтобы повторить"
      >
        <AlertIcon /> Повторить
      </button>
    )
  }
  return <CheckIcon className="status-icon" aria-label="Отправлено" />
}
