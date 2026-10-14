/// <reference types="vite/client" />

interface ImportMetaEnv {
  /** Необязательный хост GREEN-API (по умолчанию https://api.green-api.com) */
  readonly VITE_GREEN_API_URL?: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
