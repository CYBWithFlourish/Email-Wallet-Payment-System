const db = require('../config/db'); // Your database configuration

// Function to create a wallet and associate it with a user
exports.createWallet = async (walletAddress, userId) => {
    try {
        // Check if the wallet already exists in the database
        const [existingWallet] = await db.query('SELECT * FROM wallets WHERE walletAddress = ?', [walletAddress]);

        if (existingWallet.length > 0) {
            throw new Error('Wallet already exists');
        }

        // Insert a new wallet into the database for the user
        const [result] = await db.query(
            'INSERT INTO wallets (walletAddress, userId, balance) VALUES (?, ?, ?)',
            [walletAddress, userId, 0.0] // Initial balance is set to 0.0
        );

        return result.insertId;
    } catch (error) {
        console.error('Error creating wallet: ', error);
        throw new Error('Error creating wallet');
    }
};

// Function to get wallet details by wallet address
exports.getWalletByAddress = async (walletAddress) => {
    try {
        const [wallet] = await db.query('SELECT * FROM wallets WHERE walletAddress = ?', [walletAddress]);

        if (wallet.length === 0) {
            throw new Error('Wallet not found');
        }

        return wallet[0];
    } catch (error) {
        console.error('Error getting wallet by address: ', error);
        throw new Error('Error getting wallet by address');
    }
};

// Function to get wallet details by userId
exports.getWalletByUserId = async (userId) => {
    try {
        const [wallet] = await db.query('SELECT * FROM wallets WHERE userId = ?', [userId]);

        if (wallet.length === 0) {
            throw new Error('Wallet not found');
        }

        return wallet[0];
    } catch (error) {
        console.error('Error getting wallet by user ID: ', error);
        throw new Error('Error getting wallet by user ID');
    }
};

// Function to update wallet balance
exports.updateWalletBalance = async (walletAddress, newBalance) => {
    try {
        const [result] = await db.query('UPDATE wallets SET balance = ? WHERE walletAddress = ?', [newBalance, walletAddress]);

        if (result.affectedRows === 0) {
            throw new Error('Failed to update wallet balance');
        }

        return result.affectedRows > 0;
    } catch (error) {
        console.error('Error updating wallet balance: ', error);
        throw new Error('Error updating wallet balance');
    }
};

// Function to handle wallet transactions (e.g., deposit or withdraw)
exports.createTransaction = async (walletAddress, amount, type) => {
    try {
        const wallet = await this.getWalletByAddress(walletAddress);

        // Calculate new balance after transaction
        let newBalance;
        if (type === 'deposit') {
            newBalance = parseFloat(wallet.balance) + parseFloat(amount);
        } else if (type === 'withdraw') {
            if (parseFloat(wallet.balance) < parseFloat(amount)) {
                throw new Error('Insufficient balance');
            }
            newBalance = parseFloat(wallet.balance) - parseFloat(amount);
        } else {
            throw new Error('Invalid transaction type');
        }

        // Update the wallet balance
        await this.updateWalletBalance(walletAddress, newBalance);

        // Log the transaction
        const [result] = await db.query(
            'INSERT INTO transactions (walletAddress, amount, type) VALUES (?, ?, ?)',
            [walletAddress, amount, type]
        );

        return result.insertId;
    } catch (error) {
        console.error('Error creating wallet transaction: ', error);
        throw new Error('Error creating wallet transaction');
    }
};

// Function to fetch wallet transaction history
exports.getTransactionHistory = async (walletAddress) => {
    try {
        const [transactions] = await db.query('SELECT * FROM transactions WHERE walletAddress = ?', [walletAddress]);
        return transactions;
    } catch (error) {
        console.error('Error getting transaction history: ', error);
        throw new Error('Error getting transaction history');
    }
};
