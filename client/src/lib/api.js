import axios from 'axios'

export const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000',
})

export async function startBusinessSearch(query, limit = 25) {
  const response = await api.post('/api/search/start', { query, limit })
  return response.data
}

export async function getBusinessSearchProgress(jobId) {
  const response = await api.get(`/api/search/progress/${jobId}`)
  return response.data
}

export async function stopBusinessSearch(jobId) {
  const response = await api.post(`/api/search/stop/${jobId}`)
  return response.data
}

// keep old one if needed elsewhere
export async function searchBusinesses(query) {
  const response = await api.post('/api/search', { query })
  return response.data
}

export async function fetchReviews({ name, googleMapsUrl, rating, reviewCount }) {
  const response = await api.post('/api/reviews', {
    name,
    googleMapsUrl,
    rating,
    reviewCount,
  })
  return response.data
}

export async function fetchBusinessContacts({ website }) {
  const response = await api.post('/api/contacts', {
    website,
  })
  return response.data
}

export async function fetchEmailTemplates() {
  const response = await api.get('/api/email/templates')
  return response.data
}

export async function sendColdEmail(payload) {
  const response = await api.post('/api/email/send', payload)
  return response.data
}

export async function fetchAuthStatus() {
  const response = await api.get('/auth/status')
  return response.data
}

export async function sendBulkColdEmails(payload) {
  const response = await api.post('/api/bulk-email/send', payload)
  return response.data
}