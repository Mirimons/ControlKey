import express from "express";
import dashboardService from "../services/dashboardService.js";
const route = express.Router();

route.get("/stats", async (request, response) => {
  try {
    const stats = await dashboardService.getHomeStats();
    return response.status(200).json(stats);
  } catch (error) {
    console.error("Erro ao buscar stats do dashboard: ", error);
    return response.status(500).json({
      error: "Erro interno ao carregar dashboard",
    });
  }
});

route.get("/details", async (request, response) => {
  try {
    const details = await dashboardService.getDashboardDetails();
    return response.status(200).json(details);
  } catch (error) {
    console.error("Erro ao buscar detalhes do dashboard: ", error);
    return response.status(500).json({
      error: "Erro interno ao carregar detalhes",
    });
  }
});

route.get("/timestamps", async (request, response) => {
  try {
    const timestamps = await DashboardService.getLastUpdateTimestamps();
    return response.status(200).json(timestamps);
  } catch (error) {
    return response.status(500).json({ error: error.message });
  }
});

export default route;
