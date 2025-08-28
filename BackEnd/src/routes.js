import express from "express";
//Onde ficará os import dos controllers, criando as rotas de pesquisa.
import tipo_usuarioController from "./controllers/tipo_usuarioController.js";
import usuarioController from "./controllers/usuarioController.js";
import tipo_equipController from "./controllers/tipo_equipController.js";
import equipamentoController from "./controllers/equipamentoController.js";
import labsController from "./controllers/labsController.js";
import agendamentoController from "./controllers/agendamentoController.js";
import controlController from "./controllers/controlController.js";
import loginControler from "./controllers/loginController.js";
import { authenticate, authorize } from './utils/index.js'

const routes = express();

routes.use("/login", loginControler);

routes.use("/control", authenticate, controlController);
routes.use("/agendamento",authenticate, agendamentoController);
routes.use("/labs",authenticate, labsController);
routes.use("/tipo_usuario", tipo_usuarioController);
routes.use("/usuario",  usuarioController);
routes.use("/tipo_equip", authenticate, tipo_equipController);
routes.use("/equipamento", authenticate, equipamentoController);

export default routes;