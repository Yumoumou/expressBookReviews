const express = require('express');
let books = require("./booksdb.js");
let isValid = require("./auth_users.js").isValid;
let users = require("./auth_users.js").users;
const public_users = express.Router();

const doesExist = (username) => {
  let userwithsamename = users.filter((user) => user.username === username);

  return userwithsamename.length > 0;

}

public_users.post("/register", (req, res) => {
  const username = req.body.username;
  const password = req.body.password;

  if (username && password) {
    if (doesExist(username)) {
      return res.status(400).json({
        message: "Username already exists"
      });
    } else {
      users.push({
        "username": username,
        "password": password
      });
      return res.status(200).json({
        message: "User registered successfully"
      });
    }
  } else { //username or password missing in the req body
    return res.status(400).json({
      message: "Username or password missing"
    });
  }
});

// Get the book list available in the shop
public_users.get('/', async function (req, res) {
  try {
    const response = await new Promise((resolve) => {
      setTimeout(() => {
        resolve(books);
      }, 1000); // Simulate network delay
    });

    return res.status(200).json(response);
  } catch (error) {
    return res.status(500).json({ message: "Error fetching books" });
  }
});

// Get book details based on ISBN
public_users.get('/isbn/:isbn', async function (req, res) {
  const isbn = req.params.isbn;

  try {
    const response = await new Promise((resolve) => {
      setTimeout(() => {
        let book = books[isbn];
        if (book) {
          resolve(book);
        } else {
          resolve(null);
        }
      }, 1000);
    });

    if (!response) {
      return res.status(404).json({ message: "Book not found" });
    }
    return res.status(200).json(response);
  } catch (error) {
    return res.status(500).json({ message: "Error fetching book detail" });
  }
});

// Get book details based on author
public_users.get('/author/:author', async function (req, res) {
  try {
    const filtered_books = await new Promise((resolve) => {
      setTimeout(() => {
        const result = Object.entries(books)
          .filter(([isbn, book]) => book.author.toLowerCase() === req.params.author.toLowerCase());
        resolve(result);
      }, 1000);
    });

    if (filtered_books.length > 0) {
      return res.status(200).json(filtered_books);
    }
    return res.status(404).json({ message: `Author ${req.params.author} not found` });
  } catch (error) {
    return res.status(500).json({ message: "Error fetching books by author" });
  }
});

// Get all books based on title
public_users.get('/title/:title', async function (req, res) {
  try {
    const filtered_books = await new Promise((resolve) => {
      setTimeout(() => {
        const result = Object.entries(books)
          .filter(([isbn, book]) => book.title.toLowerCase().includes(req.params.title.toLowerCase()));
        resolve(result);
      }, 1000);
    });

    if (filtered_books.length > 0) {
      return res.status(200).json(filtered_books);
    }

    return res.status(404).json({ message: `Book with title ${req.params.title} not found` });
  } catch (error) {
    return res.status(500).json({ message: "Error fetching book detail by title" });
  }
});

//  Get book review
public_users.get('/review/:isbn', function (req, res) {
  const isbn = req.params.isbn;

  let filtered_book = books[isbn];

  if (filtered_book) {
    return res.status(200).json(filtered_book["reviews"]);
  } else {
    return res.status(404).json({ message: `Book ${isbn} not found` });
  }
});

module.exports.general = public_users;
