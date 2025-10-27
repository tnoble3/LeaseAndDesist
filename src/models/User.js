const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true
    },
    email: {
        type: String,
        required: true,
        unique: true,
        trim: true,
        lowercase: true,
        index: true
    },
    password: {
        type: String,
        required: true,
        minLength: 6,
    },
    refreshTokens: [{
        type: String
    }],
    role: {
        type: String,
        enum: ['renter', 'landlord', 'admin'],
        default: 'renter'
    },
    status: {
        type: String,
        enum: ['online', 'offline', 'away'],
        default: 'offline'
    },
    lastSeen: {
        type: Date,
        default: Date.now
    },
}, {
    timestamps: true
});   

module.exports = mongoose.model('User', UserSchema);