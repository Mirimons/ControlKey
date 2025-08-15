import express from "express";
//Onde ficará os import dos controllers, criando as rotas de pesquisa.
import tipo_usuarioController from "./controllers/tipo_usuarioController.js";
import usuarioController from "./controllers/usuarioController.js";
import tipo_equipController from "./controllers/tipo_equipController.js";
import equipamentoController from "./controllers/equipamentoController.js";
import labsController from "./controllers/labsController.js";
import agendamentoController from "./controllers/agendamentoController.js";
import usuario_cadController from "./controllers/usuario_cadController.js";
import controlController from "./controllers/controlController.js";
import loginControler from "./controllers/loginController.js";
import { authenticate } from "./utils/jwt.js";

const routes = express();

routes.use("/usuario_cad", usuario_cadController);
routes.use("/control", controlController);
routes.use("/agendamento", agendamentoController);
routes.use("/labs", labsController);
routes.use("/tipo_usuario", tipo_usuarioController);
routes.use("/usuario", usuarioController);
routes.use("/tipo_equip", tipo_equipController);
routes.use("/equipamento", equipamentoController);
routes.use("/usuario_cad", usuario_cadController);
routes.use("/login", loginControler);

export default routes;