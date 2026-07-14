const express = require('express');
const session = require('express-session');
const path = require('path');
const connectDB = require("./config/db");

const app = express();

// Connect to MongoDB Atlas
connectDB();

// Middleware
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(session({
  secret: 'expense-tracker-secret-key',
  resave: false,
  saveUninitialized: true
}));

// View Engine Setup
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Models
const User = require("./models/User");
const Expense = require("./models/Expense");

// Authentication Middleware
function isAuthenticated(req, res, next) {
  if (req.session.user) {
    return next();
  }
  res.redirect('/login');
}

// Styling Globals for EJS Views
const CARD_STYLE = "background: #fff; padding: 30px; border-radius: 4px; box-shadow: 0 4px 10px rgba(0,0,0,0.05); max-width: 600px; margin: 40px auto; font-family: sans-serif;";
const CONTAINER_STYLE = "background-color: #f4f4f4; min-height: 100vh; padding: 20px; box-sizing: border-box; font-family: Arial, sans-serif;";
const INPUT_STYLE = "width: 100%; padding: 8px; margin: 8px 0 16px 0; border: 1px solid #ddd; border-radius: 4px; box-sizing: border-box;";
const BUTTON_GREEN = "width: 100%; background-color: #4CAF50; color: white; padding: 12px; border: none; border-radius: 4px; cursor: pointer; font-size: 14px;";
const BUTTON_BLUE = "width: 100%; background-color: #337ab7; color: white; padding: 12px; border: none; border-radius: 4px; cursor: pointer; font-size: 14px;";

app.use((req, res, next) => {
  res.locals.styles = { CARD_STYLE, CONTAINER_STYLE, INPUT_STYLE, BUTTON_GREEN, BUTTON_BLUE };
  res.locals.user = req.session.user || null;
  next();
});

// --- ROUTES ---

app.get('/', (req, res) => {
  res.redirect('/home');
});

app.get('/login', (req, res) => {
  res.render('login', { error: null });
});

// FIXED: Added async keyword to handle await
app.post('/login', async (req, res) => {
  try {
    const { username, password } = req.body;
    const user = await User.findOne({ username, password });
    
    if (user) {
      req.session.user = user;
      return res.redirect('/home');
    }
    res.render('login', { error: 'Invalid username or password' });
  } catch (err) {
    res.status(500).send("Server Error");
  }
});

app.get('/register', (req, res) => {
  res.render('register', { error: null });
});

app.post('/register', async (req, res) => {
  try {
    const { username, password, email, fullName } = req.body;
    const userExists = await User.findOne({ username });

    if (userExists) {
      return res.render("register", { error: "Username already exists!" });
    }
    
    await User.create({ username, password, email, fullName });
    res.redirect('/login');
  } catch (err) {
    res.status(500).send("Server Error");
  }
});

app.get('/logout', (req, res) => {
  req.session.destroy();
  res.redirect('/login');
});

app.get('/home', isAuthenticated, (req, res) => {
  res.render('home');
});

app.get('/add-expense', isAuthenticated, (req, res) => {
  res.render('add-expense');
});

app.post('/add-expense', isAuthenticated, async (req, res) => {
  try {
    const { name, amount, date, description } = req.body;
    await Expense.create({
      username: req.session.user.username,
      name,
      amount: parseFloat(amount).toFixed(2), // Consistently format decimals
      date,
      description
    });
    res.redirect('/expense-list');
  } catch (err) {
    res.status(500).send("Server Error");
  }
});

app.get("/api/user", async (req, res) => {
  res.status(201).send('ok');
});

// FIXED: Added async keyword to handle await
app.get('/expense-list', isAuthenticated, async (req, res) => {
  try {
    const userExpenses = await Expense.find({ username: req.session.user.username });
    res.render('expense-list', { expenses: userExpenses });
  } catch (err) {
    res.status(500).send("Server Error");
  }
});

// FIXED: Added async keyword to handle await
app.get('/update-expense/:id', isAuthenticated, async (req, res) => {
  try {
    const expense = await Expense.findById(req.params.id);
    if (!expense || expense.username !== req.session.user.username) {
      return res.redirect("/expense-list");
    }
    res.render('update-expense', { expense });
  } catch (err) {
    res.redirect('/expense-list');
  }
});

// FIXED: Migrated from old array logic to async MongoDB update logic
app.post('/update-expense/:id', isAuthenticated, async (req, res) => {
  try {
    const { name, amount, date, description } = req.body;
    
    await Expense.findOneAndUpdate(
      { _id: req.params.id, username: req.session.user.username },
      {
        name,
        amount: parseFloat(amount).toFixed(2),
        date,
        description
      }
    );
    
    res.redirect('/expense-list');
  } catch (err) {
    res.status(500).send("Server Error");
  }
});

const PORT = 3000;
app.listen(PORT, () => {
  console.log(`Server is running at http://localhost:${PORT}`);
});