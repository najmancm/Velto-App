import { apiRequest } from './apiClient.js'

function normalizeTask(task) {
  return {
    ...task,
    id: String(task.id),
    dueDate: task.due_date ?? '',
  }
}

function toApiTask(task) {
  return {
    title: task.title,
    due_date: task.dueDate || null,
    priority: task.priority,
    completed: task.completed,
  }
}

export async function listTasks() {
  const tasks = await apiRequest('/tasks/')
  return tasks.map(normalizeTask)
}

export async function createTask(task) {
  return normalizeTask(await apiRequest('/tasks/', {
    method: 'POST',
    body: JSON.stringify(toApiTask(task)),
  }))
}

export async function updateTask(id, task) {
  return normalizeTask(await apiRequest(`/tasks/${id}/`, {
    method: 'PATCH',
    body: JSON.stringify(toApiTask(task)),
  }))
}

export function deleteTask(id) {
  return apiRequest(`/tasks/${id}/`, { method: 'DELETE' })
}

export async function createTasks(tasks) {
  const result = await apiRequest('/tasks/bulk/', {
    method: 'POST',
    body: JSON.stringify({ tasks: tasks.map(toApiTask) }),
  })
  return result.map(normalizeTask)
}
