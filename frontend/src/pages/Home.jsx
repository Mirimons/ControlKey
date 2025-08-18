import React, { Component } from "react";
import './Home.css';
import SideBar from "../components/sidebar";

const Bemvindo = (props) => {
  return (
    <div>
      <h2>Olá, {props.nome} </h2>
    </div>
  );
}

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
    <div style={{ display: "flex" }}>
      {/* <SideBar /> */}

      <div className="container" style={{ marginLeft: "250px", padding: "20px", flexGrow: 1 }}>
        <h1>Página Inicial</h1>
        <Bemvindo nome="Fulano de Tal!" />

        <div className="cards-container">
          <Cards titulo="Total de Chaves Cadastradas" quantidade={15} cor="#2196f3" />
          <Cards titulo="Chaves Emprestadas no Momento" quantidade={8} cor="#4caf50" />
          <Cards titulo="Reservas Pendentes" quantidade={4} cor="#ff9800" />
          <Cards titulo="Chaves Atrasadas" quantidade={1} cor="#f44336" />
        </div>
      </div>
    </div>
  );  
}


export default Home;