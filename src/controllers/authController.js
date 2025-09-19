import User from '../models/User.js';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

export const register = async (req, res) => {
  try {
    const { email, password } = req.body;
    if(!email || !password) return res.status(400).json({error:'Email and password required'});
    const existing = await User.findOne({ email });
    if(existing) return res.status(400).json({ error: 'User exists' });
    const salt = await bcrypt.genSalt(10);
    const hash = await bcrypt.hash(password, salt);
    const trialEndsAt = new Date(Date.now() + 10*24*3600*1000); // 10 days
    const user = await User.create({ email, passwordHash: hash, trialEndsAt });
    return res.json({ ok: true, userId: user._id, email: user.email });
  } catch(err) {
    console.error(err);
    res.status(500).json({ error: 'server_error' });
  }
};

export const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    if(!email || !password) return res.status(400).json({error:'Email and password required'});
    const user = await User.findOne({ email });
    if(!user) return res.status(400).json({ error: 'Invalid creds' });
    const match = await bcrypt.compare(password, user.passwordHash || '');
    if(!match) return res.status(400).json({ error: 'Invalid creds' });
    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET || 'secret', { expiresIn: process.env.JWT_EXPIRY || '1d' });
    res.json({ token });
  } catch(err) {
    console.error(err);
    res.status(500).json({ error: 'server_error' });
  }
};
