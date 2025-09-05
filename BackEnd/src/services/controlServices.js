import Control from "../entities/control.js";
import Usuario from "../entities/usuario.js";
import Equipamento from "../entities/equipamento.js";
import Labs from "../entities/labs.js";
import { AppDataSource } from "../database/data-source.js";
import { validateAndFormatDate } from "../utils/dateValidator.js";
import { Like, IsNull } from "typeorm";

const controlRepository = AppDataSource.getRepository(Control);
const usuarioRepository = AppDataSource.getRepository(Usuario);
const equipamentoRepository = AppDataSource.getRepository(Equipamento);
const labsRepository = AppDataSource.getRepository(Labs);

class ControlService {
  async getControls() {
    return await controlRepository.findBy({ 
        where: { deletedAt: IsNull()},
        relations: ['usuario', 'equipamento', 'labs'] 
        });
  }

  async getByNome(nome) {
    return await controlRepository.findBy({
        where: {
            nome: Like(`%${nome}%`),
            deletedAt: IsNull()
        },
        relations: ['usuario', 'equipamento', 'labs']
    });
  }

  async getByUsuario(id_usuario) {
    if (!id_usuario && isNaN(Number(id_usuario))) {
        throw new Error
    }
  }

  async postControl(controlData) {
const { id_usuario, id_equip, id_labs, data_inicio, data_fim, status } = controlData;

    // Validações
    if (!id_usuario || isNaN(Number(id_usuario))) {
      throw new Error("O campo 'id_usuario' é obrigatório e precisa ser numérico.");
    }

    if ((!id_equip || isNaN(Number(id_equip))) && (!id_labs || isNaN(Number(id_labs)))) {
      throw new Error("É necessário preencher um dos campos (id_equip ou id_labs).");
    }

    if (!data_inicio) {
      throw new Error("O campo 'data_inicio' é obrigatório.");
    }
    const dateValidation = validateAndFormatDate(data_inicio);
    if (!dateValidation.isValid) {
      throw new Error(dateValidation.error);
    }

    const statusLower = status?.toLowerCase();
    if (statusLower !== 'aberto' && statusLower !== 'fechado') {
      throw new Error("O status deve ser 'aberto' ou 'fechado'.");
    }

    const usuario = await usuarioRepository.findOneBy({
      id: Number(id_usuario),
      deletedAt: IsNull()
    });

    if (!usuario) {
      throw new Error("Usuário não encontrado.");
    }

    let equipamento = null;
    if (id_equip) {
      equipamento = await equipamentoRepository.findOneBy({
        id: Number(id_equip),
        deletedAt: IsNull()
      });
      if (!equipamento) {
        throw new Error("Equipamento não encontrado.");
      }
    }

     const newControl = controlRepository.create({
      id_usuario: Number(id_usuario),
      id_labs: id_labs ? Number(id_labs) : null,
      id_equip: id_equip ? Number(id_equip) : null,
      data_inicio: dateValidation.dateFormatted,
      data_fim: data_fim || null,
      status: statusLower,
      createdAt: new Date(),
      usuario,
      equipamento,
      labs: lab
    });

    await controlRepository.save(newControl);
    return newControl;
  }



}


export default ControlService();