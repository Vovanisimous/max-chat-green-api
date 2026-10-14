import { useState } from 'react'
import { LoginScreen } from './components/LoginScreen'
import { Messenger } from './components/Messenger'
import {
  clearCredentials,
  loadCredentials,
  saveCredentials,
} from './state/storage'
import type { Credentials } from './types'

export default function App() {
  const [creds, setCreds] = useState<Credentials | null>(loadCredentials)

  function handleLogin(next: Credentials) {
    saveCredentials(next)
    setCreds(next)
  }

  function handleLogout() {
    clearCredentials()
    setCreds(null)
  }

  if (!creds) return <LoginScreen onLogin={handleLogin} />

  return (
    <Messenger
      key={creds.idInstance}
      creds={creds}
      onLogout={handleLogout}
    />
  )
}
