import { AppDataSource } from "../database/data-source.js";
import Equipamento from "../entities/equipamento.js";
import Laboratorio from "../entities/labs.js";
import Agendamento from "../entities/agendamento.js";
import Control from "../entities/control.js";
import { IsNull, LessThan, MoreThan, Between, Not } from "typeorm";

const equipamentoRepository = AppDataSource.getRepository(Equipamento);
const labRepository = AppDataSource.getRepository(Laboratorio);
const agendamentoRepository = AppDataSource.getRepository(Agendamento);
const controlRepository = AppDataSource.getRepository(Control);

class DashboardService {
  async getHomeStats() {
    //Quantidades::
    const agora = new Date();
    const todayStart = new Date(
      agora.getFullYear(),
      agora.getMonth(),
      agora.getDate()
    );
    const todayEnd = new Date(
      agora.getFullYear(),
      agora.getMonth(),
      agora.getDate() + 1
    );

    try {
        //Total de chaves
        const totalLabs = await labRepository.count({
            where: {deletedAt: IsNull()}
        })

        //Chaves ocupadas
        const labsOcupados = await labRepository.count({
            where: {
                status: "ocupado",
                deletedAt: IsNull()
            }
        });

        //Reservas pendentes
        const reservasPendentes = await agendamentoRepository.count({
            where: {
                status: "agendado",
                data_utilizacao: MoreThan(agora),
                hora_inicio: MoreThan(agora),
                deletedAt: IsNull()
            }
        });

        //Chaves atrasadas
        const chavesAtrasadas = await controlRepository.count({
            where: {
                status: "pendente",
                deletedAt: IsNull()
            }
        });

        return {
            totalChaves: totalLabs,
            chavesEmprestadas: labsOcupados,
            reservasPendentes: reservasPendentes,
            chavesAtrasadas: chavesAtrasadas
        };
    }catch(error){
        throw new Error(`Erro ao buscar status do dashboard: ${error.message}`)
    }
  }

  async getDashboardDetails() {
    //Detalhes mais importantes
    const agora = new Date();

    try {
        // Controls que fecharam automaticamente
        const controlAutoClose = await controlRepository.find({
            where: {
                status: "pendente",
                data_fim: LessThan(agora),
                deletedAt: IsNull()
            },
            relations: ["usuario", "laboratorio", "equipamento"],
            order: {data_inicio: 'ASC'}
        })

        // Reservas das próximas 24h
        const reservasProximas = await agendamentoRepository.find({
            where:{
                status: "agendado",
                data_utilizacao: MoreThan(agora),
                hora_inicio: MoreThan(agora),
                deletedAt: IsNull()
            },
            relations: ["usuario", "laboratorio"],
            order: {hora_inicio: 'ASC'}
        });

        
    }
  }
}
