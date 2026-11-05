import { apiRequest } from './apiClient.js'

function normalizeGoal(goal) {
  return {
    ...goal,
    id: String(goal.id),
    targetDate: goal.target_date ?? '',
  }
}

function normalizeProject(project) {
  return {
    ...project,
    id: String(project.id),
    goal: project.goal == null ? '' : String(project.goal),
  }
}

function toApiResource(resource) {
  return {
    title: resource.title,
    description: resource.description,
    goal: resource.goal || null,
    target_date: resource.targetDate || null,
    completed: resource.completed,
  }
}

export async function listGoals() {
  return (await apiRequest('/goals/')).map(normalizeGoal)
}

export async function createGoal(goal) {
  return normalizeGoal(await apiRequest('/goals/', {
    method: 'POST',
    body: JSON.stringify(toApiResource(goal)),
  }))
}

export async function updateGoal(id, goal) {
  return normalizeGoal(await apiRequest(`/goals/${id}/`, {
    method: 'PATCH',
    body: JSON.stringify(toApiResource(goal)),
  }))
}

export function deleteGoal(id) {
  return apiRequest(`/goals/${id}/`, { method: 'DELETE' })
}

export async function listProjects() {
  return (await apiRequest('/projects/')).map(normalizeProject)
}

export async function createProject(project) {
  return normalizeProject(await apiRequest('/projects/', {
    method: 'POST',
    body: JSON.stringify(toApiResource(project)),
  }))
}

export async function updateProject(id, project) {
  return normalizeProject(await apiRequest(`/projects/${id}/`, {
    method: 'PATCH',
    body: JSON.stringify(toApiResource(project)),
  }))
}

export function deleteProject(id) {
  return apiRequest(`/projects/${id}/`, { method: 'DELETE' })
}