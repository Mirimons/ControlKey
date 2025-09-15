import express from "express";

import tipo_usuarioController from "./controllers/tipo_usuarioController.js";
import usuarioController from "./controllers/usuarioController.js";
import tipo_equipController from "./controllers/tipo_equipController.js";
import equipamentoController from "./controllers/equipamentoController.js";
import labsController from "./controllers/labsController.js";
import agendamentoController from "./controllers/agendamentoController.js";
import controlController from "./controllers/controlController.js";
import loginController from "./controllers/loginController.js";
import refreshController from "./controllers/refreshController.js";

import { authenticate, authorize, PERMISSIONS } from "./utils/index.js";

const routes = express();

routes.use("/login", loginController);
routes.use("/refresh", refreshController);
routes.use("/control", controlController);
routes.use("/labs", labsController);
routes.use("/equipamento", equipamentoController);

routes.use("/agendamento", authenticate, authorize(PERMISSIONS.ADMIN), agendamentoController);
routes.use("/tipo_usuario", tipo_usuarioController);
routes.use("/usuario", usuarioController);
routes.use("/tipo_equip", authenticate, authorize(PERMISSIONS.ADMIN), tipo_equipController);

export default routes;
