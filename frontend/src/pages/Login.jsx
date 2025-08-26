import "./Login.css";
import imgLogin from '../assets/imagem-cadeado.png';
import logo from '../assets/LOGOCERTO.png';
import { useState, useEffect } from "react";
import axios from 'axios';
// import api from "../services/api";

export default function Login() {

  const [login, setLogin] = useState([])
  const [senha, setSenha] = useState([])

  function handleSubmit(){
    api.post('/usuarios', )
  }

  return (
     <div className="login-container">
      {/* Lado esquerdo */}
      <div className="login-left">
      <img src={imgLogin}></img>
      </div>

      {/* Lado direito */}
      <div className="login-right">
        <form className="login-box">
          <img src={logo}></img>
          <h2>CONTROLKEY</h2>
          <input type="text" 
            placeholder="UserName" 
            onChange={setLogin}
          />
          <input type="password" 
          placeholder="PassWord"
          onChange={setSenha}
          />
          <button>Entrar</button>
          <a href="#">Esqueceu a senha?</a>
        </form>
      </div>
    </div>
  );
}

