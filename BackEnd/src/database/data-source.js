import "reflect-metadata";
import { DataSource } from "typeorm";
import dotenv from 'dotenv';

dotenv.config();

const AppDataSource = new DataSource({
    type: "mysql",
    host: process.env.DB_HOST || "localhost",
    username: process.env.DB_USER || "root",
    port: Number(process.env.DB_PORT) || 3306,
    password: process.env.DB_PASSWORD || "etecembu@123",
    database: process.env.DB_NAME || "control_key",
    entities: ["src/entities/*.js"],
    migrations: ["src/database/migrations/*.cjs"],
    synchronize: true
});

export {AppDataSource};