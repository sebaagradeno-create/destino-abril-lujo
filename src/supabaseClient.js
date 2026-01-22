import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://hxskblwcxgaosafxbygb.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imh4c2tibHdjeGdhb3NhZnhieWdiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjkxMDk4MTEsImV4cCI6MjA4NDY4NTgxMX0.D8ssMUGPqFgAjI8BlaUzWwgnptpZdmZpkCUGVVbKHa0'

export const supabase = createClient(supabaseUrl, supabaseKey)
