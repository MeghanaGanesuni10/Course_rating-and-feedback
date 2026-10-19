/**
 * Admin creation script — run ONCE to create the first admin account.
 *
 * Usage:
 *   node src/scripts/createAdmin.js
 *
 * Set these environment variables BEFORE running (or put them in .env):
 *   ADMIN_NAME, ADMIN_EMAIL, ADMIN_PASSWORD
 *
 * Example:
 *   $env:ADMIN_NAME="Admin User"; $env:ADMIN_EMAIL="admin@courserate.dev"; $env:ADMIN_PASSWORD="SecurePass123!"; node src/scripts/createAdmin.js
 */
import 'dotenv/config';
import mongoose from 'mongoose';
import User from '../models/User.js';

const createAdmin = async () => {
  const uri = process.env.MONGO_URI;
  if (!uri) {
    console.error('❌  MONGO_URI not set.');
    process.exit(1);
  }

  const name = process.env.ADMIN_NAME;
  const email = process.env.ADMIN_EMAIL;
  const password = process.env.ADMIN_PASSWORD;

  if (!name || !email || !password) {
    console.error('❌  Set ADMIN_NAME, ADMIN_EMAIL, and ADMIN_PASSWORD environment variables.');
    console.error('    Never pass passwords as command-line arguments visible in shell history.');
    process.exit(1);
  }

  if (password.length < 8) {
    console.error('❌  ADMIN_PASSWORD must be at least 8 characters.');
    process.exit(1);
  }

  await mongoose.connect(uri, { dbName: 'courserate' });
  console.log('✅  Connected to MongoDB...');

  const existing = await User.findOne({ email: email.toLowerCase() });
  if (existing) {
    if (existing.role === 'admin') {
      console.log(`⚠️   ${email} is already an admin.`);
    } else {
      existing.role = 'admin';
      await existing.save();
      console.log(`✅  ${email} promoted to admin.`);
    }
  } else {
    await User.create({ name, email: email.toLowerCase(), password, role: 'admin' });
    console.log(`✅  Admin account created for ${email}.`);
  }

  await mongoose.connection.close();
  process.exit(0);
};

createAdmin().catch((err) => {
  console.error('❌  Error:', err.message);
  process.exit(1);
});
