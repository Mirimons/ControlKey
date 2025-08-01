/**
 * @typedef {import('typeorm').MigrationInterface} MigrationInterface
 */

/**
 * @class
 * @implements {MigrationInterface}
 */
module.exports = class Db1749063950845 {
    name = 'Db1749063950845'

    async up(queryRunner) {
        await queryRunner.query(`CREATE TABLE \`tipo_equip\` (\`id\` int UNSIGNED NOT NULL AUTO_INCREMENT, \`desc_tipo\` varchar(100) NOT NULL, \`createdAt\` timestamp(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), \`deletedAt\` timestamp(6) NULL, PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);
        await queryRunner.query(`ALTER TABLE \`usuario_cad\` CHANGE \`senha\` \`senha\` varchar(50) NULL`);
        await queryRunner.query(`ALTER TABLE \`usuario_cad\` CHANGE \`deletedAt\` \`deletedAt\` timestamp(6) NULL`);
        await queryRunner.query(`ALTER TABLE \`usuario\` CHANGE \`deletedAt\` \`deletedAt\` timestamp(6) NULL`);
        await queryRunner.query(`ALTER TABLE \`tipo_usuario\` CHANGE \`createdAt\` \`createdAt\` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP`);
        await queryRunner.query(`ALTER TABLE \`tipo_usuario\` CHANGE \`deletedAt\` \`deletedAt\` datetime NULL`);
    }

    async down(queryRunner) {
        await queryRunner.query(`ALTER TABLE \`tipo_usuario\` CHANGE \`deletedAt\` \`deletedAt\` datetime NULL DEFAULT 'NULL'`);
        await queryRunner.query(`ALTER TABLE \`tipo_usuario\` CHANGE \`createdAt\` \`createdAt\` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP()`);
        await queryRunner.query(`ALTER TABLE \`usuario\` CHANGE \`deletedAt\` \`deletedAt\` timestamp(6) NULL DEFAULT 'NULL'`);
        await queryRunner.query(`ALTER TABLE \`usuario_cad\` CHANGE \`deletedAt\` \`deletedAt\` timestamp(6) NULL DEFAULT 'NULL'`);
        await queryRunner.query(`ALTER TABLE \`usuario_cad\` CHANGE \`senha\` \`senha\` varchar(50) NULL DEFAULT 'NULL'`);
        await queryRunner.query(`DROP TABLE \`tipo_equip\``);
    }
}
