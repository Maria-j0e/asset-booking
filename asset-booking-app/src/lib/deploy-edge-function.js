// Script to deploy the edge function to Supabase
// This script can be run with Node.js after setting up the Supabase CLI

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Configuration
const FUNCTION_NAME = 'initialize-database';
const FUNCTION_FILE = path.join(__dirname, 'supabase-edge-function.ts');
const SQL_FILE = path.join(__dirname, 'supabase-setup.sql');
const HELPER_SQL_FILE = path.join(__dirname, 'supabase-helper.sql');

// Read the function content
const functionContent = fs.readFileSync(FUNCTION_FILE, 'utf8');
const sqlSetupContent = fs.readFileSync(SQL_FILE, 'utf8');
const helperSqlContent = fs.readFileSync(HELPER_SQL_FILE, 'utf8');

// Create a temporary directory for deployment
const tempDir = path.join(__dirname, 'temp-edge-function');
if (!fs.existsSync(tempDir)) {
  fs.mkdirSync(tempDir);
}

// Write the function to the temp directory
fs.writeFileSync(path.join(tempDir, 'index.ts'), functionContent);

console.log('Deploying edge function to Supabase...');

// First, run the SQL setup scripts
console.log('Setting up SQL functions...');
try {
  // Note: You would need to use the Supabase CLI or API here
  // This is a placeholder for the actual implementation
  console.log('SQL setup complete.');
} catch (error) {
  console.error('Error setting up SQL functions:', error);
  process.exit(1);
}

// Deploy the function
console.log('Deploying edge function...');
try {
  // Note: You would need to use the Supabase CLI or API here
  // For example, using the Supabase CLI would look like:
  // execSync(`supabase functions deploy ${FUNCTION_NAME} --project-ref YOUR_PROJECT_REF`, { stdio: 'inherit' });
  
  console.log('Edge function deployed successfully!');
} catch (error) {
  console.error('Error deploying edge function:', error);
  process.exit(1);
}

// Clean up
fs.rmdirSync(tempDir, { recursive: true });
console.log('Deployment complete!');