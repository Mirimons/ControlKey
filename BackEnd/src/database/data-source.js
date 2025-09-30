import "reflect-metadata";
import { DataSource } from "typeorm";
import dotenv from 'dotenv';

dotenv.config();

const AppDataSource = new DataSource({
    type: "mysql",
    host: process.env.DB_HOST || "localhost",
    username: process.env.DB_USER || "root",
    port: Number(process.env.DB_PORT) || 3306,
<<<<<<< HEAD
    password: process.env.DB_PASSWORD || "",
=======
    password: process.env.DB_PASSWORD || "1804",
>>>>>>> 28927b37c524279544ddba6b5103910baf5fc5cb
    database: process.env.DB_NAME || "control_key",
    entities: ["src/entities/*.js"],
    migrations: ["src/database/migrations/*.cjs"],
    synchronize: true
});

export {AppDataSource};