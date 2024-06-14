import express from 'express';
import cors from 'cors';
import path from 'path';
import morgan from 'morgan';
import mongoose from 'mongoose';
import helmet from 'helmet';
import dotenv from 'dotenv';
import apiRoutes from './router';

// Load environment variables
dotenv.config();

// Initialize Express app
const app = express();

// Middleware
app.use(cors());
app.use(morgan('dev'));
app.use(helmet());
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// Templating and static assets
app.set('view engine', 'ejs');
app.use(express.static('static'));
app.set('views', path.join(__dirname, '../src/views'));

// Routes
app.use('/api', apiRoutes);

// Default route
app.get('/', (req, res) => {
  res.send('hello world');
});

// Error handling middleware

// Start the server
async function startServer() {
  try {
    // Connect to MongoDB
    const mongoURI = process.env.MONGODB_URI || 'mongodb://localhost/biblio_platform_db';
    await mongoose.connect(mongoURI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log(`Mongoose connected to: ${mongoURI}`);

    const port = process.env.PORT || 9090;
    app.listen(port, () => {
      console.log(`Listening on port ${port}`);
    });
  } catch (error) {
    console.error(error);
  }
}

startServer();
