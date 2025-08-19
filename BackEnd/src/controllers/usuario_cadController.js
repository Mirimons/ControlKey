import express from "express";
import usuarioCadService from "../services/usuarioCadService";

const route = express.Router();

route.get("/", async (request, response) => {
    try {
        const usuariosCad = await usuarioCadService.getUsuarioCad();
        return response.status(200).json({ response: usuariosCad });
    } catch (error) {
        return response.status(500).json({ response: error.message })
    }
});

route.get("/:nameFound", async (request, response) => {
    try {
        const { nameFound } = request.params;
        const usuarioCadFound = await usuarioCadService.getByNome(nameFound);
        return response.status(200).json({ response: usuarioCadFound });
    } catch (error) {
        return response.status(500).json({ response: error.message });
    }
});

route.post("/", async (request, response) => {
    try {
        const novoUsuarioCad = await usuarioCadService.postUsuarioCad(request.body);
        return response.status(201).json({
            response: "Cadastro do usuário realizado com sucesso!",
            usuarioCad: novoUsuarioCad
        });
    } catch (error) {
        console.error("Erro ao cadastrar usuário: ", error);
        if (
            error.message.includes("Já cadastrado") || error.message.includes("Não encontrado")
        ) {
            return response.status(409).json({ response: error.message });
        }
        return response.status(400).json({ response: error.message });
    }
});

route.put("/:id", async (request, response) => {
    try {
        const { id } = request.params;
        const usuarioCadAtualizado = await usuarioCadService.putUsuarioCad(id, request.body);
        return response.status(200).json({
            response: "Usuário atualizado com sucesso!",
            usuarioCad: usuarioCadAtualizado
        });
    } catch (error) {
        console.error("Erro ao atualizar usuário:", error);
        return response.status(400).json({ response: error.message });
    }
});
route.delete('/:id', async (request, response) => {
    try {
        const { id } = request.params;
        await usuarioCadService.deleteUsuarioCad(id);
        return response.status(200).json({response: "Usuário excluído com sucesso!"});
    } catch (error) {
        console.error("Erro ao excluir usuário: ", error);
        return response.status(400).json({response: error.message});
    }
});

export default route;