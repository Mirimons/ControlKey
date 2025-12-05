import Agendamento from "../entities/agendamento.js";
import { AppDataSource } from "../database/data-source.js";
import { IsNull } from "typeorm";

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
        // page = 1,
        // limit = 10,
      } = filtros;

      const query = agendamentoRepository
        .createQueryBuilder("agendamento")
        .leftJoinAndSelect("agendamento.laboratorio", "laboratorio")
        .leftJoinAndSelect("agendamento.usuario", "usuario")
        .where("agendamento.deletedAt IS NULL")
        .orderBy("agendamento.data_utilizacao", "DESC")
        .addOrderBy("agendamento.hora_inicio", "ASC");

      if (nomeProfessor) {
        query.andWhere("usuario.nome LIKE :nome", {
          nome: `%${nomeProfessor.trim()}%`,
        });
      }

      if (laboratorio) {
        query.andWhere("laboratorio.nome_lab LIKE :lab", {
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
      // const skip = (page - 1) * limit;
      // query.skip(skip).take(limit);

      const [agendamentos, total] = await query.getManyAndCount();

      return {
        agendamentos: agendamentos,
        // paginacao: {
        //   page: parseInt(page),
        //   limit: parseInt(limit),
        //   total,
        //   totalPages: Math.ceil(total / limit),
        // },
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

      return agendamento;
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
        status: "agendado",
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

  //Para mudar status dos agendamentos:
  async putStatusAuto() {
    try {
      const agora = new Date();
      const dataAtual = new Date(
        agora.getFullYear(),
        agora.getMonth(),
        agora.getDate()
      );

      console.log(
        `Verificando agendamentos com data anterior a: ${
          dataAtual.toISOString().split("T")[0]
        }`
      );

      //Busca agendamentos que precisam da atualização
      const agendamentosToPut = await agendamentoRepository
        .createQueryBuilder("agendamento")
        .where("agendamento.data_utilizacao < :dataAtual", { dataAtual })
        .andWhere("agendamento.status = :status", { status: "agendado" })
        .andWhere("agendamento.deletedAt IS NULL")
        .getMany();

      console.log(
        `${agendamentosToPut.length} agendamentos encontrados para atualização`
      );

      if (agendamentosToPut.length === 0) {
        return 0;
      }

      const resultado = await agendamentoRepository
        .createQueryBuilder()
        .update(Agendamento)
        .set({
          status: "finalizado",
          updatedAt: new Date(),
        })
        .where("id IN (:...ids)", {
          ids: agendamentosToPut.map((a) => a.id),
        })
        .execute();

      agendamentosToPut.forEach((agendamento) => {
        console.log(
          `Agendamento ${agendamento.id} (${agendamento.data_utilizacao}): agendado -> finalizado`
        );
      });

      return resultado.affected || 0;
    } catch (error) {
      console.error("Erro ao atualizar status dos agendamentos: ", error);
      throw new Error(`Erro ao atualizar status automático: ${error.message}`);
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

  //MÉTODOS PARA ATIVAÇÃO/REATIVAÇÃO
  //Get apenas com os inativos
  async getInactiveAgend() {
    const queryBuilder = agendamentoRepository
    .createQueryBuilder("agendamento")
    .leftJoinAndSelect("agendamento.laboratorio", "laboratorio")
    .leftJoinAndSelect("agendamento.usuario", "usuario")
    .withDeleted()
    .where("agendamento.deletedAt IS NOT NULL");

  queryBuilder.orderBy("agendamento.deletedAt", "DESC");

  const [agendamentos, total] = await queryBuilder.getManyAndCount();

  return {
    data: agendamentos,  
    total,
  };
  }

  //Get que inclui os inativos
  async getAgendByIdIncludingInactive(id) {
    return await agendamentoRepository.findOne({
      where: { id: Number(id) },
      relations: ["laboratorio", "usuario"],
      withDeleted: true,
    });
  }

  //Função para reativar agendamento
  async activateAgend(id) {
    if (isNaN(Number(id))) {
      throw new Error("O id precisa ser um valor numérico.");
    }

    const agendInativo = await this.getAgendByIdIncludingInactive(id);
    if (!agendInativo) {
      throw new Error("Agendamento não encontrado.");
    }
    if (agendInativo.deletedAt === null) {
      throw new Error("Este agendamento já está ativo.");
    }

    await agendamentoRepository.update(
      { id: Number(id) },
      { deletedAt: null, updatedAt: new Date() }
    );

    return await this.getAgendamentoById(id);
  }
}

export default new AgendamentoService();
