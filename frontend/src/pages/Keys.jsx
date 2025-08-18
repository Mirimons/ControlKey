import React from 'react';
import './Keys.css';
import SideBar from "../components/sidebar";

function Keys() {
    return (
        <div className="chaves-container">
            <header className="chaves-header">
                <h1>Chaves</h1>
                <span>Olá, Fulano de Tal!</span>
            </header>

            <div className="chaves-filtros">
                <div>
                    <h3>Ambiente:</h3>
                    <input type="text" placeholder="Ambiente" />
                </div>
                <div>
                    <h3>Descrição:</h3>
                    <input type="text" placeholder="Descrição" />
                </div>
                
            </div>

            <div className="chaves-acoes">
                <button>Adicionar Chave</button>
                <button>Pesquisar</button>
            </div>

            <table className="chaves-tabela">
                <thead>
                    <tr>
                        <th>Código</th>
                        <th>Nome</th>
                        <th>Tp_usuário</th>
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

export default Keys;