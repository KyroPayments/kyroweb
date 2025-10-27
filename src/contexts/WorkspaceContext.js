import React, { createContext, useContext, useReducer } from 'react';

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
      return {
        ...state,
        currentWorkspace: action.payload?.workspace || 'testnet',
        user: action.payload
      };
    default:
      return state;
  }
};

// Initial state
const initialState = {
  currentWorkspace: 'testnet', // Default workspace
  user: null
};

// Provider component
export const WorkspaceProvider = ({ children }) => {
  const [state, dispatch] = useReducer(workspaceReducer, initialState);

  // Function to update workspace
  const updateWorkspace = (workspace) => {
    dispatch({ type: 'SET_WORKSPACE', payload: workspace });
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