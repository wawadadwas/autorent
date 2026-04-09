import express from 'express';
import { supabase } from '../supabaseClient.js';

const router = express.Router();

// Get all rentals
router.get('/', async (req, res) => {
  try {
    const { data: rentals, error } = await supabase
      .from('rentals')
      .select(`
        *,
        cars (*)
      `)
      .order('created_at', { ascending: false });

    if (error) throw error;
    res.json(rentals);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Create a new rental
router.post('/', async (req, res) => {
  try {
    const { user_id, car_id, start_date, end_date, total_price } = req.body;
    
    const { data, error } = await supabase
      .from('rentals')
      .insert([
        { user_id, car_id, start_date, end_date, total_price, status: 'pending' }
      ])
      .select();

    if (error) throw error;
    res.status(201).json(data[0]);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Update rental status (Admin only ideally)
router.patch('/:id', async (req, res) => {
  try {
    const { status } = req.body;
    const { data, error } = await supabase
      .from('rentals')
      .update({ status })
      .eq('id', req.params.id)
      .select();

    if (error) throw error;
    res.json(data[0]);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

export default router;
