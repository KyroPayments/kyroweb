import apiClient from './api';

// Update user's workspace in the backend
export const workspaceAPI = {
  updateWorkspace: async (workspace) => {
    return await apiClient.put('/auth/profile', { workspace });
  },

  getWorkspace: async () => {
    return await apiClient.get('/auth/workspace');
  }
};