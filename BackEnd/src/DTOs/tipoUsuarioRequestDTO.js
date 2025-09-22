import BaseDTO from "./BaseDTO.js";
import TipoUsuario from "../entities/tipo_usuario.js";
import { AppDataSource } from "../database/data-source.js";
import { IsNull, Not } from "typeorm";

const tipoUsuarioRepository = AppDataSource.getRepository(TipoUsuario);

class TipoUsuarioRequestDTO extends BaseDTO {
  async validateCreate() {
    this.clearValidatedData();

    const { desc_tipo } = this.data;

    this.data.desc_tipo = desc_tipo;

    if (!this.validateString("desc_tipo", "Descrição do tipo", 2)) {
      return false;
    }

    try {
      const tipoExiste = await tipoUsuarioRepository.findOne({
        where: {
          desc_tipo: this.validatedData.desc_tipo,
          deletedAt: IsNull(),
        },
      });
      if (tipoExiste) {
        this.addError(
          "desc_tipo",
          "Já existe um tipo de usuário com esta descrição"
        );
        return false;
      }
    } catch (error) {
      this.addError("desc_tipo", "Erro ao verificar tipo de usuário existente");
      return false;
    }

    return this.isValid();
  }

  async validateUpdate() {
    this.clearValidatedData();

    const { desc_tipo } = this.data;

    if(!this.data.id && isNaN(Number(this.data.id))) {
      this.addError('id', 'O ID é obrigatório e precisa ser numérico.');
      return false;
    }

    this.validatedData.id = Number(this.data.id);

    if (desc_tipo !== undefined) {
      this.data.desc_tipo = desc_tipo;

      if (desc_tipo !== undefined) {
        if (!this.validateString("desc_tipo", "Descrição do tipo", 2)) {
          return false;
        }

        try {
          const tipoExiste = await tipoUsuarioRepository.findOne({
            where: {
              desc_tipo: this.validatedData.desc_tipo,
              deletedAt: IsNull(),
              id: Not(this.validatedData.id)
            },
          });
          if (tipoExiste) {
            this.addError(
              "desc_tipo",
              "Já existe um tipo de usuário com esta descrição"
            );
            return false;
          }
        } catch (error) {
          this.addError(
            "desc_tipo",
            "Erro ao verificar tipo de usuário existente"
          );
          return false;
        }
      }
    }
    return this.isValid();
  }

  async validateDelete() {
    this.clearValidatedData();

     if(!this.data.id && isNaN(Number(this.data.id))) {
      this.addError('id', 'O ID é obrigatório e precisa ser numérico.');
      return false;
    }

    this.validatedData.id = Number(this.data.id);
    return this.isValid();
  }
}

export default TipoUsuarioRequestDTO;