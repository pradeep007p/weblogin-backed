import express from "express";
import * as paddleController from "../controllers/paddleController.js";
const router = express.Router();

router.post("/create-paylink", paddleController.createPaylink);
router.post("/webhook", paddleController.webhookHandler);

export default router;
