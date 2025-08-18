import React from 'react';
import './Reservation.css';
import SideBar from "../components/sidebar";

function User() {
    return (
        <div className="reservas-container">
            <header className="reservas-header">
                <h1>Reservas</h1>
                <span>Olá, Fulano de Tal!</span>
            </header>

            <div className="reservas-filtros">
                <div>
                    <h3>Finalidade:</h3>
                    <input type="text" placeholder="Finalidade" />
                </div>
                <div>
                    <h3>Solicitante:</h3>
                    <input type="text" placeholder="Solicitante" />
                </div>
                <div>
                    <h3>Ambiente/Equipamento:</h3>
                    <input type="text" placeholder="Ambiente/Equipamento" />
                </div>
            </div>

            <div className="reservas-acoes">
                <button>Reservar</button>
                <button>Pesquisar</button>
            </div>

            <table className="reservas-tabela">
                <thead>
                    <tr>
                        <th>Código</th>
                        <th>Nome</th>
                        <th>Tp_usuário</th>
                        <th>Telefone</th>
                        <th>Editar</th>
                    </tr>
                </thead>
                <tbody>
                    {[...Array(6)].map((_, i) => (
                        <tr key={i}>
                            <td>Celula</td>
                            <td>Celula</td>
                            <td>Celula</td>
                            <td>Celula</td>
                            <td><button className="editar-btn">✏️</button></td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}

export default User;