import BaseDTO from './BaseDTO.js';
import TipoUsuario from '../entities/tipo_usuario.js';
import Usuario from '../entities/usuario.js'
import { AppDataSource } from '../database/data-source.js';
import { IsNull } from 'typeorm';

const tipoUsuarioRepository = AppDataSource.getRepository(TipoUsuario);
const usuarioRepository = AppDataSource.getRepository(Usuario);

class UsuarioRequestDTO extends BaseDTO {
  cadastroExtra(id_tipo) {
    const tipoCad = [1, 2];
    return tipoCad.includes(Number(id_tipo));
  }

  async validateCreate() {
    this.clearValidatedData();
    
    const { id_tipo, nome, cpf, data_nasc, telefone, matricula, email, senha } = this.data;

    this.data.cpf = cpf;
    this.data.data_nasc = data_nasc;
    this.data.telefone = telefone;

    if (!id_tipo && isNaN(Number(id_tipo))) {
      this.addError('id_tipo', 'O Tipo de Usuário é obrigatório e precisa ser numérico.');
      return false;
    }
    this.validatedData.id_tipo = Number(id_tipo);

    if (!nome && !nome.trim() && nome.trim().length < 2) {
      this.addError('nome', 'O nome deve ter pelo menos 2 caracteres.');
      return false;
    }
    this.validatedData.nome = nome.trim();

    if (!this.validateCPF('cpf', 'CPF')) return false;
    if (!this.validateDate('data_nasc', 'Data de Nascimento')) return false;
    if (!this.validatePhone('telefone', 'Telefone')) return false;

    try {
      const tipoUsuario = await tipoUsuarioRepository.findOneBy({
        id: Number(id_tipo),
        deletedAt: IsNull(),
      });

      if (!tipoUsuario) {
        this.addError('id_tipo', 'Tipo de usuário informado não encontrado.');
        return false;
      }
      this.validatedData.tipo = tipoUsuario;
    } catch (error) {
      this.addError('id_tipo', 'Erro ao validar tipo de usuário');
      return false;
    }

    try {
      const usuarioExiste = await usuarioRepository.findOneBy({
        cpf: this.validatedData.cpf,
        deletedAt: IsNull(),
      });

      if (usuarioExiste) {
        this.addError('cpf', 'CPF já cadastrado.');
        return false;
      }
    } catch (error) {
      this.addError('cpf', 'Erro ao verificar CPF');
      return false;
    }

    const cadastro = this.cadastroExtra(Number(id_tipo));
    this.validatedData.requiresCadastroExtra = cadastro;

    if (cadastro) {
      if (!matricula && !matricula.trim()) {
        this.addError('matricula', 'A matrícula é obrigatória para este tipo de usuário.');
        return false;
      }
      this.validatedData.matricula = matricula.trim();

      if (!email && !email.includes('@')) {
        this.addError('email', 'Email está no padrão incorreto.');
        return false;
      }
      this.validatedData.email = email.trim();
      
      if (senha && senha.length < 6) {
        this.addError('senha', 'Senha deve conter pelo menos 6 caracteres.');
        return false;
      }
      this.validatedData.senha = senha;
    }

    return this.isValid();
  }

  async validateUpdate() {
    this.clearValidatedData();
    
    const { id_tipo, nome, cpf, data_nasc, telefone, matricula, email, senha } = this.data;

    if (!this.data.id && isNaN(Number(this.data.id))) {
      this.addError('id', 'O ID é obrigatório e precisa ser um valor numérico.');
      return false;
    }
    this.validatedData.id = Number(this.data.id);

    if (id_tipo !== undefined) this.data.id_tipo = id_tipo;
    if (nome !== undefined) this.data.nome = nome;
    if (cpf !== undefined) this.data.cpf = cpf;
    if (data_nasc !== undefined) this.data.data_nasc = data_nasc;
    if (telefone !== undefined) this.data.telefone = telefone;

    if (id_tipo !== undefined) {
      if (!id_tipo && isNaN(Number(id_tipo))) {
        this.addError('id_tipo', 'O Tipo de Usuário é obrigatório e precisa ser numérico.');
        return false;
      }
      this.validatedData.id_tipo = Number(id_tipo);
    }

    if (nome !== undefined) {
      if (!nome && !nome.trim() && nome.trim().length < 2) {
        this.addError('nome', 'O nome deve ter pelo menos 2 caracteres.');
        return false;
      }
      this.validatedData.nome = nome.trim();
    }

    if (cpf !== undefined) {
      if (!this.validateCPF('cpf', 'CPF')) return false;
    }

    if (data_nasc !== undefined) {
      if (!this.validateDate('data_nasc', 'Data de Nascimento')) return false;
    }

    if (telefone !== undefined) {
      if (!this.validatePhone('telefone', 'Telefone')) return false;
    }

    if (id_tipo !== undefined) {
      try {
        const tipoUsuario = await tipoUsuarioRepository.findOneBy({
          id: Number(id_tipo),
          deletedAt: IsNull(),
        });

        if (!tipoUsuario) {
          this.addError('id_tipo', 'Tipo de usuário informado não encontrado.');
          return false;
        }
        this.validatedData.tipo = tipoUsuario;
      } catch (error) {
        this.addError('id_tipo', 'Erro ao validar tipo de usuário');
        return false;
      }
    }

    if (cpf !== undefined) {
      try {
        const cpfExiste = await usuarioRepository.findOneBy({
          cpf: this.validatedData.cpf,
          deletedAt: IsNull(),
        });

        if (cpfExiste && cpfExiste.id !== this.validatedData.id) {
          this.addError('cpf', 'CPF já cadastrado em outro usuário.');
          return false;
        }
      } catch (error) {
        this.addError('cpf', 'Erro ao verificar CPF');
        return false;
      }
    }

    if (id_tipo !== undefined) {
      const cadastro = this.cadastroExtra(Number(id_tipo));
      this.validatedData.requiresCadastroExtra = cadastro;

      if (cadastro) {
        if (matricula !== undefined) {
          if (!matricula.trim()) {
            this.addError('matricula', 'A matrícula é obrigatória para este tipo de usuário.');
            return false;
          }
          this.validatedData.matricula = matricula.trim();
        }

        if (email !== undefined) {
          if (!email.includes('@')) {
            this.addError('email', 'Email está no padrão incorreto.');
            return false;
          }
          this.validatedData.email = email.trim();
        }

        if (senha !== undefined && senha.length < 6) {
          this.addError('senha', 'Senha deve conter pelo menos 6 caracteres.');
          return false;
        }
        if (senha) {
          this.validatedData.senha = senha;
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

export default UsuarioRequestDTO;