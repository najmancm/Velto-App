import { useEffect, useRef, useState } from 'react'
import './Dashboard.css'
import AssistantPanel from '../../features/assistant/AssistantPanel.jsx'
import VeltoLogo from '../brand/VeltoLogo.jsx'
import TaskEditor from './TaskEditor.jsx'
import { createTask, createTasks, deleteTask as deleteTaskRequest, listTasks, updateTask } from '../../services/taskService.js'

const taskFilters = ['Inbox', 'Today', 'Upcoming', 'All tasks', 'Completed']

function getToday() {
  const date = new Date()
  const localDate = new Date(date.getTime() - date.getTimezoneOffset() * 60000)
  return localDate.toISOString().slice(0, 10)
}

function formatDueDate(dueDate, today) {
  if (!dueDate) return 'No due date'
  if (dueDate === today) return 'Today'
  return new Date(`${dueDate}T12:00:00`).toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
  })
}

function Dashboard({ onSignOut, userName }) {
  const [tasks, setTasks] = useState([])
  const [activeFilter, setActiveFilter] = useState('Inbox')
  const [search, setSearch] = useState('')
  const [quickTask, setQuickTask] = useState('')
  const [editingTask, setEditingTask] = useState(undefined)
  const [assistantOpen, setAssistantOpen] = useState(false)
  const [tasksLoading, setTasksLoading] = useState(true)
  const [taskError, setTaskError] = useState('')
  const [notice, setNotice] = useState('')
  const [today] = useState(getToday)
  const assistantInput = useRef(null)
  const assistantPanel = useRef(null)

  const openAssistant = () => {
    setAssistantOpen(true)
    requestAnimationFrame(() => {
      assistantPanel.current?.scrollIntoView({ behavior: 'smooth', block: 'nearest' })
      assistantInput.current?.focus({ preventScroll: true })
    })
  }

  useEffect(() => {
    let isActive = true
    listTasks()
      .then((savedTasks) => {
        if (isActive) setTasks(savedTasks)
      })
      .catch((error) => {
        if (isActive) setTaskError(error.message)
      })
      .finally(() => {
        if (isActive) setTasksLoading(false)
      })

    return () => {
      isActive = false
    }
  }, [])

  const saveTask = async (taskDetails) => {
    try {
      const savedTask = editingTask
        ? await updateTask(editingTask.id, { ...editingTask, ...taskDetails })
        : await createTask({ ...taskDetails, completed: false })
      setTasks((currentTasks) => editingTask
        ? currentTasks.map((task) => task.id === savedTask.id ? savedTask : task)
        : [savedTask, ...currentTasks])
      setTaskError('')
      setNotice(editingTask ? 'Task updated.' : 'Task added.')
      setEditingTask(undefined)
    } catch (error) {
      setTaskError(error.message)
    }
  }

  const addQuickTask = (event) => {
    event.preventDefault()
    const title = quickTask.trim()
    if (!title) return

    createTask({
      title,
      dueDate: activeFilter === 'Today' ? today : '',
      priority: 'medium',
      completed: false,
    }).then((task) => {
      setTasks((currentTasks) => [task, ...currentTasks])
      setQuickTask('')
      setTaskError('')
      setNotice('Task added to your list.')
    }).catch((error) => setTaskError(error.message))
  }

  const toggleTask = async (taskId) => {
    const task = tasks.find((item) => item.id === taskId)
    if (!task) return
    try {
      const updatedTask = await updateTask(taskId, { ...task, completed: !task.completed })
      setTasks((currentTasks) => currentTasks.map((item) => item.id === taskId ? updatedTask : item))
      setNotice('Task progress saved.')
    } catch (error) {
      setTaskError(error.message)
    }
  }

  const deleteTask = async (taskId) => {
    try {
      await deleteTaskRequest(taskId)
      setTasks((currentTasks) => currentTasks.filter((task) => task.id !== taskId))
      setNotice('Task deleted.')
    } catch (error) {
      setTaskError(error.message)
    }
  }

  const addAssistantTasks = async (proposedTasks, messageIndex) => {
    try {
      const createdTasks = await createTasks(proposedTasks.map((task) => ({
        title: task.title,
        dueDate: task.due_date ?? '',
        priority: task.priority,
        completed: false,
      })))
      setTasks((currentTasks) => [...createdTasks, ...currentTasks])
      setNotice(`${createdTasks.length} tasks added to your workspace.`)
      return messageIndex
    } catch (error) {
      setTaskError(error.message)
      throw error
    }
  }

  const visibleTasks = tasks
    .filter((task) => {
      if (activeFilter === 'Inbox') return !task.completed && !task.dueDate
      if (activeFilter === 'Today') return task.dueDate && task.dueDate <= today && !task.completed
      if (activeFilter === 'Upcoming') return task.dueDate > today && !task.completed
      if (activeFilter === 'Completed') return task.completed
      if (activeFilter === 'High priority') return !task.completed && task.priority === 'high'
      if (activeFilter === 'Medium priority') return !task.completed && task.priority === 'medium'
      if (activeFilter === 'Low priority') return !task.completed && task.priority === 'low'
      return true
    })
    .filter((task) => task.title.toLowerCase().includes(search.trim().toLowerCase()))
    .sort((firstTask, secondTask) => {
      if (firstTask.completed !== secondTask.completed) return Number(firstTask.completed) - Number(secondTask.completed)
      if (!firstTask.dueDate) return 1
      if (!secondTask.dueDate) return -1
      return firstTask.dueDate.localeCompare(secondTask.dueDate)
    })

  const inboxCount = tasks.filter((task) => !task.completed && !task.dueDate).length
  const todayCount = tasks.filter((task) => !task.completed && task.dueDate && task.dueDate <= today).length
  const upcomingCount = tasks.filter((task) => !task.completed && task.dueDate > today).length
  const completedCount = tasks.filter((task) => task.completed).length
  const highPriorityCount = tasks.filter((task) => !task.completed && task.priority === 'high').length
  const mediumPriorityCount = tasks.filter((task) => !task.completed && task.priority === 'medium').length
  const lowPriorityCount = tasks.filter((task) => !task.completed && task.priority === 'low').length
  const viewTitle = activeFilter === 'All tasks' ? 'All tasks' : activeFilter
  const sidebarGroups = [
    {
      label: 'TASKS',
      items: [
        { name: 'Inbox', icon: '▱', filter: 'Inbox', count: inboxCount },
        { name: 'Today', icon: '◷', filter: 'Today', count: todayCount },
        { name: 'Upcoming', icon: '▦', filter: 'Upcoming', count: upcomingCount },
        { name: 'All tasks', icon: '☷', filter: 'All tasks', count: tasks.length },
        { name: 'Completed', icon: '✓', filter: 'Completed', count: completedCount },
      ],
    },
    {
      label: 'PRIORITY',
      items: [
        { name: 'High priority', icon: '↑', filter: 'High priority', count: highPriorityCount },
        { name: 'Medium priority', icon: '→', filter: 'Medium priority', count: mediumPriorityCount },
        { name: 'Low priority', icon: '↓', filter: 'Low priority', count: lowPriorityCount },
      ],
    },
    {
      label: 'WORKSPACE',
      items: [
        { name: 'Assistant', icon: '✦', action: 'assistant' },
        { name: 'Goals', icon: '◎', comingSoon: true },
        { name: 'Projects', icon: '▧', comingSoon: true },
        { name: 'Calendar', icon: '□', comingSoon: true },
      ],
    },
  ]

  return (
    <div className="dashboard-shell">
      <aside className="dashboard-sidebar">
        <div className="dashboard-brand" aria-label="VELTO task workspace">
          <VeltoLogo size="compact" />
        </div>

        <nav className="dashboard-navigation" aria-label="Dashboard navigation">
          {sidebarGroups.map((group) => (
            <div className="dashboard-navigation-group" key={group.label}>
              <p className="dashboard-workspace-label">{group.label}</p>
              {group.items.map((item) => {
                const isSelected = item.action === 'assistant'
                  ? assistantOpen
                  : !assistantOpen && activeFilter === item.filter

                return (
                  <button
                    aria-current={isSelected ? 'page' : undefined}
                    className={`dashboard-nav-item ${isSelected ? 'is-active' : ''}`}
                    disabled={item.comingSoon}
                    key={item.name}
                    onClick={() => {
                      if (item.action === 'assistant') openAssistant()
                      else if (!item.comingSoon) {
                        setAssistantOpen(false)
                        setActiveFilter(item.filter)
                      }
                    }}
                    title={item.comingSoon ? `${item.name} is coming soon` : undefined}
                    type="button"
                  >
                    <span className="dashboard-nav-icon" aria-hidden="true">{item.icon}</span>
                    {item.name}
                    {item.count !== undefined && <span className="dashboard-nav-count">{item.count}</span>}
                    {item.comingSoon && <span className="dashboard-soon">Soon</span>}
                  </button>
                )
              })}
            </div>
          ))}
        </nav>

        <div className="dashboard-sidebar-bottom">
          <span className="local-data-dot" aria-hidden="true" />
          <div><strong>{userName || 'Personal workspace'}</strong><small>Private account</small></div>
        </div>
      </aside>

      <main className="dashboard-main">
        <header className="dashboard-topbar">
          <span className="dashboard-local-label"><span className="local-data-dot" aria-hidden="true" /> Signed in as {userName}</span>
          <button className="dashboard-back-link" type="button" onClick={onSignOut}>Sign out</button>
        </header>

        <div className="dashboard-content">
          <section className="dashboard-heading-row">
            <div>
              <p className="dashboard-kicker">YOUR TASKS</p>
              <h1>{viewTitle}</h1>
              <p className="dashboard-subtitle">Your tasks, saved to your VELTO account.</p>
            </div>
            <div className="dashboard-heading-actions">
              <button className="dashboard-button dashboard-button-muted" onClick={openAssistant} type="button">Ask assistant</button>
              <button className="dashboard-button dashboard-button-primary" onClick={() => setEditingTask(null)} type="button"><span aria-hidden="true">+</span> New task</button>
            </div>
          </section>

          <div className={`dashboard-work-grid ${assistantOpen ? 'is-assistant-open' : ''}`}>
            <section className="task-board" aria-labelledby="task-board-title">
              <div className="task-board-heading">
                <div>
                  <h2 id="task-board-title">{viewTitle}</h2>
                  <p className="task-board-count">{visibleTasks.length} task{visibleTasks.length === 1 ? '' : 's'}</p>
                </div>
                <label className="task-search">
                  <span className="sr-only">Search tasks</span>
                  <span aria-hidden="true">⌕</span>
                  <input onChange={(event) => setSearch(event.target.value)} placeholder="Search tasks" type="search" value={search} />
                </label>
              </div>

              <form className="quick-task-form" onSubmit={addQuickTask}>
                <span className="quick-task-plus" aria-hidden="true">+</span>
                <label className="sr-only" htmlFor="quick-task-title">Add a task to {activeFilter}</label>
                <input
                  id="quick-task-title"
                  onChange={(event) => setQuickTask(event.target.value)}
                  placeholder="Add a task"
                  value={quickTask}
                />
                <button disabled={!quickTask.trim()} type="submit">Add task</button>
              </form>

              <div className="task-filter-tabs" aria-label="Filter tasks">
                {taskFilters.map((filter) => (
                  <button
                    aria-pressed={activeFilter === filter}
                    className={activeFilter === filter ? 'is-selected' : ''}
                    key={filter}
                    onClick={() => setActiveFilter(filter)}
                    type="button"
                  >
                    {filter}
                    {filter === 'All tasks' && <span>{tasks.length}</span>}
                  </button>
                ))}
              </div>

              {tasksLoading ? (
                <div className="task-empty-state" role="status"><p>Loading your tasks...</p></div>
              ) : taskError && tasks.length === 0 ? (
                <div className="task-empty-state" role="alert"><h3>Could not load your tasks</h3><p>{taskError}</p></div>
              ) : visibleTasks.length > 0 ? (
                <ul className="task-list">
                  {visibleTasks.map((task) => (
                    <li className={`dashboard-task ${task.completed ? 'is-completed' : ''}`} key={task.id}>
                      <input
                        aria-label={`${task.completed ? 'Mark incomplete' : 'Complete'} ${task.title}`}
                        checked={task.completed}
                        onChange={() => toggleTask(task.id)}
                        type="checkbox"
                      />
                      <button className="dashboard-task-title" onClick={() => setEditingTask(task)} type="button">{task.title}</button>
                      <span className="task-due-date">{formatDueDate(task.dueDate, today)}</span>
                      <span className={`task-priority priority-${task.priority}`}>{task.priority}</span>
                      <div className="task-actions">
                        <button aria-label={`Edit ${task.title}`} onClick={() => setEditingTask(task)} type="button">Edit</button>
                        <button aria-label={`Delete ${task.title}`} onClick={() => deleteTask(task.id)} type="button">Delete</button>
                      </div>
                    </li>
                  ))}
                </ul>
              ) : (
                <div className="task-empty-state">
                  <div className="empty-state-mark" aria-hidden="true">✓</div>
                  <h3>{search ? 'No matching tasks' : activeFilter === 'Today' ? 'Nothing due today' : activeFilter === 'Upcoming' ? 'Nothing scheduled yet' : activeFilter === 'Completed' ? 'No completed tasks yet' : 'Your inbox is clear'}</h3>
                  <p>{search ? 'Try another search term.' : 'Capture a task above, or add details like a due date and priority.'}</p>
                  {!search && activeFilter !== 'Completed' && <button className="dashboard-button dashboard-button-primary" onClick={() => setEditingTask(null)} type="button">Create a task</button>}
                </div>
              )}
            </section>

            <AssistantPanel
              inputRef={assistantInput}
              onAddTasks={addAssistantTasks}
              onClose={() => setAssistantOpen(false)}
              panelRef={assistantPanel}
            />
          </div>
          {notice && <p className="dashboard-toast" role="status">{notice}</p>}
          {taskError && <p className="dashboard-storage-warning" role="alert">{taskError}</p>}
        </div>
      </main>

      {editingTask !== undefined && (
        <TaskEditor
          key={editingTask?.id ?? 'new-task'}
          onClose={() => setEditingTask(undefined)}
          onSave={saveTask}
          task={editingTask}
        />
      )}
    </div>
  )
}

export default Dashboard
