const express = require('express');
const speakeasy = require('speakeasy');
const User = require('../models/User');
const Proxy = require('../models/Proxy');
const router = express.Router();

// simple admin auth middleware (expects header x-admin-token)
const adminAuth = (req,res,next)=>{
  const token = req.headers['x-admin-token'];
  if(!token || token !== process.env.ADMIN_TOKEN) return res.status(401).json({ error:'noadmin' });
  next();
};

// admin login (returns ADMIN_TOKEN if password+2fa ok)
router.post('/login', (req,res)=>{
  const { password, token2fa } = req.body;
  if(password !== process.env.ADMIN_PASSWORD) return res.status(401).json({ error:'bad' });
  const secret = process.env.ADMIN_2FA_SECRET;
  if(secret){
    const ok = speakeasy.totp.verify({ secret, encoding:'base32', token: token2fa });
    if(!ok) return res.status(401).json({ error:'bad_2fa' });
  }
  res.json({ adminToken: process.env.ADMIN_TOKEN });
});

// user list
router.get('/users', adminAuth, async (req,res)=>{
  const users = await User.find().select('-passwordHash').lean();
  res.json({ users });
});

// update user plan/ads
router.post('/user/update', adminAuth, async (req,res)=>{
  const { userId, plan, adsEnabled } = req.body;
  const user = await User.findById(userId);
  if(!user) return res.status(404).json({ error:'not_found' });
  if(plan) user.plan = plan;
  if(typeof adsEnabled === 'boolean') user.adsEnabled = adsEnabled;
  // adjust limits
  if(user.plan === 'free'){ user.profileLimit = 5; user.adsEnabled = true; }
  if(user.plan === 'pro_ads'){ user.profileLimit = 10; user.adsEnabled = true; }
  if(user.plan === 'pro_adfree'){ user.profileLimit = 25; user.adsEnabled = false; }
  if(user.plan === 'business'){ user.profileLimit = 100; user.adsEnabled = false; }
  await user.save();
  res.json({ ok:true, user });
});

// proxy add/list
router.post('/proxy/add', adminAuth, async (req,res)=>{
  const { host, port, user:pu, pass, pool } = req.body;
  const p = await Proxy.create({ host, port, user:pu, pass, pool: pool||'default' });
  res.json({ ok:true, proxy: p });
});
router.get('/proxies', adminAuth, async (req,res)=>{
  const proxies = await Proxy.find().lean();
  res.json({ proxies });
});

module.exports = router;
