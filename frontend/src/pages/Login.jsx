import "./Login.css";
import logo from '../assets/LOGOCERTO.png';
import { useState, useEffect } from "react";
import axios from 'axios';
import api from "../services/api";

export default function Login() {

  const [login, setLogin] = useState("");
  const [senha, setSenha] = useState("");

  function handleLogin(e) {
    e.preventDefault();
    api.post('/usuario',)
  } 
    

  return (
    <div className="login-container">
      <div className="login-right">
        <form className="login-box" onSubmit={handleLogin}>
          <img src={logo}></img>
          <h2>CONTROLKEY</h2>

          <input type="text"
            placeholder="Username"
            value={login}
            onChange={(e) => { setLogin(e.target.value) }}
          />

          <input type="password"
            placeholder="Password"
            value={senha}
            onChange={(e) => { setSenha(e.target.value) }}
          />

          <button type="submit">Entrar</button>
          <a href="#">Esqueceu a senha?</a>
        </form>
      </div>
    </div>
  );
}

