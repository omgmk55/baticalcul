
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://gmogzhdepkimzqihnvhw.supabase.co';
const supabaseKey = 'sb_publishable__RW0d_E_IJBvEHCFQ1Meyg_InNp-J8P';

export const supabase = createClient(supabaseUrl, supabaseKey);
