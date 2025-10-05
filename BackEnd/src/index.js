import dotenv from 'dotenv';
dotenv.config();

import express from "express";
import cors from 'cors';
import routes from "./routes.js";
import { AppDataSource } from "./database/data-source.js";
import { initJobs } from './jobs/index.js';

const server = express();

const corsOptions = {
    origin: (origin, callback) => {
        const allowedOrigins = [
            'http://localhost:5173',
            process.env.FRONTEND_URL
        ];

        if(!origin || allowedOrigins.includes(origin)) {
            callback(null, true);
        } else {
            console.warn('Tentativa de acesso bloqueada: ', origin);
            callback(new Error('Não permitido por CORS'));
        }
    },
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true
};

server.use(cors(corsOptions));
server.use(express.json());
server.use("/", routes);

AppDataSource.initialize().then( async() => {
    console.log ("Banco de dados conectado!✨");

    try {
        initJobs();
        console.log("Jobs agendados inicializados!")
    }catch(jobError) {
        console.error("Erro ao inicializar jobs: ", jobError)
    }

    server.listen(3333, () => {
        console.log ("O servidor está funcionando!✨");
    });
}).catch(error => {
    console.error("Erro ao conectar com o banco: ", error);
    process.exit(1);
});