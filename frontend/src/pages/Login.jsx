import "./Login.css";
import imgLogin from '../assets/imagem-cadeado.png';
<<<<<<< HEAD
import logo from '../assets/LOGOCERTO.png';
import { useState, useEffect } from "react";
import axios from 'axios';
// import api from "../services/api";
=======
import { useState, useEffect } from "react";
import axios from 'axios';
import api from "../services/api";
>>>>>>> c86e5f202adb3a7f19433e3ce45ed44609be5960

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
<<<<<<< HEAD
          <img src={logo}></img>
=======
          <img src="/logo-controlkey.png" alt="ControlKey" />
>>>>>>> c86e5f202adb3a7f19433e3ce45ed44609be5960
          <h2>CONTROLKEY</h2>
          <input type="text" 
            placeholder="UserName" 
            onChange={setLogin}
          />
          <input type="password" 
<<<<<<< HEAD
          placeholder="PassWord"
=======
          placeholder="Password"
>>>>>>> c86e5f202adb3a7f19433e3ce45ed44609be5960
          onChange={setSenha}
          />
          <button>Entrar</button>
          <a href="#">Esqueceu a senha?</a>
        </form>
      </div>
    </div>
  );
}

