const crypto = require('crypto');

function generateApiKey() {
  return crypto.randomBytes(32).toString('hex');
}

// Generate API keys when this script is run directly
if (require.main === module) {
  console.log('\n=== API Key Generator ===\n');
  console.log('Generated API Keys:\n');
  console.log('DOCTOR_SERVICE_API_KEY=' + generateApiKey());
  console.log('PATIENT_SERVICE_API_KEY=' + generateApiKey());
  console.log('\nCopy these keys to your .env files');
  console.log('- Add to admin-portal backend/.env');
  console.log('- Add to main backend/.env as ADMIN_SERVICE_API_KEY\n');
}

module.exports = { generateApiKey };
