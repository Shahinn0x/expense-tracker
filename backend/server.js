// server.js
const express = require('express');
const mongoose = require('mongoose');
const passport = require('passport');
const session = require('express-session');
const methodOverride = require('method-override');
const bcrypt = require('bcryptjs');
const LocalStrategy = require('passport-local').Strategy;
const { User, Expense } = require('./models');
require('dotenv').config();

const app = express();

// Database Connection
mongoose.connect(process.env.MONGO_URI).then(() => console.log('DB Connected'));

// Passport Config
passport.use(new LocalStrategy({ usernameField: 'email' }, async (email, password, done) => {
  try {
    const user = await User.findOne({ email });
    if (!user) return done(null, false);
    const isMatch = await bcrypt.compare(password, user.password);
    return isMatch ? done(null, user) : done(null, false);
  } catch (err) { return done(err); }
}));
passport.serializeUser((user, done) => done(null, user.id));
passport.deserializeUser(async (id, done) => {
  const user = await User.findById(id);
  done(null, user);
});

// App Middleware
app.set('view engine', 'ejs');
app.use(express.urlencoded({ extended: false }));
app.use(methodOverride('_method'));
app.use(session({ secret: process.env.SESSION_SECRET, resave: false, saveUninitialized: false }));
app.use(passport.initialize());
app.use(passport.session());

const ensureAuth = (req, res, next) => req.isAuthenticated() ? next() : res.redirect('/login');

// Auth Routes
app.get('/register', (req, res) => res.render('register'));
app.post('/register', async (req, res) => {
  try {
    const hashedPassword = await bcrypt.hash(req.body.password, 10);
    const newUser = new User({ name: req.body.name, email: req.body.email, password: hashedPassword });
    await newUser.save();
    res.redirect('/login');
  } catch { res.redirect('/register'); }
});

app.get('/login', (req, res) => res.render('login'));
app.post('/login', passport.authenticate('local', { successRedirect: '/dashboard', failureRedirect: '/login' }));
app.get('/logout', (req, res, next) => {
  req.logout((err) => { if (err) return next(err); res.redirect('/login'); });
});

// Expense CRUD Dashboard Route
app.get('/dashboard', ensureAuth, async (req, res) => {
  const expenses = await Expense.find({ user: req.user.id });
  res.render('dashboard', { user: req.user, expenses });
});

// Create
app.post('/expenses', ensureAuth, async (req, res) => {
  const newExpense = new Expense({ ...req.body, user: req.user.id });
  await newExpense.save();
  res.redirect('/dashboard');
});

// Update
app.put('/expenses/:id', ensureAuth, async (req, res) => {
  await Expense.findOneAndUpdate({ _id: req.params.id, user: req.user.id }, req.body);
  res.redirect('/dashboard');
});

// Delete
app.delete('/expenses/:id', ensureAuth, async (req, res) => {
  await Expense.deleteOne({ _id: req.params.id, user: req.user.id });
  res.redirect('/dashboard');
}); 


app.listen(process.env.PORT, () => console.log('Server started'));

