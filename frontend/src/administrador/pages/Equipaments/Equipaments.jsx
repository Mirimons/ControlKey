    import React, { useState, useEffect, useRef, use } from 'react';
    import './Equipaments.css';
    import Navbar from "../../../components/navbar";
    import BotaoSair from "../../../components/botaoSair/sair";
    import api from "../../../services/api"
    import { toast } from 'react-toastify';

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
                // alert('Você precisa estar logado para cadastrar equipamentos!');
                toast.error('Você precisa estar logado para cadastrar um equipamento!', {
                    position: "top-right",
                    autoClose: 2000,
                    hideProgressBar: false,
                    closeOnClick: false,
                    pauseOnHover: true,
                    draggable: true,
                    progress: undefined,
                    theme: 'light'
                })
                return;
            }

            api.post("/equipamento", {
                tipo: tipoEquip,
                desc_equip: descEquip
            }, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            })
                .then(response => {
                    console.log("Equipamento cadastrado:", response.data);
                    // alert("Equipamento cadastrado com sucesso!");
                    toast.success('Equipamento cadastrado com sucesso!', {
                        position: "top-right",
                        autoClose: 2000,
                        hideProgressBar: false,
                        closeOnClick: false,
                        pauseOnHover: true,
                        draggable: true,
                        progress: undefined,
                        theme: 'light'
                    })
                    fecharModal();

                    // limpa os campos
                    setTipoEquip("");
                    setDescEquip("");
                })
                .catch(error => {
                    console.error("Erro ao cadastrar:", error);
                    // alert(error.response?.data?.error || "Erro ao cadastrar Equipamento!");
                    toast.error('Erro ao cadastrar equipamento!', {
                        position: "top-right",
                        autoClose: 2000,
                        hideProgressBar: false,
                        closeOnClick: false,
                        pauseOnHover: true,
                        draggable: true,
                        progress: undefined,
                        theme: 'light'
                    })
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
                    console.log("Resposta do backend:", response.data);

                    // Garante que sempre vai ser um array
                    if (Array.isArray(response.data)) {
                        setEquipamentos(response.data);
                    }
                    else if (Array.isArray(response.data.equipamentos)) {
                        setEquipamentos(response.data.equipamentos);
                    }
                    else if (Array.isArray(response.data.data)) {
                        setEquipamentos(response.data.data);
                    }
                    else {
                        console.warn("Formato inesperado da resposta:", response.data);
                        setEquipamentos([]);
                    }
                })
                .catch(error => {
                    console.error("Erro ao buscar equipamento:", error);
                    setEquipamentos([]); // Evita quebra da página
                });
        }, []);

        useEffect(() => {
            if (!modalAberto) return;

            const handleClickFora = (event) => {
                if (modalRef.current && !modalRef.current.contains(event.target)) {
                    fecharModal();
                }
            };

            const handleEsc = (event) => {
                if (event.key === "Escape") {
                    fecharModal();
                }
            };

            // Adiciona os ouvintes
            document.addEventListener("mousedown", handleClickFora);
            document.addEventListener("keydown", handleEsc);

            // Remove os ouvintes ao desmontar
            return () => {
                document.removeEventListener("mousedown", handleClickFora);
                document.removeEventListener("keydown", handleEsc);
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
                                {/* <td>{equipaments.tipo}</td> */}
                                <td>{equipaments.tipo?.desc_tipo || "Sem tipo"}</td>
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

                                <label>Tipo equipamento:</label>
                                <input
                                    type="text"
                                    placeholder="Digite o tipo do equipamento"
                                    value={tipoEquip}
                                    onChange={(e) => setTipoEquip(e.target.value)}
                                />

                                <label>Desrição:</label>
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