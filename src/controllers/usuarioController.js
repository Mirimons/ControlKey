import express from "express";
import Usuario from "../entities/usuario.js";
import TipoUsuario from "../entities/tipo_usuario.js";
import { AppDataSource } from "../database/data-source.js";
import { Like, IsNull } from "typeorm";
import { validateAndFormatDate } from "../utils/dateValidator.js";

const route = express.Router();

const usuarioRepository = AppDataSource.getRepository(Usuario);
const tipo_usuarioRepository = AppDataSource.getRepository(TipoUsuario);

route.get("/", async (request, response) => {
    const usuarios = await usuarioRepository.findBy({ deletedAt: IsNull() });
    return response.status(200).send({ "response": usuarios });
});

route.get("/:nameFound", async (request, response) => {
    const { nameFound } = request.params;
    const usuarioFound = await usuarioRepository.findBy({ nome: Like(`%${nameFound}%`) });
    return response.status(200).send({ "response": usuarioFound });
});

route.post("/", async (request, response) => {
    const { id_tipo, nome, cpf, data_nasc, telefone } = request.body;

    if (!id_tipo && isNaN(Number(id_tipo))) {
        return response.status(400).send({ "response": "O campo 'id_tipo' é obrigatório e precisa ser numérico." });
    }

    if (!nome?.trim() && nome.length < 2) {
        return response.status(400).send({ "response": "O campo 'nome' deve ter pelo menos 1 caractere." });
    }

    if (!cpf && cpf.length != 11 && isNaN(Number(cpf))) {
        return response.status(400).send({ "response": "O campo 'cpf' está no padrão incorreto. É preciso ter 11 dígitos." });
    }

    //Validação se a data foi preenchida
    if (!data_nasc) {
        return response.status(400).send({ "response": "O campo 'data_nasc' é obrigatório." })
    }
    //Chamada da função
    const dateValidation = validateAndFormatDate(data_nasc);
    if (!dateValidation.isValid) {
        return response.status(400).send({ "response": dateValidation.error });
    }

    if (!telefone && isNaN(telefone)) {
        return response.status(400).send({ "response": "O campo 'telefone' é obrigatório e precisa ser numérico." });
    }

    try {
        //Verifica se o tipo de usuario existe
        //Foreign Key
        const tipo_usuario = await tipo_usuarioRepository.findOneBy({
            id: Number(id_tipo),
            deletedAt: IsNull()
        });

        if (!tipo_usuario) {
            return response.status(404).send({ "response": "Tipo de usuário informado não encontrado." });
        }

        //Verifica se o CPF já existe  
        const usuarioExiste = await usuarioRepository.findOneBy({
            cpf,
            deletedAt: IsNull()
        });

        if (usuarioExiste) {
            return response.status(409).send({ "response": "CPF já cadastrado." });
        }

        //Criar um novo usuário
        const newUsuario = usuarioRepository.create({
            id_tipo: Number(id_tipo),
            tipo: tipo_usuario,
            nome: nome.trim(),
            cpf,
            data_nasc: dateValidation.dateFormatted,
            telefone: telefone.toString().trim(),
            createdAt: new Date()
        });

        await usuarioRepository.save(newUsuario);
        return response.status(201).send({ "response": "Usuário cadastrado com sucesso!" });

    } catch (error) {
        console.error("Erro ao cadastrar usuário: ", error)
        return response.status(500).send({ "response": error });
    }
});

route.put("/:id", async (request, response) => {
    const { id_tipo, nome, cpf, data_nasc, telefone } = request.body;
    const { id } = request.params;

    if (isNaN(Number(id))) {
        return response.status(400).send({ "response": "O campo 'id' precisa ser um valor numérico." });
    }

    if (!id_tipo && isNaN(Number(id_tipo))) {
        return response.status(400).send({ "response": "O campo 'id_tipo' é obrigatório e precisa ser numérico." });
    }

    if (!nome?.trim() && nome.length < 2) {
        return response.status(400).send({ "response": "O campo 'nome' deve ter pelo menos 1 caractere." });
    }

    if (!cpf && cpf.length != 11 && isNaN(Number(cpf))) {
        return response.status(400).send({ "response": "O campo 'cpf' está no padrão incorreto. É preciso ter 11 dígitos." });
    }

    //Validação se a data foi preenchida
    if (!data_nasc) {
        return response.status(400).send({ "response": "O campo 'data_nasc' é obrigatório." })
    }
    //Chamada da função
    const dateValidation = validateAndFormatDate(data_nasc);
    if (!dateValidation.isValid) {
        return response.status(400).send({ "response": dateValidation.error });
    }

    if (!telefone && isNaN(telefone)) {
        return response.status(400).send({ "response": "O campo 'telefone' é obrigatório e precisa ser numérico." });
    }

    try {
        //Verifica se o tipo de usuario existe
        //Foreign Key
        const tipo_usuario = await tipo_usuarioRepository.findOneBy({
            id: Number(id_tipo),
            deletedAt: IsNull()
        });

        if (!tipo_usuario) {
            return response.status(404).send({ "response": "Tipo de usuário informado não encontrado." });
        }

        await usuarioRepository.update({ id, id_tipo, nome, cpf, data_nasc, telefone });
        return response.status(201).send({ "response": "Usuário atualizado com sucesso!" });

    } catch (error) {
        console.error("Erro ao atualizar usuário:", error);
        return response.status(500).send({ "response": error });
    }
});

route.delete('/:id', async (request, response) => {
    const { id } = request.params;

    if (isNaN(Number(id))) {
        return response.status(400).send({ "response": "O id precisa ser um valor numérico." });
    }

    //Hard delete:
    // await userRepository.delete({id});

    await usuarioRepository.update({ id }, { deletedAt: () => "CURRENT_TIMESTAMP" });

    return response.status(200).send({ "response": "Usuário excluído com sucesso!" });
});

export default route;