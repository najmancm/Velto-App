import { useState } from 'react'

function TaskEditor({ task, onClose, onSave }) {
  const [title, setTitle] = useState(task?.title ?? '')
  const [dueDate, setDueDate] = useState(task?.dueDate ?? '')
  const [priority, setPriority] = useState(task?.priority ?? 'medium')

  const handleSubmit = (event) => {
    event.preventDefault()
    if (!title.trim()) return
    onSave({ title: title.trim(), dueDate, priority })
  }

  return (
    <div className="task-dialog-backdrop" onMouseDown={(event) => {
      if (event.target === event.currentTarget) onClose()
    }}>
      <section className="task-dialog" role="dialog" aria-modal="true" aria-labelledby="task-dialog-title">
        <button className="task-dialog-close" type="button" onClick={onClose} aria-label="Close task form">×</button>
        <p className="dashboard-kicker">TASK DETAILS</p>
        <h2 id="task-dialog-title">{task ? 'Edit task' : 'Create a task'}</h2>
        <form className="task-editor-form" onSubmit={handleSubmit}>
          <label htmlFor="task-title">Task</label>
          <input
            autoFocus
            id="task-title"
            maxLength={140}
            onChange={(event) => setTitle(event.target.value)}
            placeholder="What needs to get done?"
            required
            value={title}
          />
          <div className="task-editor-fields">
            <div>
              <label htmlFor="task-due-date">Due date</label>
              <input id="task-due-date" onChange={(event) => setDueDate(event.target.value)} type="date" value={dueDate} />
            </div>
            <div>
              <label htmlFor="task-priority">Priority</label>
              <select id="task-priority" onChange={(event) => setPriority(event.target.value)} value={priority}>
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
              </select>
            </div>
          </div>
          <div className="task-editor-actions">
            <button className="dashboard-button dashboard-button-muted" onClick={onClose} type="button">Cancel</button>
            <button className="dashboard-button dashboard-button-primary" type="submit">{task ? 'Save changes' : 'Add task'}</button>
          </div>
        </form>
      </section>
    </div>
  )
}

export default TaskEditor
