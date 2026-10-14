import { describe, expect, it } from 'vitest'
import { chatReducer, initialChatState } from './chatReducer'
import type { Message } from '../types'

const msg = (id: string, direction: Message['direction'], ts = 1000): Message => ({
  id,
  text: `text ${id}`,
  direction,
  timestamp: ts,
})

describe('chatReducer', () => {
  it('создаёт чат один раз', () => {
    const a = chatReducer(initialChatState, {
      type: 'chat/ensure',
      chatId: '1',
      title: 'A',
    })
    const b = chatReducer(a, { type: 'chat/ensure', chatId: '1', title: 'A' })
    expect(b.chats).toHaveLength(1)
    expect(b).toBe(a)
  })

  it('создаёт чат при первом входящем и считает непрочитанные', () => {
    const state = chatReducer(initialChatState, {
      type: 'message/add',
      chatId: '1',
      title: 'Иван',
      message: msg('m1', 'incoming'),
      isActive: false,
    })
    expect(state.chats[0]).toMatchObject({ title: 'Иван', unread: 1 })
  })

  it('не увеличивает непрочитанные в открытом чате и для исходящих', () => {
    let state = chatReducer(initialChatState, {
      type: 'message/add',
      chatId: '1',
      title: 'Иван',
      message: msg('m1', 'incoming'),
      isActive: true,
    })
    state = chatReducer(state, {
      type: 'message/add',
      chatId: '1',
      title: '',
      message: msg('m2', 'outgoing', 2000),
      isActive: false,
    })
    expect(state.chats[0].unread).toBe(0)
    expect(state.chats[0].messages).toHaveLength(2)
  })

  it('игнорирует дубликаты сообщений', () => {
    const add = {
      type: 'message/add' as const,
      chatId: '1',
      title: 'Иван',
      message: msg('m1', 'incoming'),
      isActive: false,
    }
    const once = chatReducer(initialChatState, add)
    const twice = chatReducer(once, add)
    expect(twice).toBe(once)
  })

  it('поднимает чат с новым сообщением наверх', () => {
    let state = chatReducer(initialChatState, {
      type: 'message/add',
      chatId: '1',
      title: 'A',
      message: msg('a', 'incoming', 1000),
      isActive: false,
    })
    state = chatReducer(state, {
      type: 'message/add',
      chatId: '2',
      title: 'B',
      message: msg('b', 'incoming', 2000),
      isActive: false,
    })
    state = chatReducer(state, {
      type: 'message/add',
      chatId: '1',
      title: 'A',
      message: msg('c', 'incoming', 3000),
      isActive: false,
    })
    expect(state.chats.map((c) => c.chatId)).toEqual(['1', '2'])
  })

  it('обновляет id и статус отправленного сообщения', () => {
    let state = chatReducer(initialChatState, {
      type: 'message/add',
      chatId: '1',
      title: 'A',
      message: { ...msg('local-1', 'outgoing'), status: 'sending' },
      isActive: true,
    })
    state = chatReducer(state, {
      type: 'message/update',
      chatId: '1',
      id: 'local-1',
      patch: { id: 'real-1', status: 'sent' },
    })
    expect(state.chats[0].messages[0]).toMatchObject({
      id: 'real-1',
      status: 'sent',
    })
  })

  it('сбрасывает непрочитанные при открытии чата', () => {
    let state = chatReducer(initialChatState, {
      type: 'message/add',
      chatId: '1',
      title: 'A',
      message: msg('a', 'incoming'),
      isActive: false,
    })
    state = chatReducer(state, { type: 'chat/read', chatId: '1' })
    expect(state.chats[0].unread).toBe(0)
  })
})
