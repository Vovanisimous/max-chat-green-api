import type { ConnectionStatus } from '../hooks/useNotifications'
import type { Chat } from '../types'
import { formatListTime } from '../utils/format'
import { Avatar } from './Avatar'
import { ComposeIcon, LogoutIcon } from './Icons'

interface Props {
  chats: Chat[]
  activeChatId: string | null
  idInstance: string
  status: ConnectionStatus
  statusError: string | null
  onSelect: (chatId: string) => void
  onNewChat: () => void
  onLogout: () => void
}

const STATUS_LABEL: Record<ConnectionStatus, string> = {
  connecting: 'Подключение…',
  online: 'На связи',
  error: 'Нет связи',
}

export function Sidebar({
  chats,
  activeChatId,
  idInstance,
  status,
  statusError,
  onSelect,
  onNewChat,
  onLogout,
}: Props) {
  return (
    <aside className="sidebar">
      <header className="sidebar-header">
        <div>
          <h1>Чаты</h1>
          <div className="status" title={statusError ?? undefined}>
            <span className={`dot dot-${status}`} />
            {STATUS_LABEL[status]} · {idInstance}
          </div>
        </div>
        <div className="sidebar-actions">
          <button
            className="icon-btn"
            onClick={onNewChat}
            aria-label="Новый чат"
            title="Новый чат"
          >
            <ComposeIcon />
          </button>
          <button
            className="icon-btn"
            onClick={onLogout}
            aria-label="Выйти"
            title="Выйти"
          >
            <LogoutIcon />
          </button>
        </div>
      </header>

      {status === 'error' && statusError && (
        <div className="alert alert-inline" role="alert">
          {statusError}
        </div>
      )}

      <ul className="chat-list">
        {chats.length === 0 && (
          <li className="chat-list-empty">
            Чатов пока нет.
            <br />
            Нажмите на карандаш, чтобы написать по номеру телефона.
          </li>
        )}

        {chats.map((chat) => {
          const last = chat.messages[chat.messages.length - 1]
          return (
            <li key={chat.chatId}>
              <button
                className={`chat-item${chat.chatId === activeChatId ? ' active' : ''}`}
                onClick={() => onSelect(chat.chatId)}
              >
                <Avatar title={chat.title} seed={chat.chatId} />
                <div className="chat-item-body">
                  <div className="chat-item-top">
                    <span className="chat-item-title">{chat.title}</span>
                    {last && (
                      <time className="chat-item-time">
                        {formatListTime(last.timestamp)}
                      </time>
                    )}
                  </div>
                  <div className="chat-item-bottom">
                    <span className="chat-item-preview">
                      {last
                        ? `${last.direction === 'outgoing' ? 'Вы: ' : ''}${last.text}`
                        : 'Нет сообщений'}
                    </span>
                    {chat.unread > 0 && (
                      <span className="badge">{chat.unread}</span>
                    )}
                  </div>
                </div>
              </button>
            </li>
          )
        })}
      </ul>
    </aside>
  )
}
