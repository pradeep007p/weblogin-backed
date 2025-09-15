const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Proxy = require('../models/Proxy');
const router = express.Router();

const signAccess = user => jwt.sign({ id: user._id, role: user.role, plan: user.plan }, process.env.JWT_SECRET, { expiresIn: '1h' });
const signRefresh = user => jwt.sign({ id: user._id }, process.env.JWT_REFRESH_SECRET, { expiresIn: '30d' });

// Register
router.post('/register', async (req, res) => {
  try {
    const { email, password } = req.body;
    if(!email || !password) return res.status(400).json({ error: 'email+password required' });
    const exists = await User.findOne({ email });
    if(exists) return res.status(400).json({ error: 'email_taken' });

    const hash = await bcrypt.hash(password, 10);
    const trialEndsAt = new Date(Date.now() + 10*24*3600*1000);
    const user = await User.create({ email, passwordHash: hash, trialEndsAt, plan: 'free', profileLimit:5, adsEnabled:true });

    // create 5 default proxies + profiles (local placeholders)
    for(let i=0;i<5;i++){
      const p = await Proxy.create({ host:`free-proxy-${i+1}.local`, port:8000+i, user:'free', pass:'free', owner: user._id, pool:'default' });
      user.profiles.push({ name:`default-${i+1}`, proxy:{ host:p.host, port:p.port, user:p.user, pass:p.pass }, active:true });
    }
    await user.save();

    const access = signAccess(user);
    const refresh = signRefresh(user);
    res.json({ accessToken: access, refreshToken: refresh, trialEndsAt: user.trialEndsAt, plan: user.plan, profileLimit: user.profileLimit });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'internal' });
  }
});

// Login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    if(!email || !password) return res.status(400).json({ error:'email+password required' });
    const user = await User.findOne({ email });
    if(!user) return res.status(401).json({ error:'invalid' });
    const ok = await bcrypt.compare(password, user.passwordHash);
    if(!ok) return res.status(401).json({ error:'invalid' });
    const access = signAccess(user);
    const refresh = signRefresh(user);
    res.json({ accessToken: access, refreshToken: refresh, plan: user.plan, adsEnabled: user.adsEnabled, profileLimit: user.profileLimit });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error:'internal' });
  }
});

// Refresh
router.post('/refresh', async (req, res) => {
  try {
    const { token } = req.body;
    if(!token) return res.status(400).json({ error:'token required' });
    const payload = jwt.verify(token, process.env.JWT_REFRESH_SECRET);
    const user = await User.findById(payload.id);
    if(!user) return res.status(401).json({ error:'invalid' });
    const access = signAccess(user);
    res.json({ accessToken: access });
  } catch (err) {
    console.error(err);
    res.status(401).json({ error:'invalid' });
  }
});

module.exports = router;
