import axios from "axios";

const api = axios.create({
  baseURL: "http://localhost:3333"
});

api.interceptors.request.use((config) => {
  const token = sessionStorage.getItem('tokenJwt');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default api ;
