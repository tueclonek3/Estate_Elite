import express from "express";
import { 
  agentRegister, 
  agentLogin, 
  agentLogout 
} from "../controllers/agentAuth.controller.js";

const router = express.Router();

router.post("/register", agentRegister);
router.post("/login", agentLogin);
router.post("/logout", agentLogout);

export default router;