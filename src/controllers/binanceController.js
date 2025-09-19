import QRCode from 'qrcode';
import User from '../models/User.js';
import Subscription from '../models/Subscription.js';

const WALLET = process.env.BINANCE_WALLET || 'your_wallet_address_here';

export const getPayDetails = async (req, res) => {
  try {
    const { amount } = req.query;
    const data = WALLET + (amount ? `?amount=${amount}` : '');
    const qr = await QRCode.toDataURL(data);
    res.json({ success: true, wallet: WALLET, amount: amount || null, qr });
  } catch(err) {
    console.error('getPayDetails error', err);
    res.status(500).json({ error: 'server_error' });
  }
};

export const confirmPayment = async (req, res) => {
  try {
    const { userId, txId, plan } = req.body;
    if(!userId || !txId || !plan) return res.status(400).json({ error: 'userId, txId, plan required' });
    const user = await User.findById(userId);
    if(!user) return res.status(404).json({ error: 'user not found' });
    user.plan = plan;
    if(plan === 'pro_ads') user.profileLimit = 15;
    if(plan === 'pro_adfree') user.profileLimit = 30;
    if(plan === 'business') user.profileLimit = 100;
    await user.save();
    await Subscription.create({ userId: user._id, paddleSubscriptionId: txId, plan, status: 'active', lastPaymentDate: new Date() });
    res.json({ success: true });
  } catch(err) {
    console.error('confirmPayment error', err);
    res.status(500).json({ error: 'server_error' });
  }
};
