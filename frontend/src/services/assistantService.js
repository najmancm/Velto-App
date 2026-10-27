import { apiRequest } from './apiClient.js'

export function sendAssistantMessage(message) {
  return apiRequest('/assistant/', {
    method: 'POST',
    body: JSON.stringify({ message }),
  })
}
