// Token manager to provide token access to axios interceptors
let tokenManager = {
  token: null,
  setToken: (newToken) => {
    tokenManager.token = newToken;
  },
  getToken: () => {
    return tokenManager.token;
  },
  clearToken: () => {
    tokenManager.token = null;
  }
};

export default tokenManager;