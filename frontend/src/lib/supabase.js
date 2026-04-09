import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://sdoizkhxzmvittpcfcae.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNkb2l6a2h4em12aXR0cGNmY2FlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzU2NTE0MzEsImV4cCI6MjA5MTIyNzQzMX0.rGe2-8labs3mrGEazURUO96IiXe2wte_WsaEYy2tBsY';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
