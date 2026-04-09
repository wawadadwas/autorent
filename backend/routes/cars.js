import express from 'express';
import { supabase } from '../supabaseClient.js';

const router = express.Router();

// Get all cars
router.get('/', async (req, res) => {
  try {
    const { data: cars, error } = await supabase
      .from('cars')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;
    res.json(cars);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get a single car
router.get('/:id', async (req, res) => {
  try {
    const { data: car, error } = await supabase
      .from('cars')
      .select('*')
      .eq('id', req.params.id)
      .single();

    if (error) throw error;
    if (!car) return res.status(404).json({ error: 'Car not found' });
    
    res.json(car);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Create a new car (Admin only ideally)
router.post('/', async (req, res) => {
  try {
    const { custom_id, make, model, year, price_per_day, availability_status, image_url } = req.body;
    
    const { data, error } = await supabase
      .from('cars')
      .insert([
        { make, model, year, price_per_day, availability_status, image_url }
      ])
      .select();

    if (error) throw error;
    res.status(201).json(data[0]);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

export default router;
