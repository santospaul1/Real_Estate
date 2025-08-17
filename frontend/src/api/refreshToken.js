import axios from "axios";

const refreshToken = async () => {
  const refresh = localStorage.getItem("refreshToken");
  if (!refresh) return null;

  try {
    const response = await axios.post("http://127.0.0.1:8000/api/auth/token/refresh/", {
      refresh,
    });
    const { access } = response.data;

    localStorage.setItem("accessToken", access);
    return access;
  } catch (error) {
    console.error("Token refresh failed:", error.response?.data || error.message);
    return null;
  }
};

export default refreshToken;
