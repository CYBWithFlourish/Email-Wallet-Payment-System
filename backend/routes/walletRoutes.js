const express = require('express');
const walletController = require('../controllers/walletController');
const authMiddleware = require('../middleware/authMiddleware'); // Assuming you have JWT middleware to protect routes
const router = express.Router();

// Get wallet balance
router.get('/balance', authMiddleware, async (req, res) => {
    const userId = req.userId; // Assuming you extract userId from JWT

    try {
        // Fetch the wallet address associated with the user
        const walletAddress = await walletController.getWalletAddress(userId);
        if (!walletAddress) {
            return res.status(404).json({ message: 'Wallet address not found' });
        }

        // Get the wallet balance
        const balance = await walletController.getBalance(walletAddress);
        res.status(200).json({ balance: balance });
    } catch (error) {
        console.error('Error fetching wallet balance:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// Send funds to another wallet (via email address)
router.post('/send', authMiddleware, async (req, res) => {
    const userId = req.userId; // Assuming you extract userId from JWT
    const { email, amount } = req.body; // Email and amount to send

    try {
        // Fetch the wallet address associated with the user
        const senderWalletAddress = await walletController.getWalletAddress(userId);
        if (!senderWalletAddress) {
            return res.status(404).json({ message: 'Wallet address not found' });
        }

        // Fetch the recipient's wallet address using their email
        const recipientWalletAddress = await walletController.getWalletAddressByEmail(email);
        if (!recipientWalletAddress) {
            return res.status(404).json({ message: 'Recipient wallet address not found' });
        }

        // Perform the transaction (deduct from sender's wallet, send to recipient's wallet)
        const transactionResult = await walletController.sendFunds(
            senderWalletAddress,
            recipientWalletAddress,
            amount
        );

        if (!transactionResult.success) {
            return res.status(400).json({ message: 'Transaction failed' });
        }

        res.status(200).json({ message: 'Funds sent successfully' });
    } catch (error) {
        console.error('Error sending funds:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// Get transaction history
router.get('/transactions', authMiddleware, async (req, res) => {
    const userId = req.userId; // Assuming you extract userId from JWT

    try {
        // Fetch the wallet address associated with the user
        const walletAddress = await walletController.getWalletAddress(userId);
        if (!walletAddress) {
            return res.status(404).json({ message: 'Wallet address not found' });
        }

        // Fetch transaction history (assuming a getTransactionHistory method)
        const transactions = await walletController.getTransactionHistory(walletAddress);
        res.status(200).json({ transactions: transactions });
    } catch (error) {
        console.error('Error fetching transaction history:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

module.exports = router;
