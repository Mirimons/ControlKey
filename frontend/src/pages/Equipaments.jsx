import React from 'react';
import './Equipaments.css';
import SideBar from "../components/sidebar";

function User() {
    return (
        <div className="equipamentos-container">
            <header className="equipamentos-header">
                <h1>Equipamentos</h1>
                <span>Olá, Fulano de Tal!</span>
            </header>

            <div className="equipamentos-filtros">
                <div>
                    <h3>Equipamento:</h3>
                    <input type="text" placeholder="Equipamento" />
                </div>
                <div>
                    <h3>Descrição:</h3>
                    <input type="text" placeholder="Descrição" />
                </div>
            </div>

            <div className="equipamentos-acoes">
                <button>Adicionar Equipamento</button>
                <button>Pesquisar</button>
            </div>

            <table className="equipamentos-tabela">
                <thead>
                    <tr>
                        <th>Código</th>
                        <th>Equipamento</th>
                        <th>Descrição</th>
                        <th>Editar</th>
                    </tr>
                </thead>
                <tbody>
                    {[...Array(6)].map((_, i) => (
                        <tr key={i}>
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