import express from "express";
//Onde ficará os import dos controllers, criando as rotas de pesquisa.
import tipo_usuarioController from "./controllers/tipo_usuarioController.js";
import usuarioController from "./controllers/usuarioController.js";


const routes = express();

routes.use("/tipo_usuario", tipo_usuarioController);
routes.use("/usuario", usuarioController);


export default routes;