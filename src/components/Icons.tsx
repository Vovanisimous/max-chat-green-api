import type { SVGProps } from 'react'

const base: SVGProps<SVGSVGElement> = {
  width: 20,
  height: 20,
  viewBox: '0 0 24 24',
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 2,
  strokeLinecap: 'round',
  strokeLinejoin: 'round',
  'aria-hidden': true,
}

export const ComposeIcon = (p: SVGProps<SVGSVGElement>) => (
  <svg {...base} {...p}>
    <path d="M12 20h9" />
    <path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4Z" />
  </svg>
)

export const SendIcon = (p: SVGProps<SVGSVGElement>) => (
  <svg {...base} fill="currentColor" stroke="none" {...p}>
    <path d="M3.4 20.4 21 12 3.4 3.6 3.4 10l12 2-12 2z" />
  </svg>
)

export const BackIcon = (p: SVGProps<SVGSVGElement>) => (
  <svg {...base} {...p}>
    <path d="m15 18-6-6 6-6" />
  </svg>
)

export const LogoutIcon = (p: SVGProps<SVGSVGElement>) => (
  <svg {...base} {...p}>
    <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
    <path d="m16 17 5-5-5-5" />
    <path d="M21 12H9" />
  </svg>
)

export const CloseIcon = (p: SVGProps<SVGSVGElement>) => (
  <svg {...base} {...p}>
    <path d="M18 6 6 18M6 6l12 12" />
  </svg>
)

export const CheckIcon = (p: SVGProps<SVGSVGElement>) => (
  <svg {...base} width={14} height={14} strokeWidth={2.5} {...p}>
    <path d="m5 12 5 5L20 7" />
  </svg>
)

export const ClockIcon = (p: SVGProps<SVGSVGElement>) => (
  <svg {...base} width={14} height={14} {...p}>
    <circle cx="12" cy="12" r="9" />
    <path d="M12 7v5l3 2" />
  </svg>
)

export const AlertIcon = (p: SVGProps<SVGSVGElement>) => (
  <svg {...base} width={14} height={14} {...p}>
    <circle cx="12" cy="12" r="9" />
    <path d="M12 8v5M12 16.5v.01" />
  </svg>
)

export const ChatBubbleIcon = (p: SVGProps<SVGSVGElement>) => (
  <svg {...base} fill="currentColor" stroke="none" {...p}>
    <path d="M12 2C6.5 2 2 6 2 11c0 2.9 1.5 5.5 3.9 7.2V22l3.8-2.4c.7.1 1.5.2 2.3.2 5.5 0 10-4 10-9S17.5 2 12 2z" />
  </svg>
)
