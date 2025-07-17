import express from "express";
import Agendamento from "../entities/agendamento.js";
import Labs from "../entities/labs.js";
import Usuario from "../entities/usuario.js";
import { AppDataSource } from "../database/data-source.js";
import { Like, IsNull } from "typeorm";

const route = express.Router();

const agendamentoRepository = AppDataSource.getRepository(Agendamento);
const labsRepository = AppDataSource.getRepository(Labs);
const usuarioRepository = AppDataSource.getRepository(Usuario);

route.get("/", async (request, response) => {
    const agendamento = await agendamentoRepository.findBy({ deletedAt: IsNull() });
    return response.status(200).send({ "response": agendamento });
});

route.get("/:nameFound", async (request, response) => {
    const { nameFound } = request.params;
    const agendamentoFound = await agendamentoRepository.findBy({ nome: Like(`%${nameFound}%`) });
    return response.status(200).send({ "response": agendamentoFound });
});

route.post("/", async (request, response) => {
    const { id_labs, id_usuario, data_utilizacao, hora_inicio, hora_fim, finalidade, status} = request.body;

    if (!id_labs && isNaN(Number(id_labs))) {
        return response.status(400).send({ "response": "O campo 'id_labs' é obrigatório e precisa ser numérico." });
    }
    if (!id_usuario && isNaN(Number(id_usuario))) {
        return response.status(400).send({ "response": "O campo 'id_usuario' é obrigatório e precisa ser numérico." });
    }
    if (!data_utilizacao && IsNull(Date(data_utilizacao))){
        return response.status(400).send({"response": "O campo 'data_utilizacao' é obrigatório."})
    }
    const dateValidation = validateAndFormatDate(data_utilizacao);
    if (!dateValidation.isValid) {
        return response.status(400).send({ "response": dateValidation.error });
    }
    if (!hora_inicio && IsNull(Time(hora_inicio))){
        return response.status(400).send({"response": "O campo 'hora_inicio' é obrigatório."})
    }
    if (!hora_fim && IsNull(Time(hora_fim))){
        return response.status(400).send({"response": "O campo 'hora_fim' é obrigatório."})
    }
    if (finalidade.length < 1) {
        return response.status(400).send({ "response": "O campo 'finalidade' deve ter pelo menos um caractere." });
    }
    if (status.toLowercase() != 'pendente' && status.toLowercase() != 'confirmado' && status.toLowercase() != 'cancelado'){
        return response.status(400).send({"response": "O status deve ser 'pendente', 'confirmado' ou 'cancelado'. "})
    }

    try {
        const labs = await labsRepository.findOneBy({
            id: Number(id_labs),
            deletedAt: IsNull()
        });
        const usuario = await usuarioRepository.findOneBy({
            id: Number(id_usuario),
            deletedAt: IsNull()
        });

        if (!labs && isNaN(Number(labs))) {
            return response.status(404).send({ "response": "laboratório não encontrado." });
        }
        if (!usuario && isNaN(Number(usuario))){
            return response.status(404).send({ "response": "usuario não encontrado." })
        }

        const newAgendamento = agendamentoRepository.create({
            id_labs: Number(id_labs),
            id_usuario: Number(id_usuario),
            data_utilizacao, 
            hora_inicio, 
            hora_fim, 
            finalidade, 
            status,
            createdAt: new Date(),
        });

        await agendamentoRepository.save(newAgendamento);
        return response.status(201).send({ "response": "Agendamento registrado com sucesso!" });
    } catch (error) {
        console.error("Erro ao registrar agendamento: ", error);
        return response.status(500).send({ "response": error });
    };
});

route.put("/:id", async (request, response) => {
    const { id_labs, id_usuario, data_utilizacao, hora_inicio, hora_fim, finalidade, status } = request.body;
    const { id } = request.params;

    if (!id_labs && isNaN(Number(id_labs))) {
        return response.status(400).send({ "response": "O campo 'id_labs' é obrigatório e precisa ser numérico." });
    }
    if (!id_usuario && isNaN(Number(id_usuario))) {
        return response.status(400).send({ "response": "O campo 'id_usuario' é obrigatório e precisa ser numérico." });
    }
    if (!data_utilizacao && IsNull(Date(data_utilizacao))){
        return response.status(400).send({"response": "O campo 'data_utilizacao' é obrigatório."})
    }
    if (!hora_inicio && IsNull(Time(hora_inicio))){
        return response.status(400).send({"response": "O campo 'hora_inicio' é obrigatório."})
    }
    if (!hora_fim && IsNull(Time(hora_fim))){
        return response.status(400).send({"response": "O campo 'hora_fim' é obrigatório."})
    }
    if (finalidade.length < 1) {
        return response.status(400).send({ "response": "O campo 'finalidade' deve ter pelo menos um caractere." });
    }
    if (status.toLowercase() != 'pendente' && status.toLowercase() != 'confirmado' && status.toLowercase() != 'cancelado'){
        return response.status(400).send({"response": "O status deve ser 'pendente', 'confirmado' ou 'cancelado'. "})
    }

    try {
        await agendamentoRepository.update({
            id_labs: Number(id_labs),
            id_usuario: Number(id_usuario),
            data_utilizacao, 
            hora_inicio, 
            hora_fim, 
            finalidade, 
            status
        });

        return response.status(201).send({"response": "Agendamento atualizado com sucesso!"});
        } catch(erro){
            return response.status(500).send({"error": erro});
        };
});
route.delete("/:id", async (request, response) => {
    const { id } = request.params;

    if (isNaN(Number(id))) {
        return response.status(400).send({ "response": "O 'id' precisa ser um valor numérico" });
    }
    //Soft delete
    await agendamentoRepository.update({ id }, { deletedAt: () => "CURRENT_TIMESTAMP" });

    return response.status(200).send({"response": "Agendamento excluído com sucesso!"});
});

export default route;