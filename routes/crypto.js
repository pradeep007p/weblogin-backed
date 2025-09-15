import express from "express";
import QRCode from "qrcode";

const router = express.Router();

// ✅ Binance Wallet (manual payments)
const BINANCE_WALLET = process.env.BINANCE_WALLET || "your_wallet_address_here";

// Generate QR code and return wallet info
router.get("/pay", async (req, res) => {
  try {
    const qr = await QRCode.toDataURL(BINANCE_WALLET);
    res.json({
      success: true,
      wallet: BINANCE_WALLET,
      qrCode: qr,
      note: "Send exact USDT amount to this wallet. Contact support after payment."
    });
  } catch (err) {
    res.status(500).json({ success: false, message: "QR code error", error: err });
  }
});

export default router;
