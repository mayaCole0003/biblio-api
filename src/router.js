/* eslint-disable consistent-return */
import { Router } from 'express';
import { check, validationResult } from 'express-validator';
import * as BookService from './services/googleBooksService';
import * as Books from './controllers/book_controller';
import * as Users from './controllers/user_controller';

const router = Router();

router.get('/', (req, res) => {
  res.json({ message: 'welcome to our book-sharing platform api!' });
});

// Add book search route
router.get('/books/search', async (req, res, next) => {
  try {
    const { query } = req.query;
    if (!query) {
      return res.status(400).json({ error: 'Query parameter is required' });
    }

    const books = await BookService.searchBooks(query);
    res.json({ items: books });
  } catch (error) {
    next(error);
  }
});

router.get('/books/fetchBook', async (req, res, next) => {
  try {
    const { title } = req.query;
    if (!title) {
      return res.status(400).json({ error: 'Query parameter is required' });
    }

    const bookInfo = await BookService.fetchBook(title);
    res.json({ items: bookInfo });
  } catch (error) {
    next(error);
  }
});
// Routes for managing books
router.route('/books')
  .post(async (req, res) => {
    try {
      const result = await Books.addBook(req, res);
      res.json(result);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  })
  .get(async (req, res) => {
    try {
      const result = await Books.getBooks();
      res.json(result);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

router.get('/books/all-uploaded', async (req, res) => {
  try {
    const allUploadedBooks = await Users.getAllUsersWithBooks(); // Call the controller function
    res.status(200).json(allUploadedBooks); // Send response with the data
  } catch (error) {
    console.error('Error in getting all uploaded books:', error); // Log the error
    res.status(500).json({ error: error.message }); // Send error response
  }
});

router.route('/books/:id')
  .get(async (req, res) => {
    try {
      const result = await Books.getBook(req.params.id);
      res.json(result);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  })
  .put(async (req, res) => {
    try {
      const result = await Books.updateBook(req.params.id, req.body);
      res.json(result);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  })
  .delete(async (req, res) => {
    try {
      const result = await Books.deleteBook(req.params.id);
      res.json(result);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

// Routes for user registration and login
router.post('/register', [
  check('name').notEmpty().withMessage('Name is required'),
  check('email').isEmail().withMessage('Valid email is required'),
  check('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters long'),
], (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  next();
}, async (req, res) => {
  try {
    const result = await Users.createUser(req.body);
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.post('/login', [
  check('email').isEmail().withMessage('Valid email is required'),
  check('password').notEmpty().withMessage('Password is required'),
], (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  next();
}, async (req, res) => {
  try {
    const result = await Users.loginUser(req.body);
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/users', async (req, res) => {
  try {
    const users = await Users.getUsers(req, res);
    res.status(200).json(users);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/users/:id', async (req, res) => {
  try {
    await Users.getUserById(req, res);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.delete('/users/:id', async (req, res) => {
  try {
    const result = await Users.deleteUser(req.params.id);
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.post('/users/:id/trade', async (req, res) => {
  try {
    const result = await Users.sendTradeRequest(req, res);
    res.status(201).json(result);
  } catch (error) {
    console.error('Error sending trade request:', error);
    res.status(500).json({ error: error.message });
  }
});

router.get('/users/:userId/trade', async (req, res) => {
  try {
    const result = await Users.getTradeRequests(req, res);
    res.status(200).json(result);
  } catch (error) {
    console.error('Error getting trade requests:', error);
    res.status(500).json({ error: error.message });
  }
});

router.put('/users/:userId/trade/:tradeId', async (req, res) => {
  try {
    const result = await Users.updateTradeRequest(req, res);
    res.status(200).json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// second bookId route
router.get('/users/getbooks/:id', async (req, res) => {
  try {
    const userId = req.params.id;
    const user = await Users.getUserById2(userId);

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    const books = await Books.getBooksById(user.uploadedBooks);
    res.json(books);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/trade-user/:id', async (req, res) => {
  try {
    const userId = req.params.id;
    const user = await Users.getUserById2(userId);

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    console.log('in router', userId);

    res.json(user);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Routes for wishlist
router.post('/users/:userId/wishlist', async (req, res) => {
  try {
    const result = await Books.addToWishlist(req, res);
    res.status(200).json(result);
  } catch (error) {
    console.error('Error adding to wishlist:', error.message);
    res.status(500).json({ error: error.message });
  }
});

router.get('/users/:userId/wishlist', async (req, res) => {
  try {
    const result = await Books.getWishlist(req.params.userId);
    res.json(result);
  } catch (error) {
    console.error('Error fetching wishlist:', error.message);
    res.status(500).json({ error: error.message });
  }
});

router.delete('/users/:userId/wishlist/:bookId', async (req, res) => {
  try {
    const result = await Books.removeFromWishlist(
      req.params.userId,
      req.params.bookId,
    );
    res.json(result);
  } catch (error) {
    console.error('Error removing from wishlist:', error.message);
    res.status(500).json({ error: error.message });
  }
});

export default router;
