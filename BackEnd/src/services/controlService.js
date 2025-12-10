import Control from "../entities/control.js";
import Labs from "../entities/labs.js";
import Equipamento from "../entities/equipamento.js";
import Usuario from "../entities/usuario.js";
import { AppDataSource } from "../database/data-source.js";
import { IsNull } from "typeorm";

const controlRepository = AppDataSource.getRepository(Control);
const labsRepository = AppDataSource.getRepository(Labs);
const equipamentoRepository = AppDataSource.getRepository(Equipamento);
const usuarioRepository = AppDataSource.getRepository(Usuario);

class ControlService {
  async getControlById(id) {
    return await controlRepository.findOne({
      where: { id, deletedAt: IsNull() },
      relations: ["usuario", "laboratorio", "equipamento"],
    });
  }

  async getControls(filtros = {}) {
    try {
      const {
        id_usuario,
        id_labs,
        id_equip,
        status,
        data_inicio,
        data_fim,
        periodo,
        // page = 1,
        // limit = 10,
      } = filtros;
      console.log(">>> inicio", data_inicio)
      console.log(">>> fim", data_fim)
      const query = controlRepository
        .createQueryBuilder("control")
        .leftJoinAndSelect("control.usuario", "usuario")
        .leftJoinAndSelect("control.equipamento", "equipamento")
        .leftJoinAndSelect("control.laboratorio", "laboratorio")
        // .select([
        //   "control.id",
        //   "control.status",
        //   "control.data_inicio",
        //   "control.data_fim",
        //   "usuario.nome",
        //   "equipamento.desc_equip",
        //   "laboratorio.nome_lab"
        // ])
        .where("control.deletedAt IS NULL")
        .orderBy("control.data_inicio", "DESC");

      //Talvez mudar
      if (id_usuario) {
        query.andWhere("control.id_usuario = :id_usuario", {
          id_usuario: Number(id_usuario),
        });
      }

      //Talvez mudar
      if (id_labs) {
        query.andWhere("control.id_labs = :id_labs", {
          id_labs: Number(id_labs),
        });
      }

      //Talvez mudar
      if (id_equip) {
        query.andWhere("control.id_equip = :id_equip", {
          id_equip: Number(id_equip),
        });
      }

      if (status) {
        query.andWhere("control.status = :status", { status });
      }

      if (data_inicio && data_fim) {
        query.andWhere("control.data_inicio BETWEEN :start AND :end", {
          start: data_inicio,
          end: `${data_fim} 23:59:00`,
        });
      } else if (data_inicio) {
        query.andWhere("control.data_inicio >= :start", { start: data_inicio });
      } else if (data_fim) {
        query.andWhere("control.data_fim <= :end", { end: data_fim });
      }

      const periodos = {
        manha: { inicio: "06:00", fim: "11:59" },
        tarde: { inicio: "12:00", fim: "16:59" },
        noite: { inicio: "17:00", fim: "22:59" },
      };

      console.log("Período recebido para filtro: ", periodo);

      const horario = periodos[periodo];
      if (horario) {
        console.log(
          `Aplicando filtro de período: ${periodo} (${horario.inicio} - ${horario.fim})`
        );

        //Converte horários para objetos Date do JavaScript para comparação
        const [inicioHora, inicioMinuto] = horario.inicio
          .split(":")
          .map(Number);
        const [fimHora, fimMinuto] = horario.fim.split(":").map(Number);

        //Usando EXTRACT para MYSQL
        query.andWhere(
          `(EXTRACT(HOUR FROM control.data_inicio) > :inicioHora OR
            (EXTRACT(HOUR FROM control.data_inicio) = :inicioHora AND EXTRACT(MINUTE FROM control.data_inicio) >= :inicioMinuto))
            AND
          (EXTRACT(HOUR FROM control.data_inicio) < :fimHora OR
            (EXTRACT(HOUR FROM control.data_inicio) = :fimHora AND EXTRACT(MINUTE FROM control.data_inicio) <= :fimMinuto))`,
          {
            inicioHora,
            inicioMinuto,
            fimHora,
            fimMinuto,
          }
        );
      }

      //Paginação:
      // const skip = (page - 1) * limit;
      // query.skip(skip).take(limit);

      const [controls, total] = await query.getManyAndCount();

      return {
        controls,
        // paginacao: {
        //   page: parseInt(page),
        //   limit: parseInt(limit),
        //   total,
        //   totalPages: Math.ceil(total / limit),
        // },
      };
    } catch (error) {
      throw new Error(`Erro ao buscar controles: ${error.message}`);
    }
  }

  //Get para a devolução
  async getControlsByUsuario(identificador) {
    try {
      //Primeiro busca o usuário pelo identificador
      const usuario = await usuarioRepository.findOne({
        where: [
          { cpf: identificador, deletedAt: IsNull() },
          {
            usuario_cad: { matricula: identificador },
            deletedAt: IsNull(),
          },
        ],
        relations: ["usuario_cad"],
      });

      if (!usuario) {
        throw new Error("Usuário não encontrado");
      }

      //Busca controles em aberto do usuário
      const controles = await controlRepository
        .createQueryBuilder("control")
        .leftJoinAndSelect("control.usuario", "usuario")
        .leftJoinAndSelect("usuario.usuario_cad", "usuario_cad")
        .leftJoinAndSelect("control.equipamento", "equipamento")
        .leftJoinAndSelect("equipamento.tipo", "tipo")
        .leftJoinAndSelect("control.laboratorio", "laboratorio")
        .where("control.id_usuario = :id_usuario", { id_usuario: usuario.id })
        .andWhere("control.status = :status", { status: "aberto" })
        .andWhere("control.deletedAt IS NULL")
        .orderBy("control.data_inicio", "DESC")
        .getMany();

      return controles;
    } catch (error) {
      throw new Error(`Erro ao buscar controles do usuário: ${error.message}`);
    }
  }

  async openControl(controlData) {
    const { id_usuario, id_equip, id_labs, status, ciente, data_inicio } =
      controlData;

    const newControl = controlRepository.create({
      id_usuario,
      id_equip: id_equip || null,
      id_labs: id_labs || null,
      status,
      ciente,
      data_inicio,
      createdAt: new Date(),
    });

    await controlRepository.save(newControl);

    //Status do laboratório mudar para ocupado
    if (id_labs) {
      await labsRepository.update(
        { id: id_labs },
        { status: "ocupado", updatedAt: new Date() }
      );
      console.log(`Laboratório ${id_labs} marcado como OCUPADO`);
    }

    //Status do equipamento mudar para ocupado
    if (id_equip) {
      await equipamentoRepository.update(
        { id: id_equip },
        { status: "ocupado", updatedAt: new Date() }
      );
      console.log(`Equipamento ${id_equip} marcado como OCUPADO`);
    }

    return await controlRepository.findOne({
      where: { id: newControl.id },
      relations: ["usuario", "laboratorio", "equipamento"],
    });
  }

  async closeControl(controlData) {
    const { id, data_fim, status } = controlData;

    //Busca o controle atual para pegar o id_labs antes de atualizar
    const currentControl = await controlRepository.findOne({
      where: { id },
      relations: ["laboratorio", "equipamento"],
    });

    if (!currentControl) {
      throw new Error("Controle não encontrado");
    }

    const id_labs = currentControl.id_labs;
    const id_equip = currentControl.id_equip;

    //Atualiza a control
    await controlRepository.update(
      { id },
      {
        data_fim,
        status,
        updatedAt: new Date(),
      }
    );

    //Atualiza status do lab
    if (id_labs) {
      await labsRepository.update(
        { id: id_labs },
        { status: "livre", updatedAt: new Date() }
      );
      console.log(`Laboratório ${id_labs} marcado como LIVRE`);
    }

    //Atualiza status do equipamento
    if (id_equip) {
      await equipamentoRepository.update(
        { id: id_equip },
        { status: "livre", updatedAt: new Date() }
      );
      console.log(`Equipamento ${id_equip} marcado como LIVRE`);
    }

    return await controlRepository.findOne({
      where: { id },
      relations: ["usuario", "laboratorio", "equipamento"],
    });
  }

  //Close pelos Admins
  async closeControlAsAdmin(controlId) {
    try {
      //Busca o controle pelo ID
      const control = await controlRepository.findOne({
        where: { id: controlId, deletedAt: IsNull() },
        relations: ["laboratorio", "equipamento"],
      });

      if (!control) {
        throw new Error("Controle não encontrado.");
      }

      //Verifica se o controle já está fechado
      if (control.status === "fechado") {
        throw new Error("Este controle já está fechado.");
      }

      //Fecha o controle usando a função existente
      const updatedControl = await this.closeControl({
        id: controlId,
        data_fim: new Date(),
        status: "fechado",
      });

      return {
        success: true,
        message: "Controle fechado com sucesso pelo administrador.",
        data: updatedControl,
      };
    } catch (error) {
      console.error("Erro ao fechar controle como admin: ", error);
      throw new Error(`Erro ao fechar controle: ${error.message}`);
    }
  }

  //Ciente bollean
  async confirmAwareness(controlData) {
    const { id, ciente } = controlData;

    await controlRepository.update(
      { id },
      {
        ciente,
        updatedAt: new Date(),
      }
    );

    return await controlRepository.findOne({
      where: { id },
      relations: ["usuario", "laboratorio", "equipamento"],
    });
  }

  //Status: pendente
  async autoCloseControl() {
    try {
      console.log("🕐 Executando fechamento automático diário...");

      const hoje = new Date();
      const inicioDia = new Date(hoje);
      inicioDia.setHours(0, 0, 0, 0);

      // const fimDia = new Date(hoje)
      // fimDia.setHours(23,59,59,999)

      //Busca dos controles em aberto
      const controlsToClose = await controlRepository
        .createQueryBuilder("control")
        .where("control.status = :status", { status: "aberto" })
        .andWhere("control.data_inicio < :inicioDia", { inicioDia: inicioDia })
        .andWhere("control.deletedAt IS NULL")
        .getMany();

      console.log(
        `Encontrados ${controlsToClose.length} controles para marcas como pendente`
      );

      if (controlsToClose.length === 0) {
        return { update: 0, message: "Nenhum controle para atualizar" };
      }

      //Atualiza os labs para "livre" antes de mudar os controles
      const labsIdsToFree = controlsToClose
        .map((control) => control.id_labs)
        .filter((id) => id !== null);

      if (labsIdsToFree.length > 0) {
        await labsRepository
          .createQueryBuilder()
          .update(Labs)
          .set({ status: "livre", updatedAt: new Date() })
          .where("id IN (:...ids)", { ids: labsIdsToFree })
          .execute();

        console.log(`${labsIdsToFree.length} laboratórios marcados como LIVRE`);
      }

      //Atualiza os equipamentos para "livre" antes de mudar os controles
      const equipIdsToFree = controlsToClose
        .map((control) => control.id_equip)
        .filter((id) => id !== null);

      if (equipIdsToFree.length > 0) {
        await equipamentoRepository
          .createQueryBuilder()
          .update(Equipamento)
          .set({ status: "livre", updatedAt: new Date() })
          .where("id IN (:...ids)", { ids: equipIdsToFree })
          .execute();

        console.log(
          `${equipIdsToFree.length} equipamentos marcados como LIVRE`
        );
      }

      //Atualiza todos para pendente
      const ids = controlsToClose.map((control) => control.id);

      await controlRepository
        .createQueryBuilder()
        .update(Control)
        .set({
          status: "pendente",
          updatedAt: new Date(),
        })
        .where("id IN (:...ids)", { ids })
        .execute();

      console.log(
        `${controlsToClose.length} controles atualizados para 'pendente'`
      );

      return {
        updated: controlsToClose.length,
        message: `${controlsToClose.length} controles marcados como pendente`,
      };
    } catch (error) {
      console.error("Erro no fechamento automático: ", error);
      throw new Error(`Erro no fechamento automático: ${error.message}`);
    }
  }

  async deleteControl(id) {
    await controlRepository.update(
      { id },
      {
        deletedAt: new Date(),
        updatedAt: new Date(),
      }
    );
    return true;
  }
}

export default new ControlService();
