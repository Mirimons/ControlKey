import { EntitySchema } from "typeorm";

const tipo_usuario = new EntitySchema({
    name: "TipoUsuario",
    tableName:"tipo_usuario",
    columns: {
        id: {
            primary: true, 
            type: "int", 
            generated: "increment", 
            unsigned: true,
            nullable: false
        },
        desc_tipo: {
            type: "varchar", 
            length: 15, 
            nullable: false
        },
        createdAt: {
            type: "datetime", 
            nullable: false, 
            default: () => "CURRENT_TIMESTAMP"
        },
        updatedAt: {
            type: "timestamp",
            updateDate: true,
            nullable: true
        },
        deletedAt: {
            type: "datetime", 
            nullable: true
        }
    },
    relations: {
        usuarios: {
            type: "one-to-many",
            target: "Usuario",
            inverseSide: "tipo"
        }
    }
});

export default tipo_usuario;