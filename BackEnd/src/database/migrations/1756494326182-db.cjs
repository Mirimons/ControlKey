/**
 * @typedef {import('typeorm').MigrationInterface} MigrationInterface
 */

/**
 * @class
 * @implements {MigrationInterface}
 */
module.exports = class Db1756494326182 {
    name = 'Db1756494326182'

    async up(queryRunner) {
        await queryRunner.query(`CREATE TABLE \`tipo_usuario\` (\`id\` int UNSIGNED NOT NULL AUTO_INCREMENT, \`desc_tipo\` varchar(15) NOT NULL, \`createdAt\` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP, \`deletedAt\` datetime NULL, PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);
    }

    async down(queryRunner) {
        await queryRunner.query(`DROP TABLE \`tipo_usuario\``);
    }
}
