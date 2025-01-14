const { Connection, PublicKey, Transaction, SystemProgram } = require('@solana/web3.js');
const { Keypair } = require('@solana/web3.js');

// Connect to the Solana cluster
const connection = new Connection('https://api.mainnet-beta.solana.com', 'confirmed');

// Function to send transaction to Solana blockchain
exports.sendTransaction = async (walletAddress, amount) => {
    try {
        // Set the sender's private key (this should be securely stored)
        const senderKey = process.env.SOLANA_PRIVATE_KEY; // You should store this in your .env file
        const sender = Keypair.fromSecretKey(new Uint8Array(JSON.parse(senderKey)));

        // Convert the receiver's address to a public key
        const recipientPublicKey = new PublicKey(walletAddress);

        // Create the transaction
        const transaction = new Transaction().add(
            SystemProgram.transfer({
                fromPubkey: sender.publicKey,
                toPubkey: recipientPublicKey,
                lamports: Math.floor(amount * 1e9), // Sol to Lamports (1 SOL = 1e9 Lamports)
            })
        );

        // Send the transaction
        const signature = await connection.sendTransaction(transaction, [sender]);

        // Confirm the transaction
        await connection.confirmTransaction(signature, 'confirmed');

        console.log('Transaction successful. Signature:', signature);
        return signature;
    } catch (error) {
        console.error('Error in Solana transaction:', error);
        throw new Error('Transaction failed');
    }
};
