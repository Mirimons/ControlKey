import { EntitySchema } from "typeorm";

const equipamento = new EntitySchema ({
    name: "Equipamento",
    tableName: "equipamento",
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
        desc_equip: {
            type: "varchar",
            length: 100,
            nullable: false
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
            target: "TipoEquipamento",
            joinColumn: {
                name: "id_tipo",
                referencedColumnName: "id"
            },
            nullable: false,
            inverseSide: "equipamentos"
        },
        controls: {
            type: "one-to-many",
            target: "Control",
            inverseSide: "equipamento"
        }
    }
});

export default equipamento;