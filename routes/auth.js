const express = require('express');
const router = express.Router();
const User = require('../models/User');

router.get('/register', (req, res) => {
  res.render('register', { error: null, form: {} });
});

router.post('/register', async (req, res) => {
  const { name, email, password, role, company } = req.body;
  try {
    if (!name || !email || !password) throw new Error('All fields are required.');
    if (password.length < 6) throw new Error('Password must be at least 6 characters.');
    const existing = await User.findOne({ email: email.toLowerCase() });
    if (existing) throw new Error('That email is already registered.');

    const user = await User.create({
      name: name.trim(),
      email: email.trim().toLowerCase(),
      password,
      role: role === 'employer' ? 'employer' : 'seeker',
      company: role === 'employer' ? (company || '').trim() : undefined,
    });

    req.session.user = { id: user._id, name: user.name, email: user.email, role: user.role };
    res.redirect('/');
  } catch (err) {
    res.status(400).render('register', { error: err.message, form: req.body });
  }
});

router.get('/login', (req, res) => {
  res.render('login', { error: null, form: {} });
});

router.post('/login', async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await User.findOne({ email: (email || '').toLowerCase() });
    if (!user || !(await user.comparePassword(password || ''))) {
      throw new Error('Invalid email or password.');
    }
    req.session.user = { id: user._id, name: user.name, email: user.email, role: user.role };
    res.redirect('/');
  } catch (err) {
    res.status(400).render('login', { error: err.message, form: req.body });
  }
});

router.post('/logout', (req, res) => {
  req.session.destroy(() => res.redirect('/'));
});

module.exports = router;
