import React, { useState, useEffect, useRef, use } from 'react';
import './Equipaments.css';
import Navbar from "../../components/navbar";

function Equipaments() {
    const [modalAberto, setModalAberto] = useState(false);
    const [tipoEquip, setTipoEquip] = useState("");
    const [descEquip, setDescEquip] = useState("");

    const modalRef = useRef();

    const abrirModal = () => setModalAberto(true);
    const fecharModal = () => setModalAberto(false);

    const handleSalvar = (e) => {
        e.preventDefault();
        const novoEquip = { id_tipo: tipoEquip, desc_equip: descEquip };
        setLabs([...labs, novoEquip]);
        // Limpar campos
        setTipoEquip("");
        setDescEquip("");
        fecharModal();
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
        <div className="equipamentos-container">
            <header className="equipamentos-header">
                <h1>Equipamentos</h1>
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
                <button type="button" onClick={abrirModal}>Adicionar Equipamento</button>
                <button type="button">Pesquisar</button>
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

            {modalAberto && (
                <div className="modal-fundo">
                    <div className="modal-conteudo" ref={modalRef}>
                        <form onSubmit={handleSalvar}>
                            <h2>Adicionar Equipamento</h2>

                            <select
                                value={tipoEquip}
                                onChange={(e) => setTipoEquip(Number(e.target.value))}
                                required defaultValue=""
                            >

                                <option value="" disabled selected
                                    hidden> Selecione o tipo do equipamento</option>
                                <option value={1}>1</option>
                                <option value={2}>2</option>
                                <option value={3}>3</option>
                            </select>

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
        </div>
    );
}

export default Equipaments;