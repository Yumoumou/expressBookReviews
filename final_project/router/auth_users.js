const express = require('express');
const jwt = require('jsonwebtoken');
let books = require("./booksdb.js");
const regd_users = express.Router();

let users = [
  {
    "username": "1",
    "password": "1"
  }
];

const isValid = (username) => { //returns boolean
  //write code to check is the username is valid
}

const authenticatedUser = (username, password) => { //returns boolean
  let validusers = users.filter((user) => user.username === username && user.password === password);

  return validusers.length > 0;
}

//only registered users can login
regd_users.post("/login", (req, res) => {
  const username = req.body.username;
  const password = req.body.password;

  if (!username || !password) {
    return res.status(400).json({
      messeage: "Username or password missing"
    });
  }

  if (authenticatedUser(username, password)) {
    let accessToken = jwt.sign({
      data: password
    }, 'access', { expiresIn: 60 * 60 });

    req.session.authorization = {
      accessToken, username
    }

    return res.status(200).json({
      message: "User successfully login"
    });
  } else {
    return res.status(208).json({
      message: "Wrong username or password"
    });
  }




});

// Add a book review
regd_users.put("/auth/review/:isbn", (req, res) => {
  const username = req.user.data;
  console.log(username);
  const userreview = req.body.review; //The review the user input
  const isbn = req.params.isbn;

  //Check if user has input review
  if (!userreview) {
    return res.status(400).json({ message: "Review is required" });
  }

  let book = books[isbn];
  //Check if book exists
  if (!books[isbn]) {
    return res.status(404).json({ message: "Book not found" });
  }


  let reviews = book["reviews"]; //Get the current reviews of the book

  // Initialize reviews as array if it doesn't exist
  if (!books[isbn].reviews[username]) {
    books[isbn].reviews[username] = userreview;
    return res.status(200).json({ message: "Review added successfully" });
  } else {
    // Update existing review
    books[isbn].reviews[username] = userreview;
    return res.status(200).json({ message: "Review updated successfully" });
  }
});

regd_users.delete(("/auth/review/:isbn"), (req, res) => {
  const isbn = req.params.isbn;
  const username = req.user.data;

  //Check if book exists
  if (!books[isbn]) {
    return res.status(404).json({ message: "Book not found" });
  }

  //Check if review exists
  let review = books[isbn].reviews[username];

  if (review) {
    delete books[isbn].reviews[username];
    return res.status(200).json({ message: "Review successfully deleted" });
  } else {
    return res.status(404).json({ message: "No review found" });
  }
});

module.exports.authenticated = regd_users;
module.exports.isValid = isValid;
module.exports.users = users;
