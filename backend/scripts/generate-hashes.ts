import { hashPassword } from '../src/infrastructure/auth/password.js';

async function generateHashes() {
  console.log('Generating password hashes for seed file...\n');
  
  const adminHash = await hashPassword('Admin@123');
  const artistHash = await hashPassword('Artist@123');
  
  console.log('-- Admin User');
  console.log('-- Email: admin@vwaza.com');
  console.log('-- Password: Admin@123');
  console.log(`'${adminHash}',\n`);
  
  console.log('-- Artist User');
  console.log('-- Email: artist@vwaza.com');
  console.log('-- Password: Artist@123');
  console.log(`'${artistHash}',\n`);
  
  console.log('\nCopy these hashes into backend/migrations/seeds/001_seed_users.sql');
}

generateHashes().catch(console.error);
