import { useState } from 'react'
import './DemoEntry.css'
import VeltoLogo from '../brand/VeltoLogo.jsx'
import { loginAccount, registerAccount } from '../../services/apiClient.js'

function DemoEntry({ initialMode = 'login', onAuthenticated, onExplore }) {
  const [mode, setMode] = useState(initialMode)
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async (event) => {
    event.preventDefault()
    setError('')
    setIsSubmitting(true)

    try {
      const user = mode === 'register'
        ? await registerAccount({ email, name, password })
        : await loginAccount({ email, password })
      onAuthenticated(user)
    } catch (requestError) {
      setError(requestError.message)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <main className="demo-entry-shell">
      <section className="demo-entry-story">
        <div className="demo-entry-brand"><VeltoLogo appearance="light" /></div>
        <div className="demo-entry-story-copy">
          <p>TURN YOUR GOALS INTO ACTION</p>
          <h1>Your day, with a plan that moves with you.</h1>
          <div className="demo-entry-preview" aria-hidden="true">
            <div className="entry-preview-heading"><span>Today</span><span>3 tasks</span></div>
            <div className="entry-preview-task"><span /> Read 20 pages</div>
            <div className="entry-preview-task"><span /> Take a proper break</div>
            <div className="entry-preview-task"><span /> Send the project update</div>
          </div>
        </div>
        <p className="demo-entry-story-note">One workspace for the things you want to get done.</p>
      </section>

      <section className="demo-entry-form-side">
        <div className="demo-entry-form-wrap">
          <p className="demo-entry-kicker">YOUR PERSONAL WORKSPACE</p>
          <h2>{mode === 'register' ? 'Create your account' : 'Welcome back'}</h2>
          <p className="demo-entry-intro">{mode === 'register' ? 'Create an account to keep your tasks private and synced to your account.' : 'Sign in to continue to your tasks and plans.'}</p>

          <form className="demo-entry-form" onSubmit={handleSubmit}>
            {mode === 'register' && (
              <>
                <label htmlFor="demo-display-name">Your name</label>
                <input
                  autoComplete="name"
                  id="demo-display-name"
                  maxLength={60}
                  onChange={(event) => setName(event.target.value)}
                  placeholder="How should we address you?"
                  required
                  value={name}
                />
              </>
            )}
            <label htmlFor="demo-email">Email</label>
            <input
              autoComplete="email"
              autoFocus={mode === 'login'}
              id="demo-email"
              onChange={(event) => setEmail(event.target.value)}
              placeholder="you@example.com"
              required
              type="email"
              value={email}
            />
            <label htmlFor="demo-password">Password</label>
            <input
              autoComplete={mode === 'register' ? 'new-password' : 'current-password'}
              id="demo-password"
              minLength={8}
              onChange={(event) => setPassword(event.target.value)}
              placeholder={mode === 'register' ? 'At least 8 characters' : 'Enter your password'}
              required
              type="password"
              value={password}
            />
            {error && <p className="demo-entry-error" role="alert">{error}</p>}
            <button disabled={isSubmitting || !email.trim() || !password || (mode === 'register' && !name.trim())} type="submit">
              {isSubmitting ? 'Please wait...' : mode === 'register' ? 'Create account' : 'Sign in'}
              {!isSubmitting && <span aria-hidden="true">→</span>}
            </button>
          </form>

          <p className="demo-entry-switch">
            {mode === 'register' ? 'Already have an account?' : 'New to VELTO?'}{' '}
            <button onClick={() => { setMode(mode === 'register' ? 'login' : 'register'); setError('') }} type="button">
              {mode === 'register' ? 'Sign in' : 'Create an account'}
            </button>
          </p>
          <p className="demo-entry-notice">Your account is stored on the VELTO backend. Use a unique password and do not reuse a sensitive one during development.</p>
          <button className="demo-entry-explore" onClick={onExplore} type="button">Explore the VELTO landing page</button>
        </div>
      </section>
    </main>
  )
}

export default DemoEntry
