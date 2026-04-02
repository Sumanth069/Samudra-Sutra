const { createClient } = require('@supabase/supabase-js');
const supabaseUrl = 'https://eutgnzuplehjrhvzvwrf.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImV1dGduenVwbGVoanJodnp2d3JmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzUwNzQ3MzUsImV4cCI6MjA5MDY1MDczNX0.OdJrnCPZGb1Cq6m4K7dNeBFRDa48-M0tpSwUbuRvayM';
const supabase = createClient(supabaseUrl, supabaseKey);

async function getColumns(tableName) {
  // Try querying a non-existent row to see if the error gives column info, 
  // or just do an insert with bad payload, actually, let's just make a REST call to GET /rest/v1/${tableName}?limit=1 
  // and see if we can get the PostgREST openapi spec!
  
  const res = await fetch(`${supabaseUrl}/rest/v1/?apikey=${supabaseKey}`);
  const openapi = await res.json();
  
  if (openapi && openapi.definitions) {
      console.log('TABLE', tableName, 'COLUMNS:');
      console.log(Object.keys(openapi.definitions[tableName].properties));
  } else {
     console.error("Couldn't read openapi spec");
  }
}

async function run() {
  await getColumns('pollution_reports');
  await getColumns('system_alerts');
  await getColumns('profiles');
  await getColumns('credit_transactions');
}

run();
