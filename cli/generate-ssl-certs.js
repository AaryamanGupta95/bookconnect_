/**
 * Generate SSL Certificates for HTTPS
 * This script generates self-signed certificates for localhost
 */

const { generateCertificate } = require('../utils/certGenerator');

async function main() {
  try {
    console.log('🔐 Generating SSL certificates for HTTPS...\n');
    await generateCertificate();
    console.log('\n✅ Certificate generation complete!');
    console.log('\n📝 Next steps:');
    console.log('   1. Run: powershell -ExecutionPolicy Bypass -File cli\\fix-secure.ps1');
    console.log('   2. Restart your server');
    console.log('   3. Restart your browser completely');
    console.log('   4. Visit https://localhost:3000');
    console.log('   5. You should see "Secure" (padlock icon) ✅\n');
  } catch (error) {
    console.error('\n❌ Error:', error.message);
    process.exit(1);
  }
}

main();













