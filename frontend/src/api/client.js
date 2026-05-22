import axios from 'axios'

const api = axios.create({
  baseURL: 'http://localhost:8000',
  headers: {
    'Content-Type': 'application/json',
  },
})

export const boardsApi = {
  getAll: () => api.get('/boards/'),

  getOne: (id) => api.get(`/boards/${id}`),

  create: (data) => api.post('/boards/', data),

  update: (id, data) =>
    api.patch(`/boards/${id}`, data),

  delete: (id) =>
    api.delete(`/boards/${id}`),
}

export const listsApi = {
  create: (data) => api.post('/lists/', data),

  update: (id, data) =>
    api.patch(`/lists/${id}`, data),

  reorder: (id, data) =>
    api.patch(`/lists/${id}/reorder`, data),

  delete: (id) =>
    api.delete(`/lists/${id}`),
}

export const cardsApi = {
  create: (data) => api.post('/cards/', data),

  getOne: (id) => api.get(`/cards/${id}`),

  update: (id, data) =>
    api.patch(`/cards/${id}`, data),

  reorder: (id, data) =>
    api.patch(`/cards/${id}/reorder`, data),

  delete: (id) =>
    api.delete(`/cards/${id}`),

  addLabel: (id, labelId) =>
    api.post(`/cards/${id}/labels/${labelId}`),

  removeLabel: (id, labelId) =>
    api.delete(`/cards/${id}/labels/${labelId}`),

  addMember: (id, memberId) =>
    api.post(`/cards/${id}/members/${memberId}`),

  removeMember: (id, memberId) =>
    api.delete(`/cards/${id}/members/${memberId}`),

  generateDescription: (id) =>
    api.post(`/cards/${id}/generate-description`),
}

export const checklistsApi = {
  create: (cardId, data) =>
    api.post(
      `/cards/${cardId}/checklists`,
      data
    ),

  delete: (cardId, checklistId) =>
    api.delete(
      `/cards/${cardId}/checklists/${checklistId}`
    ),

  addItem: (
    cardId,
    checklistId,
    data
  ) =>
    api.post(
      `/cards/${cardId}/checklists/${checklistId}/items`,
      data
    ),

  updateItem: (
    cardId,
    checklistId,
    itemId,
    data
  ) =>
    api.patch(
      `/cards/${cardId}/checklists/${checklistId}/items/${itemId}`,
      data
    ),
}

export const membersApi = {
  getAll: () => api.get('/members/'),
}

export const labelsApi = {
  getAll: () => api.get('/labels/'),
}

export const searchApi = {
  search: (params) =>
    api.get('/search/cards', {
      params,
    }),
}

export default api