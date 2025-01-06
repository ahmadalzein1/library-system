const express = require('express');
const mongoose = require('mongoose');

const app = express();
app.use(express.json());

// MongoDB Models
const Book = mongoose.model('Book', new mongoose.Schema({
  title: { en: String, ar: String },
  isbn: { type: String, unique: true },
  genre: String,
  description: { en: String, ar: String },
  numberOfAvailableCopies: Number,
  isBorrowable: Boolean,
  numberOfBorrowableDays: Number,
  isOpenToReviews: Boolean,
  minAge: Number,
  authorId: mongoose.Types.ObjectId,
  coverImageUrl: String,
  publishedDate: Date,
  isPublished: Boolean,
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
}));

const Author = mongoose.model('Author', new mongoose.Schema({
  name: { en: String, ar: String },
  email: String,
  biography: { en: String, ar: String },
  profileImageUrl: String,
  birthDate: Date,
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
}));

const Member = mongoose.model('Member', new mongoose.Schema({
  name: String,
  username: { type: String, unique: true },
  email: { type: String, unique: true },
  birthDate: Date,
  subscribedBooks: [mongoose.Types.ObjectId],
  borrowedBooks: [{
    borrowedBookId: mongoose.Types.ObjectId,
    borrowedDate: Date,
    returnDate: Date,
  }],
  returnRate: { type: Number, default: 100 },
}));

// Middleware to fetch member from headers
app.use(async (req, res, next) => {
  const memberId = req.header('X-Member-ID');
  if (!memberId) return res.status(400).send('Member ID is required in headers.');
  req.member = await Member.findById(memberId);
  if (!req.member) return res.status(404).send('Member not found.');
  next();
});



// Return a Book
app.post('/books/:id/return', async (req, res) => {
  const { id: bookId } = req.params;
  const member = req.member;
  const book = await Book.findById(bookId);
  if (!book) return res.status(404).send('Book not found.');

  const borrowedBook = member.borrowedBooks.find(b => b.borrowedBookId.equals(book._id));
  if (!borrowedBook) return res.status(404).send('Book not borrowed by member.');

  const now = new Date();
  const isOnTime = now <= borrowedBook.returnDate;

  // Update return rate
  const totalBooks = member.borrowedBooks.length;
  const onTimeBooks = member.returnRate * totalBooks / 100 + (isOnTime ? 1 : 0);
  member.returnRate = (onTimeBooks / totalBooks) * 100;

  // Remove from borrowedBooks
  member.borrowedBooks = member.borrowedBooks.filter(b => !b.borrowedBookId.equals(book._id));
  await member.save();

  // Update book availability
  book.numberOfAvailableCopies++;
  await book.save();

  res.send('Book returned successfully.');
});



// Subscribe to a Book
app.post('/books/:id/subscribe', async (req, res) => {
  const { id: bookId } = req.params;
  const member = req.member;
  if (member.subscribedBooks.includes(bookId)) return res.status(400).send('Already subscribed.');

  member.subscribedBooks.push(bookId);
  await member.save();
  res.send('Subscribed to book successfully.');
});

// Unsubscribe from a Book
app.post('/books/:id/unsubscribe', async (req, res) => {
  const { id: bookId } = req.params;
  const member = req.member;
  member.subscribedBooks = member.subscribedBooks.filter(b => !b.equals(bookId));
  await member.save();
  res.send('Unsubscribed from book successfully.');
});

// Connect to MongoDB and start the server
mongoose.connect('mongodb://localhost/library', { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => {
    app.listen(3000, () => console.log('Server running on http://localhost:3000'));
  })
  .catch(err => console.error('Could not connect to MongoDB:', err));
