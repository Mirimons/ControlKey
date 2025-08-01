/**
 * @typedef {import('typeorm').MigrationInterface} MigrationInterface
 */

/**
 * @class
 * @implements {MigrationInterface}
 */
module.exports = class Db1749064035233 {
    name = 'Db1749064035233'

    async up(queryRunner) {
        await queryRunner.query(`CREATE TABLE \`equipamento\` (\`id\` int UNSIGNED NOT NULL AUTO_INCREMENT, \`id_tipo\` int UNSIGNED NOT NULL, \`desc_equip\` varchar(100) NOT NULL, \`createdAt\` timestamp(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), \`deletedAt\` timestamp(6) NULL, PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);
        await queryRunner.query(`ALTER TABLE \`usuario_cad\` CHANGE \`senha\` \`senha\` varchar(50) NULL`);
        await queryRunner.query(`ALTER TABLE \`usuario_cad\` CHANGE \`deletedAt\` \`deletedAt\` timestamp(6) NULL`);
        await queryRunner.query(`ALTER TABLE \`usuario\` CHANGE \`deletedAt\` \`deletedAt\` timestamp(6) NULL`);
        await queryRunner.query(`ALTER TABLE \`tipo_usuario\` CHANGE \`createdAt\` \`createdAt\` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP`);
        await queryRunner.query(`ALTER TABLE \`tipo_usuario\` CHANGE \`deletedAt\` \`deletedAt\` datetime NULL`);
        await queryRunner.query(`ALTER TABLE \`tipo_equip\` CHANGE \`deletedAt\` \`deletedAt\` timestamp(6) NULL`);
        await queryRunner.query(`ALTER TABLE \`equipamento\` ADD CONSTRAINT \`FK_472d36e72be3f87d8b417e9cc0b\` FOREIGN KEY (\`id_tipo\`) REFERENCES \`tipo_equip\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    async down(queryRunner) {
        await queryRunner.query(`ALTER TABLE \`equipamento\` DROP FOREIGN KEY \`FK_472d36e72be3f87d8b417e9cc0b\``);
        await queryRunner.query(`ALTER TABLE \`tipo_equip\` CHANGE \`deletedAt\` \`deletedAt\` timestamp(6) NULL DEFAULT 'NULL'`);
        await queryRunner.query(`ALTER TABLE \`tipo_usuario\` CHANGE \`deletedAt\` \`deletedAt\` datetime NULL DEFAULT 'NULL'`);
        await queryRunner.query(`ALTER TABLE \`tipo_usuario\` CHANGE \`createdAt\` \`createdAt\` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP()`);
        await queryRunner.query(`ALTER TABLE \`usuario\` CHANGE \`deletedAt\` \`deletedAt\` timestamp(6) NULL DEFAULT 'NULL'`);
        await queryRunner.query(`ALTER TABLE \`usuario_cad\` CHANGE \`deletedAt\` \`deletedAt\` timestamp(6) NULL DEFAULT 'NULL'`);
        await queryRunner.query(`ALTER TABLE \`usuario_cad\` CHANGE \`senha\` \`senha\` varchar(50) NULL DEFAULT 'NULL'`);
        await queryRunner.query(`DROP TABLE \`equipamento\``);
    }
}
