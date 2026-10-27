import './VeltoLogo.css'

function VeltoLogo({ appearance = 'burgundy', size = 'standard' }) {
  return (
    <span className={`velto-logo velto-logo--${appearance} velto-logo--${size}`} role="img" aria-label="VELTO">
      <svg className="velto-logo-mark" viewBox="0 0 40 40" aria-hidden="true" focusable="false">
        <circle cx="20" cy="20" r="18.25" fill="none" stroke="currentColor" strokeWidth="1.25" />
        <path d="M11.5 12.5 18.6 27.8h2.7l7.2-15.3" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.1" />
        <circle cx="20" cy="20" r="1.25" fill="var(--velto-logo-detail)" />
      </svg>
      <span className="velto-logo-wordmark">VELTO</span>
    </span>
  )
}

export default VeltoLogo
