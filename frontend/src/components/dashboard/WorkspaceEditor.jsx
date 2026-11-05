import { useState } from 'react'

function WorkspaceEditor({ type, item, goals, onClose, onSave }) {
  const [title, setTitle] = useState(item?.title ?? '')
  const [description, setDescription] = useState(item?.description ?? '')
  const [goal, setGoal] = useState(item?.goal ?? '')
  const [targetDate, setTargetDate] = useState(item?.targetDate ?? '')
  const isGoal = type === 'goal'

  const handleSubmit = (event) => {
    event.preventDefault()
    if (!title.trim()) return
    onSave({
      title: title.trim(),
      description: description.trim(),
      goal,
      targetDate,
      completed: item?.completed ?? false,
    })
  }

  return (
    <div className="task-dialog-backdrop" onMouseDown={(event) => {
      if (event.target === event.currentTarget) onClose()
    }}>
      <section className="task-dialog" role="dialog" aria-modal="true" aria-labelledby="workspace-dialog-title">
        <button className="task-dialog-close" type="button" onClick={onClose} aria-label={`Close ${type} form`}>×</button>
        <p className="dashboard-kicker">WORKSPACE</p>
        <h2 id="workspace-dialog-title">{item ? `Edit ${type}` : `Create a ${type}`}</h2>
        <form className="task-editor-form" onSubmit={handleSubmit}>
          <label htmlFor="workspace-title">Name</label>
          <input
            autoFocus
            id="workspace-title"
            maxLength={120}
            onChange={(event) => setTitle(event.target.value)}
            placeholder={isGoal ? 'What do you want to achieve?' : 'What are you working on?'}
            required
            value={title}
          />
          <label htmlFor="workspace-description">Description</label>
          <textarea
            id="workspace-description"
            maxLength={2000}
            onChange={(event) => setDescription(event.target.value)}
            placeholder="Add a few details"
            rows={3}
            value={description}
          />
          {isGoal ? (
            <>
              <label htmlFor="goal-target-date">Target date</label>
              <input id="goal-target-date" onChange={(event) => setTargetDate(event.target.value)} type="date" value={targetDate} />
            </>
          ) : (
            <>
              <label htmlFor="project-goal">Goal</label>
              <select id="project-goal" onChange={(event) => setGoal(event.target.value)} value={goal}>
                <option value="">No goal</option>
                {goals.filter((item) => !item.completed).map((item) => (
                  <option key={item.id} value={item.id}>{item.title}</option>
                ))}
              </select>
            </>
          )}
          <div className="task-editor-actions">
            <button className="dashboard-button dashboard-button-muted" onClick={onClose} type="button">Cancel</button>
            <button className="dashboard-button dashboard-button-primary" type="submit">{item ? 'Save changes' : `Create ${type}`}</button>
          </div>
        </form>
      </section>
    </div>
  )
}

export default WorkspaceEditor