import "./Login.css";
import logo from '../../../assets/LOGOCERTO.png';
import { useState, useEffect } from "react";
import api from "../../../services/api";

export default function Login() {

  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");

  function handleLogin(e) {
    e.preventDefault();
    api.post('/login', {
      email: email,
      senha: senha
    })
    .then(response => {
      console.log("Login bem-sucedido: ", response.data);

      localStorage.setItem('token', response.data.token);
      localStorage.setItem('usuario', JSON.stringify({
        id: response.data.usuario.usuarioId,
        email: response.data.usuario.email
      }));

      window.location.href = "/home";
    })
    .catch(error => {
      console.error("Erro no login: ", error);
      alert(error.response?.data?.error || "Email ou senha incorretos!");
    });
  } 
    

  return (
    <div className="login-container">
      <div className="login-right">
        <form className="login-box" onSubmit={handleLogin}>
          <img src={logo}></img>
          <h2>CONTROLKEY</h2>

          <input type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => { setEmail(e.target.value) }}
            required
          />

          <input type="password"
            placeholder="Senha"
            value={senha}
            onChange={(e) => { setSenha(e.target.value) }}
            required
          />

          <button type="submit">Entrar</button>
          <a href="#">Esqueceu a senha?</a>
        </form>
      </div>
    </div>
  );
}