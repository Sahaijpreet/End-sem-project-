import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';
import User from '../models/User.js';

dotenv.config();

const email = process.env.ADMIN_EMAIL;
const password = process.env.ADMIN_PASSWORD;
const name = process.env.ADMIN_NAME || 'Platform Admin';

async function run() {
  if (!email || !password) {
    console.error('Set ADMIN_EMAIL and ADMIN_PASSWORD in .env before running seed:admin');
    process.exit(1);
  }

  await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/saar_db');
  const salt = await bcrypt.genSalt(10);
  const PasswordHash = await bcrypt.hash(password, salt);

  const existing = await User.findOne({ Email: email });
  if (existing) {
    existing.Role = 'Admin';
    existing.PasswordHash = PasswordHash;
    if (name && existing.Name !== name) existing.Name = name;
    await existing.save();
    console.log('Admin user updated (role + password):', email);
    await mongoose.disconnect();
    return;
  }

  await User.create({
    Name: name,
    Email: email,
    PasswordHash,
    Role: 'Admin',
  });
  console.log('Admin user created:', email);
  await mongoose.disconnect();
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
