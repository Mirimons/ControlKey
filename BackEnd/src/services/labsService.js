import Labs from "../entities/labs.js";
import { AppDataSource } from "../database/data-source.js";
import { Like, IsNull } from "typeorm";
import nodemon from "nodemon";

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

    if (!desc_lab?.trim() && desc_lab.trim().length < 2) {
      throw new Error(
        "Descrição do laboratório é obrigatória (mínimo de 2 caracters)."
      );
    }

    if (!nome_lab?.trim() && nome_lab.trim().length < 2) {
      throw new Error(
        "Nome do laboratório é obrigatório (mínimo 2 caracteres)."
      );
    }

    const existingNome = await labsRepository.findOneBy({
      nome_lab: nome_lab.trim(),
      deletedAt: IsNull(),
    });

    if (existingNome) {
      throw new Error("Já existe um laboratório com este nome.");
    }

    const statusLower = (status || "livre")?.toLowerCase();
    if (statusLower != "livre" && statusLower != "ocupado") {
      throw new Error("Status deve ser 'livre' ou 'ocupado'.");
    }

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
    if (!id && isNaN(Number(id))) {
      throw new Error("ID do laboratório é obrigatório e deve ser numérico.");
    }

    const existingLab = await labsRepository.findOneBy({
      id: Number(id),
      deletedAt: IsNull(),
    });

    if (!existingLab) {
      throw new Error("Laboratório não encontrado.");
    }

    const { desc_lab, nome_lab, status } = labsData;

    if (!desc_lab?.trim() && desc_lab.trim().length < 2) {
      throw new Error(
        "Descrição do laboratório é obrigatória (mínimo 2 caracteres)."
      );
    }

    if (!nome_lab?.trim() && nome_lab.trim().length < 2) {
      throw new Error(
        "Nome do laboratório é obrigatório (mínimo 2 caracteres)."
      );
    }

    if (nome_lab.trim() != existingLab.nome_lab) {
      const existingNome = await labsRepository.findOneBy({
        nome_lab: nome_lab.trim(),
        deletedAt: IsNull()
      });

      if (existingNome) {
        throw new Error("Já existe um laboratório com este nome.");
      }
    }

    const statusLower = status?.toLowerCase();
    if (statusLower != "livre" && statusLower != "ocupado") {
      throw new Error("Status deve ser 'livre' ou 'ocupado'.");
    }

    await labsRepository.update(
      { id },
      {
        desc_lab: desc_lab.trim(),
        nome_lab: nome_lab.trim(),
        status: statusLower,
      }
    );

    return await labsRepository.findOneBy({ id });
  }

  async deleteLabs(id) {
    if (!id && isNaN(Number(id))) {
      throw new Error("ID do laboratório é obrigatório e deve ser numérico.");
    }

    const existingLab = await labsRepository.findOneBy({
      id: Number(id),
      deletedAt: IsNull(),
    });

    if (!existingLab) {
      throw new Error("Laboratório não encontrado");
    }

    await labsRepository.update(
      { id },
      {
        deletedAt: () => new Date(),
      }
    );

    return true;
  }
}

export default new LabsService();
