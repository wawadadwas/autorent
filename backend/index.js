import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import carsRouter from './routes/cars.js';
import rentalsRouter from './routes/rentals.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// Routes
app.use('/api/cars', carsRouter);
app.use('/api/rentals', rentalsRouter);

app.get('/', (req, res) => {
  res.send('Car Rental Backend API is running.');
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
