const db = require('../config/db'); // Your database configuration

// Function to register a new user and map email to a wallet address
exports.registerUser = async (email, walletAddress, verificationCode) => {
    try {
        const [existingUser] = await db.query('SELECT * FROM users WHERE email = ?', [email]);

        if (existingUser.length > 0) {
            throw new Error('User already exists');
        }

        // Insert the new user into the database
        const [result] = await db.query(
            'INSERT INTO users (email, walletAddress, verificationCode, isVerified) VALUES (?, ?, ?, ?)',
            [email, walletAddress, verificationCode, false]
        );

        return result.insertId;
    } catch (error) {
        console.error('Error registering user: ', error);
        throw new Error('Error registering user');
    }
};

// Function to get user data by email
exports.getUserByEmail = async (email) => {
    try {
        const [user] = await db.query('SELECT * FROM users WHERE email = ?', [email]);

        if (user.length === 0) {
            throw new Error('User not found');
        }

        return user[0];
    } catch (error) {
        console.error('Error getting user by email: ', error);
        throw new Error('Error getting user by email');
    }
};

// Function to update the user's verification status after verifying their email
exports.verifyUserEmail = async (email) => {
    try {
        const [result] = await db.query('UPDATE users SET isVerified = ? WHERE email = ?', [true, email]);
        return result.affectedRows > 0;
    } catch (error) {
        console.error('Error verifying user email: ', error);
        throw new Error('Error verifying user email');
    }
};

// Function to update wallet balance after a transaction
exports.updateWalletBalance = async (walletAddress, newBalance) => {
    try {
        const [result] = await db.query(
            'UPDATE wallets SET balance = ? WHERE walletAddress = ?',
            [newBalance, walletAddress]
        );

        return result.affectedRows > 0;
    } catch (error) {
        console.error('Error updating wallet balance: ', error);
        throw new Error('Error updating wallet balance');
    }
};

// Function to check if the verification code is valid
exports.isVerificationCodeValid = async (email, code) => {
    try {
        const [user] = await db.query('SELECT * FROM users WHERE email = ?', [email]);

        if (user.length === 0) {
            throw new Error('User not found');
        }

        return user[0].verificationCode === code;
    } catch (error) {
        console.error('Error validating verification code: ', error);
        throw new Error('Error validating verification code');
    }
};
