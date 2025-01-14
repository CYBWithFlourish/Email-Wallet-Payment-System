const mongoose = require('mongoose');

// Define the schema for audit logs
const auditLogSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User', // Reference to the User model
        required: true
    },
    action: {
        type: String,
        required: true,
        enum: ['login', 'send-funds', 'verify-email', 'withdraw', 'transaction-failed', 'signup'],
        default: 'signup'
    },
    details: {
        type: String,
        required: true
    },
    timestamp: {
        type: Date,
        default: Date.now
    },
    ipAddress: {
        type: String,
        required: true
    }
});

// Create the AuditLog model
const AuditLog = mongoose.model('AuditLog', auditLogSchema);

// Function to create a new audit log entry
async function createAuditLog(userId, action, details, ipAddress) {
    const log = new AuditLog({
        userId,
        action,
        details,
        ipAddress
    });

    try {
        await log.save();
        console.log('Audit log created successfully');
    } catch (error) {
        console.error('Error saving audit log:', error);
    }
}

// Function to fetch audit logs for a particular user
async function getAuditLogs(userId) {
    try {
        const logs = await AuditLog.find({ userId }).sort({ timestamp: -1 });
        return logs;
    } catch (error) {
        console.error('Error fetching audit logs:', error);
        return [];
    }
}

// Function to fetch all audit logs
async function getAllAuditLogs() {
    try {
        const logs = await AuditLog.find().sort({ timestamp: -1 });
        return logs;
    } catch (error) {
        console.error('Error fetching all audit logs:', error);
        return [];
    }
}

module.exports = {
    createAuditLog,
    getAuditLogs,
    getAllAuditLogs
};
