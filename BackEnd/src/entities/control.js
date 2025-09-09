import { EntitySchema } from "typeorm";

const control = new EntitySchema({
    name: "Control",
    tableName: "control",
    columns: {
        id: {
            primary: true,
            type: "int",
            generated: "increment",
            unsigned: true,
            nullable: false
        },
        id_usuario: {
            type: "int",
            unsigned: true,
            nullable: false
        },
        id_equip: {
            type: "int",
            unsigned: true,
            nullable: true
        },
        id_labs: {
            type: "int",
            unsigned: true,
            nullable: true
        },
        data_inicio: {
            type: "timestamp",
            createDate: true,
            nullable: false
        },
        data_fim: {
            type: "timestamp",
            nullable: true
        },
        status: {
            type: "enum",
            enum: ["aberto", "fechado", "pendente"],
            default: "aberto"
        },
        createdAt: {
            type: "timestamp", 
            createDate: true,
            nullable: false, 
        },
        deletedAt: {
            type: "timestamp", 
            deleteDate: true,
            nullable: true
        }
    },
    relations: {
        usuario: {
            type: "many-to-one",
            target: "Usuario",
            joinColumn: {
                name: "id_usuario",
                referencedColumnName: "id",
                onDelete: "CASCADE"
            },
            nullable: false,
        },
        equipamento: {
            type: "many-to-one",
            target: "Equipamento",
            joinColumn: {
                name: "id_equip",
                referencedColumnName: "id",
                onDelete: "SET NULL"
            },
            nullable: true
        },
        laboratorio: {
            type: "many-to-one",
            target: "Laboratorios",
            joinColumn: {
                name: "id_labs",
                referencedColumnName: "id",
                onDelete: "SET NULL"
            },
            nullable: true
        }
    }
});

export default control;