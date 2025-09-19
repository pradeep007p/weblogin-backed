import axios from 'axios';
import querystring from 'querystring';
import crypto from 'crypto';
import User from '../models/User.js';
import Subscription from '../models/Subscription.js';

export const createPaylink = async (req, res) => {
  try {
    const { planId, userId, email } = req.body;
    if(!planId) return res.status(400).json({ error: 'planId required' });
    const payload = {
      vendor_id: process.env.PADDLE_VENDOR_ID,
      vendor_auth_code: process.env.PADDLE_API_KEY,
      product_id: planId,
      passthrough: JSON.stringify({ userId, email }),
      return_url: process.env.PADDLE_CHECKOUT_RETURN_URL
    };
    const resp = await axios.post('https://vendors.paddle.com/api/2.0/product/generate_pay_link', querystring.stringify(payload), { headers: { 'Content-Type': 'application/x-www-form-urlencoded' } });
    if(!resp.data || !resp.data.success) return res.status(500).json({ error: 'paddle_error', detail: resp.data });
    return res.json({ url: resp.data.response.url });
  } catch(err) {
    console.error('createPaylink error', err?.response?.data || err.message);
    res.status(500).json({ error: 'server_error' });
  }
};

const verifyHmac = (raw, secret, signature) => {
  const hmac = crypto.createHmac('sha256', secret);
  hmac.update(raw);
  const expected = hmac.digest('hex');
  if(signature === expected) return true;
  if(signature === Buffer.from(expected, 'hex').toString('base64')) return true;
  return false;
};

export const webhookHandler = async (req, res) => {
  try {
    const raw = req.body;
    const signature = req.headers['paddle-signature'] || req.headers['paddle_signature'];
    const secret = process.env.PADDLE_WEBHOOK_SECRET;
    if(!signature || !secret) return res.status(400).send('missing signature/secret');
    if(!verifyHmac(raw, secret, signature)) {
      console.warn('invalid paddle signature', signature);
      return res.status(400).send('invalid signature');
    }
    let event;
    try { event = JSON.parse(raw.toString('utf8')); } catch(e) { event = null; }
    console.log('Paddle webhook verified', event || '<form>');
    const alert = (event && (event.alert_name || event.event)) || (req.body && req.body.alert_name);
    if(alert === 'subscription_created' || alert === 'subscription_created_v2') {
      let passthrough = null;
      try { passthrough = event.passthrough ? JSON.parse(event.passthrough) : null; } catch(e){}
      const userId = passthrough?.userId || (req.body && req.body.passthrough && JSON.parse(req.body.passthrough).userId);
      const paddleSubId = (event && event.subscription_id) || req.body.subscription_id;
      const productId = (event && (event.product_id || event.plan_id)) || req.body.product_id;
      let user = null;
      if(userId) user = await User.findById(userId);
      else if(event && event.email) user = await User.findOne({ email: event.email });
      if(user) {
        user.paddleSubscriptionId = paddleSubId || '';
        if(productId == process.env.PADDLE_PLAN_PRO_ADS) { user.plan='pro_ads'; user.profileLimit=15; }
        else if(productId == process.env.PADDLE_PLAN_PRO_ADFREE) { user.plan='pro_adfree'; user.profileLimit=30; }
        else if(productId == process.env.PADDLE_PLAN_BUSINESS) { user.plan='business'; user.profileLimit=100; }
        await user.save();
        await Subscription.create({ userId: user._id, paddleSubscriptionId: paddleSubId, plan: user.plan, status: 'active' });
      } else {
        console.log('user not found for paddle webhook', userId, event && event.email);
      }
    } else if(alert && (alert.toString().includes('transaction') || alert.toString().includes('payment'))) {
      console.log('payment event', event || req.body);
    } else if(alert === 'subscription_cancelled') {
      const paddleSubId = (event && event.subscription_id) || req.body.subscription_id;
      const sub = await Subscription.findOne({ paddleSubscriptionId: paddleSubId });
      if(sub) { sub.status='cancelled'; await sub.save(); const user = await User.findById(sub.userId); if(user) { user.plan='trial'; user.profileLimit=8; await user.save(); } }
    } else {
      console.log('Unhandled paddle alert', alert);
    }
    return res.status(200).send('ok');
  } catch(err) {
    console.error('paddle webhook handler error', err);
    return res.status(500).send('server_error');
  }
};
