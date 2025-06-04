import "reflect-metadata";
import { DataSource } from "typeorm";

const AppDataSource = new DataSource({
    type: "mysql",
    host: "localhost",
    username: "root",
    port: 3306,
    password: "",
    database: "control_key",
    entities: ["src/entities/*.js"],
    migrations: ["src/database/migrations/*.cjs"]
});

export {AppDataSource};