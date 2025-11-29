import "./Login.css";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import logo from "../../../assets/LOGOCERTO.png";
import { useState, useEffect } from "react";
import api from "../../../services/api";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";
import { Link } from "react-router-dom";

export default function Login() {
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [mostrarSenha, setMostrarSenha] = useState(false);
  const navigate = useNavigate();

  async function handleLogin(e) {
    e.preventDefault();
    api
      .post("/login", {
        email: email,
        senha: senha,
      })
      .then((response) => {
        console.log("Login bem-sucedido: ", response.data);

        sessionStorage.setItem("token", response.data.token);
        localStorage.setItem("refreshToken", response.data.refreshToken);
        sessionStorage.setItem(
          "usuario",
          JSON.stringify({
            id: response.data.usuario.id,
            email: response.data.usuario.email,
            tipo: response.data.usuario.tipo,
            id_tipo: response.data.usuario.id_tipo,
          })
        );
        toast.success("Login efetuado com sucesso", {
          position: "top-right",
          autoClose: 2000,
          hideProgressBar: false,
          closeOnClick: false,
          pauseOnHover: true,
          draggable: true,
          progress: undefined,
          theme: "light",
        }),
          setTimeout(() => {
            navigate("/home");
          }, 2000);
      })
      .catch((error) => {
        console.error("Erro no login: ", error);
        // alert(error.response?.data?.error || "Email ou senha incorretos!");
        toast.error("E-mail ou senha incorretos", {
          position: "top-right",
          autoClose: 2000,
          hideProgressBar: false,
          closeOnClick: false,
          pauseOnHover: true,
          draggable: true,
          progress: undefined,
          theme: "light",
        });
      });
  }

  return (
    <div className="login-container">
      <div className="login-right">
        <form className="login-box" onSubmit={handleLogin}>
          <img src={logo}></img>
          <h2>CONTROLKEY</h2>

          <input
            type="email"
            placeholder="seunome@email.com"
            value={email}
            onChange={(e) => {
              setEmail(e.target.value);
            }}
            required
          />

          <div className="senha-container">
            <input
              type={mostrarSenha ? "text" : "password"}
              placeholder="Senha"
              value={senha}
              onChange={(e) => setSenha(e.target.value)}
              required
            />
            <span
              className="toggle-senha"
              onClick={() => setMostrarSenha(!mostrarSenha)}
            >
              {mostrarSenha ? <FaEyeSlash /> : <FaEye />}
            </span>
          </div>

          <div className="esqueceu-senha">
            {/* <a href="#">Esqueceu a senha?</a> */}
            <Link to="/EsqueceuSenha">Esqueceu a senha?</Link>
          </div>

          <button type="submit">Entrar</button>
        </form>
      </div>
    </div>
  );
}
