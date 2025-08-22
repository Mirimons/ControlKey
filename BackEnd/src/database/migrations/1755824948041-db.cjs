/**
 * @typedef {import('typeorm').MigrationInterface} MigrationInterface
 */

/**
 * @class
 * @implements {MigrationInterface}
 */
module.exports = class Db1755824948041 {
    name = 'Db1755824948041'

    async up(queryRunner) {
        await queryRunner.query(`ALTER TABLE \`usuario_cad\` CHANGE \`senha\` \`senha\` varchar(255) NULL`);
        await queryRunner.query(`ALTER TABLE \`usuario_cad\` CHANGE \`passwordResetAt\` \`passwordResetAt\` timestamp NULL`);
        await queryRunner.query(`ALTER TABLE \`usuario_cad\` CHANGE \`deletedAt\` \`deletedAt\` timestamp(6) NULL`);
        await queryRunner.query(`ALTER TABLE \`usuario\` CHANGE \`deletedAt\` \`deletedAt\` timestamp(6) NULL`);
        await queryRunner.query(`ALTER TABLE \`tipo_usuario\` CHANGE \`createdAt\` \`createdAt\` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP`);
        await queryRunner.query(`ALTER TABLE \`tipo_usuario\` CHANGE \`deletedAt\` \`deletedAt\` datetime NULL`);
        await queryRunner.query(`ALTER TABLE \`tipo_equip\` CHANGE \`deletedAt\` \`deletedAt\` timestamp(6) NULL`);
        await queryRunner.query(`ALTER TABLE \`labs\` CHANGE \`desc_lab\` \`desc_lab\` varchar(100) NULL`);
        await queryRunner.query(`ALTER TABLE \`labs\` CHANGE \`deletedAt\` \`deletedAt\` timestamp(6) NULL`);
        await queryRunner.query(`ALTER TABLE \`equipamento\` CHANGE \`deletedAt\` \`deletedAt\` timestamp(6) NULL`);
        await queryRunner.query(`ALTER TABLE \`control\` DROP FOREIGN KEY \`FK_aceeecca4f8d61260a56f5f05b6\``);
        await queryRunner.query(`ALTER TABLE \`control\` DROP FOREIGN KEY \`FK_e18bd8366515143272f6c4ee82e\``);
        await queryRunner.query(`ALTER TABLE \`control\` CHANGE \`id_equip\` \`id_equip\` int UNSIGNED NULL`);
        await queryRunner.query(`ALTER TABLE \`control\` CHANGE \`id_labs\` \`id_labs\` int UNSIGNED NULL`);
        await queryRunner.query(`ALTER TABLE \`control\` CHANGE \`data_fim\` \`data_fim\` timestamp NULL`);
        await queryRunner.query(`ALTER TABLE \`control\` CHANGE \`deletedAt\` \`deletedAt\` timestamp(6) NULL`);
        await queryRunner.query(`ALTER TABLE \`agendamento\` CHANGE \`deletedAt\` \`deletedAt\` timestamp(6) NULL`);
        await queryRunner.query(`ALTER TABLE \`usuario\` ADD CONSTRAINT \`FK_a56c58e5cabaa04fb2c98d2d7e2\` FOREIGN KEY (\`id\`) REFERENCES \`usuario_cad\`(\`id_usuario\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`control\` ADD CONSTRAINT \`FK_aceeecca4f8d61260a56f5f05b6\` FOREIGN KEY (\`id_equip\`) REFERENCES \`equipamento\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`control\` ADD CONSTRAINT \`FK_e18bd8366515143272f6c4ee82e\` FOREIGN KEY (\`id_labs\`) REFERENCES \`labs\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    async down(queryRunner) {
        await queryRunner.query(`ALTER TABLE \`control\` DROP FOREIGN KEY \`FK_e18bd8366515143272f6c4ee82e\``);
        await queryRunner.query(`ALTER TABLE \`control\` DROP FOREIGN KEY \`FK_aceeecca4f8d61260a56f5f05b6\``);
        await queryRunner.query(`ALTER TABLE \`usuario\` DROP FOREIGN KEY \`FK_a56c58e5cabaa04fb2c98d2d7e2\``);
        await queryRunner.query(`ALTER TABLE \`agendamento\` CHANGE \`deletedAt\` \`deletedAt\` timestamp(6) NULL DEFAULT 'NULL'`);
        await queryRunner.query(`ALTER TABLE \`control\` CHANGE \`deletedAt\` \`deletedAt\` timestamp(6) NULL DEFAULT 'NULL'`);
        await queryRunner.query(`ALTER TABLE \`control\` CHANGE \`data_fim\` \`data_fim\` timestamp NULL DEFAULT 'NULL'`);
        await queryRunner.query(`ALTER TABLE \`control\` CHANGE \`id_labs\` \`id_labs\` int UNSIGNED NULL DEFAULT 'NULL'`);
        await queryRunner.query(`ALTER TABLE \`control\` CHANGE \`id_equip\` \`id_equip\` int UNSIGNED NULL DEFAULT 'NULL'`);
        await queryRunner.query(`ALTER TABLE \`control\` ADD CONSTRAINT \`FK_e18bd8366515143272f6c4ee82e\` FOREIGN KEY (\`id_labs\`) REFERENCES \`labs\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`control\` ADD CONSTRAINT \`FK_aceeecca4f8d61260a56f5f05b6\` FOREIGN KEY (\`id_equip\`) REFERENCES \`equipamento\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`equipamento\` CHANGE \`deletedAt\` \`deletedAt\` timestamp(6) NULL DEFAULT 'NULL'`);
        await queryRunner.query(`ALTER TABLE \`labs\` CHANGE \`deletedAt\` \`deletedAt\` timestamp(6) NULL DEFAULT 'NULL'`);
        await queryRunner.query(`ALTER TABLE \`labs\` CHANGE \`desc_lab\` \`desc_lab\` varchar(100) NULL DEFAULT 'NULL'`);
        await queryRunner.query(`ALTER TABLE \`tipo_equip\` CHANGE \`deletedAt\` \`deletedAt\` timestamp(6) NULL DEFAULT 'NULL'`);
        await queryRunner.query(`ALTER TABLE \`tipo_usuario\` CHANGE \`deletedAt\` \`deletedAt\` datetime NULL DEFAULT 'NULL'`);
        await queryRunner.query(`ALTER TABLE \`tipo_usuario\` CHANGE \`createdAt\` \`createdAt\` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP()`);
        await queryRunner.query(`ALTER TABLE \`usuario\` CHANGE \`deletedAt\` \`deletedAt\` timestamp(6) NULL DEFAULT 'NULL'`);
        await queryRunner.query(`ALTER TABLE \`usuario_cad\` CHANGE \`deletedAt\` \`deletedAt\` timestamp(6) NULL DEFAULT 'NULL'`);
        await queryRunner.query(`ALTER TABLE \`usuario_cad\` CHANGE \`passwordResetAt\` \`passwordResetAt\` timestamp NULL DEFAULT 'NULL'`);
        await queryRunner.query(`ALTER TABLE \`usuario_cad\` CHANGE \`senha\` \`senha\` varchar(255) NULL DEFAULT 'NULL'`);
    }
}
