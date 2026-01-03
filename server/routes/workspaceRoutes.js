import express from "express";
import {
  getUserWorkspaces,
  addMember,
} from "../controllers/workspaceController.js";
import { protect } from "../middlewares/authMiddleware.js";

const router = express.Router();

router.get("/", protect, getUserWorkspaces);
router.post("/members", protect, addMember);

export default router;
