import api from "./axios";

export const loginUser = async (username, password) => {
  try {
    const response = await api.post("/auth/token/", { username, password });
    const { access, refresh } = response.data;

    // Save tokens in localStorage
    localStorage.setItem("accessToken", access);
    localStorage.setItem("refreshToken", refresh);

    // Attach token to axios
    api.defaults.headers.common["Authorization"] = `Bearer ${access}`;

    return true;
  } catch (error) {
    console.error("Login failed:", error.response?.data || error.message);
    return false;
  }
};
