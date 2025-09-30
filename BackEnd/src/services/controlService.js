import Control from "../entities/control.js";
import { AppDataSource } from "../database/data-source.js";
import { IsNull } from "typeorm";

const controlRepository = AppDataSource.getRepository(Control);

class ControlService {
  async getControlById(id) {
    return await controlRepository.findOne({
      where: { id, deletedAt: IsNull() },
      relations: ["usuario", "laboratorio", "equipamento"],
    });
  }

  async getControls() {
    try {
      const {
        id_usuario,
        id_labs,
        id_equip,
        status,
        data_inicio,
        data_fim,
        page = 1,
        limit = 10,
      } = filtros;

      const query = controlRepository
        .createQueryBuilder("control")
        .leftJoinAndSelect("control.usuario", "usuario")
        .leftJoinAndSelect("control.equipamento", "equipamento")
        .leftJoinAndSelect("control.laboratorio", "laboratorio")
        .select([
          "control.id",
          "control.status",
          "control.data_inicio",
          "control.data_fim",
          "usuario.nome",
        ])
        .where("control.deletedAt IS NULL")
        .orderBy("control.data_inicio", "DESC");

      //Talvez mudar
      if (id_usuario) {
        query.andWhere("control.id_usuario = :id_usuario", {
          id_usuario: Number(id_usuario),
        });
      }

      //Talvez mudar
      if (id_labs) {
        query.andWhere("control.id_labs = :id_labs", {
          id_labs: Number(id_labs),
        });
      }

      //Talvez mudar
      if (id_equip) {
        query.andWhere("control.id_equip = :id_equip", {
          id_equip: Number(id_equip),
        });
      }

      if (status) {
        query.andWhere("control.status = :status", { status });
      }

      if (data_inicio && data_fim) {
        query.andWhere("control.data_inicio BETWEEN : start AND :end", {
          start: data_inicio,
          end: data_fim,
        });
      } else if (data_inicio) {
        query.andWhere("control.data_inicio >= :start", { start: data_inicio });
      } else if (data_fim) {
        query.andWhere("control.data_inicio <= :end", { end: data_fim });
      }
      //Paginação:
      const skip = (page - 1) * limit;
      query.skip(skip).take(limit);

      const [controls, total] = await query.getManyAndCount();

      return {
        controls,
        paginacao: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          totalPages: Math.ceil(total / limit),
        },
      };
    } catch (error) {
      throw new Error(`Erro ao buscar controles: ${error.message}`);
    }
  }

  async openControl(controlData) {
    const { id_usuario, id_equip, id_labs, status, aberto, data_inicio } =
      controlData;

    const newControl = controlRepository.create({
      id_usuario,
      id_equip: id_equip || null,
      id_labs: id_labs || null,
      status,
      aberto,
      data_inicio,
      createdAt: new Date(),
    });

    await controlRepository.save(newControl);

    return await controlRepository.findOne({
      where: { id: newControl.id },
      relations: ["usuario", "laboratorio", "equipamento"],
    });
  }

  async closeControl(controlData) {
    const { id, data_fim, status } = controlData;

    await controlRepository.update(
      { id },
      {
        data_fim,
        status,
        updatedAt: new Date(),
      }
    );

    return await controlRepository.findOne({
      where: { id },
      relations: ["usuario", "laboratorio", "equipamento"],
    });
  }

  async confirmAwareness(controlData) {
    const { id, aberto } = controlData;

    await controlRepository.update(
      { id },
      {
        aberto,
        updatedAt: new Date(),
      }
    );

    return await controlRepository.findOne({
      where: { id },
      relations: ["usuario", "laboratorio", "equipamento"],
    });
  }

  async deleteControl(id) {
    await controlRepository.update(
      { id },
      {
        deletedAt: new Date(),
        updatedAt: new Date(),
      }
    );
    return true;
  }
}

export default new ControlService();
