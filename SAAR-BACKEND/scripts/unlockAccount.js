import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from '../models/User.js';

dotenv.config();

async function unlockAccount(email) {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to MongoDB');
    
    const user = await User.findOne({ 
      Email: { $regex: new RegExp(`^${email.trim()}$`, 'i') } 
    }).select('+LoginAttempts +AccountLocked +AccountLockedUntil');
    
    if (!user) {
      console.log('User not found');
      return;
    }
    
    console.log('User status:');
    console.log('- Email:', user.Email);
    console.log('- Login Attempts:', user.LoginAttempts || 0);
    console.log('- Account Locked:', user.AccountLocked || false);
    console.log('- Locked Until:', user.AccountLockedUntil ? new Date(user.AccountLockedUntil) : 'Not locked');
    
    if (user.AccountLocked) {
      user.AccountLocked = false;
      user.AccountLockedUntil = undefined;
      user.LoginAttempts = 0;
      await user.save();
      console.log('✅ Account unlocked successfully!');
    } else {
      console.log('✅ Account is not locked');
    }
    
  } catch (error) {
    console.error('Error:', error.message);
  } finally {
    await mongoose.disconnect();
  }
}

// Get email from command line argument
const email = process.argv[2];
if (!email) {
  console.log('Usage: node unlockAccount.js <email>');
  process.exit(1);
}

unlockAccount(email);