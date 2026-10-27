import { useState } from 'react'
import './AssistantPanel.css'
import { sendAssistantMessage } from '../../services/assistantService.js'

function AssistantPanel({ inputRef, onAddTasks, onClose, panelRef }) {
  const [messages, setMessages] = useState([
    { role: 'assistant', text: 'Tell me what you need to get done. I can turn a task list into a draft for your review.' },
  ])
  const [message, setMessage] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [savingProposalIndex, setSavingProposalIndex] = useState(null)

  const sendMessage = async (event, prompt = message) => {
    event?.preventDefault()
    const trimmedPrompt = prompt.trim()
    if (!trimmedPrompt || isLoading) return

    setMessages((currentMessages) => [
      ...currentMessages,
      { role: 'user', text: trimmedPrompt },
      { role: 'assistant', text: 'Thinking...', isPending: true },
    ])
    setMessage('')
    setIsLoading(true)

    try {
      const response = await sendAssistantMessage(trimmedPrompt)
      setMessages((currentMessages) => currentMessages.map((item, index) => (
        index === currentMessages.length - 1
          ? { role: 'assistant', text: response.reply, proposedTasks: response.proposed_tasks ?? [], source: response.source }
          : item
      )))
    } catch (error) {
      setMessages((currentMessages) => currentMessages.map((item, index) => (
        index === currentMessages.length - 1
          ? { role: 'assistant', text: error.message }
          : item
      )))
    } finally {
      setIsLoading(false)
    }
  }

  const confirmProposedTasks = async (tasks, messageIndex) => {
    setSavingProposalIndex(messageIndex)
    try {
      await onAddTasks(tasks)
      setMessages((currentMessages) => currentMessages.map((item, index) => (
        index === messageIndex
          ? { role: 'assistant', text: `${tasks.length} tasks were added to your workspace.` }
          : item
      )))
    } catch {
      setMessages((currentMessages) => currentMessages.map((item, index) => (
        index === messageIndex ? { ...item, text: 'The tasks could not be saved. Please try again.' } : item
      )))
    } finally {
      setSavingProposalIndex(null)
    }
  }

  return (
    <aside className="assistant-panel" aria-label="VELTO assistant" ref={panelRef}>
      <header className="assistant-header">
        <div className="assistant-avatar" aria-hidden="true">V</div>
        <div><h2>VELTO assistant</h2><p><span className="assistant-status-dot" /> Private workspace</p></div>
        <button className="assistant-mobile-close" onClick={onClose} type="button">Tasks</button>
      </header>
      <div className="assistant-disclaimer">Drafts are only saved after you approve them.</div>
      <div className="assistant-messages" aria-live="polite" aria-relevant="additions">
        {messages.map((item, index) => (
          <div className={`assistant-message message-${item.role}`} key={`${item.role}-${index}`}>
            {item.role === 'assistant' && <span className="assistant-message-mark" aria-hidden="true">V</span>}
            <div className="assistant-message-content">
              <p>{item.text}</p>
              {item.source === 'local-parser' && <small className="assistant-source">LOCAL TASK PARSING · NOT AI</small>}
              {item.proposedTasks?.length > 0 && (
                <div className="assistant-proposed-tasks">
                  <p className="assistant-proposed-heading">Tasks for your review</p>
                  <ul>
                    {item.proposedTasks.map((task, taskIndex) => (
                      <li key={`${task.title}-${taskIndex}`}>{task.title}</li>
                    ))}
                  </ul>
                  <button disabled={savingProposalIndex === index} onClick={() => confirmProposedTasks(item.proposedTasks, index)} type="button">
                    {savingProposalIndex === index ? 'Saving...' : 'Add tasks to my list'}
                  </button>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
      <div className="assistant-suggestions" aria-label="Suggested requests">
        {['My tasks for today are:', 'Help me plan tomorrow'].map((suggestion) => (
          <button disabled={isLoading} key={suggestion} onClick={() => sendMessage(null, suggestion)} type="button">{suggestion}</button>
        ))}
      </div>
      <form className="assistant-composer" onSubmit={sendMessage}>
        <label className="sr-only" htmlFor="assistant-message">Ask the VELTO assistant</label>
        <textarea
          id="assistant-message"
          onChange={(event) => setMessage(event.target.value)}
          onKeyDown={(event) => {
            if (event.key === 'Enter' && !event.shiftKey) sendMessage(event)
          }}
          placeholder="Tell me what you need to get done..."
          ref={inputRef}
          rows={2}
          value={message}
        />
        <button aria-label="Send message" disabled={!message.trim() || isLoading} type="submit">↑</button>
      </form>
      <p className="assistant-footnote">AI task drafts are generated from your signed-in workspace.</p>
    </aside>
  )
}

export default AssistantPanel
