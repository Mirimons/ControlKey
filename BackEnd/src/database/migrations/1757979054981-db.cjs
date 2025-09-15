/**
 * @typedef {import('typeorm').MigrationInterface} MigrationInterface
 */

/**
 * @class
 * @implements {MigrationInterface}
 */
module.exports = class Db1757979054981 {
    name = 'Db1757979054981'

    async up(queryRunner) {
        await queryRunner.query(`CREATE TABLE \`usuario\` (\`id\` int UNSIGNED NOT NULL AUTO_INCREMENT, \`id_tipo\` int UNSIGNED NOT NULL, \`nome\` varchar(100) NOT NULL, \`cpf\` char(11) NOT NULL, \`data_nasc\` date NOT NULL, \`telefone\` varchar(15) NOT NULL, \`createdAt\` timestamp(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), \`deletedAt\` timestamp(6) NULL, UNIQUE INDEX \`IDX_28cd8597e57c8197d4929a98e7\` (\`cpf\`), PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);
        await queryRunner.query(`ALTER TABLE \`tipo_usuario\` CHANGE \`createdAt\` \`createdAt\` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP`);
        await queryRunner.query(`ALTER TABLE \`tipo_usuario\` CHANGE \`deletedAt\` \`deletedAt\` datetime NULL`);
        await queryRunner.query(`ALTER TABLE \`usuario\` ADD CONSTRAINT \`FK_e8bfc0803f31395668d2b32e0c1\` FOREIGN KEY (\`id_tipo\`) REFERENCES \`tipo_usuario\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    async down(queryRunner) {
        await queryRunner.query(`ALTER TABLE \`usuario\` DROP FOREIGN KEY \`FK_e8bfc0803f31395668d2b32e0c1\``);
        await queryRunner.query(`ALTER TABLE \`tipo_usuario\` CHANGE \`deletedAt\` \`deletedAt\` datetime NULL DEFAULT 'NULL'`);
        await queryRunner.query(`ALTER TABLE \`tipo_usuario\` CHANGE \`createdAt\` \`createdAt\` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP()`);
        await queryRunner.query(`DROP INDEX \`IDX_28cd8597e57c8197d4929a98e7\` ON \`usuario\``);
        await queryRunner.query(`DROP TABLE \`usuario\``);
    }
}
