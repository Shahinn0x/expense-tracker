Here is a complete breakdown of your project, structured exactly like a real assessment review.

When presenting this project, interviewers won't just look at the code—they want to see if you understand **why** you wrote it this way, how the data flows, and how to secure or scale it.

---

## 1. Project Overview (The "Elevator Pitch")

> *"This is a lightweight, full-stack MVC (Model-View-Controller) Expense Tracker built using Node.js, Express, and EJS. It features secure user registration and login, session-based authentication, and full CRUD (Create, Read, Update, Delete) capabilities for managing personal expenses. To keep deployment fast and lightweight for this assessment, it utilizes an in-memory database configuration."*

---

## 2. Technical Walkthrough (How It Works)

* **View Layer (Frontend - EJS):** EJS (Embedded JavaScript) templates are compiled server-side. The server injects dynamic data (like the logged-in user's name or their specific expense list) into the HTML before sending it to the client.
* **Controller/Route Layer (Backend - Express):** Routes inside `app.js` act as traffic controllers. They receive incoming HTTP requests (GET/POST), verify if the user is logged in, manipulate the data array, and render the correct page.


* **Session State (Authentication):** `express-session` creates a temporary cookie on the user's browser. The backend references this cookie to keep the user logged in as they navigate from `/home` to `/add-expense`.
* **Data Flow Example (Adding an Expense):**
1. The user fills out the form in `/add-expense` and clicks submit.
2. A `POST` request is sent to `/add-expense` with the form payload.
3. The middleware `isAuthenticated` checks if `req.session.user` exists.
4. If authorized, the backend pushes a new expense object containing a unique ID (`Date.now()`) and the active user's `username` into the global array.
5. The browser is redirected to `/expense-list`, which pulls only the records matching the active username.



---

## 3. Top Interview Questions & How to Answer Them

### Q1: "Why did you use EJS instead of React/Angular?"

* **Good Answer:** *"For a simple, content-driven CRUD application like this, EJS is highly efficient. It allows server-side rendering (SSR), meaning the HTML is fully built on the server and sent to the browser in a single round-trip. This eliminates client-side routing complexity, speeds up initial page load, and keeps the codebase simple and lightweight without needing a heavy build step."*

### Q2: "How are you securing user passwords in this application? What is the problem with your current approach?"

* **Good Answer:** *"Right now, passwords are saved as plain text in the data array, which is a significant security risk. If this were a production application, I would use **bcrypt** to hash the passwords before saving them during registration, and use `bcrypt.compare()` during login to verify them safely."*

### Q3: "What happens to the expenses and users when the server restarts? How would you solve this?"

* **Good Answer:** *"Because we are using in-memory arrays (`const users = []` and `const expenses = []`), all data is lost whenever the Node.js process terminates. To solve this in production, I would integrate a persistent database. A relational database like **PostgreSQL** or a NoSQL database like **MongoDB** (using Mongoose) would allow us to store users and expenses securely and run complex queries."*

### Q4: "Explain what `isAuthenticated` does in your code."

* **Good Answer:** *"It is a custom middleware function. Before loading protected routes like `/expense-list` or `/add-expense`, Express runs this function. It checks if `req.session.user` is populated. If it is, the request proceeds using `next()`. If not, it blocks access and redirects the user to `/login`."*

### Q5: "How are you ensuring that User A cannot see or edit User B’s expenses?"


* **Good Answer:** *"We enforce data isolation at the route level. When an expense is created, we tag it with the logged-in user's username (`req.session.user.username`). When displaying or updating expenses, we use array filtering (`expenses.filter()` or `.find()`) to match against that specific username. This prevents unauthorized cross-user access."*

### Q6: "If you had more time, what features would you add next?"

* **Good Answer:** *"I would implement:*
1. *Password hashing using `bcrypt`.*
2. *A persistent database layer like MongoDB.*
3. *A 'Delete' route to complete the full CRUD cycle.*
4. *Form validation (using a library like `joi` or `express-validator`) to ensure invalid data or negative amounts cannot be submitted."*