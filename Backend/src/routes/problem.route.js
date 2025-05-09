import express from "express";
import {
  createProblems,
  deleteProblemById,
  getAllProblems,
  getAllProblemSolvedByUser,
  getProblemById,
  updateProblemById,
} from "../controller/problem.controller";
import { authMiddleware, checkAdmin } from "../middleware/auth.middleware";
const problemRoutes = express.Router();

problemRoutes.post(
  "/create-problem",
  authMiddleware,
  checkAdmin,
  createProblems
);
problemRoutes.get("/get-all-problems", authMiddleware, getAllProblems);
problemRoutes.get("/get-problem/:id", authMiddleware, getProblemById);
problemRoutes.put(
  "/update-problem/:id",
  authMiddleware,
  checkAdmin,
  updateProblemById
);
problemRoutes.delete(
  "/delete-problem/:id",
  authMiddleware,
  checkAdmin,
  deleteProblemById
);

problemRoutes.get(
  "/get-solved-problems",
  authMiddleware,
  getAllProblemSolvedByUser
);

export default problemRoutes;
