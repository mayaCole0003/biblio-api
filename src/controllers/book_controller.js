/* eslint-disable no-unused-vars */
import Book from '../models/book_model';
import User from '../models/user_model';

export async function addBook(req, res) {
  try {
    const { userId, bookDetails } = req.body;

    // Create a new book instance
    const book = new Book({ ...bookDetails, owner: userId });
    await book.save();

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    user.uploadedBooks.push(book._id);
    await user.save();

    return book;
  } catch (error) {
    return res
      .status(500)
      .json({ error: `Error creating book: ${error.message}` });
  }
}

export async function getBooks() {
  try {
    const books = await Book.find();
    return books;
  } catch (error) {
    throw new Error(`Error getting books: ${error.message}`);
  }
}

export async function getBook(bookId) {
  try {
    const book = await Book.findById(bookId);

    if (!book) {
      throw new Error('Book not found:');
    }

    return book;
  } catch (error) {
    throw new Error(`Error getting book: ${error.message}`);
  }
}

export async function getBooksById(bookIds) {
  try {
    const books = await Book.find({
      _id: { $in: bookIds },
    });

    if (books.length === 0) {
      throw new Error('No books found for the provided IDs');
    }

    return books;
  } catch (error) {
    throw new Error(`Error getting books: ${error.message}`);
  }
}

export async function deleteBook(bookId) {
  try {
    const book = await Book.findById(bookId);
    if (!book) {
      throw new Error(`Book with ID ${bookId} not found`);
    }

    const user = await User.findById(book.owner);
    if (user) {
      const bookIndex = user.uploadedBooks.indexOf(bookId);
      if (bookIndex !== -1) {
        user.uploadedBooks.splice(bookIndex, 1);
        await user.save();
      }
    }

    const deletedBook = await Book.findByIdAndDelete(bookId);
    if (!deletedBook) {
      throw new Error(`Book with ID ${bookId} not found`);
    }

    return deletedBook;
  } catch (error) {
    throw new Error(`Error deleting book: ${error.message}`);
  }
}

export async function addToWishlist(req, res) {
  try {
    const { userId, bookDetails } = req.body;

    // Check if the book already exists by a unique identifier, e.g., ISBN
    let book = await Book.findOne({ ISBN: bookDetails.ISBN });
    if (!book) {
      // If the book does not exist, create a new book instance
      book = new Book({ ...bookDetails, owner: userId });
      await book.save();
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Check if the book is already in the wishlist to prevent duplicates
    if (user.wishlist.indexOf(book._id) === -1) {
      user.wishlist.push(book._id);
      await user.save();
    }

    // user.wishlist.push(book._id);
    // await user.save();

    return book;
  } catch (error) {
    throw new Error(`Error adding to wishlist: ${error.message}`);
  }
}

export async function getWishlist(userId) {
  try {
    const user = await User.findById(userId).populate('wishlist');
    if (!user) throw new Error('User not found');
    return user.wishlist;
  } catch (error) {
    throw new Error(`Error fetching wishlist: ${error.message}`);
  }
}

export async function removeFromWishlist(userId, bookId) {
  try {
    const user = await User.findById(userId);
    if (!user) throw new Error('User not found');

    const index = user.wishlist.indexOf(bookId);
    if (index > -1) {
      user.wishlist.splice(index, 1);
      await user.save();
    }
    return { message: 'Book removed from wishlist', wishlist: user.wishlist };
  } catch (error) {
    throw new Error(`Error removing from wishlist: ${error.message}`);
  }
}
