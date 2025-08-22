/**
 * @typedef {import('typeorm').MigrationInterface} MigrationInterface
 */

/**
 * @class
 * @implements {MigrationInterface}
 */
module.exports = class Db1755881712114 {
    name = 'Db1755881712114'

    async up(queryRunner) {
        await queryRunner.query(`CREATE TABLE \`usuario_cad\` (\`id_usuario\` int UNSIGNED NOT NULL, \`matricula\` varchar(10) NOT NULL, \`email_institucional\` varchar(100) NOT NULL, \`senha\` varchar(255) NULL, \`passwordResetAt\` timestamp NULL, \`createdAt\` timestamp(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), \`deletedAt\` timestamp(6) NULL, UNIQUE INDEX \`IDX_cfbeb39635dde17f08a9323cf0\` (\`email_institucional\`), PRIMARY KEY (\`id_usuario\`)) ENGINE=InnoDB`);
        await queryRunner.query(`ALTER TABLE \`usuario\` CHANGE \`deletedAt\` \`deletedAt\` timestamp(6) NULL`);
        await queryRunner.query(`ALTER TABLE \`tipo_usuario\` CHANGE \`createdAt\` \`createdAt\` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP`);
        await queryRunner.query(`ALTER TABLE \`tipo_usuario\` CHANGE \`deletedAt\` \`deletedAt\` datetime NULL`);
        await queryRunner.query(`ALTER TABLE \`usuario_cad\` ADD CONSTRAINT \`FK_36f63fd13f0291b37ccfd968953\` FOREIGN KEY (\`id_usuario\`) REFERENCES \`usuario\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`usuario\` ADD CONSTRAINT \`FK_a56c58e5cabaa04fb2c98d2d7e2\` FOREIGN KEY (\`id\`) REFERENCES \`usuario_cad\`(\`id_usuario\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    async down(queryRunner) {
        await queryRunner.query(`ALTER TABLE \`usuario\` DROP FOREIGN KEY \`FK_a56c58e5cabaa04fb2c98d2d7e2\``);
        await queryRunner.query(`ALTER TABLE \`usuario_cad\` DROP FOREIGN KEY \`FK_36f63fd13f0291b37ccfd968953\``);
        await queryRunner.query(`ALTER TABLE \`tipo_usuario\` CHANGE \`deletedAt\` \`deletedAt\` datetime NULL DEFAULT 'NULL'`);
        await queryRunner.query(`ALTER TABLE \`tipo_usuario\` CHANGE \`createdAt\` \`createdAt\` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP()`);
        await queryRunner.query(`ALTER TABLE \`usuario\` CHANGE \`deletedAt\` \`deletedAt\` timestamp(6) NULL DEFAULT 'NULL'`);
        await queryRunner.query(`DROP INDEX \`IDX_cfbeb39635dde17f08a9323cf0\` ON \`usuario_cad\``);
        await queryRunner.query(`DROP TABLE \`usuario_cad\``);
    }
}
