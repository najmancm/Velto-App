import { useEffect, useState } from 'react'
import './App.css'
import DemoEntry from './components/auth/DemoEntry.jsx'
import Dashboard from './components/dashboard/Dashboard.jsx'
import LandingPage from './components/landing/LandingPage.jsx'
import { getCurrentUser, logoutAccount } from './services/apiClient.js'

function App() {
  const [view, setView] = useState('landing')
  const [authMode, setAuthMode] = useState('login')
  const [currentUser, setCurrentUser] = useState(null)
  const [isCheckingSession, setIsCheckingSession] = useState(true)
  const [sessionError, setSessionError] = useState('')

  useEffect(() => {
    let isActive = true

    getCurrentUser()
      .then((user) => {
        if (isActive) {
          setCurrentUser(user)
          if (user) setView('dashboard')
        }
      })
      .catch(() => {
        if (isActive) setSessionError('Could not reach VELTO. Check that the backend is running.')
      })
      .finally(() => {
        if (isActive) setIsCheckingSession(false)
      })

    return () => {
      isActive = false
    }
  }, [])

  const openAuth = (mode) => {
    setSessionError('')
    setAuthMode(mode)
    setView('auth')
  }

  const handleAuthenticated = (user) => {
    setCurrentUser(user)
    setSessionError('')
    setView('dashboard')
  }

  const handleSignOut = async () => {
    try {
      await logoutAccount()
      setCurrentUser(null)
      setView('landing')
    } catch (error) {
      setSessionError(error.message)
    }
  }

  if (isCheckingSession) {
    return <main className="app-loading" role="status">Checking your VELTO session...</main>
  }

  if (view === 'dashboard' && currentUser) {
    return (
      <Dashboard
        key={currentUser.id}
        onSignOut={handleSignOut}
        userName={currentUser.name}
      />
    )
  }

  if (view === 'auth') {
    return (
      <>
        {sessionError && <p className="app-session-error" role="alert">{sessionError}</p>}
        <DemoEntry
          initialMode={authMode}
          onAuthenticated={handleAuthenticated}
          onExplore={() => setView('landing')}
        />
      </>
    )
  }

  return (
    <>
      {sessionError && <p className="app-session-error" role="alert">{sessionError}</p>}
      <LandingPage
        onRegister={() => openAuth('register')}
        onSignIn={() => openAuth('login')}
      />
    </>
  )
}

export default App
