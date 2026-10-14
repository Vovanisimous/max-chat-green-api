import { avatarGradient, initials } from '../utils/format'

interface Props {
  title: string
  seed: string
  size?: number
}

export function Avatar({ title, seed, size = 48 }: Props) {
  return (
    <div
      className="avatar"
      style={{
        width: size,
        height: size,
        fontSize: size * 0.38,
        background: avatarGradient(seed),
      }}
      aria-hidden
    >
      {initials(title)}
    </div>
  )
}
