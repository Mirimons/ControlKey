import axios from "axios";

const api = axios.create({
  baseURL: "http://localhost:3333",
});

//Token
api.interceptors.request.use((config) => {
  const token = sessionStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

//RefreshToken
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    //Se erro 401 (não autorizado) e não é tentativa de refresh
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      const refreshToken = localStorage.getItem("refreshToken");

      if (refreshToken) {
        try {
          console.log("🔄 Tentando renovar token automaticamente...");

          //Chama a rota de refresh no backend
          const response = await api.post("/refresh", {
            refreshToken: refreshToken,
          });

          const newToken = response.data.token;

          //Atualiza o token na sessionStorage
          sessionStorage.setItem("token", newToken);

          //Repete a requisição original com o novo token
          originalRequest.headers.Authorization = `Bearer ${newToken}`;
          return api(originalRequest);
        } catch (refreshError) {
          console.error("❌ Refresh token falhou: ", refreshError);

          // Token expirado - faz logout
          sessionStorage.clear();
          localStorage.clear();
          window.location.href = "/login";
        }
      } else {
        //Não tem refresh token - faz logout
        console.log("❌ Não há refresh token disponível");
        sessionStorage.clear();
        window.location.href = "/login";
      }
    }
    return Promise.reject(error);
  }
);

export default api;
