import Labs from "../entities/labs.js";
import { AppDataSource } from "../database/data-source.js";
import { Like, IsNull } from "typeorm";

const labsRepository = AppDataSource.getRepository(Labs);

class LabsService {
  async getLabs() {
    return await labsRepository.findBy({ deletedAt: IsNull() });
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
