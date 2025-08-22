/**
 * @typedef {import('typeorm').MigrationInterface} MigrationInterface
 */

/**
 * @class
 * @implements {MigrationInterface}
 */
module.exports = class Db1755881832803 {
    name = 'Db1755881832803'

    async up(queryRunner) {
        await queryRunner.query(`CREATE TABLE \`labs\` (\`id\` int UNSIGNED NOT NULL AUTO_INCREMENT, \`nome_lab\` varchar(50) NOT NULL, \`desc_lab\` varchar(100) NULL, \`status\` enum ('livre', 'ocupado') NOT NULL DEFAULT 'livre', \`createdAt\` timestamp(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), \`deletedAt\` timestamp(6) NULL, PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);
        await queryRunner.query(`ALTER TABLE \`usuario_cad\` CHANGE \`senha\` \`senha\` varchar(255) NULL`);
        await queryRunner.query(`ALTER TABLE \`usuario_cad\` CHANGE \`passwordResetAt\` \`passwordResetAt\` timestamp NULL`);
        await queryRunner.query(`ALTER TABLE \`usuario_cad\` CHANGE \`deletedAt\` \`deletedAt\` timestamp(6) NULL`);
        await queryRunner.query(`ALTER TABLE \`usuario\` CHANGE \`deletedAt\` \`deletedAt\` timestamp(6) NULL`);
        await queryRunner.query(`ALTER TABLE \`tipo_usuario\` CHANGE \`createdAt\` \`createdAt\` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP`);
        await queryRunner.query(`ALTER TABLE \`tipo_usuario\` CHANGE \`deletedAt\` \`deletedAt\` datetime NULL`);
        await queryRunner.query(`ALTER TABLE \`tipo_equip\` CHANGE \`deletedAt\` \`deletedAt\` timestamp(6) NULL`);
        await queryRunner.query(`ALTER TABLE \`equipamento\` CHANGE \`deletedAt\` \`deletedAt\` timestamp(6) NULL`);
    }

    async down(queryRunner) {
        await queryRunner.query(`ALTER TABLE \`equipamento\` CHANGE \`deletedAt\` \`deletedAt\` timestamp(6) NULL DEFAULT 'NULL'`);
        await queryRunner.query(`ALTER TABLE \`tipo_equip\` CHANGE \`deletedAt\` \`deletedAt\` timestamp(6) NULL DEFAULT 'NULL'`);
        await queryRunner.query(`ALTER TABLE \`tipo_usuario\` CHANGE \`deletedAt\` \`deletedAt\` datetime NULL DEFAULT 'NULL'`);
        await queryRunner.query(`ALTER TABLE \`tipo_usuario\` CHANGE \`createdAt\` \`createdAt\` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP()`);
        await queryRunner.query(`ALTER TABLE \`usuario\` CHANGE \`deletedAt\` \`deletedAt\` timestamp(6) NULL DEFAULT 'NULL'`);
        await queryRunner.query(`ALTER TABLE \`usuario_cad\` CHANGE \`deletedAt\` \`deletedAt\` timestamp(6) NULL DEFAULT 'NULL'`);
        await queryRunner.query(`ALTER TABLE \`usuario_cad\` CHANGE \`passwordResetAt\` \`passwordResetAt\` timestamp NULL DEFAULT 'NULL'`);
        await queryRunner.query(`ALTER TABLE \`usuario_cad\` CHANGE \`senha\` \`senha\` varchar(255) NULL DEFAULT 'NULL'`);
        await queryRunner.query(`DROP TABLE \`labs\``);
    }
}
