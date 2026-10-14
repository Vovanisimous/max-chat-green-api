import { describe, expect, it } from 'vitest'
import { formatPhone, normalizePhone } from './phone'

describe('normalizePhone', () => {
  it('убирает форматирование', () => {
    expect(normalizePhone('+7 (999) 123-45-67')).toBe('79991234567')
  })

  it('заменяет ведущую 8 на 7', () => {
    expect(normalizePhone('8 999 123 45 67')).toBe('79991234567')
  })

  it('добавляет код страны к 10 цифрам', () => {
    expect(normalizePhone('9991234567')).toBe('79991234567')
  })

  it('принимает белорусский номер (12 цифр)', () => {
    expect(normalizePhone('+375 29 123-45-67')).toBe('375291234567')
  })

  it('отклоняет некорректные номера', () => {
    expect(normalizePhone('12345')).toBeNull()
    expect(normalizePhone('')).toBeNull()
    expect(normalizePhone('abc')).toBeNull()
  })
})

describe('formatPhone', () => {
  it('форматирует российский номер', () => {
    expect(formatPhone('79991234567')).toBe('+7 999 123-45-67')
  })

  it('остальные номера выводит с плюсом', () => {
    expect(formatPhone('375291234567')).toBe('+375291234567')
  })
})
