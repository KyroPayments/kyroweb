import React, { createContext, useContext, useReducer } from 'react';
import { profileAPI } from '../services/api';

// Create the Workspace context
const WorkspaceContext = createContext();

// Reducer for workspace state
const workspaceReducer = (state, action) => {
  switch (action.type) {
    case 'SET_WORKSPACE':
      return {
        ...state,
        currentWorkspace: action.payload
      };
    case 'LOAD_FROM_PROFILE':
      const workspace = action.payload?.workspace || 'testnet';
      return {
        ...state,
        currentWorkspace: workspace,
        user: action.payload
      };
    default:
      return state;
  }
};

// Initial state - initialize to default workspace
const initialState = {
  currentWorkspace: 'testnet', // Default workspace
  user: null
};

// Provider component
export const WorkspaceProvider = ({ children }) => {
  const [state, dispatch] = useReducer(workspaceReducer, initialState);

  // Function to update workspace
  const updateWorkspace = async (workspace) => {
    // First update the workspace in the backend
    try {
      await profileAPI.updateProfile({ workspace });
      // Then fetch the updated user profile to reflect the change
      const response = await profileAPI.getProfile();
      // Update the local state with the updated user data
      dispatch({ type: 'LOAD_FROM_PROFILE', payload: response.data.user });
    } catch (error) {
      console.error('Error updating workspace in backend:', error);
    }
  };

  // Function to load user and workspace from profile
  const loadProfile = (profileData) => {
    dispatch({ type: 'LOAD_FROM_PROFILE', payload: profileData });
  };

  return (
    <WorkspaceContext.Provider
      value={{
        currentWorkspace: state.currentWorkspace,
        user: state.user,
        updateWorkspace,
        loadProfile
      }}
    >
      {children}
    </WorkspaceContext.Provider>
  );
};

// Custom hook to use the workspace context
export const useWorkspace = () => {
  const context = useContext(WorkspaceContext);
  if (!context) {
    throw new Error('useWorkspace must be used within a WorkspaceProvider');
  }
  return context;
};