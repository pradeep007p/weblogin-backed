const express = require('express');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const router = express.Router();

const auth = (req,res,next)=>{
  const authh = req.headers.authorization;
  if(!authh) return res.status(401).json({ error:'noauth' });
  const token = authh.split(' ')[1];
  try{
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    req.userId = payload.id;
    next();
  }catch(e){ return res.status(401).json({ error:'invalid' }); }
};

// get profiles
router.get('/profiles', auth, async (req,res)=>{
  const user = await User.findById(req.userId).lean();
  if(!user) return res.status(404).json({ error:'not_found' });
  res.json({ profiles: user.profiles, trialEndsAt: user.trialEndsAt, plan: user.plan, adsEnabled: user.adsEnabled, profileLimit: user.profileLimit });
});

// add profile
router.post('/profiles', auth, async (req,res)=>{
  try{
    const { name, proxy } = req.body;
    const user = await User.findById(req.userId);
    if(!user) return res.status(404).json({ error:'not_found' });
    if((user.profiles||[]).length >= user.profileLimit) return res.status(400).json({ error:'profile_limit_reached' });
    user.profiles.push({ name: name||('profile-'+(user.profiles.length+1)), proxy: proxy||null, active:true });
    await user.save();
    res.json({ ok:true, profiles: user.profiles });
  }catch(e){ console.error(e); res.status(500).json({ error:'err' }); }
});

module.exports = router;
