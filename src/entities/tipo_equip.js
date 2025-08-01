import { EntitySchema } from "typeorm";

const tipo_equip = new EntitySchema({
    name: "TipoEquipamento",
    tableName:"tipo_equip",
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
            length: 100, 
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
        equipamentos: {
            type: "one-to-many",
            target: "Equipamento",
            inverseSide: "tipo"
        }
    }
});

export default tipo_equip;