import React, { Component } from "react";
import './Home.css';
import Navbar from "../../../components/navbar";
import BotaoSair from "../../../components/botaoSair/sair"

class Cards extends Component {
  render() {
    const { titulo, quantidade, cor } = this.props;
    return (
      <div className="card" style={{ backgroundColor: cor }}>
        <div className="card-content">
          <h3>{titulo}</h3>
          <span>{quantidade}</span>
        </div>
      </div>
    );
  }
}

function Home() {
  return (
    <div style={{ display: "flex", paddingTop: "70px", paddingLeft:"200px" }}>
      {/* <navbar /> */}

      <div className="container" style={{ marginLeft: "30px", padding: "20px", flexGrow: 1 }}>
        <h1>Página Inicial</h1>

        <div className="cards-container">
          <Cards titulo="Total de Chaves Cadastradas" quantidade={15} cor="#0A4174" />
          <Cards titulo="Chaves Emprestadas no Momento" quantidade={8} cor="#49769F" />
          <Cards titulo="Reservas Pendentes" quantidade={4} cor="#4E8EA2" />
          <Cards titulo="Chaves Atrasadas" quantidade={1} cor="#001D39" />
        </div>
      </div>
      <BotaoSair />
    </div>
  );  
}


export default Home;