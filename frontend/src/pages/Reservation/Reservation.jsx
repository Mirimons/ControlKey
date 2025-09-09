import React, { useState, useEffect, useRef } from 'react';
import './Reservation.css';
import Navbar from "../../components/navbar";
import api from '../../services/api';

function Reservation() {
    const [modalAberto, setModalAberto] = useState(false);
    const [nomeProfessor, setNomeProfessor] = useState("");
    const [laboratorio, setLaboratorio] = useState("");
    const [dataInicio, setDataInicio] = useState("");
    const [dataFim, setDataFim] = useState("");
    const [dataUtilizacao, setDataUtilizacao] = useState("");

    const modalRef = useRef();

    const abrirModal = () => setModalAberto(true);
    const fecharModal = () => setModalAberto(false);

    const handleSalvar = (e) => {
        e.preventDefault();

        api.post("/agendamento", {
            nomeProfessor,
            laboratorio,
            dataInicio,
            dataFim,
            dataUtilizacao
        })
            .then(response => {
                console.log("Agendamento realizado:", response.data);
                alert("Agendamento realizado com sucesso!");
                fecharModal();

                // limpa os campos
                setNomeProfessor("");
                setLaboratorio("");
                setDataInicio("");
                setDataFim("");
                setDataUtilizacao("");

                sessionStorage.setItem("tokenJwt", data.token);
            })
            .catch(error => {
                console.error("Erro ao agendar:", error);
                alert(error.response?.data?.error || "Erro ao agendar!");
            });
    };

    useEffect(() => {
        function handleClickFora(event) {
            if (modalRef.current && !modalRef.current.contains(event.target)) {
                fecharModal();
            }
        }

        function handleEsc(event) {
            if (event.key == 'Escape') {
                fecharModal();
            }
        }

        if (modalAberto) {
            document.addEventListener('mousedown', handleClickFora);
            document.addEventListener('keydown', handleEsc);
        }

        return () => {
            document.removeEventListener('mousedown', handleClickFora);
            document.removeEventListener('keydown', handleEsc);
        };
    }, [modalAberto]);

    return (
        <div className="reservas-container">
            <header className="reservas-header">
                <h1>Reservas</h1>
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
                <button type="button" onClick={abrirModal}>Reservar</button>
                <button type='button'>Pesquisar</button>
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

            {/* Modal */}
            {modalAberto && (
                <div className="modal-fundo">
                    <div className="modal-conteudo" ref={modalRef}>
                        <form onSubmit={handleSalvar}>
                            <h2>Fazer Reserva</h2>

                            <input
                                type="text"
                                placeholder="Nome professor"
                                value={nomeProfessor}
                                onChange={(e) => setNomeProfessor(e.target.value)}
                                required
                            />

                            <select
                                value={laboratorio}
                                onChange={(e) => setLaboratorio(Number(e.target.value))}
                                required defaultValue=""
                            >
                                <option value="" disabled selected hidden>Selecione o Ambiente</option>
                                <option value={1}>Administrador</option>
                                <option value={2}>Comum</option>
                                <option value={3}>Terceiro</option>
                            </select>

                            <label>Data de ínicio</label>
                            <input
                                type="date"
                                placeholder="Data de Início"
                                value={dataInicio}
                                onChange={(e) => setDataInicio(e.target.value)}
                                required
                            />

                            <label>Data de Fim</label>
                            <input
                                type="date"
                                placeholder="Data de Fim"
                                value={dataFim}
                                onChange={(e) => setDataFim(e.target.value)}
                                required
                            />

                            <label>Data de Utilização</label>
                            <input
                                type="date"
                                placeholder="Data de Utilização"
                                value={dataUtilizacao}
                                onChange={(e) => setDataUtilizacao(e.target.value)}
                                required
                            />

                            <div className="modal-botoes">
                                <button type="button" onClick={fecharModal}>Cancelar</button>
                                <button type="submit">Salvar</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}

export default Reservation;