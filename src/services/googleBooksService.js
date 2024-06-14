import axios from 'axios';

const GOOGLE_BOOKS_API_URL = 'https://www.googleapis.com/books/v1/volumes';
const API_KEY = process.env.GOOGLE_BOOKS_API_KEY;

export async function searchBooks(query) {
  try {
    const response = await axios.get(GOOGLE_BOOKS_API_URL, {
      params: {
        q: query,
        key: API_KEY,
      },
    });
    return response.data.items || [];
  } catch (error) {
    throw new Error(`Google Books API error: ${error.message}`);
  }
}

export async function fetchBook(title) {
  try {
    const response = await axios.get(GOOGLE_BOOKS_API_URL, {
      params: {
        q: title,
        key: API_KEY,
      },
    });
    return response.data.items[0] || {};
  } catch (error) {
    throw new Error(`Google Books API error: ${error.message}`);
  }
}
