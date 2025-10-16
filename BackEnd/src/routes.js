import express from "express";

import tipoUsuarioController from "./controllers/tipoUsuarioController.js";
import usuarioController from "./controllers/usuarioController.js";
import tipoEquipController from "./controllers/tipoEquipController.js";
import equipamentoController from "./controllers/equipamentoController.js";
import labsController from "./controllers/labsController.js";
import agendamentoController from "./controllers/agendamentoController.js";
import controlController from "./controllers/controlController.js";
import loginController from "./controllers/loginController.js";
import refreshController from "./controllers/refreshController.js";
import dashboardController from "./controllers/dashboardController.js";
import { authenticate, authorize, PERMISSIONS } from "./utils/index.js";

const routes = express();

routes.use("/login", loginController);
routes.use("/refresh", refreshController);
routes.use("/dashboard", dashboardController);
routes.use("/control", controlController);

//routes.use("/labs", authenticate, authorize(PERMISSIONS.ADMIN), labsController);
routes.use("/labs", labsController);
//routes.use("/equipamento", authenticate, authorize(PERMISSIONS.ADMIN), equipamentoController);
routes.use("/equipamento", equipamentoController);
//routes.use("/agendamento", authenticate, authorize(PERMISSIONS.ADMIN), agendamentoController);
routes.use("/agendamento", agendamentoController);
//routes.use("/tipo_usuario", authenticate, authorize(PERMISSIONS.ADMIN), tipoUsuarioController);
routes.use("/tipo_usuario", tipoUsuarioController);
//routes.use("/usuario", authenticate, authorize(PERMISSIONS.ADMIN), usuarioController);
//routes.use("/usuario", authenticate, authorize(PERMISSIONS.ADMIN), usuarioController);
routes.use("/usuario", usuarioController);
//routes.use("/tipo_equip", authenticate, authorize(PERMISSIONS.ADMIN), tipoEquipController);
routes.use("/tipo_equip", tipoEquipController);

export default routes;
