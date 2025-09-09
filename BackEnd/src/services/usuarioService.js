import Usuario from "../entities/usuario.js";
import UsuarioCad from "../entities/usuario_cad.js";
import TipoUsuario from "../entities/tipo_usuario.js";
import { AppDataSource } from "../database/data-source.js";
import { Like, IsNull } from "typeorm";
import { validateAndFormatDate } from "../utils/dateValidator.js";
import bcrypt from "bcrypt";

const usuarioRepository = AppDataSource.getRepository(Usuario);
const usuarioCadRepository = AppDataSource.getRepository(UsuarioCad);
const tipoUsuarioRepository = AppDataSource.getRepository(TipoUsuario);

class UsuarioService {
  async getUsuarios() {
    return await usuarioRepository.find({
      where: { deletedAt: IsNull() },
      relations: ["tipo", "usuario_cad"],
    });
  }

  async getByNome(nome) {
    return await usuarioRepository.find({
      where: {
        nome: Like(`%${nome}%`),
        deletedAt: IsNull(),
      },
      relations: ["tipo", "usuario_cad"],
    });
  }

  async getUsuarioById(id) {
    return await usuarioRepository.findOne({
      where: { id, deletedAt: IsNull() },
      relations: ["tipo", "usuario_cad"],
    });
  }

  cadastroExtra(id_tipo) {
    const tipoCad = [1, 2];
    return tipoCad.includes(Number(id_tipo));
  }

  async postUsuario(usuarioData) {
    // Dados já validados no DTO
    const {
      id_tipo,
      nome,
      cpf,
      data_nasc,
      telefone,
      requiresCadastroExtra,
      matricula,
      email,
      senha,
      tipo,
    } = usuarioData;

    // Criação do usuário base
    const newUsuario = usuarioRepository.create({
      id_tipo: Number(id_tipo),
      tipo: tipo,
      nome: nome,
      cpf: cpf,
      data_nasc: data_nasc,
      telefone: telefone,
      createdAt: new Date(),
    });

    // Criação do UsuarioCad (se necessário)
    if (requiresCadastroExtra) {
      const hashedPassword = senha ? await bcrypt.hash(senha, 10) : null;

      newUsuario.usuario_cad = usuarioCadRepository.create({
        matricula: matricula,
        email: email,
        senha: hashedPassword,
        createdAt: new Date(),
      });
    }

    await usuarioRepository.save(newUsuario);

    const usuarioCompleto = await usuarioRepository.findOne({
      where: { id: newUsuario.id },
      relations: ["tipo", "usuario_cad"],
    });

    return usuarioCompleto;
  }

  async putUsuario(id, usuarioData) {
    // Dados já validados no DTO
    const {
      id_tipo,
      nome,
      cpf,
      data_nasc,
      telefone,
      requiresCadastroExtra,
      matricula,
      email,
      senha,
      tipo,
    } = usuarioData;

    const currentUsuario = await usuarioRepository.findOne({
      where: { id, deletedAt: IsNull() },
      relations: ["usuario_cad"],
    });

    if (!currentUsuario) {
      throw new Error("Usuário não encontrado.");
    }

    await usuarioRepository.update(
      { id },
      {
        id_tipo: Number(id_tipo),
        nome: nome,
        cpf: cpf,
        data_nasc: data_nasc,
        telefone: telefone,
      }
    );

    if(currentUsuario.usuario_cad) {
      const hashedPassword = senha ? await bcrypt.hash(senha, 10): currentUsuario.usuario_cad.senha;

      await usuarioCadRepository.update(currentUsuario.usuario_cad.id_usuario, {
        matricula: matricula,
        email: email,
        senha: hashedPassword
      });
    }

    // Atualização dos dados básicos
    const updateData = {};
    if (id_tipo !== undefined) updateData.id_tipo = Number(id_tipo);
    if (nome !== undefined) updateData.nome = nome;
    if (cpf !== undefined) updateData.cpf = cpf;
    if (data_nasc !== undefined) updateData.data_nasc = data_nasc;
    if (telefone !== undefined) updateData.telefone = telefone;
    
    if (Object.keys(updateData).length > 0) {
      await usuarioRepository.update({ id }, updateData);
    }
    
    // Atualização do cadastro extra
    if (requiresCadastroExtra && currentUsuario.usuario_cad) {
      const updateCadData = {};
      if (matricula !== undefined) updateCadData.matricula = matricula;
      if (email !== undefined) updateCadData.email = email;
      
      if (senha !== undefined) {
        updateCadData.senha = await bcrypt.hash(senha, 10);
      }
      
      if (Object.keys(updateCadData).length > 0) {
        await usuarioCadRepository.update(
          { id_usuario: currentUsuario.usuario_cad.id_usuario },
          updateCadData
        );
      }
    }
    return await this.getUsuarioById(id);

  }

  async deleteUsuario(id) {
    if(isNaN(Number(id))) {
      throw new Error("O id precisa ser um valor numérico.");
    }

    await usuarioRepository.update({ id }, { deletedAt: new Date() });
    return true;
  }
}

export default new UsuarioService();

// import Usuario from "../entities/usuario.js";
// import UsuarioCad from "../entities/usuario_cad.js";
// import TipoUsuario from "../entities/tipo_usuario.js";
// import { AppDataSource } from "../database/data-source.js";
// import { Like, IsNull } from "typeorm";
// import { validateAndFormatDate } from "../utils/dateValidator.js";
// import bcrypt from "bcrypt";

// const usuarioRepository = AppDataSource.getRepository(Usuario);
// const usuarioCadRepository = AppDataSource.getRepository(UsuarioCad);
// const tipoUsuarioRepository = AppDataSource.getRepository(TipoUsuario);

// class UsuarioService {
//   async getUsuarios() {
//     return await usuarioRepository.find({
//       where: { deletedAt: IsNull() },
//       relations: ["tipo", "usuario_cad"],
//     });
//   }

//   async getByNome(nome) {
//     return await usuarioRepository.find({
//       where: {
//         nome: Like(`%${nome}%`),
//         deletedAt: IsNull(),
//       },
//       relations: ["tipo", "usuario_cad"],
//     });
//   }

//   async getUsuarioById(id) {
//     return await usuarioRepository.findOne({
//       where: { id, deletedAt: IsNull() },
//       relations: ["tipo", "usuario_cad"],
//     });
//   }

//   cadastroExtra(id_tipo) {
//     const tipoCad = [1, 2];
//     return tipoCad.includes(Number(id_tipo));
//   }

//   async postUsuario(usuarioData) {

//     // Validações:
//     const {
//       id_tipo,
//       nome,
//       cpf,
//       data_nasc,
//       telefone,
//       matricula,
//       email,
//       senha,
//     } = usuarioData;

//     if (!id_tipo && isNaN(Number(id_tipo))) {
//       throw new Error(
//         "O Tipo de Usuário é obrigatório e precisa ser numérico."
//       );
//     }

//     if (!nome?.trim() && nome.trim().length < 2) {
//       throw new Error("O nome deve ter pelo menos 2 caracteres.");
//     }

//     if (!cpf && cpf.length != 11 && isNaN(Number(cpf))) {
//       throw new Error(
//         "O CPF está no padrão incorreto. É preciso ter 11 dígitos."
//       );
//     }

//     if (!data_nasc) {
//       throw new Error("A Data de Nascimento é obrigatória.");
//     }

//     const dateValidation = validateAndFormatDate(data_nasc);
//     if (!dateValidation.isValid) {
//       throw new Error(dateValidation.error);
//     }

//     if (!telefone && isNaN(telefone)) {
//       throw new Error("O Telefone é obrigatório e precisa ser numérico.");
//     }

//     // Verifica se o tipo de usuário existe:
//     const tipoUsuario = await tipoUsuarioRepository.findOneBy({
//       id: Number(id_tipo),
//       deletedAt: IsNull(),
//     });

//     if (!tipoUsuario) {
//       throw new Error("Tipo de usuário informado não encontrado.");
//     }

//     //Vendo se precisa do cadastroExtra Extra
//     const cadastro = this.cadastroExtra(Number(id_tipo));

//     if (cadastro) {
//       if (!matricula?.trim()) {
//         throw new Error(
//           "A matrícula é obrigatória para este tipo de usuário."
//         );
//       }
//       if (!email?.includes("@")) {
//         throw new Error("Email está no padrão incorreto.");
//       }
//       if (senha && senha.length < 6) {
//         throw new Error("Senha deve conter pelo menos 6 caracteres.");
//       }
//     }

//     // Verifica se o CPF já existe:
//     const usuarioExiste = await usuarioRepository.findOneBy({
//       cpf,
//       deletedAt: IsNull(),
//     });

//     if (usuarioExiste) {
//       throw new Error("CPF já cadastrado.");
//     }

//     // Criação do usuário base:
//     const newUsuario = usuarioRepository.create({
//       id_tipo: Number(id_tipo),
//       tipo: tipoUsuario,
//       nome: nome.trim(),
//       cpf,
//       data_nasc: dateValidation.dateFormatted,
//       telefone: telefone.toString().trim(),
//       createdAt: new Date(),
//     });

//     // Criação do UsuarioCad
//     if (cadastro) {
//       const hashedPassword = senha ? await bcrypt.hash(senha, 10) : null;

//       newUsuario.usuario_cad = usuarioCadRepository.create({
//         matricula: matricula.trim(),
//         email: email.trim(),
//         senha: hashedPassword,
//         createdAt: new Date(),
//       });
//     }

//     //Salva em CASCATE
//     await usuarioRepository.save(newUsuario);
//     return newUsuario;
//   }

//   async putUsuario(id, usuarioData) {
//     const {
//       id_tipo,
//       nome,
//       cpf,
//       data_nasc,
//       telefone,
//       matricula,
//       email,
//       senha,
//     } = usuarioData;

//     if (!id && isNaN(Number(id))) {
//       throw new Error("O ID é obrigatório e precisa ser um valor numérico.");
//     }

//     // Validações iguais, só que pro put agora
//     if (!id_tipo && isNaN(Number(id_tipo))) {
//       throw new Error(
//         "O Tipo de Usuário é obrigatório e precisa ser numérico."
//       );
//     }

//     if (!nome?.trim() && nome.trim().length < 2) {
//       throw new Error("O nome deve ter pelo menos 2 caracteres.");
//     }

//     if (!cpf && cpf.length != 11 && isNaN(Number(cpf))) {
//       throw new Error(
//         "O CPF está no padrão incorreto. É preciso ter 11 dígitos."
//       );
//     }

//     if (!data_nasc) {
//       throw new Error("A Data de Nascimento é obrigatória.");
//     }

//     const dateValidation = validateAndFormatDate(data_nasc);
//     if (!dateValidation.isValid) {
//       throw new Error(dateValidation.error);
//     }

//     if (!telefone && isNaN(telefone)) {
//       throw new Error("O Telefone é obrigatório e precisa ser numérico.");
//     }

//     // Verifica se o tipo de usuário existe:
//     const tipoUsuario = await tipoUsuarioRepository.findOneBy({
//       id: Number(id_tipo),
//       deletedAt: IsNull(),
//     });

//     if (!tipoUsuario) {
//       throw new Error("Tipo de usuário informado não encontrado.");
//     }

//     //Vendo se precisa do cadastro Extra
//     const cadastro = this.cadastroExtra(Number(id_tipo));

//     if (cadastro) {
//       if (!matricula?.trim()) {
//         throw new Error(
//           "A matrícula é obrigatória para este tipo de usuário."
//         );
//       }
//       if (!email?.includes("@")) {
//         throw new Error("Email está no padrão incorreto.");
//       }
//       if (senha && senha.length < 6) {
//         throw new Error("Senha deve conter pelo menos 6 caracteres.");
//       }
//     }

//     // Verifica se o CPF é de outro usuário:
//     const cpfExiste = await usuarioRepository.findOneBy({
//       cpf,
//       deletedAt: IsNull(),
//     });

//     if (cpfExiste && cpfExiste.id !== Number(id)) {
//       throw new Error("CPF já cadastrado em outro usuário.");
//     }

//     const currentUsuario = await usuarioRepository.findOne({
//       where: { id, deletedAt: IsNull()},
//       relations: ['usuario_cad']
//     });

//     if (!currentUsuario){
//       throw new Error("Usuário não encontrado.")
//     }

//     //Atualização dos dados básicos
//     await usuarioRepository.update(
//       { id },
//       {
//         id_tipo: Number(id_tipo),
//         nome: nome.trim(),
//         cpf,
//         data_nasc: dateValidation.dateFormatted,
//         telefone: telefone.toString().trim()
//       }
//     );

//     //Se tiver usuarioCad:
//     if(currentUsuario.usuario_cad) {
//       const hashedPassword = senha ? await bcrypt.hash(senha, 10): currentUsuario.usuario_cad.senha;

//       await usuarioCadRepository.update(currentUsuario.usuario_cad.id_usuario, {
//         matricula: matricula.trim(),
//         email: email.trim(),
//         senha: hashedPassword
//       });
//     }

//     return await this.getUsuarioById(id);
//   }

//   async deleteUsuario(id) {
//     if (isNaN(Number(id))) {
//       throw new Error("O id precisa ser um valor numérico.");
//     }

//     await usuarioRepository.update({ id }, { deletedAt: () => new Date() });
//     return true;
//   }
// }

// export default new UsuarioService();
