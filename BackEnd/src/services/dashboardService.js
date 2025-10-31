import { AppDataSource } from "../database/data-source.js";
import Laboratorio from "../entities/labs.js";
import Agendamento from "../entities/agendamento.js";
import Control from "../entities/control.js";
import { IsNull, MoreThan, Between } from "typeorm";

const labsRepository = AppDataSource.getRepository(Laboratorio);
const agendamentoRepository = AppDataSource.getRepository(Agendamento);
const controlRepository = AppDataSource.getRepository(Control);

class DashboardService {
  async getHomeStats() {
    try {
      //TOTAL DE CHAVES (Total de laboratórios cadastrados)
      const totalLabs = await labsRepository.count({
        where: { deletedAt: IsNull() },
      });

      //CHAVES OCUPADAS (Laboratórios ocupados no momento)
      const labsOcupados = await labsRepository.count({
        where: {
          status: "ocupado",
          deletedAt: IsNull(),
        },
      });

      //Reservas pendentes (agendamentos com status: agendado)
      const agora = new Date();
      const hoje = new Date(
        agora.getFullYear(),
        agora.getMonth(),
        agora.getDate()
      );

      const reservasAgendadas = await agendamentoRepository.count({
        where: {
          status: "agendado",
          data_utilizacao: MoreThan(hoje),
          deletedAt: IsNull(),
        },
      });

      //Chaves atrasadas (controls com status: pendente)
      const chavesAtrasadas = await controlRepository.count({
        where: {
          status: "pendente",
          deletedAt: IsNull(),
        },
      });

      return {
        totalChaves: totalLabs,
        chavesEmprestadas: labsOcupados,
        reservasAgendadas: reservasAgendadas,
        chavesAtrasadas: chavesAtrasadas,
      };
    } catch (error) {
      console.error("Erro ao buscar stats do dashboard: ", error);
      throw new Error(`Erro ao buscar stats do dashboard: ${error.message}`);
    }
  }

  async getDashboardDetails() {
    //Detalhes mais importantes
    const agora = new Date();
    const hoje = new Date(
      agora.getFullYear(),
      agora.getMonth(),
      agora.getDate()
    );
    const amanha = new Date(hoje);
    amanha.setDate(amanha.getDate() + 1);
    const ontem = new Date(hoje);
    ontem.setDate(ontem.getDate() - 1);
    const fimOntem = new Date(ontem);
    fimOntem.setHours(23, 59, 59, 999);

    try {
      // Controls que estão atrasadas (pendentes) dia anterior
      const controlsAtrasadas = await controlRepository.find({
        where: {
          status: "pendente",
          data_fim: Between(ontem, hoje),
          deletedAt: IsNull(),
        },
        relations: ["usuario", "laboratorio", "equipamento"],
        order: { data_inicio: "DESC" },
      });


      // Reservas das próximas 24h
      const reservasProximas = await agendamentoRepository.find({
        where: {
          status: "agendado",
          data_utilizacao: Between(hoje, amanha),
          deletedAt: IsNull(),
        },
        relations: ["usuario", "laboratorio"],
        order: { data_utilizacao: "ASC", hora_inicio: "ASC" },
        take: 15,
      });

      return {
        controlsAtrasadas: controlsAtrasadas.map((control) => ({
          id: control.id,
          tipo: "atraso",
          laboratorio:
            control.laboratorio?.nome_lab || "Laboratório não encontrado",
          equipamento:
            control.equipamento?.desc_equip || "Equipamento não encontrado",
          usuario: control.usuario?.nome || "Usuário não encontrado",
          data_inicio: control.data_inicio,
          data_fim: control.data_fim,
          status: control.status,
          timestamp: new Date(control.data_inicio).getTime(),
        })),
        reservasProximas: reservasProximas.map((agendamento) => ({
          id: agendamento.id,
          tipo: "reserva",
          laboratorio:
            agendamento.laboratorio?.nome_lab || "Laboratório não encontrado",
          usuario: agendamento.usuario?.nome || "Usuário não encontrado",
          data_utilizacao: agendamento.data_utilizacao,
          hora_inicio: agendamento.hora_inicio,
          hora_fim: agendamento.hora_fim,
          finalidade: agendamento.finalidade,
          status: agendamento.status,
          timestamp: new Date(
            agendamento.data_utilizacao + "T" + agendamento.hora_inicio
          ).getTime(),
        })),
      };
    } catch (error) {
      console.error("Erro ao buscar detalhes do dashboard: ", error);
      throw new Error(`Erro ao buscar detalhes do dashboard: ${error.message}`);
    }
  }

  // async getLastUpdateTimestamps() {
  //   try {
  //     // Pega o último update de cada tabela
  //     const lastControl = await controlRepository.findOne({
  //       where: { deletedAt: IsNull() },
  //       order: { updatedAt: 'DESC' },
  //       select: ['updatedAt']
  //     });

  //     const lastAgendamento = await agendamentoRepository.findOne({
  //       where: { deletedAt: IsNull() },
  //       order: { updatedAt: 'DESC' },
  //       select: ['updatedAt']
  //     });

  //     const lastLaboratorio = await labsRepository.findOne({
  //       where: { deletedAt: IsNull() },
  //       order: { updatedAt: 'DESC' },
  //       select: ['updatedAt']
  //     });
  //     return {
  //       lastControlUpdate: lastControl?.updatedAt?.getTime() || 0,
  //       lastAgendamentoUpdate: lastAgendamento?.updatedAt?.getTime() || 0,
  //       lastLaboratorioUpdate: lastLaboratorio?.updatedAt?.getTime() || 0,
  //       serverTimestamp: Date.now()
  //     };
  //   } catch (error) {
  //     throw new Error(`Erro ao buscar timestamps: ${error.message}`);
  //   }
  // }
}

export default new DashboardService();
