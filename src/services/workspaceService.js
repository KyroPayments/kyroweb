import { useWorkspace } from '../contexts/WorkspaceContext';

// Custom hook to update workspace after profile update
export const useUpdateWorkspaceAfterProfileUpdate = () => {
  const { loadProfile } = useWorkspace();

  const updateWorkspace = (profileData) => {
    loadProfile(profileData);
  };

  return { updateWorkspace };
};