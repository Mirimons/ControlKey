import React, { useState, useEffect, useRef, use } from 'react';
import './Equipaments.css';
import Navbar from "../../../components/navbar";
import BotaoSair from "../../../components/botaoSair/sair";
import api from "../../../services/api"

function Equipaments() {
    const [modalAberto, setModalAberto] = useState(false);
    const [tipoEquip, setTipoEquip] = useState("");
    const [descEquip, setDescEquip] = useState("");

    const [equipamentos, setEquipamentos] = useState([]);

    const modalRef = useRef();

    const abrirModal = () => setModalAberto(true);
    const fecharModal = () => setModalAberto(false);

    const handleSalvar = (e) => {
        e.preventDefault();

        const token = localStorage.getItem('token');

        if (!token) {
            alert('Você precisa estar logado para cadastrar equipamentos!');
            return;
        }

        api.post("/equipamento", {
            id_tipo : tipoEquip,
            desc_equip : descEquip
        }, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        })
            .then(response => {
                console.log("Equipamento cadastrado:", response.data);
                alert("Equipamento cadastrado com sucesso!");
                fecharModal();

                // limpa os campos
                setTipoEquip("");
                setDescEquip("");
            })
            .catch(error => {
                console.error("Erro ao cadastrar:", error);
                alert(error.response?.data?.error || "Erro ao cadastrar Equipamento!");
            });
    };

    useEffect(() => {
        const token = localStorage.getItem("token");
        if (!token) return;

        api.get("/equipamento", {
            headers: {
                Authorization: `Bearer ${token}`
            }
        })
            .then(response => {
                setEquipamentos(response.data);
            })
            .catch(error => {
                console.error("Erro ao buscar equipamento:", error);
            });

    }, [])

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
        <div className="equipamentos-container">
            <header className="equipamentos-header">
                <h1>Equipamentos</h1>
            </header>

            <div className="equipamentos-acoes">
                <button type="button" onClick={abrirModal}>Adicionar Equipamento</button>
            </div>

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
                    {equipamentos && equipamentos.map((equipaments) => (
                        <tr key={equipaments.id}>
                            <td>{equipaments.id}</td>
                            <td>{equipaments.id_tipo}</td>
                            <td>{equipaments.desc_equip}</td>
                            <td><button className="editar-btn">✏️</button></td>
                        </tr>
                    ))}
                </tbody>
            </table>

            {modalAberto && (
                <div className="modal-fundo">
                    <div className="modal-conteudo" ref={modalRef}>
                        <form onSubmit={handleSalvar}>
                            <h2>Adicionar Equipamento</h2>

                            <input
                                type="text"
                                placeholder="Digite o código do equipamento"
                                value={tipoEquip}
                                onChange={(e) => setTipoEquip(e.target.value)}
                            />

                            <input
                                type="text"
                                placeholder="Descrição (Opcional)"
                                value={descEquip}
                                onChange={(e) => setDescEquip(e.target.value)}
                            />

                            <div className="modal-botoes">
                                <button type="button" onClick={fecharModal}>
                                    Cancelar
                                </button>
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

export default Equipaments;