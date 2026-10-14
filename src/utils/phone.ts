/**
 * Приводит введённый номер к международному формату без "+":
 *  - "+7 (999) 123-45-67" → "79991234567"
 *  - "8 999 123 45 67"     → "79991234567"
 *  - "9991234567"          → "79991234567"
 * Возвращает null, если номер некорректен (ожидается 11–12 цифр).
 */
export function normalizePhone(input: string): string | null {
  let digits = input.replace(/\D/g, '')

  if (digits.length === 11 && digits.startsWith('8')) {
    digits = `7${digits.slice(1)}`
  } else if (digits.length === 10) {
    digits = `7${digits}`
  }

  return digits.length === 11 || digits.length === 12 ? digits : null
}

export function formatPhone(phone: string): string {
  if (phone.length === 11 && phone.startsWith('7')) {
    return `+7 ${phone.slice(1, 4)} ${phone.slice(4, 7)}-${phone.slice(7, 9)}-${phone.slice(9)}`
  }
  return `+${phone}`
}
