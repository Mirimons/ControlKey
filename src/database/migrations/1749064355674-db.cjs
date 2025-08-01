/**
 * @typedef {import('typeorm').MigrationInterface} MigrationInterface
 */

/**
 * @class
 * @implements {MigrationInterface}
 */
module.exports = class Db1749064355674 {
    name = 'Db1749064355674'

    async up(queryRunner) {
        await queryRunner.query(`CREATE TABLE \`control\` (\`id\` int UNSIGNED NOT NULL AUTO_INCREMENT, \`id_usuario\` int UNSIGNED NOT NULL, \`id_equip\` int UNSIGNED NULL, \`id_labs\` int UNSIGNED NULL, \`data_inicio\` timestamp(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), \`data_fim\` timestamp NULL, \`status\` enum ('aberto', 'fechado') NOT NULL DEFAULT 'aberto', \`createdAt\` timestamp(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), \`deletedAt\` timestamp(6) NULL, PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);
        await queryRunner.query(`ALTER TABLE \`usuario_cad\` CHANGE \`senha\` \`senha\` varchar(50) NULL`);
        await queryRunner.query(`ALTER TABLE \`usuario_cad\` CHANGE \`deletedAt\` \`deletedAt\` timestamp(6) NULL`);
        await queryRunner.query(`ALTER TABLE \`usuario\` CHANGE \`deletedAt\` \`deletedAt\` timestamp(6) NULL`);
        await queryRunner.query(`ALTER TABLE \`tipo_usuario\` CHANGE \`createdAt\` \`createdAt\` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP`);
        await queryRunner.query(`ALTER TABLE \`tipo_usuario\` CHANGE \`deletedAt\` \`deletedAt\` datetime NULL`);
        await queryRunner.query(`ALTER TABLE \`tipo_equip\` CHANGE \`deletedAt\` \`deletedAt\` timestamp(6) NULL`);
        await queryRunner.query(`ALTER TABLE \`labs\` CHANGE \`deletedAt\` \`deletedAt\` timestamp(6) NULL`);
        await queryRunner.query(`ALTER TABLE \`equipamento\` CHANGE \`deletedAt\` \`deletedAt\` timestamp(6) NULL`);
        await queryRunner.query(`ALTER TABLE \`agendamento\` CHANGE \`deletedAt\` \`deletedAt\` timestamp(6) NULL`);
        await queryRunner.query(`ALTER TABLE \`control\` ADD CONSTRAINT \`FK_78ab57ed89be343c70a3a1b6f6d\` FOREIGN KEY (\`id_usuario\`) REFERENCES \`usuario\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`control\` ADD CONSTRAINT \`FK_aceeecca4f8d61260a56f5f05b6\` FOREIGN KEY (\`id_equip\`) REFERENCES \`equipamento\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`control\` ADD CONSTRAINT \`FK_e18bd8366515143272f6c4ee82e\` FOREIGN KEY (\`id_labs\`) REFERENCES \`labs\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    async down(queryRunner) {
        await queryRunner.query(`ALTER TABLE \`control\` DROP FOREIGN KEY \`FK_e18bd8366515143272f6c4ee82e\``);
        await queryRunner.query(`ALTER TABLE \`control\` DROP FOREIGN KEY \`FK_aceeecca4f8d61260a56f5f05b6\``);
        await queryRunner.query(`ALTER TABLE \`control\` DROP FOREIGN KEY \`FK_78ab57ed89be343c70a3a1b6f6d\``);
        await queryRunner.query(`ALTER TABLE \`agendamento\` CHANGE \`deletedAt\` \`deletedAt\` timestamp(6) NULL DEFAULT 'NULL'`);
        await queryRunner.query(`ALTER TABLE \`equipamento\` CHANGE \`deletedAt\` \`deletedAt\` timestamp(6) NULL DEFAULT 'NULL'`);
        await queryRunner.query(`ALTER TABLE \`labs\` CHANGE \`deletedAt\` \`deletedAt\` timestamp(6) NULL DEFAULT 'NULL'`);
        await queryRunner.query(`ALTER TABLE \`tipo_equip\` CHANGE \`deletedAt\` \`deletedAt\` timestamp(6) NULL DEFAULT 'NULL'`);
        await queryRunner.query(`ALTER TABLE \`tipo_usuario\` CHANGE \`deletedAt\` \`deletedAt\` datetime NULL DEFAULT 'NULL'`);
        await queryRunner.query(`ALTER TABLE \`tipo_usuario\` CHANGE \`createdAt\` \`createdAt\` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP()`);
        await queryRunner.query(`ALTER TABLE \`usuario\` CHANGE \`deletedAt\` \`deletedAt\` timestamp(6) NULL DEFAULT 'NULL'`);
        await queryRunner.query(`ALTER TABLE \`usuario_cad\` CHANGE \`deletedAt\` \`deletedAt\` timestamp(6) NULL DEFAULT 'NULL'`);
        await queryRunner.query(`ALTER TABLE \`usuario_cad\` CHANGE \`senha\` \`senha\` varchar(50) NULL DEFAULT 'NULL'`);
        await queryRunner.query(`DROP TABLE \`control\``);
    }
}
