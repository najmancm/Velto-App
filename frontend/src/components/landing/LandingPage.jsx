import './LandingPage.css'
import VeltoLogo from '../brand/VeltoLogo.jsx'

function LandingPage({ onSignIn, onRegister }) {
  return (
    <div className="landing-page">
      <header className="navbar">
        <a aria-label="VELTO home" className="landing-logo" href="#home"><VeltoLogo /></a>
        <nav aria-label="Main navigation" className="nav-links">
          <a href="#how-it-works">How it works</a>
          <a href="#features">Features</a>
          <button className="login-btn" onClick={onSignIn} type="button">Log in</button>
          <button className="signup-btn" onClick={onRegister} type="button">Create account</button>
        </nav>
      </header>

      <main>
        <section className="hero-section" id="home">
          <div className="hero-content">
            <p className="eyebrow">A CALMER WAY TO GET THINGS DONE</p>
            <h1>Turn your goals<br />into <span>action.</span></h1>
            <p className="hero-text">Keep your tasks clear, your plans in reach, and your next step easy to find.</p>
            <div className="hero-buttons">
              <button className="primary-btn" onClick={onRegister} type="button">Create your account</button>
              <a className="secondary-btn landing-secondary-link" href="#how-it-works">See how it works</a>
            </div>
          </div>

          <div className="hero-card">
            <div className="card-header">
              <div><p>EXAMPLE TASK LIST</p><h3>Get my small business off the ground</h3></div>
              <span>3</span>
            </div>
            <div className="task"><span className="task-check">✓</span><div><strong>Decide what I want to offer</strong><small>Today · High priority</small></div></div>
            <div className="task"><span className="task-check task-check-empty" /><div><strong>Ask three people what they think</strong><small>Tomorrow · Medium priority</small></div></div>
            <div className="task"><span className="task-check task-check-empty" /><div><strong>Put together a simple launch page</strong><small>Friday · Medium priority</small></div></div>
            <p className="landing-sample-note">A preview only. Your tasks stay private to your account.</p>
          </div>
        </section>

        <section className="landing-planning-showcase" aria-labelledby="landing-planning-heading">
          <div className="landing-planning-copy">
            <p className="eyebrow">A CLEARER VIEW OF YOUR DAY</p>
            <h2 id="landing-planning-heading">Everything you need to move a plan forward.</h2>
            <p>Keep priorities, due dates, and everyday tasks together in one calm workspace.</p>
          </div>
          <div className="landing-app-preview" role="img" aria-label="VELTO example workspace showing a Today task list with due dates and priorities">
            <div className="preview-window-bar">
              <span className="preview-window-brand"><VeltoLogo size="mini" /></span>
              <span className="preview-window-label">PERSONAL WORKSPACE</span>
              <span className="preview-window-avatar">N</span>
            </div>
            <div className="preview-window-body">
              <aside className="preview-sidebar">
                <span className="preview-sidebar-heading">TASKS</span>
                <span className="preview-sidebar-item">Inbox <small>4</small></span>
                <span className="preview-sidebar-item is-current">Today <small>3</small></span>
                <span className="preview-sidebar-item">Upcoming</span>
                <span className="preview-sidebar-item">Completed</span>
                <span className="preview-sidebar-heading preview-project-heading">PROJECTS</span>
                <span className="preview-sidebar-item"><i /> Small business launch</span>
              </aside>
              <div className="preview-plan-content">
                <div className="preview-plan-topline">MONDAY <span>OCTOBER 19</span></div>
                <div className="preview-plan-heading"><div><h3>Today</h3><p>Three steps to keep things moving.</p></div><span>3 TASKS</span></div>
                <div className="preview-plan-task"><span className="preview-check is-done">✓</span><span className="preview-task-copy"><strong>Choose the first service to offer</strong><small>Small business launch</small></span><span className="preview-task-priority high">High</span></div>
                <div className="preview-plan-task"><span className="preview-check" /><span className="preview-task-copy"><strong>Ask Maya for feedback on the idea</strong><small>Small business launch</small></span><span className="preview-task-priority medium">Medium</span></div>
                <div className="preview-plan-task"><span className="preview-check" /><span className="preview-task-copy"><strong>Write a short introduction for the site</strong><small>Website</small></span><span className="preview-task-priority low">Low</span></div>
                <span className="preview-add-task">+ Add a task</span>
              </div>
            </div>
          </div>
        </section>

        <section className="how-section" id="how-it-works">
          <p className="eyebrow">HOW VELTO WORKS</p>
          <h2>Make a plan. Find your next step.</h2>
          <div className="steps-grid">
            <article className="step"><div className="step-number">01</div><h3>Capture what matters</h3><p>Put tasks and goals in one place, without having to organize everything first.</p></article>
            <article className="step"><div className="step-number">02</div><h3>Give your day shape</h3><p>Choose what is due today, what can wait, and what deserves your focus.</p></article>
            <article className="step"><div className="step-number">03</div><h3>Keep moving</h3><p>Mark progress, adjust the plan, and keep your next action visible.</p></article>
          </div>
        </section>

        <section className="features-section" id="features">
          <p className="eyebrow">MADE FOR REAL LIFE</p>
          <h2>Simple enough for today. Flexible enough for bigger goals.</h2>
          <div className="feature-grid">
            <article className="feature"><span className="feature-icon" aria-hidden="true">01</span><h3>Task-first workspace</h3><p>Inbox, Today, Upcoming, and Completed views keep the important work easy to scan.</p></article>
            <article className="feature"><span className="feature-icon" aria-hidden="true">02</span><h3>Plans you can change</h3><p>Set a due date or priority, then update your tasks as your day changes.</p></article>
            <article className="feature"><span className="feature-icon" aria-hidden="true">03</span><h3>Your work stays yours</h3><p>Sign in to keep your task list attached to your account across sessions.</p></article>
          </div>
        </section>
      </main>

      <footer className="landing-footer">
        <a aria-label="VELTO home" className="landing-logo" href="#home"><VeltoLogo size="compact" /></a>
        <p>Turn your goals into action.</p>
        <button className="login-btn" onClick={onSignIn} type="button">Sign in to your workspace</button>
      </footer>
    </div>
  )
}

export default LandingPage
