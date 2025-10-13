import React, { useState } from "react";
import "./esqueceuSenha.css";
import api from "../../../services/api"; // ajusta se o caminho do seu arquivo api for diferente
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";

function EsqueceuSenha() {
  const [email, setEmail] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!email) {
      toast.warn("Por favor, insira seu e-mail institucional.");
      return;
    }

    try {
      await api.post("/usuarios/esqueci-senha", { email });
      toast.success("Uma nova senha foi enviada para seu e-mail!");
      navigate("/login");
    } catch (error) {
      console.error(error);
      toast.error("Erro ao enviar e-mail. Verifique o endereço informado.");
    }
  };

  return (
    <div className="container-esqueceu">
      <div className="form-box">
        <h2>Recuperar Senha</h2>
        <p>Digite seu e-mail institucional para receber uma nova senha.</p>
        <form onSubmit={handleSubmit}>
          <input
            type="email"
            placeholder="E-mail institucional"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <button type="submit">Enviar nova senha</button>
        </form>

        <button className="voltar" onClick={() => navigate("/login")}>
          Voltar para o login
        </button>
      </div>
    </div>
  );
}

export default EsqueceuSenha;
