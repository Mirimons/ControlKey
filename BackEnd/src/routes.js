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

routes.use("/agendamento", authenticate, agendamentoController);
routes.use("/labs", authenticate, labsController);
routes.use("/equipamento", authenticate, equipamentoController);

routes.use("/tipo_usuario", tipo_usuarioController);
routes.use("/usuario", usuarioController);
routes.use("/tipo_equip", authenticate, authorize, tipo_equipController);
routes.use("/control", authenticate, authorize, controlController);

export default routes;
