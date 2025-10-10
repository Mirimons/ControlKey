import { EntitySchema } from "typeorm";

const agendamento = new EntitySchema ({
    name: "Agendamento",
    tableName: "agendamento",
    columns: {
        id: {
            primary: true,
            type: "int",
            generated: "increment",
            unsigned: true,
            nullable: false
        },
        id_labs: {
            type: "int",
            unsigned: true,
            nullable: false
        },
        id_usuario: {
            type: "int",
            unsigned: true,
            nullable: false
        },
        data_agendamento: {
            type: "timestamp",
            createDate: true,
            nullable: false, 
        },
        data_utilizacao: {
            type: "date",
            nullable: false
        },
        hora_inicio: {
            type: "time",
            nullable: false
        },
        hora_fim: {
            type: "time",
            nullable: false
        },
        finalidade: {
            type: "varchar",
            length: 100,
            nullable: false
        },
        status: {
            type: "enum",
            enum: ["agendado", "finalizado", "cancelado"],
            default: "agendado"
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
        laboratorio: {
            type: "many-to-one",
            target: "Laboratorios",
            joinColumn: {
                name: "id_labs",
                referencedColumnName: "id"
            },
            nullable: false,
        },
        usuario: {
            type: "many-to-one",
            target: "Usuario",
            joinColumn: {
                name: "id_usuario",
                referencedColumnName: "id"
            },
            nullable: false,
        }
    }
});

export default agendamento;