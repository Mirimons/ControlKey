import { EntitySchema } from "typeorm";

const labs = new EntitySchema({
    name: "Laboratorios",
    tableName:"labs",
    columns: {
        id: {
            primary: true, 
            type: "int", 
            generated: "increment", 
            unsigned: true,
            nullable: false
        },
        nome_lab: {
            type: "varchar",
            length: 50,
            nullable: false
        },
        desc_lab: {
            type: "varchar", 
            length: 100, 
            nullable: true
        },
        status: {
            type: "enum",
            enum: ["livre", "ocupado"],
            default: "livre",
            nullable: false
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
        agendamentos: {
            type: "one-to-many",
            target: "Agendamento",
            inverseSide: "laboratorio"
        },
        controls: {
            type: "one-to-many",
            target: "Control",
            inverseSide: "laboratorio"
        }
    }
});

export default labs;