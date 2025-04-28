import express from "express";
import { authMiddleware, checkAdmin } from "../middleware/auth.middleware";
const problemRoutes = express.Router();
problemRoutes.post("createProblems",authMiddleware,checkAdmin)
export default problemRoutes;
