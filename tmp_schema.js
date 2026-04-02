const { createClient } = require('@supabase/supabase-js');
const supabaseUrl = 'https://eutgnzuplehjrhvzvwrf.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImV1dGduenVwbGVoanJodnp2d3JmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzUwNzQ3MzUsImV4cCI6MjA5MDY1MDczNX0.OdJrnCPZGb1Cq6m4K7dNeBFRDa48-M0tpSwUbuRvayM';
const supabase = createClient(supabaseUrl, supabaseKey);

async function check() {
  const { data, error } = await supabase.from('system_alerts').select('*').limit(1);
  if (error) {
    console.error('Error system_alerts:', error);
  } else {
    console.log('System Alerts row:', data);
  }
}
check();
