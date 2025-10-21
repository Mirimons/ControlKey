import cron from "node-cron";
import agendamentoService from "../services/agendamentoServices.js";

class AutoStatusJob {
  init() {
    //A cada minuto, pega agendamentos que passaram para mudar o status para finalizado
    cron.schedule(
      "* * * * *",
      async () => {
        try {
          console.log(
            "Iniciando atualização automática de status de agendamentos..."
          );
          const result = await agendamentoService.putStatusAuto();
          console.log(
            `Atualização de status concluída: ${result} agendamentos atualizados`
          );
        } catch (error) {
          console.log("Erro no job de atualização de status: ", error);
        }
      },
      {
        timezone: "America/Sao_Paulo",
      }
    );
  }

  async executarManualmente() {
    try {
      console.log("Executando atualização de status manualmente...");
      const result = await agendamentoService.putStatusAuto();
      console.log(
        `Atualização manual concluída: ${result} agendamentos atualizados`
      );
      return result;
    } catch (error) {
      console.error("Erro na execução manual:", error);
      throw error;
    }
  }
}

export default new AutoStatusJob()
