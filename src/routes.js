import express from "express";
//Onde ficará os import dos controllers, criando as rotas de pesquisa.
import tipo_usuarioController from "./controllers/tipo_usuarioController.js";
import usuarioController from "./controllers/usuarioController.js";
import tipo_equipController from "./controllers/tipo_equipController.js";
import equipamentoController from "./controllers/equipamentoController.js";
import labsController from "./controllers/labsController.js";
import usuario_cad from "./controllers/usuario_cadController.js";

const routes = express();

routes.use("/labs", labsController);
routes.use("/tipo_usuario", tipo_usuarioController);
routes.use("/usuario", usuarioController);
routes.use("/tipo_equip", tipo_equipController);
routes.use("/equipamento", equipamentoController);
routes.use("/usuario_cad", usuario_cadController);

export default routes;