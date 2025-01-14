const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const userModel = require('../models/userModel');
const { sendVerificationEmail } = require('../services/emailService'); // Assuming you have an email service
const router = express.Router();

// Registration route
router.post('/register', async (req, res) => {
    const { email, password } = req.body;

    // Check if email is already in use
    try {
        const user = await userModel.getUserByEmail(email);
        if (user) {
            return res.status(400).json({ message: 'Email already registered' });
        }

        // Hash the password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Create the user
        const newUser = await userModel.createUser(email, hashedPassword);

        // Generate a verification code (assuming you implement this logic)
        const verificationCode = Math.floor(100000 + Math.random() * 900000); // Example 6-digit code

        // Send the verification email (you would have to implement this function in the emailService)
        await sendVerificationEmail(email, verificationCode);

        // Return success response
        res.status(201).json({ message: 'User registered successfully, verification email sent' });
    } catch (error) {
        console.error('Error during registration:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// Login route
router.post('/login', async (req, res) => {
    const { email, password } = req.body;

    try {
        const user = await userModel.getUserByEmail(email);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Check password
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(400).json({ message: 'Invalid password' });
        }

        // Generate JWT token
        const token = jwt.sign({ userId: user.id }, process.env.JWT_SECRET, { expiresIn: '1h' });

        // Send response with JWT token
        res.status(200).json({ message: 'Login successful', token });
    } catch (error) {
        console.error('Error during login:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// User profile route
router.get('/profile', async (req, res) => {
    const userId = req.userId; // Assuming you're using JWT and have middleware to extract userId

    try {
        const user = await userModel.getUserById(userId);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        res.status(200).json({
            email: user.email,
            walletAddress: user.walletAddress, // If applicable
            balance: user.balance // If applicable
        });
    } catch (error) {
        console.error('Error fetching profile:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// Update user password route
router.put('/update-password', async (req, res) => {
    const { oldPassword, newPassword } = req.body;
    const userId = req.userId; // Assuming you extract userId from JWT

    try {
        const user = await userModel.getUserById(userId);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Check if old password matches
        const isMatch = await bcrypt.compare(oldPassword, user.password);
        if (!isMatch) {
            return res.status(400).json({ message: 'Incorrect current password' });
        }

        // Hash the new password
        const hashedNewPassword = await bcrypt.hash(newPassword, 10);

        // Update the password in the database
        await userModel.updateUserPassword(userId, hashedNewPassword);

        res.status(200).json({ message: 'Password updated successfully' });
    } catch (error) {
        console.error('Error updating password:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// Verify email route (this should verify the code sent to the email)
router.post('/verify-email', async (req, res) => {
    const { email, verificationCode } = req.body;

    try {
        const user = await userModel.getUserByEmail(email);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Assuming you save the verification code temporarily for verification
        const isCodeValid = await userModel.verifyEmailCode(user.id, verificationCode);
        if (!isCodeValid) {
            return res.status(400).json({ message: 'Invalid verification code' });
        }

        // Mark the email as verified
        await userModel.verifyEmail(user.id);

        res.status(200).json({ message: 'Email verified successfully' });
    } catch (error) {
        console.error('Error verifying email:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

module.exports = router;
