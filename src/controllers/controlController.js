import express from "express";
import Control from "../entities/control.js";
import Usuario from "../entities/usuario.js";
import Equipamento from "../entities/equipamento.js";
import Labs from "../entities/labs.js";
import { AppDataSource } from "../database/data-source.js";
import { Like, IsNull } from "typeorm";

const route = express.Router();

const controlRepository = AppDataSource.getRepository(Control);
const usuarioRepository = AppDataSource.getRepository(Usuario);
const equipamentoRepository = AppDataSource.getRepository(Equipamento);
const labsRepository = AppDataSource.getRepository(Labs);

route.get("/", async (request, response) => {
    const control = await controlRepository.findBy({ deletedAt: IsNull() });
    return response.status(200).send({ "response": control });
});

route.get("/:nameFound", async (request, response) => {
    const { nameFound } = request.params;
    const controlFound = await controlRepository.findBy({ nome: Like(`%${nameFound}%`) });
    return response.status(200).send({ "response": controlFound });
});

route.post("/", async (request, response) => {
    //data_fim na const talvez
    const { id_usuario, id_equip, id_labs, data_inicio, status } = request.body;
    if (!id_usuario && isNaN(Number(id_usuario))) {
        return response.status(400).send({ "response": "O campo 'id_usuario' é obrigatório e precisa ser numérico." });
    }
    if (!id_equip && isNaN(Number(id_equip))) {
        return response.status(400).send({ "response": "O campo 'id_equip' é obrigatório e precisa ser numérico." });
    }
    if (!id_labs && isNaN(Number(id_labs))) {
        return response.status(400).send({ "response": "O campo 'id_labs' é obrigatório e precisa ser numérico." });
    }
    if (!data_inicio && IsNull(Date(data_inicio))){
        return response.status(400).send({"response": "O campo 'data_inicio' é obrigatório."})
    }
    const dateValidation = validateAndFormatDate(data_inicio);
    if (!dateValidation.isValid) {
        return response.status(400).send({ "response": dateValidation.error });
    }
    if (status.toLowercase() != 'aberto' && status.toLowercase() != 'fechado'){
        return response.status(400).send({"response": "O status deve ser 'aberto' ou 'fechado'. "})
    }
    
    try {
        const usuario = await usuarioRepository.findOneBy({
            id: Number(id_usuario),
            deletedAt: IsNull()
        });
        const equipamento = await equipamentoRepository.findOneBy({
            id: Number(id_equip),
            deletedAt: IsNull()
        });
        const labs = await labsRepository.findOneBy({
            id: Number(id_labs),
            deletedAt: IsNull()
        });
    
        if (!usuario && isNaN(Number(usuario))) {
            return response.status(404).send({ "response": "laboratório não encontrado." });
        }
        if (!equipamento && isNaN(Number(equipamento))){
            return response.status(404).send({ "response": "usuario não encontrado." })
        }
        if (!labs && isNaN(Number(labs))){
            return response.status(404).send({ "response": "usuario não encontrado." })
        }
    
        const newControl = controlRepository.create({
            id_labs: Number(id_labs),
            id_usuario: Number(id_usuario),
            id_equip: Number(id_equip),
            data_inicio, 
            data_fim,
            status,
            createdAt: new Date(),
        });
    
        await controlRepository.save(newControl);
        return response.status(201).send({ "response": "Control registrado com sucesso!" });
    } catch (error) {
        console.error("Erro ao registrar control: ", error);
        return response.status(500).send({ "response": error });
    };
});
route.put("/:id", async (request, response) => {
    const { id_usuario, id_equip, id_labs, data_inicio, status } = request.body;
    const { id } = request.params;

    if (!id_usuario && isNaN(Number(id_usuario))) {
        return response.status(400).send({ "response": "O campo 'id_usuario' é obrigatório e precisa ser numérico." });
    }
    if (!id_equip && isNaN(Number(id_equip))) {
        return response.status(400).send({ "response": "O campo 'id_equip' é obrigatório e precisa ser numérico." });
    }
    if (!id_labs && isNaN(Number(id_labs))) {
        return response.status(400).send({ "response": "O campo 'id_labs' é obrigatório e precisa ser numérico." });
    }
    if (!data_inicio && IsNull(Date(data_inicio))){
        return response.status(400).send({"response": "O campo 'data_inicio' é obrigatório."})
    }
    const dateValidation = validateAndFormatDate(data_inicio);
    if (!dateValidation.isValid) {
        return response.status(400).send({ "response": dateValidation.error });
    }
    if (status.toLowercase() != 'aberto' && status.toLowercase() != 'fechado'){
        return response.status(400).send({"response": "O status deve ser 'aberto' ou 'fechado'. "})
    }

    try {
        await controlRepository.update({
            id_labs: Number(id_labs),
            id_usuario: Number(id_usuario),
            id_equip: Number(id_equip),
            data_inicio, 
            data_fim,
            status,
        });

        return response.status(201).send({"response": "Control atualizado com sucesso!"});
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

    return response.status(200).send({"response": "Control excluído com sucesso!"});
});

export default route;