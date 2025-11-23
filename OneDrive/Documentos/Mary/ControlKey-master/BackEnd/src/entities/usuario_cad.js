import { EntitySchema } from "typeorm";

const usuario_cad = new EntitySchema({
    name: "UsuarioCad",
    tableName:"usuario_cad",
    columns: {
        id_usuario: { 
            primary: true,
            type: "int", 
            unsigned: true,
            nullable: false
        },
        matricula: {
            type: "varchar",
            length: 10,
            unique: true,
            nullable: false
        },
        email: {
            type: "varchar",
            length: 100,
            unique: true,
            nullable: false
        },
        senha: {
            type: "varchar",
            length: 255,
            nullable: true
        },
        passwordResetAt: {
            type: "timestamp",
            nullable: true,
            default: null
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
        usuario: {
            type: "one-to-one",
            target: "Usuario",
            joinColumn: {
                name: "id_usuario",
                referencedColumnName: "id",
                onDelete: "CASCADE",
                onUpdate: "CASCADE"
            },
            nullable: false,
            inverseSide: "usuario_cad"
        }
    }
});

export default usuario_cad;