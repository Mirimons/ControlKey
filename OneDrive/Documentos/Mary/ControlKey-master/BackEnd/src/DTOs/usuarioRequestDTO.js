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
  async cadastroExtra(tipoInput) {
    try {
      let tipoUsuario;

      //Se for número - ID
      if (typeof tipoInput === "number" || !isNaN(Number(tipoInput))) {
        tipoUsuario = await tipoUsuarioRepository.findOneBy({
          id: Number(tipoInput),
          deletedAt: IsNull(),
        });
      } else if (typeof tipoInput === "string") {
        tipoUsuario = await tipoUsuarioRepository.findOne({
          where: {
            desc_tipo: tipoInput.trim(),
            deletedAt: IsNull(),
          },
        });
      } else if (typeof tipoInput === "object" && tipoInput.desc_tipo) {
        tipoUsuario = tipoInput;
      }

      if (!tipoUsuario) return false;

      //Tipos que precisam do cadastroExtra
      const tipoCad = ["Administrador", "Comum"];
      return tipoCad.includes(tipoUsuario.desc_tipo);
    } catch (error) {
      console.error("Erro ao verificar cadastro extra: ", error);
      return false;
    }
  }

  async validateGetUsuarios() {
    this.clearValidatedData();

    const { 
      nome, 
      id_tipo, 
      tipo_desc, 
      // page, 
      // limit 
    } = this.data;

    // this.validatedData.page = 1;
    // this.validatedData.limit = 10;

    // if (page !== undefined && page !== null && page !== "") {
    //   if (!this.validateParamsId("page", "Página", 1, 1000)) return false;
    //   this.validatedData.page = Math.max(1, Number(page));
    // }

    // if (limit !== undefined && limit !== null && limit !== "") {
    //   if (!this.validateParamsId("limit", "Limite", 1, 100)) return false;
    //   this.validatedData.limit = Math.min(Math.max(1, Number(limit)), 100);
    // }

    if (nome !== undefined && nome !== null && nome !== "") {
      if (typeof nome !== "string") {
        this.addError("nome", "Nome deve ser um texto");
        return false;
      }
      this.validatedData.nome = nome.trim();
    }

    if (id_tipo !== undefined && id_tipo !== null && id_tipo !== "") {
      if (!this.validateForeignKeyId("id_tipo", "Tipo de Usuário", false))
        return false;
      this.validatedData.filtro_tipo_tipo = "id";
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

    const { tipo, senha, matricula, email } = this.data;

    if (!tipo || !tipo.trim()) {
      this.addError("tipo", "O tipo de usuário é obrigatório");
      return false;
    }
    //Busca o id do tipo pela sua descrição
    try {
      const tipoFind = await tipoUsuarioRepository.findOne({
        where: {
          desc_tipo: tipo.trim(),
          deletedAt: IsNull(),
        },
      });

      if (!tipoFind) {
        this.addError("tipo", "Tipo de usuário não encontrado.");
        return false;
      }
      this.validatedData.id_tipo = tipoFind.id;
      this.validatedData.tipo = tipoFind;
    } catch (error) {
      this.addError("tipo", "Erro ao buscar tipo de usuário");
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

    const cadastro = await this.cadastroExtra(
      this.validatedData.tipo.desc_tipo
    );
    this.validatedData.requiresCadastroExtra = cadastro;

    if (cadastro) {
      if (matricula !== undefined && matricula !== null && matricula !== "") {
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
      }
      if (email !== undefined && email !== null && email !== "") {
        if (!this.validateEmail("email", "Email")) return false;
      }

      const precisaSenha =
        this.validatedData.tipo.desc_tipo === "Administrador";
      if (
        precisaSenha &&
        senha !== undefined &&
        senha !== null &&
        senha !== ""
      ) {
        if (senha && senha.length < 6) {
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

    const {
      tipo,
      id_tipo,
      nome,
      cpf,
      data_nasc,
      telefone,
      matricula,
      email,
      senha,
    } = this.data;

    if (!this.validateParamsId("id", "ID do Usuário")) return false;

    //Tipo de Usuário
    if (tipo !== undefined && tipo !== null && tipo !== "") {
      //Busca o id do tipo pela sua descrição
      try {
        const tipoFind = await tipoUsuarioRepository.findOne({
          where: {
            desc_tipo: tipo.trim(),
            deletedAt: IsNull(),
          },
        });

        if (!tipoFind) {
          this.addError("tipo", "Tipo de usuário não encontrado.");
          return false;
        }
        this.validatedData.id_tipo = tipoFind.id;
        this.validatedData.tipo = tipoFind;
      } catch (error) {
        this.addError("tipo", "Erro ao buscar tipo de usuário");
        return false;
      }
    } else if (id_tipo !== undefined && id_tipo !== null && id_tipo !== "") {
      if (!this.validateForeignKeyId("id_tipo", "ID do Tipo de Usuário"))
        return false;

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

    if (this.validatedData.tipo) {
      const cadastro = await this.cadastroExtra(
        this.validatedData.tipo.desc_tipo
      );
      this.validatedData.requiresCadastroExtra = cadastro;

      if (cadastro) {
        if (matricula !== undefined && matricula !== null && matricula !== "") {
          if (!this.validateString("matricula", "Matrícula", 1)) return false;

          try {
            const matriculaExiste = await usuarioCadRepository.findOne({
              where: {
                matricula: this.validatedData.matricula,
              },
              relations: ["usuario"],
            });

            if (
              matriculaExiste &&
              matriculaExiste.usuario?.id !== this.validatedData.id
            ) {
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
        }

        if (email !== undefined && email !== null && email !== "") {
          if (!this.validateEmail("email", "Email")) return false;
        }

        if (senha !== undefined && senha !== null && senha !== "") {
          if (senha.length < 6) {
            this.addError(
              "senha",
              "Senha deve conter pelo menos 6 caracteres."
            );
            return false;
          }
          this.validatedData.senha = senha;
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
