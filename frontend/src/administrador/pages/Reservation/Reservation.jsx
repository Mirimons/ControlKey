import React, { useState, useEffect, useRef } from 'react';
import './Reservation.css';
import Navbar from "../../../components/navbar";
import api from '../../../services/api';
import BotaoSair from "../../../components/botaoSair/sair";

function Reservation() {
    const [modalAberto, setModalAberto] = useState(false);
    const [nomeProfessor, setNomeProfessor] = useState("");
    const [laboratorio, setLaboratorio] = useState("");
    const [horaInicio, setHoraInicio] = useState("");
    const [horaFim, setHoraFim] = useState("");
    const [dataUtilizacao, setDataUtilizacao] = useState("");
    const [status, setStatus] = useState("");
    const [chaves, setChaves] = useState("");

    const [reservas, setReservas] = useState([]);

    console.log(reservas);

    const modalRef = useRef();

    const abrirModal = () => setModalAberto(true);
    const fecharModal = () => setModalAberto(false);

    const handleSalvar = (e) => {
        e.preventDefault();

        const token = localStorage.getItem('token');

        if (!token) {
            alert('Você precisa estar logado para reservar!');
            return;
        }

        api.post("/agendamento", {
            nomeProfessor,
            laboratorio,
            horaInicio,
            horaFim,
            dataUtilizacao,
            status
        }, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        })
            .then(response => {
                console.log("Agendamento realizado:", response.data);
                alert("Agendamento realizado com sucesso!");
                fecharModal();

                // limpa os campos
                setNomeProfessor("");
                setLaboratorio("");
                setHoraInicio("");
                setHoraFim("");
                setDataUtilizacao("");
                setStatus("");

                sessionStorage.setItem("tokenJwt", data.token);
            })
            .catch(error => {
                console.error("Erro ao agendar:", error);
                alert(error.response?.data?.error || "Erro ao agendar!");
            });
    };

    useEffect(() => {
        const token = localStorage.getItem("token");
        if (!token) return;

        api.get("/labs", {
            headers: { Authorization: `Bearer ${token}` }
        })
            .then(response => {
                setChaves(response.data); // guarda os labs
            })
            .catch(error => {
                console.error("Erro ao buscar chaves:", error);
            });
    }, []);

    useEffect(() => {
        const token = localStorage.getItem("token");
        if (!token) return;

        api.get("/labs", {
            headers: {
                Authorization: `Bearer ${token}`
            }
        })
            .then(response => {
                setReservas(response.data);
            })
            .catch(error => {
                console.error("Erro ao buscar reserva:", error);
            });

    }, [reservas])

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

            <div className="reservas-acoes">
                <button type="button" onClick={abrirModal}>Reservar</button>
            </div>

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


            <table className="reservas-tabela">
                <thead>
                    <tr>
                        <th>Solicitante</th>
                        <th>Ambiente</th>
                        <th>Data Utilização</th>
                        <th>Horário InÍcio</th>
                        <th>Horário Fim</th>
                        <th>Status</th>
                        <th>Editar</th>
                    </tr>
                </thead>
                <tbody>
                    {reservas && reservas.map((reservation) => (
                        <tr key={reservation.id}>
                            <td>{reservation.nomeProfessor}</td>
                            <td>{reservation.laboratorio}</td>
                            <td>{reservation.dataUtilizacao}</td>
                            <td>{reservation.horaInicio}</td>
                            <td>{reservation.setHoraFim}</td>
                            <td>{reservation.status}</td>
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
                                onChange={(e) => setLaboratorio(e.target.value)}
                                required
                            >
                                <option value="" disabled hidden>Selecione o Ambiente</option>
                                {chaves.map((chave) => (
                                    <option key={chave.id} value={chave.id}>
                                        {chave.nome_lab}
                                    </option>
                                ))}
                            </select>

                            <label>Horário de ínicio</label>
                            <input
                                type="time"
                                placeholder="Data de Início"
                                value={horaInicio}
                                onChange={(e) => setHoraInicio(e.target.value)}
                                required
                            />

                            <label>Horário de Fim</label>
                            <input
                                type="time"
                                placeholder="Data de Fim"
                                value={horaFim}
                                onChange={(e) => setHoraFim(e.target.value)}
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
            <BotaoSair />
        </div>
    );
}

export default Reservation;