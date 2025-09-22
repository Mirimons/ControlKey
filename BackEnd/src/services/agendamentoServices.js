import Agendamento from "../entities/agendamento.js";
import Labs from "../entities/labs.js";
import Usuario from "../entities/usuario.js";
import { AppDataSource } from "../database/data-source.js";
import { IsNull } from "typeorm";

const agendamentoRepository = AppDataSource.getRepository(Agendamento);
const labsRepository = AppDataSource.getRepository(Labs);
const usuarioRepository = AppDataSource.getRepository(Usuario);

class AgendamentoService {
  async getAgendamentos(filtros = {}) {
    try {
      const {
        nomeProfessor,
        laboratorio,
        dataInicio,
        dataUtilizacao,
        dataFim,
        status,
        page = 1,
        limit = 10
      } = filtros;

      const query = agendamentoRepository
        .createQueryBuilder("agendamento")
        .leftJoinAndSelect("agendamento.laboratorio", "laboratorio")
        .leftJoinAndSelect("agendamento.usuario", "usuario")
        .where("agendamento.deletedAt IS NULL")
        .orderBy("agendamento.data_utilizacao", "DESC")
        .addOrderBy("agendamento.hora_inicio", "ASC");

      // 🔎 Filtros
      if (nomeProfessor) {
        query.andWhere("usuario.nome ILIKE :nome", { 
          nome: `%${nomeProfessor.trim()}%` 
        });
      }

      if (laboratorio) {
        query.andWhere("laboratorio.nome_lab ILIKE :lab", { 
          lab: `%${laboratorio.trim()}%` 
        });
      }

      if (dataUtilizacao) {
        query.andWhere("agendamento.data_utilizacao = :dataUtil", { 
          dataUtil: dataUtilizacao 
        });
      }

      if (dataInicio && dataFim) {
        query.andWhere("agendamento.data_utilizacao BETWEEN :start AND :end", {
          start: dataInicio,
          end: dataFim
        });
      } else if (dataInicio) {
        query.andWhere("agendamento.data_utilizacao >= :start", {
          start: dataInicio
        });
      } else if (dataFim) {
        query.andWhere("agendamento.data_utilizacao <= :end", {
          end: dataFim
        });
      }

      if (status) {
        query.andWhere("agendamento.status = :status", { status });
      }

      // 📄 Paginação
      const skip = (page - 1) * limit;
      query.skip(skip).take(limit);

      const [agendamentos, total] = await query.getManyAndCount();

      return {
        agendamentos,
        paginacao: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          totalPages: Math.ceil(total / limit)
        }
      };
    } catch (error) {
      throw new Error(`Erro ao buscar agendamentos: ${error.message}`);
    }
  }

  async getAgendamentoById(id) {
    try {
      if (!id || isNaN(Number(id))) {
        throw new Error("ID do agendamento é obrigatório e deve ser numérico");
      }

      const agendamento = await agendamentoRepository.findOne({
        where: { id: Number(id), deletedAt: IsNull() },
        relations: ["laboratorio", "usuario"]
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
        finalidade
      } = agendamentoData;

      // ✅ Validações
      if (!id_labs || isNaN(Number(id_labs))) {
        throw new Error("ID do laboratório é obrigatório e deve ser numérico");
      }

      if (!id_usuario || isNaN(Number(id_usuario))) {
        throw new Error("ID do usuário é obrigatório e deve ser numérico");
      }

      if (!data_utilizacao) {
        throw new Error("Data de utilização é obrigatória");
      }

      if (!hora_inicio) {
        throw new Error("Hora de início é obrigatória");
      }

      if (!hora_fim) {
        throw new Error("Hora de fim é obrigatória");
      }

      if (!finalidade?.trim() || finalidade.length < 5) {
        throw new Error("Finalidade deve ter pelo menos 5 caracteres");
      }

      if (hora_inicio >= hora_fim) {
        throw new Error("Hora de início deve ser anterior à hora de fim");
      }

      // ✅ Verificar se laboratório existe
      const laboratorio = await labsRepository.findOne({
        where: { id: Number(id_labs), deletedAt: IsNull() }
      });

      if (!laboratorio) {
        throw new Error("Laboratório não encontrado");
      }

      // ✅ Verificar se usuário existe
      const usuario = await usuarioRepository.findOne({
        where: { id: Number(id_usuario), deletedAt: IsNull() }
      });

      if (!usuario) {
        throw new Error("Usuário não encontrado");
      }

      // ✅ Verificar conflitos de agendamento
      const conflitos = await this.verificarConflitosAgendamento(
        Number(id_labs),
        data_utilizacao,
        hora_inicio,
        hora_fim
      );

      if (conflitos.length > 0) {
        throw new Error("Conflito de agendamento: laboratório já reservado neste horário");
      }

      // ✅ Criar agendamento
      const novoAgendamento = agendamentoRepository.create({
        id_labs: Number(id_labs),
        id_usuario: Number(id_usuario),
        laboratorio,
        usuario,
        data_utilizacao,
        hora_inicio,
        hora_fim,
        finalidade: finalidade.trim(),
        status: "pendente",
        createdAt: new Date()
      });

      await agendamentoRepository.save(novoAgendamento);
      return novoAgendamento;

    } catch (error) {
      throw new Error(`Erro ao criar agendamento: ${error.message}`);
    }
  }

  async putAgendamento(id, agendamentoData) {
    try {
      if (!id || isNaN(Number(id))) {
        throw new Error("ID do agendamento é obrigatório e deve ser numérico");
      }

      const agendamentoExistente = await agendamentoRepository.findOne({
        where: { id: Number(id), deletedAt: IsNull() }
      });

      if (!agendamentoExistente) {
        throw new Error("Agendamento não encontrado");
      }

      const {
        id_labs,
        id_usuario,
        data_utilizacao,
        hora_inicio,
        hora_fim,
        finalidade,
        status
      } = agendamentoData;

      // ✅ Validações (similar ao post)
      if (id_labs && isNaN(Number(id_labs))) {
        throw new Error("ID do laboratório deve ser numérico");
      }

      if (id_usuario && isNaN(Number(id_usuario))) {
        throw new Error("ID do usuário deve ser numérico");
      }

      if (finalidade && (!finalidade.trim() || finalidade.length < 5)) {
        throw new Error("Finalidade deve ter pelo menos 5 caracteres");
      }

      if (hora_inicio && hora_fim && hora_inicio >= hora_fim) {
        throw new Error("Hora de início deve ser anterior à hora de fim");
      }

      // ✅ Atualizar agendamento
      const dadosAtualizacao = {};
      
      if (id_labs) dadosAtualizacao.id_labs = Number(id_labs);
      if (id_usuario) dadosAtualizacao.id_usuario = Number(id_usuario);
      if (data_utilizacao) dadosAtualizacao.data_utilizacao = data_utilizacao;
      if (hora_inicio) dadosAtualizacao.hora_inicio = hora_inicio;
      if (hora_fim) dadosAtualizacao.hora_fim = hora_fim;
      if (finalidade) dadosAtualizacao.finalidade = finalidade.trim();
      if (status) dadosAtualizacao.status = status;

      await agendamentoRepository.update({ id: Number(id) }, dadosAtualizacao);

      return await this.getAgendamentoById(id);

    } catch (error) {
      throw new Error(`Erro ao atualizar agendamento: ${error.message}`);
    }
  }

  async deleteAgendamento(id) {
    try {
      if (!id || isNaN(Number(id))) {
        throw new Error("ID do agendamento é obrigatório e deve ser numérico");
      }

      const agendamento = await agendamentoRepository.findOne({
        where: { id: Number(id), deletedAt: IsNull() }
      });

      if (!agendamento) {
        throw new Error("Agendamento não encontrado");
      }

      await agendamentoRepository.update(
        { id: Number(id) }, 
        { deletedAt: new Date() }
      );

      return true;

    } catch (error) {
      throw new Error(`Erro ao excluir agendamento: ${error.message}`);
    }
  }

  async verificarConflitosAgendamento(idLaboratorio, dataUtilizacao, horaInicio, horaFim, agendamentoId = null) {
    const query = agendamentoRepository
      .createQueryBuilder("agendamento")
      .where("agendamento.id_labs = :idLaboratorio", { idLaboratorio })
      .andWhere("agendamento.data_utilizacao = :dataUtilizacao", { dataUtilizacao })
      .andWhere("agendamento.status != :status", { status: "cancelado" })
      .andWhere("agendamento.deletedAt IS NULL");

    // Excluir o próprio agendamento na atualização
    if (agendamentoId) {
      query.andWhere("agendamento.id != :agendamentoId", { agendamentoId });
    }

    query.andWhere(
      `(agendamento.hora_inicio BETWEEN :horaInicio AND :horaFim 
       OR agendamento.hora_fim BETWEEN :horaInicio AND :horaFim
       OR (:horaInicio BETWEEN agendamento.hora_inicio AND agendamento.hora_fim
           AND :horaFim BETWEEN agendamento.hora_inicio AND agendamento.hora_fim))`,
      { horaInicio, horaFim }
    );

    return await query.getMany();
  }
}

export default new AgendamentoService();