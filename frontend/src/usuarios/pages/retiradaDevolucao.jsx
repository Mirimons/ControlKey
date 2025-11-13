import { useState, useEffect } from "react";
import "./retiradaDevolucao.css";
import api from "../../services/api";

function RetiradaDevolucao() {
    const [identificacao, setIdentificacao] = useState("");
    const [tipo, setTipo] = useState("");
    const [codigo, setCodigo] = useState("");
    const [professor, setProfessor] = useState(null);
    const [erro, setErro] = useState("");

    // Chaves
    const [labs, setLabs] = useState([]);
    const [filtroLabs, setFiltroLabs] = useState([]);
    const [labSelecionado, setLabSelecionado] = useState(null);
    const [mostrarSugestoesLabs, setMostrarSugestoesLabs] = useState(false);

    // Equipamentos
    const [equipamentos, setEquipamentos] = useState([]);
    const [filtroEquip, setFiltroEquip] = useState([]);
    const [equipSelecionado, setEquipSelecionado] = useState(null);
    const [mostrarSugestoesEquip, setMostrarSugestoesEquip] = useState(false);

    // Função para retirar
    const handleRetirar = async () => {
        if (!professor) return alert("Professor não identificado!");
        if (!tipo) return alert("Selecione se é chave ou equipamento!");

        try {
            if (tipo === "chave" && labSelecionado) {
                await api.put(`/labs/${labSelecionado.id}`, { ...labSelecionado, status: "ocupado" });
                alert(`✅ Laboratório "${labSelecionado.nome_lab}" retirado com sucesso!`);
            } else if (tipo === "equipamento" && equipSelecionado) {
                await api.put(`/equipamento/${equipSelecionado.id}`, { ...equipSelecionado, status: "ocupado" });
                alert(`✅ Equipamento "${equipSelecionado.desc_equip}" retirado com sucesso!`);
            } else {
                alert("Selecione um item válido para retirar!");
            }
        } catch (err) {
            console.error("Erro ao retirar:", err);
            alert("Erro ao retirar. Tente novamente.");
        }
    };

    // Função para devolver
    const handleDevolver = async () => {
        if (!professor) return alert("Professor não identificado!");
        if (!tipo) return alert("Selecione se é chave ou equipamento!");

        try {
            if (tipo === "chave" && labSelecionado) {
                await api.put(`/labs/${labSelecionado.id}`, { ...labSelecionado, status: "livre" });
                alert(`✅ Laboratório "${labSelecionado.nome_lab}" devolvido com sucesso!`);
            } else if (tipo === "equipamento" && equipSelecionado) {
                await api.put(`/equipamento/${equipSelecionado.id}`, { ...equipSelecionado, status: "livre" });
                alert(`✅ Equipamento "${equipSelecionado.desc_equip}" devolvido com sucesso!`);
            } else {
                alert("Selecione um item válido para devolver!");
            }
        } catch (err) {
            console.error("Erro ao devolver:", err);
            alert("Erro ao devolver. Tente novamente.");
        }
    };

    // Buscar professor automaticamente
    useEffect(() => {
        if (identificacao.trim().length > 3) {
            api
                .get(`/usuario/buscar/${identificacao}`)
                .then((res) => {
                    setProfessor(res.data);
                    setErro("");
                })
                .catch(() => {
                    setProfessor(null);
                    setErro("Professor não encontrado");
                });
        } else {
            setProfessor(null);
            setErro("");
        }
    }, [identificacao]);

    // Buscar laboratórios e equipamentos quando tipo muda
    useEffect(() => {
        if (tipo === "chave") {
            api
                .get("/labs")
                .then((res) => setLabs(res.data.data || []))
                .catch((err) => console.error("Erro ao carregar labs:", err));
        } else if (tipo === "equipamento") {
            api
                .get("/equipamento")
                .then((res) => setEquipamentos(res.data.data || []))
                .catch((err) => console.error("Erro ao carregar equipamentos:", err));
        }

        // Limpa campos e sugestões ao trocar tipo
        setCodigo("");
        setLabSelecionado(null);
        setEquipSelecionado(null);
        setFiltroLabs([]);
        setFiltroEquip([]);
        setMostrarSugestoesLabs(false);
        setMostrarSugestoesEquip(false);
    }, [tipo]);

    // Filtrar laboratórios ou equipamentos conforme digita
    const handleCodigoChange = (e) => {
        const value = e.target.value;
        setCodigo(value);

        if (tipo === "chave" && value.trim().length > 0) {
            const filtrados = labs.filter(
                (lab) =>
                    lab.nome_lab.toLowerCase().includes(value.toLowerCase()) ||
                    lab.desc_lab.toLowerCase().includes(value.toLowerCase())
            );
            setFiltroLabs(filtrados);
            setMostrarSugestoesLabs(true);
        } else {
            setFiltroLabs([]);
            setMostrarSugestoesLabs(false);
        }

        if (tipo === "equipamento" && value.trim().length > 0) {
            const filtrados = equipamentos.filter(
                (equip) =>
                    equip.desc_equip.toLowerCase().includes(value.toLowerCase()) ||
                    equip.tipo.desc_tipo.toLowerCase().includes(value.toLowerCase())
            );
            setFiltroEquip(filtrados);
            setMostrarSugestoesEquip(true);
        } else {
            setFiltroEquip([]);
            setMostrarSugestoesEquip(false);
        }
    };

    // Seleção de lab ou equipamento
    const handleSelecionarLab = (lab) => {
        setCodigo(`${lab.nome_lab} - ${lab.desc_lab}`);
        setLabSelecionado(lab);
        setMostrarSugestoesLabs(false);
    };

    const handleSelecionarEquip = (equip) => {
        setCodigo(`${equip.tipo.desc_tipo} - ${equip.desc_equip}`);
        setEquipSelecionado(equip);
        setMostrarSugestoesEquip(false);
    };

    // Envio do formulário
    const handleSubmit = (e) => {
        e.preventDefault();
        if (!professor) {
            alert("Professor não identificado!");
            return;
        }
        if (!tipo) {
            alert("Selecione se é chave ou equipamento!");
            return;
        }

        console.log("✅ Retirada/Devolução registrada:");
        console.log("Professor:", professor.nome);
        console.log("Tipo:", tipo);
        console.log("Código:", codigo);
        console.log("Lab selecionado:", labSelecionado);
        console.log("Equip selecionado:", equipSelecionado);
    };

    return (
        <div className="wrapper-pagprofs">
            <div className="container-pagprofs">
                <h2>Retirada e Devolução</h2>
                <form onSubmit={handleSubmit}>
                    {/* Identificação */}
                    <label htmlFor="identificacao" className="form-label">
                        RM ou CPF:
                    </label>
                    <input
                        id="identificacao"
                        type="text"
                        placeholder="Digite seu RM ou CPF"
                        value={identificacao}
                        onChange={(e) => setIdentificacao(e.target.value)}
                        className="input-identificacao"
                    />
                    {professor && <p className="professor-encontrado">Olá, {professor.nome}!</p>}
                    {erro && <p className="erro">{erro}</p>}

                    {/* Tipo */}
                    <div className="opcoes">
                        <label className="radio-label">
                            <input
                                type="radio"
                                name="tipo"
                                value="chave"
                                checked={tipo === "chave"}
                                onChange={(e) => setTipo(e.target.value)}
                            />
                            <span className="custom-radio"></span> Chave
                        </label>
                        <label className="radio-label">
                            <input
                                type="radio"
                                name="tipo"
                                value="equipamento"
                                checked={tipo === "equipamento"}
                                onChange={(e) => setTipo(e.target.value)}
                            />
                            <span className="custom-radio"></span> Equipamento
                        </label>
                    </div>

                    {/* Código / Autocomplete */}
                    {tipo && (
                        <>
                            <label htmlFor="codigo" className="form-label">
                                {tipo === "chave"
                                    ? "Digite o nome do laboratório:"
                                    : "Digite o equipamento ou tipo:"}
                            </label>
                            <input
                                id="codigo"
                                type="text"
                                placeholder={
                                    tipo === "chave" ? "Ex: Laboratório de Redes" : "Ex: Projetor A"
                                }
                                value={codigo}
                                onChange={handleCodigoChange}
                                className="input-codigo"
                                autoComplete="off"
                            />

                            {tipo === "chave" && mostrarSugestoesLabs && filtroLabs.length > 0 && (
                                <ul className="lista-sugestoes">
                                    {filtroLabs.map((lab) => (
                                        <li
                                            key={lab.id}
                                            onClick={() => handleSelecionarLab(lab)}
                                            className="opcao-lab"
                                        >
                                            {lab.nome_lab} - {lab.desc_lab}
                                        </li>
                                    ))}
                                </ul>
                            )}

                            {tipo === "equipamento" &&
                                mostrarSugestoesEquip &&
                                filtroEquip.length > 0 && (
                                    <ul className="lista-sugestoes">
                                        {filtroEquip.map((equip) => (
                                            <li
                                                key={equip.id}
                                                onClick={() => handleSelecionarEquip(equip)}
                                                className="opcao-lab"
                                            >
                                                {equip.tipo.desc_tipo} - {equip.desc_equip}
                                            </li>
                                        ))}
                                    </ul>
                                )}
                        </>
                    )}

                    <div className="buttons">
                        <button type="button" className="btn-retirar" onClick={handleRetirar}>
                            Retirar
                        </button>
                        <button type="button" className="btn-devolver" onClick={handleDevolver}>
                            Devolver
                        </button>
                    </div>

                </form>
            </div>
        </div>
    );
}

export default RetiradaDevolucao;
