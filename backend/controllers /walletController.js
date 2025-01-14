const { sendTransaction } = require('../services/solanaService');
const { getWalletByEmail, updateWalletBalance } = require('../models/walletModel');
const { generateVerificationCode } = require('./userController');
const db = require('../config/db');

// Interact with Solana Blockchain for wallet transactions and process fee
exports.handleWalletTransaction = async (req, res) => {
    const { email, amount } = req.body;

    try {
        // Check if the email is mapped to a wallet
        const userWallet = await getWalletByEmail(email);
        if (!userWallet) {
            return res.status(400).json({ error: 'Wallet not found for this email.' });
        }

        // Ensure the user is verified
        if (!userWallet.isVerified) {
            return res.status(400).json({ error: 'User is not verified.' });
        }

        // Set the amount to send (subtract the transaction fee)
        const transactionAmount = parseFloat(amount) - 0.0001; // Subtracting 0.0001 SOL as a transaction fee

        // Trigger the Solana transaction
        const txHash = await sendTransaction(userWallet.walletAddress, transactionAmount);
        
        // Update the wallet balance after transaction
        const newBalance = parseFloat(userWallet.balance) - transactionAmount;
        await updateWalletBalance(userWallet.walletAddress, newBalance);

        res.status(200).json({
            message: 'Transaction successful.',
            transactionHash: txHash,
            newBalance: newBalance,
        });
    } catch (error) {
        console.error('Error in wallet transaction: ', error);
        res.status(500).json({ error: 'Failed to process transaction.' });
    }
};

// Get wallet balance
exports.getWalletBalance = async (req, res) => {
    const { email } = req.params;

    try {
        // Get wallet information by email
        const userWallet = await getWalletByEmail(email);
        if (!userWallet) {
            return res.status(400).json({ error: 'Wallet not found for this email.' });
        }

        res.status(200).json({
            message: 'Wallet balance fetched successfully.',
            balance: userWallet.balance,
        });
    } catch (error) {
        console.error('Error fetching wallet balance: ', error);
        res.status(500).json({ error: 'Failed to fetch wallet balance.' });
    }
};

// Fetch transaction history (for simplicity, assumes this information is stored in the database)
exports.getTransactionHistory = async (req, res) => {
    const { email } = req.params;

    try {
        // Get transaction history for the email from the database
        const [rows] = await db.query('SELECT * FROM transactions WHERE email = ?', [email]);

        if (rows.length === 0) {
            return res.status(400).json({ error: 'No transactions found for this email.' });
        }

        res.status(200).json({
            message: 'Transaction history fetched successfully.',
            transactions: rows,
        });
    } catch (error) {
        console.error('Error fetching transaction history: ', error);
        res.status(500).json({ error: 'Failed to fetch transaction history.' });
    }
};
