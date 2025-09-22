// routes.js

const express = require('express');
const router = express.Router();
// const connection = require('./database'); // Import MySQL connection
// const { parseBody } = require('./middleware'); // Import middleware



// Route to render HTML page with input fields
router.get('/template', (req, res) => {
  res.render('index');
});

// Route to handle form submission
router.post('/message', (req, res) => {
  const { email, message } = req.body;
  const INSERT_MESSAGE_QUERY = `INSERT INTO messages (email, message) VALUES (?, ?)`;
  connection.query(INSERT_MESSAGE_QUERY, [email, message], (error, results) => {
    if (error) {
      console.error('Error inserting message: ' + error.stack);
      return res.status(500).send('Error inserting message');
    }
    console.log('Message inserted successfully');
    res.redirect('/');
  });
});

module.exports = router;
