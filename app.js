const express = require('express');
const session = require('express-session');
const path = require('path');

const app = express();


app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(session({
  secret: 'expense-tracker-secret-key',
  resave: false,
  saveUninitialized: true
}));


app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));



const users = []; 
const expenses = []; 




function isAuthenticated(req, res, next) {
  if (req.session.user) {
    return next();
  }
  res.redirect('/login');
}


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


app.get('/login', (req, res) => {
  res.render('login', { error: null });
});


app.get('/delete-expense/:id', isAuthenticated, (req, res) => {
  const expenseIndex = expenses.findIndex(
    e => e.id === req.params.id && e.username === req.session.user.username
  );

  if (expenseIndex !== -1) {

    expenses.splice(expenseIndex, 1); 
  }


  res.redirect('/expense-list');
});

app.post('/login', (req, res) => {
  const { username, password } = req.body;
  const user = users.find(u => u.username === username && u.password === password);
  if (user) {
    req.session.user = user;
    return res.redirect('/home');
  }
  res.render('login', { error: 'Invalid username or password' });
});


app.get('/register', (req, res) => {
  res.render('register', { error: null });
});



app.post('/register', (req, res) => {
  const { username, password, email, fullName } = req.body;
  if (users.find(u => u.username === username)) {
    return res.render('register', { error: 'Username already exists!' });
  }
  users.push({ username, password, email, fullName });
  res.redirect('/login');
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


app.post('/add-expense', isAuthenticated, (req, res) => {
  const { name, amount, date, description } = req.body;
  expenses.push({
    id: Date.now().toString(),
    username: req.session.user.username,
    name,
    amount: parseFloat(amount).toFixed(2),
    date,
    description
  });
  res.redirect('/expense-list');
});

app.get("/api/user",async(req,res)=>{
    res.status(201).send('ok');
})

app.get('/expense-list', isAuthenticated, (req, res) => {
  const userExpenses = expenses.filter(e => e.username === req.session.user.username);
  res.render('expense-list', { expenses: userExpenses });
});


app.get('/update-expense/:id', isAuthenticated, (req, res) => {
  const expense = expenses.find(e => e.id === req.params.id && e.username === req.session.user.username);
  if (!expense) return res.redirect('/expense-list');
  res.render('update-expense', { expense });
});


app.post('/update-expense/:id', isAuthenticated, (req, res) => {
  const expenseIndex = expenses.findIndex(e => e.id === req.params.id && e.username === req.session.user.username);
  if (expenseIndex !== -1) {
    const { name, amount, date, description } = req.body;
    expenses[expenseIndex] = {
      ...expenses[expenseIndex],
      name,
      amount: parseFloat(amount).toFixed(2),
      date,
      description
    };
  }
  res.redirect('/expense-list');
});



app.get('/', (req, res) => {
  res.redirect('/home');
});


const PORT = 3000;
app.listen(PORT, () => {
  console.log(`Server is running at http://localhost:${PORT}`);
});
