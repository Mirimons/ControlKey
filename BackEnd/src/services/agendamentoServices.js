import Agendamento from "../entities/agendamento.js";
import { AppDataSource } from "../database/data-source.js";
import { Like, IsNull } from "typeorm";
import AgendamentoRequestDTO from "../DTOs/agendamentoRequestDTO.js";

const agendamentoRepository = AppDataSource.getRepository(Agendamento);

class AgendamentoService {
  async getAgendamentos(filtros = {}) {
    try {
      const {
        nomeProfessor,
        laboratorio,
        hora_inicio,
        hora_fim,
        data_utilizacao,
        status,
        page = 1,
        limit = 10,
      } = filtros;

      const query = agendamentoRepository
        .createQueryBuilder("agendamento")
        .leftJoinAndSelect("agendamento.laboratorio", "laboratorio")
        .leftJoinAndSelect("agendamento.usuario", "usuario")
        .where("agendamento.deletedAt IS NULL")
        .orderBy("agendamento.data_utilizacao", "DESC")
        .addOrderBy("agendamento.hora_inicio", "ASC");

      if (nomeProfessor) {
        query.andWhere("usuario.nome ILIKE :nome", {
          nome: `%${nomeProfessor.trim()}%`,
        });
      }

      if (laboratorio) {
        query.andWhere("laboratorio.nome_lab ILIKE :lab", {
          lab: `%${laboratorio.trim()}%`,
        });
      }

      if (data_utilizacao) {
        query.andWhere("agendamento.data_utilizacao = :dataUtil", {
          dataUtil: data_utilizacao,
        });
      }

      if (hora_inicio && hora_fim) {
        query.andWhere("agendamento.data_utilizacao BETWEEN :start AND :end", {
          start: hora_inicio,
          end: hora_fim,
        });
      } else if (hora_inicio) {
        query.andWhere("agendamento.data_utilizacao >= :start", {
          start: hora_inicio,
        });
      } else if (hora_fim) {
        query.andWhere("agendamento.data_utilizacao <= :end", {
          end: hora_fim,
        });
      }

      if (status) {
        query.andWhere("agendamento.status = :status", { status });
      }

      // Paginação
      const skip = (page - 1) * limit;
      query.skip(skip).take(limit);

      const [agendamentos, total] = await query.getManyAndCount();

      const agendamentoDTO = new AgendamentoRequestDTO();
      const agendamentosAtualizados = await Promise.all(
        agendamentos.map((agendamento) =>
          agendamentoDTO.verificarAtualizarStatus(agendamento)
        )
      );
      return {
        agendamentos: agendamentosAtualizados,
        paginacao: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          totalPages: Math.ceil(total / limit),
        },
      };
    } catch (error) {
      throw new Error(`Erro ao buscar agendamentos: ${error.message}`);
    }
  }

  async getAgendamentoById(id) {
    try {
      const agendamento = await agendamentoRepository.findOne({
        where: { id: Number(id), deletedAt: IsNull() },
        relations: ["laboratorio", "usuario"],
      });

      if (!agendamento) {
        throw new Error("Agendamento não encontrado");
      }

      const agendamentoDTO = new AgendamentoRequestDTO();
      return await agendamentoDTO.verificarAtualizarStatus(agendamento);
    } catch (error) {
      throw new Error(`Erro ao buscar agendamento: ${error.message}`);
    }
  }

  async postAgendamento(agendamentoData) {
    try {
      const {
        id_labs,
        id_usuario,
        data_utilizacao,
        hora_inicio,
        hora_fim,
        finalidade,
        laboratorio,
        usuario,
      } = agendamentoData;

      const novoAgendamento = agendamentoRepository.create({
        id_labs: Number(id_labs),
        id_usuario: Number(id_usuario),
        laboratorio,
        usuario,
        data_utilizacao,
        hora_inicio,
        hora_fim,
        finalidade: finalidade,
        status: "pendente",
        createdAt: new Date(),
      });

      await agendamentoRepository.save(novoAgendamento);
      return novoAgendamento;
    } catch (error) {
      throw new Error(`Erro ao criar agendamento: ${error.message}`);
    }
  }

  async putAgendamento(id, agendamentoData) {
    try {
      const dadosAtualizacao = {};

      if (agendamentoData.id_labs !== undefined)
        dadosAtualizacao.id_labs = Number(agendamentoData.id_labs);
      if (agendamentoData.id_usuario !== undefined)
        dadosAtualizacao.id_usuario = Number(agendamentoData.id_usuario);
      if (agendamentoData.data_utilizacao !== undefined)
        dadosAtualizacao.data_utilizacao = agendamentoData.data_utilizacao;
      if (agendamentoData.hora_inicio !== undefined)
        dadosAtualizacao.hora_inicio = agendamentoData.hora_inicio;
      if (agendamentoData.hora_fim !== undefined)
        dadosAtualizacao.hora_fim = agendamentoData.hora_fim;
      if (agendamentoData.finalidade !== undefined)
        dadosAtualizacao.finalidade = agendamentoData.finalidade;
      if (agendamentoData.status !== undefined)
        dadosAtualizacao.status = agendamentoData.status;

      await agendamentoRepository.update({ id: Number(id) }, dadosAtualizacao);

      return await this.getAgendamentoById(id);
    } catch (error) {
      throw new Error(`Erro ao atualizar agendamento: ${error.message}`);
    }
  }

  async deleteAgendamento(id) {
    try {
      await agendamentoRepository.update(
        { id: Number(id) },
        { deletedAt: new Date() }
      );

      return true;
    } catch (error) {
      throw new Error(`Erro ao excluir agendamento: ${error.message}`);
    }
  }
}

export default new AgendamentoService();
