import BaseDTO from "./BaseDTO.js";
import TipoUsuario from "../entities/tipo_usuario.js";
import Usuario from "../entities/usuario.js";
import UsuarioCad from "../entities/usuario_cad.js";
import { AppDataSource } from "../database/data-source.js";
import { IsNull } from "typeorm";

const tipoUsuarioRepository = AppDataSource.getRepository(TipoUsuario);
const usuarioRepository = AppDataSource.getRepository(Usuario);
const usuarioCadRepository = AppDataSource.getRepository(UsuarioCad);

class UsuarioRequestDTO extends BaseDTO {
  async cadastroExtra(id_tipo) {
    const tipoCad = [1, 2];
    return tipoCad.includes(Number(id_tipo));
  }

  async validateGetUsuarios() {
    this.clearValidatedData();

    const { nome, id_tipo, tipo_desc, page = 1, limit = 10 } = this.data;

    if (page !== undefined) {
      if (!this.validateParamsId("page", "Página", 1, 1000)) return false;
      this.validatedData.page = Math.max(1, Number(page));
    }

    if (limit !== undefined) {
      if (!this.validateParamsId("limit", "Limite", 1, 100)) return false;
      this.validatedData.limit = Math.min(Math.max(1, Number(limit)), 100);
    }

    if (nome !== undefined) {
      if (typeof nome !== "string") {
        this.addError("nome", "Nome deve ser um texto");
        return false;
      }
      this.validatedData.nome = nome.trim();
    }

    if (id_tipo !== undefined && id_tipo !== null && id_tipo !== "") {
      if (!this.validateForeignKeyId("id_tipo", "Tipo de Usuário", false))
        return false;
    } else if (
      tipo_desc !== undefined &&
      tipo_desc !== null &&
      tipo_desc !== ""
    ) {
      if (typeof tipo_desc !== "string") {
        this.addError("tipo_desc", "O tipo de usuário deve ser um texto");
        return false;
      }
      this.validatedData.tipo_desc = tipo_desc.trim();
      this.validatedData.filtro_tipo_tipo = "descricao";
    }
    return this.isValid();
  }

  async validateCreate() {
    this.clearValidatedData();

    const { id_tipo, senha, matricula, email } = this.data;

    if (!this.validateForeignKeyId("id_tipo", "Tipo de Usuário", true))
      return false;

    //Busca o id do tipo pelo ID
    try {
      const tipoUsuario = await tipoUsuarioRepository.findOneBy({
        id: this.validatedData.id_tipo,
        deletedAt: IsNull(),
      });

      if (!tipoUsuario) {
        this.addError("id_tipo", "Tipo de usuário informado não encontrado.");
        return false;
      }
      this.validatedData.tipo = tipoUsuario;
    } catch (error) {
      this.addError("id_tipo", "Erro ao validar tipo de usuário");
      return false;
    }

    if (!this.validateString("nome", "Nome", 2)) return false;
    if (!this.validateCPF("cpf", "CPF")) return false;
    if (!this.validateDate("data_nasc", "Data de Nascimento")) return false;
    if (!this.validatePhone("telefone", "Telefone")) return false;

    try {
      const usuarioExiste = await usuarioRepository.findOneBy({
        cpf: this.validatedData.cpf,
        deletedAt: IsNull(),
      });

      if (usuarioExiste) {
        this.addError("cpf", "CPF já cadastrado.");
        return false;
      }
    } catch (error) {
      this.addError("cpf", "Erro ao verificar CPF");
      return false;
    }

    const cadastro = this.cadastroExtra(this.validatedData.id_tipo);
    this.validatedData.requiresCadastroExtra = cadastro;

    if (cadastro) {
      if (!this.validateString("matricula", "Matrícula", 1)) return false;

      try {
        const matriculaExiste = await usuarioCadRepository.findOne({
          where: {
            matricula: this.validatedData.matricula,
          },
          relations: ["usuario"],
        });

        if (matriculaExiste) {
          this.addError(
            "matricula",
            "Matricula já cadastrada para outro usuário."
          );
          return false;
        }
      } catch (error) {
        this.addError("matricula", "Erro ao verificar matrícula");
        return false;
      }

      if (!this.validateEmail("email", "Email")) return false;

      const precisaSenha = this.validatedData.id_tipo === 1;
      if (precisaSenha) {
        if (!senha && senha.length < 6) {
          this.addError("senha", "Senha deve conter pelo menos 6 caracteres.");
          return false;
        }
        this.validatedData.senha = senha;
      }
    }

    return this.isValid();
  }

  async validateUpdate() {
    this.clearValidatedData();

    const { id_tipo, nome, cpf, data_nasc, telefone, matricula, email, senha } =
      this.data;

    if (!this.validateParamsId("id", "ID do Usuário")) return false;

    //Tipo de Usuário
    if (id_tipo !== undefined) {
      if (!this.validateForeignKeyId("id_tipo", "ID do Tipo de Usuário"))
        return false;
      //Busca o id do tipo pela sua descrição
      try {
        const tipoUsuario = await tipoUsuarioRepository.findOneBy({
          id: this.validatedData.id_tipo,
          deletedAt: IsNull(),
        });

        if (!tipoUsuario) {
          this.addError("id_tipo", "Tipo de usuário informado não encontrado.");
          return false;
        }
        this.validatedData.tipo = tipoUsuario;
      } catch (error) {
        this.addError("id_tipo", "Erro ao validar tipo de usuário");
        return false;
      }
    }

    if (nome !== undefined) {
      if (!this.validateString("nome", "Nome", 2)) return false;
    }

    if (cpf !== undefined) {
      if (!this.validateCPF("cpf", "CPF")) return false;
    }

    if (data_nasc !== undefined) {
      if (!this.validateDate("data_nasc", "Data de Nascimento")) return false;
    }

    if (telefone !== undefined) {
      if (!this.validatePhone("telefone", "Telefone")) return false;
    }

    if (cpf !== undefined) {
      try {
        const cpfExiste = await usuarioRepository.findOneBy({
          cpf: this.validatedData.cpf,
          deletedAt: IsNull(),
        });

        if (cpfExiste && cpfExiste.id !== this.validatedData.id) {
          this.addError("cpf", "CPF já cadastrado em outro usuário.");
          return false;
        }
      } catch (error) {
        this.addError("cpf", "Erro ao verificar CPF");
        return false;
      }
    }

    if (id_tipo !== undefined) {
      const cadastro = this.cadastroExtra(this.validatedData.id_tipo);
      this.validatedData.requiresCadastroExtra = cadastro;

      if (cadastro) {
        if (matricula !== undefined) {
          if (!this.validateString("matricula", "Matrícula", 1)) return false;
        }

        try {
          const matriculaExiste = await usuarioCadRepository.findOne({
            where: {
              matricula: this.validatedData.matricula,
            },
            relations: ["usuario"],
          });

          if (matriculaExiste) {
            this.addError(
              "matricula",
              "Matricula já cadastrada para outro usuário."
            );
            return false;
          }
        } catch (error) {
          this.addError("matricula", "Erro ao verificar matrícula");
          return false;
        }

        if (email !== undefined) {
          if (!this.validateEmail("email", "Email")) return false;
        }

        const precisaSenha = this.validatedData.id_tipo === 1;
        if (precisaSenha && senha !== undefined) {
          if (senha.length < 6) {
            this.addError(
              "senha",
              "Senha deve conter pelo menos 6 caracteres."
            );
            return false;
          }
          if (senha) {
            this.validatedData.senha = senha;
          }
        }
      }
    }

    return this.isValid();
  }

  async validateDelete() {
    this.clearValidatedData();

    if (!this.validateParamsId("id", "ID do Usuário")) return false;

    return this.isValid();
  }
}

export default UsuarioRequestDTO;
