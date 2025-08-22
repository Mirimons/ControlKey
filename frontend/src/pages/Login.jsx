import "./Login.css";

export default function Login() {
  return (
    <div className="login-container">
      {/* Lado esquerdo */}
      <div className="login-left">
        <img src="/logo-etec.png" alt="Etec" />
        <img src="/logo-cps.png" alt="CPS" />
      </div>

      {/* Lado direito */}
      <div className="login-right">
        <div className="login-box">
          <img src="/logo-controlkey.png" alt="ControlKey" />
          <h2>CONTROLKEY</h2>
          <input type="text" placeholder="UserName" />
          <input type="password" placeholder="Password" />
          <button>Entrar</button>
          <a href="#">Esqueceu a senha?</a>
        </div>
      </div>
    </div>
  );
}

