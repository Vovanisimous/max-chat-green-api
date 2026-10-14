import { describe, expect, it } from 'vitest'
import { parseIncomingMessage } from './notifications'

const base = {
  typeWebhook: 'incomingMessageReceived',
  timestamp: 1763115112,
  idMessage: 'ABC123',
  senderData: {
    chatId: '10000000',
    chatName: 'Иван Петров',
    sender: '10000000',
  },
}

describe('parseIncomingMessage', () => {
  it('разбирает текстовое сообщение', () => {
    const result = parseIncomingMessage({
      ...base,
      messageData: {
        typeMessage: 'textMessage',
        textMessageData: { textMessage: 'Привет!' },
      },
    })

    expect(result).toEqual({
      chatId: '10000000',
      chatTitle: 'Иван Петров',
      message: {
        id: 'ABC123',
        text: 'Привет!',
        direction: 'incoming',
        timestamp: 1763115112000,
      },
    })
  })

  it('разбирает extendedTextMessage', () => {
    const result = parseIncomingMessage({
      ...base,
      messageData: {
        typeMessage: 'extendedTextMessage',
        extendedTextMessageData: { text: 'Ссылка https://example.com' },
      },
    })
    expect(result?.message.text).toBe('Ссылка https://example.com')
  })

  it('в качестве названия чата берёт chatId, если имени нет', () => {
    const result = parseIncomingMessage({
      ...base,
      senderData: { chatId: '555' },
      messageData: {
        typeMessage: 'textMessage',
        textMessageData: { textMessage: 'hi' },
      },
    })
    expect(result?.chatTitle).toBe('555')
  })

  it('игнорирует не текстовые сообщения', () => {
    expect(
      parseIncomingMessage({
        ...base,
        messageData: { typeMessage: 'imageMessage' },
      }),
    ).toBeNull()
  })

  it('игнорирует другие типы уведомлений и мусор', () => {
    expect(
      parseIncomingMessage({ ...base, typeWebhook: 'outgoingMessageStatus' }),
    ).toBeNull()
    expect(parseIncomingMessage(null)).toBeNull()
    expect(parseIncomingMessage('x')).toBeNull()
  })
})
