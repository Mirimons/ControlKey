import Labs from "../entities/labs.js";
import { AppDataSource } from "../database/data-source.js";
import { Like, IsNull } from "typeorm";

const labsRepository = AppDataSource.getRepository(Labs);

class LabsService {
  async getLabById(id) {
    return await labsRepository.findOne({
      where: { id, deletedAt: IsNull() },
    });
  }

  async getByNomeLivre(nome) {
    return await labsRepository.find({
      where: {
        nome_lab: Like(`%${nome}%`),
        status: "livre",
        deletedAt: IsNull(),
      },
    });
  }

  async getLabs(filtros = {}) {
    try {
      const {
        nome_lab,
        desc_lab,
        status,
        // page = 1,
        // limit = 10
      } = filtros;

      const query = labsRepository
        .createQueryBuilder("labs")
        .where("labs.deletedAt IS NULL");

      if (nome_lab) {
        query.andWhere("labs.nome_lab = :nome_lab", { nome_lab });
      }

      if (desc_lab) {
        query.andWhere("labs.desc_lab = :desc_lab", { desc_lab });
      }

      if (status) {
        query.andWhere("labs.status = :status", { status });
      }

      // const skip = (page - 1) * limit;
      // query.skip(skip).take(limit);

      const [labs, total] = await query.getManyAndCount();

      return {
        data: labs,
        // pagination: {
        //   page: parseInt(page),
        //   limit: parseInt(limit),
        //   total,
        //   totalPages: Math.ceil(total / limit),
        // },
      };
    } catch (error) {
      throw new Error(`Erro ao bucar laboratórios: ${error.message}`);
    }
  }

  async getByNome(nome) {
    return await labsRepository.findBy({
      nome: Like(`%${nome}%`),
      deletedAt: IsNull(),
    });
  }
  async postLabs(labsData) {
    const { desc_lab, nome_lab, status } = labsData;
    const statusLower = (status || "livre")?.toLowerCase();

    const newLab = labsRepository.create({
      desc_lab: desc_lab.trim(),
      nome_lab: nome_lab.trim(),
      status: statusLower,
      createdAt: new Date(),
    });
    await labsRepository.save(newLab);
    return newLab;
  }

  async putLabs(id, labsData) {
    const { desc_lab, nome_lab, status } = labsData;
    const existingLab = await labsRepository.findOneBy({
      id: Number(id),
      deletedAt: IsNull(),
    });
    const statusLower = (status || "livre")?.toLowerCase();
    await labsRepository.update(
      { id },
      {
        desc_lab: desc_lab,
        nome_lab: nome_lab,
        status: statusLower,
      }
    );

    return await labsRepository.findOneBy({ id });
  }

  async deleteLabs(id) {
    //Verifica se existe
    const lab = await this.getLabById(id);
    if (!lab) {
      throw new Error("Laboratório não encontrado.");
    }

    //Verifica se existem dependências
    const controlsAtivos = await AppDataSource.getRepository("Control")
      .createQueryBuilder("control")
      .where("control.id_labs = :id", { id })
      .andWhere("control.deletedAt IS NULL")
      .getCount();

    if (controlsAtivos > 0) {
      throw new Error(
        "Não é possível desativar este Laboratório, pois existem controles ativos vinculados a ele."
      );
    }

    const agendamentosAtivos = await AppDataSource.getRepository("Agendamento")
      .createQueryBuilder("agendamento")
      .where("agendamento.id_labs = :id", { id })
      .andWhere("agendamento.deletedAt IS NULL")
      .getCount();

    if (agendamentosAtivos > 0) {
      throw new Error(
        "Não foi possível desativar este Laboratório, pois existem agendamentos ativos vinculados a ele."
      );
    }

    await labsRepository.update(
      {
        id: Number(id),
      },
      { deletedAt: new Date() }
    );
    return true;
  }

  //MÉTODOS PARA ATIVAÇÃO/REATIVAÇÃO
  //Get apenas com os inativos
  async getInactiveLab() {
    const queryBuilder = labsRepository
      .createQueryBuilder("labs")
      .withDeleted()
      .where("labs.deletedAt IS NOT NULL");

    queryBuilder.orderBy("labs.deletedAt", "DESC");

    const [labs, total] = await queryBuilder.getManyAndCount();

    return {
      data: labs,
      total,
    };
  }

  //Get que inclui os inativos
  async getLabByIdIncludingInactive(id) {
    return await labsRepository.findOne({
      where: { id },
      withDeleted: true,
    });
  }

  //Função para reativar laboratório
  async activateLab(id) {
    if (isNaN(Number(id))) {
      throw new Error("O id precisa ser um valor numérico.");
    }

    const labInativo = await this.getLabByIdIncludingInactive(id);
    if (!labInativo) {
      throw new Error("Laboratório não encontrado.");
    }

    await labsRepository.update({ id }, { deletedAt: null });

    return await this.getLabById(id);
  }
}

export default new LabsService();
