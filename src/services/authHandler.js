import tokenManager from './tokenManager';

// This will be set by App.js to handle navigation
let onUnauthorizedCallback = null;

export const setUnauthorizedCallback = (callback) => {
  onUnauthorizedCallback = callback;
};

export const handleUnauthorized = () => {
  tokenManager.clearToken();
  localStorage.removeItem('kyro_token'); // Still remove from localStorage for compatibility
  
  // Store the current URL for redirect after re-login
  sessionStorage.setItem('redirectAfterLogin', window.location.pathname + window.location.search);
  
  // Trigger a custom event for React components to handle the redirect
  window.dispatchEvent(new CustomEvent('unauthorized'));
};