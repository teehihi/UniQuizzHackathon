// utils/auth.js
// Helper functions để làm việc với authentication

export const getAuthToken = () => {
  return localStorage.getItem("token");
};

export const getAuthHeaders = () => {
  const token = getAuthToken();
  return {
    "Authorization": token ? `Bearer ${token}` : "",
  };
};

export const isAuthenticated = () => {
  return !!getAuthToken();
};

