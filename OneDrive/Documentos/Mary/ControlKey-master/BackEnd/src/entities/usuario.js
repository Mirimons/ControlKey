import { EntitySchema } from "typeorm";

const usuario = new EntitySchema({
    name: "Usuario",
    tableName:"usuario",
    columns: {
        id: {
            primary: true, 
            type: "int", 
            generated: "increment", 
            unsigned: true,
            nullable: false
        },
        id_tipo: {
            type: "int",
            unsigned: true,
            nullable: false
        },
        nome: {
            type: "varchar",
            length: 100,
            nullable: false
        },
        cpf: {
            type: "char", 
            length: 11,
            unique: true,
            nullable: false
        },
        data_nasc: {
            type: "date",
            nullable: false
        },
        telefone: {
            type: "varchar",
            length: 15,
            nullable: false
        },
        createdAt: {
            type: "timestamp", 
            createDate: true,
            nullable: false, 
        },
        updatedAt: {
            type: "timestamp",
            updateDate: true,
            nullable: true
        },
        deletedAt: {
            type: "timestamp", 
            deleteDate: true,
            nullable: true
        }
    },
    relations: {
        tipo: {
            type: "many-to-one",
            target: "TipoUsuario",
            joinColumn: {
                name: "id_tipo",
                referencedColumnName: "id"
            },
            nullable: false,
        },
        usuario_cad: {
            type: "one-to-one",
            target: "UsuarioCad",
            cascade: true,
            nullable: true,
            inverseSide: "usuario"
        },
        agendamentos: {
            type: "one-to-many",
            target: "Agendamento",
            inverseSide: "usuario"
        },
        controls: {
            type: "one-to-many",
            target: "Control",
            inverseSide: "usuario"
        }
    }
});

export default usuario;