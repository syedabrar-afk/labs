// --- Imports ---
const express = require('express');
const session = require('express-session');
const app = express();

// --- Configuration (Middleware) ---
app.use(express.json()); // Lets our server read JSON
app.use(express.static(__dirname)); // Serves our index.html
app.use(session({ // Simulates user logins
  secret: 'a-very-weak-secret-key',
  resave: false,
  saveUninitialized: true
}));

// --- Our "Database" (Just a simple array) ---
const db = {
  users: [
    { id: 1, username: 'alice', email: 'alice@acme.com', privateNote: 'My dog is named Sparky.', passwordHash: 'abc1234' },
    { id: 2, username: 'bob', email: 'bob@acme.com', privateNote: 'My secret password is "1234".', passwordHash: 'xyz9876' },
    { id: 3, username: 'admin', email: 'admin@acme.com', privateNote: 'I am the admin.', passwordHash: 'adminpass' }
  ],
  comments: [
    { author: 'alice', text: 'Hi everyone! This is the first comment.' }
  ]
};

// --- Our (Vulnerable) API Endpoints ---

// 1. "Login" endpoint (simulated)
app.get('/api/login/:id', (req, res) => {
  const userId = parseInt(req.params.id, 10);
  const user = db.users.find(u => u.id === userId);
  if (user) {
    req.session.userId = user.id; // "Log in" the user
    req.session.username = user.username;
    console.log(`User ${user.username} (ID: ${user.id}) logged in.`);
    res.json({ success: true, message: `Logged in as ${user.username}` });
  } else {
    res.status(404).json({ success: false, message: 'User not found' });
  }
});

// 2. Endpoint to get a user's details (vulnerable)
app.get('/api/user/:id', (req, res) => {
  const userId = parseInt(req.params.id, 10);
  const user = db.users.find(u => u.id === userId);
  if (user) {
    // VULNERABILITY #1 (IDOR) & #2 (Excessive Data):
    // We just find the user and return EVERYTHING.
    // We don't check who is *asking*.
    res.json(user);
  } else {
    res.status(404).json({ message: 'User not found' });
  }
});

// corrected Endpoint -
// app.get('/api/user/:id', (req, res) => {
//   const userId = parseInt(req.params.id, 10);
//   const loggedInUserId = req.session.userId;
//   const user = db.users.find(u => u.id === userId);
//   if (!user) {
//     res.status(404).json({ message: 'User not found' });
//     return;
//   }
//   if (userId == loggedInUserId) {
//     res.json({
//       username: user.username,
//       email: user.email,
//       privateNote: user.privateNote
//       // We are NOT sending the passwordHash!
//     });
//   } else {
//     // It's a public profile request, only send public data
//     res.json({
//       username: user.username
//     });
//   }
// });

// 3. Endpoint to get all comments
app.get('/api/comments', (req, res) => {
  res.json(db.comments);
});

// 4. Endpoint to post a new comment
app.post('/api/comments', (req, res) => {
  if (!req.session.userId) {
    return res.status(401).json({ message: 'Not logged in' });
  }
  // VULNERABILITY #3 (XSS):
  // We trust the user's input and save it directly.
  const newComment = {
    author: req.session.username,
    text: req.body.text
  };
  db.comments.push(newComment);
  res.json(newComment);
});

// 5. Endpoint to update a username
app.post('/api/user/update-username', (req, res) => {
  if (!req.session.userId) {
    return res.status(401).json({ message: 'Not logged in' });
  }
  // VULNERABILITY #4 (CSRF):
  // This request is only protected by a cookie.
  // There is no Anti-CSRF token.
  const user = db.users.find(u => u.id === req.session.userId);
  user.username = req.body.newName;
  req.session.username = req.body.newName;
  console.log(`User ${req.session.userId} changed name to ${req.body.newName}`);
  res.json({ success: true, newName: user.username });
});


// --- Start the Server ---
app.listen(3000, () => {
  console.log('Vulnerable server running on http://localhost:3000');
}); 
