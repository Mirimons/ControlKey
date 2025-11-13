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
    await labsRepository.update({ id }, { deletedAt: new Date() });
    return true;
  }
}

export default new LabsService();
