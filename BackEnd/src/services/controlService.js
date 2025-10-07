import Control from "../entities/control.js";
import Labs from "../entities/labs.js"
import Equipamento from "../entities/equipamento.js"
import { AppDataSource } from "../database/data-source.js";
import { IsNull } from "typeorm";

const controlRepository = AppDataSource.getRepository(Control);
const labsRepository = AppDataSource.getRepository(Labs)
const equipamentoRepository = AppDataSource.getRepository(Equipamento)

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
        page = 1,
        limit = 10,
      } = filtros;

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
          end: data_fim,
        });
      } else if (data_inicio) {
        query.andWhere("control.data_inicio >= :start", { start: data_inicio });
      } else if (data_fim) {
        query.andWhere("control.data_inicio <= :end", { end: data_fim });
      }
      //Paginação:
      const skip = (page - 1) * limit;
      query.skip(skip).take(limit);

      const [controls, total] = await query.getManyAndCount();

      return {
        controls,
        paginacao: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          totalPages: Math.ceil(total / limit),
        },
      };
    } catch (error) {
      throw new Error(`Erro ao buscar controles: ${error.message}`);
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
    if(id_labs){
      await labsRepository.update(
        {id: id_labs},
        {status:"ocupado", updatedAt: new Date() }
      );
      console.log(`Laboratório ${id_labs} marcado como OCUPADO`)
    }

    //Status do equipamento mudar para ocupado
    if(id_equip) {
      await equipamentoRepository.update(
        {id: id_equip},
        {status: "ocupado", updatedAt: new Date()}
      )
      console.log(`Equipamento ${id_equip} marcado como OCUPADO`)
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
      where: {id},
      relations: ["laboratorio", "equipamento"]
    });

    if(!currentControl) {
      throw new Error("Controle não encontrado")
    }

    const id_labs = currentControl.id_labs
    const id_equip = currentControl.id_equip

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
    if(id_labs) {
      await labsRepository.update(
        {id: id_labs},
        {status: "livre", updatedAt: new Date()}
      )
      console.log(`Laboratório ${id_labs} marcado como LIVRE`)
    }

    //Atualiza status do equipamento
    if(id_equip) {
      await equipamentoRepository.update(
        {id: id_equip},
        {status: "livre", updatedAt: new Date()}
      )
      console.log(`Equipamento ${id_equip} marcado como LIVRE`)
    }

    return await controlRepository.findOne({
      where: { id },
      relations: ["usuario", "laboratorio", "equipamento"],
    });
  }

  //Ciente 
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
      console.log ("🕐 Executando fechamento automático diário...")

      const hoje = new Date()
      const inicioDia = new Date(hoje)
      inicioDia.setHours(0,0,0,0)

      const fimDia = new Date(hoje)
      fimDia.setHours(23,59,59,999)

      //Busca dos controles em aberto
      const controlsToClose = await controlRepository
      .createQueryBuilder("control")
      .where("control.status = :status", {status: "aberto"})
      .andWhere("control.data_inicio BETWEEN :inicio AND :fim", {
        inicio: inicioDia,
        fim: fimDia
      })
      .andWhere("control.deletedAt IS NULL")
      .getMany();

      console.log(`Encontrados ${controlsToClose.length} controles para marcas como pendente`);

      if(controlsToClose.length === 0) {
        return {update: 0, message: "Nenhum controle para atualizar"}
      }

      //Atualiza os labs para "livre" antes de mudar os controles
      const labsIdsToFree = controlsToClose
      .map(control => control.id_labs)
      .filter(id => id !== null)

      if (labsIdsToFree.length > 0) {
        await labsRepository
        .createQueryBuilder()
        .update(Labs)
        .set({status: "livre", updatedAt: new Date()})
        .where("id IN (:...ids)", {ids: labsIdsToFree})
        .execute()

        console.log(`${labsIdsToFree.length} laboratórios marcados como LIVRE`)
      }

      //Atualiza os equipamentos para "livre" antes de mudar os controles
      const equipIdsToFree = controlsToClose
      .map(control => control.id_equip)
      .filter(id => id !== null)

      if (equipIdsToFree.length > 0) {
        await equipamentoRepository
        .createQueryBuilder()
        .update(Equipamento)
        .set({status: "livre", updatedAt: new Date()})
        .where("id IN (:...ids)", {ids: equipIdsToFree})
        .execute()

        console.log(`${equipIdsToFree.length} equipamentos marcados como LIVRE`)
      }

      //Atualiza todos para pendente
      const ids = controlsToClose.map(control => control.id)

      await controlRepository
      .createQueryBuilder()
      .update(Control)
      .set({
        status: "pendente",
        updatedAt: new Date()
      })
      .where("id IN (:...ids)", {ids})
      .execute();

      console.log(`${controlsToClose.length} controles atualizados para 'pendente'`)

      return {
        updated: controlsToClose.length,
        message: `${controlsToClose.length} controles marcados como pendente`
      };
    }catch(error) {
      console.error("Erro no fechamento automático: ", error)
      throw new Error(`Erro no fechamento automático: ${error.message}`)
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
