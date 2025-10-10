/**
 * @typedef {import('typeorm').MigrationInterface} MigrationInterface
 */

/**
 * @class
 * @implements {MigrationInterface}
 */
module.exports = class Db1760043414579 {
    name = 'Db1760043414579'

    async up(queryRunner) {
        await queryRunner.query(`CREATE TABLE \`agendamento\` (\`id\` int UNSIGNED NOT NULL AUTO_INCREMENT, \`id_labs\` int UNSIGNED NOT NULL, \`id_usuario\` int UNSIGNED NOT NULL, \`data_agendamento\` timestamp(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), \`data_utilizacao\` date NOT NULL, \`hora_inicio\` time NOT NULL, \`hora_fim\` time NOT NULL, \`finalidade\` varchar(100) NOT NULL, \`status\` enum ('agendado', 'finalizado', 'cancelado') NOT NULL DEFAULT 'agendado', \`createdAt\` timestamp(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), \`updatedAt\` timestamp(6) NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6), \`deletedAt\` timestamp(6) NULL, PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);
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
        await queryRunner.query(`ALTER TABLE \`agendamento\` ADD CONSTRAINT \`FK_21781af46883bcb909de798e0fd\` FOREIGN KEY (\`id_labs\`) REFERENCES \`labs\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`agendamento\` ADD CONSTRAINT \`FK_73dbec99adea7068ec070cb675d\` FOREIGN KEY (\`id_usuario\`) REFERENCES \`usuario\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    async down(queryRunner) {
        await queryRunner.query(`ALTER TABLE \`agendamento\` DROP FOREIGN KEY \`FK_73dbec99adea7068ec070cb675d\``);
        await queryRunner.query(`ALTER TABLE \`agendamento\` DROP FOREIGN KEY \`FK_21781af46883bcb909de798e0fd\``);
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
        await queryRunner.query(`DROP TABLE \`agendamento\``);
    }
}
