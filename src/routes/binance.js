import express from "express";
import * as binanceController from "../controllers/binanceController.js";
const router = express.Router();

router.get("/pay", binanceController.getPayDetails);
router.post("/confirm", binanceController.confirmPayment);

export default router;
