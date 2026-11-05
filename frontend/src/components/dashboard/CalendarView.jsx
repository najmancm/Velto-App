import { useState } from 'react'

const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

function dateKey(year, month, day) {
  return `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`
}

function getMonthCells(monthDate) {
  const year = monthDate.getFullYear()
  const month = monthDate.getMonth()
  const firstWeekday = new Date(year, month, 1).getDay()
  const daysInMonth = new Date(year, month + 1, 0).getDate()
  const cellCount = Math.ceil((firstWeekday + daysInMonth) / 7) * 7

  return Array.from({ length: cellCount }, (_, index) => {
    const date = new Date(year, month, index - firstWeekday + 1)
    return {
      key: dateKey(date.getFullYear(), date.getMonth(), date.getDate()),
      day: date.getDate(),
      inMonth: date.getMonth() === month,
    }
  })
}

function formatSelectedDate(value) {
  return new Date(`${value}T12:00:00`).toLocaleDateString(undefined, {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  })
}

function CalendarView({ tasks, today, selectedDate, onSelectDate, onEditTask, onCreateTask }) {
  const [displayedMonth, setDisplayedMonth] = useState(() => new Date(`${selectedDate}T12:00:00`))
  const monthCells = getMonthCells(displayedMonth)
  const monthLabel = displayedMonth.toLocaleDateString(undefined, { month: 'long', year: 'numeric' })
  const selectedTasks = tasks
    .filter((task) => task.dueDate === selectedDate)
    .sort((firstTask, secondTask) => Number(firstTask.completed) - Number(secondTask.completed))

  const changeMonth = (amount) => {
    const nextMonth = new Date(displayedMonth.getFullYear(), displayedMonth.getMonth() + amount, 1)
    setDisplayedMonth(nextMonth)
    onSelectDate(dateKey(nextMonth.getFullYear(), nextMonth.getMonth(), 1))
  }

  return (
    <section className="calendar-layout" aria-label="Task calendar">
      <div className="calendar-panel">
        <div className="calendar-toolbar">
          <div>
            <p className="dashboard-kicker">MONTH VIEW</p>
            <h2>{monthLabel}</h2>
          </div>
          <div className="calendar-month-controls">
            <button aria-label="Previous month" onClick={() => changeMonth(-1)} type="button">‹</button>
            <button className="calendar-today-button" onClick={() => {
              setDisplayedMonth(new Date(`${today}T12:00:00`))
              onSelectDate(today)
            }} type="button">Today</button>
            <button aria-label="Next month" onClick={() => changeMonth(1)} type="button">›</button>
          </div>
        </div>
        <div className="calendar-grid" role="grid" aria-label={monthLabel}>
          {weekDays.map((day) => <div className="calendar-weekday" key={day} role="columnheader">{day}</div>)}
          {monthCells.map((cell) => {
            const dayTasks = tasks.filter((task) => task.dueDate === cell.key)
            return (
              <div
                aria-selected={selectedDate === cell.key}
                className={`calendar-day ${!cell.inMonth ? 'is-outside-month' : ''} ${selectedDate === cell.key ? 'is-selected' : ''} ${today === cell.key ? 'is-today' : ''}`}
                key={cell.key}
                role="gridcell"
              >
                <button
                  aria-label={`${formatSelectedDate(cell.key)}${dayTasks.length ? `, ${dayTasks.length} task${dayTasks.length === 1 ? '' : 's'}` : ''}`}
                  aria-pressed={selectedDate === cell.key}
                  className="calendar-day-number"
                  onClick={() => onSelectDate(cell.key)}
                  type="button"
                >
                  {cell.day}
                </button>
                <div className="calendar-day-tasks">
                  {dayTasks.slice(0, 2).map((task) => (
                    <button
                      className={`calendar-task-chip priority-${task.priority} ${task.completed ? 'is-completed' : ''}`}
                      key={task.id}
                      onClick={() => onEditTask(task)}
                      title={task.title}
                      type="button"
                    >
                      {task.title}
                    </button>
                  ))}
                  {dayTasks.length > 2 && <span className="calendar-more-tasks">+{dayTasks.length - 2} more</span>}
                </div>
              </div>
            )
          })}
        </div>
      </div>

      <aside className="calendar-agenda" aria-labelledby="calendar-agenda-title">
        <div className="calendar-agenda-heading">
          <div>
            <p className="dashboard-kicker">DAY PLAN</p>
            <h2 id="calendar-agenda-title">{formatSelectedDate(selectedDate)}</h2>
          </div>
          <button aria-label="Add task to selected day" className="calendar-add-button" onClick={() => onCreateTask(selectedDate)} type="button">+</button>
        </div>
        {selectedTasks.length ? (
          <ul className="calendar-agenda-list">
            {selectedTasks.map((task) => (
              <li className={task.completed ? 'is-completed' : ''} key={task.id}>
                <span className={`calendar-agenda-priority priority-${task.priority}`} aria-hidden="true" />
                <button onClick={() => onEditTask(task)} type="button">{task.title}</button>
                {task.completed && <span className="calendar-complete-label">Done</span>}
              </li>
            ))}
          </ul>
        ) : (
          <p className="calendar-agenda-empty">Nothing scheduled for this day.</p>
        )}
      </aside>
    </section>
  )
}

export default CalendarView