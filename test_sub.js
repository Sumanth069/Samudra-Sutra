const { createClient } = require('@supabase/supabase-js');
const supabaseUrl = 'https://eutgnzuplehjrhvzvwfr.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImV1dGduenVwbGVoanJodnp2d3JmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzUwNzQ3MzUsImV4cCI6MjA5MDY1MDczNX0.OdJrnCPZGb1Cq6m4K7dNeBFRDa48-M0tpSwUbuRvayM';
const supabase = createClient(supabaseUrl, supabaseKey);

async function test() {
  const { data, error } = await supabase.from('pollution_reports').select('*').limit(1);
  if (error) {
    console.error('Supabase Error:', error.message);
  } else {
    console.log('Supabase Data:', data);
  }
}
test();
