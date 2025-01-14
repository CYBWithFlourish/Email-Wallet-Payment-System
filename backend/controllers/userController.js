const { getUserByEmail, addUser } = require('../models/userModel');
const { sendEmail } = require('../services/emailService');
const crypto = require('crypto');

// Generate Verification Code
const generateVerificationCode = () => crypto.randomBytes(3).toString('hex').toUpperCase();

// Register User
exports.registerUser = async (req, res) => {
    const { email, password } = req.body;

    const user = await getUserByEmail(email);
    if (user) {
        return res.status(400).json({ error: 'Email already registered.' });
    }

    const verificationCode = generateVerificationCode();
    const expiry = new Date(Date.now() + 10 * 60 * 1000);

    await addUser(email, password, verificationCode, expiry);
    await sendEmail(email, 'Verification Code', `Your code: ${verificationCode}. Expires in 10 minutes.`);

    res.status(200).json({ message: 'Verification code sent.' });
};
