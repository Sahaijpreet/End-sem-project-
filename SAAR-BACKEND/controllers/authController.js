import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import User from '../models/User.js';
import { sendEmail, passwordResetOTPEmail, emailVerificationEmail, welcomeEmail } from '../utils/email.js';

const generateToken = (id) => jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: '30d' });

// Password strength validation
const validatePassword = (password) => {
  const minLength = 8;
  const hasUpperCase = /[A-Z]/.test(password);
  const hasLowerCase = /[a-z]/.test(password);
  const hasNumbers = /\d/.test(password);
  const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);
  
  const errors = [];
  if (password.length < minLength) errors.push('Password must be at least 8 characters long');
  if (!hasUpperCase) errors.push('Password must contain at least one uppercase letter');
  if (!hasLowerCase) errors.push('Password must contain at least one lowercase letter');
  if (!hasNumbers) errors.push('Password must contain at least one number');
  if (!hasSpecialChar) errors.push('Password must contain at least one special character');
  
  return { isValid: errors.length === 0, errors };
};

// Check if account is locked
const isAccountLocked = (user) => {
  return user.AccountLocked && user.AccountLockedUntil && user.AccountLockedUntil > Date.now();
};

// Lock account after failed attempts
const lockAccount = async (user) => {
  const lockTime = 15 * 60 * 1000; // 15 minutes
  user.AccountLocked = true;
  user.AccountLockedUntil = Date.now() + lockTime;
  user.LoginAttempts = 0;
  await user.save();
};

export const registerUser = async (req, res) => {
  try {
    console.log('Registration request body:', req.body);
    const { Name, Email, Password, CollegeID } = req.body;
    
    if (!Name || !Email || !Password) {
      console.log('Missing required fields:', { Name: !!Name, Email: !!Email, Password: !!Password });
      return res.status(400).json({ success: false, message: 'Name, Email and Password are required' });
    }
    
    // Validate password strength
    const passwordValidation = validatePassword(Password);
    if (!passwordValidation.isValid) {
      return res.status(400).json({ 
        success: false, 
        message: 'Password does not meet requirements',
        errors: passwordValidation.errors
      });
    }
    
    const existingUser = await User.findOne({ Email });
    if (existingUser) {
      console.log('User already exists with email:', Email);
      return res.status(400).json({ success: false, message: 'User already exists' });
    }
    
    console.log('Creating new user...');
    const salt = await bcrypt.genSalt(10);
    const PasswordHash = await bcrypt.hash(Password, salt);
    
    // Generate email verification token
    const emailVerificationToken = crypto.randomBytes(32).toString('hex');
    const emailVerificationExpires = Date.now() + 24 * 60 * 60 * 1000; // 24 hours
    
    const user = await User.create({ 
      Name, 
      Email, 
      PasswordHash, 
      Role: 'Student', 
      CollegeID,
      EmailVerificationToken: emailVerificationToken,
      EmailVerificationExpires: emailVerificationExpires
    });
    console.log('User created successfully:', user._id);
    
    // Send verification email
    try {
      await sendEmail(emailVerificationEmail(user.Email, user.Name, emailVerificationToken));
      console.log('Verification email sent to:', user.Email);
    } catch (emailError) {
      console.error('Failed to send verification email:', emailError.message);
      // Don't fail registration if email fails
    }
    
    // Get user data without sensitive fields
    const userData = await User.findById(user._id).select('-PasswordHash -EmailVerificationToken');
    
    const response = {
      success: true,
      message: 'Registration successful! Please check your email to verify your account.',
      data: { 
        ...userData.toObject(), 
        token: generateToken(user._id),
        emailVerificationRequired: true
      },
    };
    
    console.log('Sending registration response');
    res.status(201).json(response);
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

export const loginUser = async (req, res) => {
  try {
    const { Email, Password } = req.body;
    if (!Email || !Password) {
      return res.status(400).json({ success: false, message: 'Email and Password are required' });
    }
    
    const emailTrim = Email.trim();
    const escaped = emailTrim.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const user = await User.findOne({
      Email: { $regex: new RegExp(`^${escaped}$`, 'i') },
    }).select('+PasswordHash +LoginAttempts +AccountLocked +AccountLockedUntil');
    
    if (!user) {
      return res.status(401).json({ success: false, message: 'Invalid email or password' });
    }
    
    // Check if account is locked
    if (isAccountLocked(user)) {
      const lockTimeRemaining = Math.ceil((user.AccountLockedUntil - Date.now()) / (1000 * 60));
      return res.status(423).json({ 
        success: false, 
        message: `Account is locked. Try again in ${lockTimeRemaining} minutes.`,
        accountLocked: true,
        lockTimeRemaining
      });
    }
    
    // Check password
    const isPasswordValid = await bcrypt.compare(Password, user.PasswordHash);
    
    if (!isPasswordValid) {
      // Increment failed login attempts
      user.LoginAttempts = (user.LoginAttempts || 0) + 1;
      
      // Lock account after 5 failed attempts
      if (user.LoginAttempts >= 5) {
        await lockAccount(user);
        return res.status(423).json({ 
          success: false, 
          message: 'Account locked due to too many failed login attempts. Try again in 15 minutes.',
          accountLocked: true
        });
      }
      
      await user.save();
      const attemptsRemaining = 5 - user.LoginAttempts;
      return res.status(401).json({ 
        success: false, 
        message: `Invalid email or password. ${attemptsRemaining} attempts remaining.`,
        attemptsRemaining
      });
    }
    
    // Successful login - reset attempts and update last login
    user.LoginAttempts = 0;
    user.AccountLocked = false;
    user.AccountLockedUntil = undefined;
    user.LastLogin = new Date();
    await user.save();
    
    // Get full user data without sensitive fields
    const userData = await User.findById(user._id).select('-PasswordHash -LoginAttempts -AccountLockedUntil');
    
    // Send welcome email for first login (if email is verified)
    if (!user.LastLogin && userData.EmailVerified) {
      try {
        await sendEmail(welcomeEmail(userData.Email, userData.Name));
      } catch (emailError) {
        console.error('Failed to send welcome email:', emailError.message);
      }
    }
    
    res.json({
      success: true,
      data: { 
        ...userData.toObject(), 
        token: generateToken(user._id),
        firstLogin: !user.LastLogin
      },
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

export const forgotPassword = async (req, res) => {
  try {
    const { Email } = req.body;
    if (!Email) {
      return res.status(400).json({ success: false, message: 'Email is required' });
    }
    
    // Check if email service is configured
    if (!process.env.SMTP_HOST || !process.env.SMTP_USER || !process.env.SMTP_PASS) {
      return res.status(500).json({ 
        success: false, 
        message: 'Email service is not configured. Please contact administrator.' 
      });
    }
    
    const user = await User.findOne({ Email: { $regex: new RegExp(`^${Email.trim()}$`, 'i') } });
    if (!user) {
      // Don't reveal if user exists or not for security
      return res.json({ success: true, message: 'If an account with that email exists, an OTP has been sent.' });
    }
    
    // Generate 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    
    // Save OTP and expiry to user (5 minutes expiry)
    user.PasswordResetOTP = otp;
    user.PasswordResetOTPExpires = Date.now() + 5 * 60 * 1000; // 5 minutes
    await user.save();
    
    // Send email with OTP
    try {
      await sendEmail(passwordResetOTPEmail(user.Email, user.Name, otp));
      res.json({ success: true, message: 'OTP sent to your email. Please check your inbox.' });
    } catch (emailError) {
      // Clear the OTP if email fails
      user.PasswordResetOTP = undefined;
      user.PasswordResetOTPExpires = undefined;
      await user.save();
      
      console.error('Email sending failed:', emailError.message);
      return res.status(500).json({ 
        success: false, 
        message: 'Failed to send OTP email. Please try again later.' 
      });
    }
  } catch (error) {
    console.error('Forgot password error:', error);
    res.status(500).json({ success: false, message: 'Server error. Please try again later.' });
  }
};

export const verifyOTP = async (req, res) => {
  try {
    const { Email, OTP } = req.body;
    if (!Email || !OTP) {
      return res.status(400).json({ success: false, message: 'Email and OTP are required' });
    }
    
    // Find user with valid OTP
    const user = await User.findOne({
      Email: { $regex: new RegExp(`^${Email.trim()}$`, 'i') },
      PasswordResetOTP: OTP,
      PasswordResetOTPExpires: { $gt: Date.now() }
    });
    
    if (!user) {
      return res.status(400).json({ success: false, message: 'Invalid or expired OTP' });
    }
    
    // Generate temporary token for password reset (valid for 10 minutes)
    const resetToken = crypto.randomBytes(32).toString('hex');
    const resetTokenHash = crypto.createHash('sha256').update(resetToken).digest('hex');
    
    // Clear OTP and set reset token
    user.PasswordResetOTP = undefined;
    user.PasswordResetOTPExpires = undefined;
    user.PasswordResetToken = resetTokenHash;
    user.PasswordResetExpires = Date.now() + 10 * 60 * 1000; // 10 minutes
    await user.save();
    
    res.json({ 
      success: true, 
      message: 'OTP verified successfully',
      resetToken: resetToken
    });
  } catch (error) {
    console.error('Verify OTP error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

export const resetPassword = async (req, res) => {
  try {
    const { token, Password } = req.body;
    if (!token || !Password) {
      return res.status(400).json({ success: false, message: 'Token and password are required' });
    }
    
    if (Password.length < 6) {
      return res.status(400).json({ success: false, message: 'Password must be at least 6 characters' });
    }
    
    // Hash the token to compare with stored hash
    const resetTokenHash = crypto.createHash('sha256').update(token).digest('hex');
    
    // Find user with valid reset token
    const user = await User.findOne({
      PasswordResetToken: resetTokenHash,
      PasswordResetExpires: { $gt: Date.now() }
    }).select('+PasswordHash');
    
    if (!user) {
      return res.status(400).json({ success: false, message: 'Invalid or expired reset token' });
    }
    
    // Hash new password
    const salt = await bcrypt.genSalt(10);
    const PasswordHash = await bcrypt.hash(Password, salt);
    
    // Update password and clear reset token
    user.PasswordHash = PasswordHash;
    user.PasswordResetToken = undefined;
    user.PasswordResetExpires = undefined;
    await user.save();
    
    res.json({ success: true, message: 'Password reset successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const updateProfile = async (req, res) => {
  try {
    const { Name, CollegeID, Bio, Branch, Year } = req.body;
    const updates = {};
    if (Name) updates.Name = Name;
    if (CollegeID !== undefined) updates.CollegeID = CollegeID;
    if (Bio !== undefined) updates.Bio = Bio;
    if (Branch !== undefined) updates.Branch = Branch;
    if (Year !== undefined) updates.Year = Year || null;
    if (req.file) updates.Avatar = `/uploads/${req.file.filename}`;
    const user = await User.findByIdAndUpdate(req.user._id, updates, { new: true, runValidators: true }).select('-PasswordHash');
    res.json({ success: true, data: user });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('-PasswordHash');
    res.json({ success: true, data: user });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const toggleBookmark = async (req, res) => {
  try {
    const { resourceType, resourceId } = req.params;
    const user = await User.findById(req.user._id);
    const idx = user.Bookmarks.findIndex(
      (b) => b.ResourceType === resourceType && b.ResourceID.toString() === resourceId
    );
    if (idx === -1) {
      user.Bookmarks.push({ ResourceType: resourceType, ResourceID: resourceId });
    } else {
      user.Bookmarks.splice(idx, 1);
    }
    await user.save();
    res.json({ success: true, data: { bookmarked: idx === -1, count: user.Bookmarks.length } });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const verifyEmail = async (req, res) => {
  try {
    const { token } = req.body;
    if (!token) {
      return res.status(400).json({ success: false, message: 'Verification token is required' });
    }
    
    const user = await User.findOne({
      EmailVerificationToken: token,
      EmailVerificationExpires: { $gt: Date.now() }
    });
    
    if (!user) {
      return res.status(400).json({ success: false, message: 'Invalid or expired verification token' });
    }
    
    user.EmailVerified = true;
    user.EmailVerificationToken = undefined;
    user.EmailVerificationExpires = undefined;
    await user.save();
    
    // Send welcome email
    try {
      await sendEmail(welcomeEmail(user.Email, user.Name));
    } catch (emailError) {
      console.error('Failed to send welcome email:', emailError.message);
    }
    
    res.json({ 
      success: true, 
      message: 'Email verified successfully! Welcome to SAAR!' 
    });
  } catch (error) {
    console.error('Email verification error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

export const resendVerificationEmail = async (req, res) => {
  try {
    const { Email } = req.body;
    if (!Email) {
      return res.status(400).json({ success: false, message: 'Email is required' });
    }
    
    const user = await User.findOne({ Email: { $regex: new RegExp(`^${Email.trim()}$`, 'i') } });
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }
    
    if (user.EmailVerified) {
      return res.status(400).json({ success: false, message: 'Email is already verified' });
    }
    
    // Generate new verification token
    const emailVerificationToken = crypto.randomBytes(32).toString('hex');
    const emailVerificationExpires = Date.now() + 24 * 60 * 60 * 1000; // 24 hours
    
    user.EmailVerificationToken = emailVerificationToken;
    user.EmailVerificationExpires = emailVerificationExpires;
    await user.save();
    
    // Send verification email
    try {
      await sendEmail(emailVerificationEmail(user.Email, user.Name, emailVerificationToken));
      res.json({ success: true, message: 'Verification email sent successfully' });
    } catch (emailError) {
      console.error('Failed to send verification email:', emailError.message);
      res.status(500).json({ success: false, message: 'Failed to send verification email' });
    }
  } catch (error) {
    console.error('Resend verification error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};
export const getBookmarks = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('Bookmarks');
    const noteIds = user.Bookmarks.filter((b) => b.ResourceType === 'Note').map((b) => b.ResourceID);
    const pyqIds = user.Bookmarks.filter((b) => b.ResourceType === 'PYQ').map((b) => b.ResourceID);
    const [{ default: Note }, { default: PYQ }] = await Promise.all([
      import('../models/Note.js'),
      import('../models/PYQ.js'),
    ]);
    const [notes, pyqs] = await Promise.all([
      Note.find({ _id: { $in: noteIds } }).populate('UploaderID', 'Name').select('Title Subject Semester CoverImage Likes Downloads'),
      PYQ.find({ _id: { $in: pyqIds } }).populate('UploaderID', 'Name').select('Title Subject Semester Year ExamType Likes Downloads'),
    ]);
    res.json({ success: true, data: { notes, pyqs } });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
