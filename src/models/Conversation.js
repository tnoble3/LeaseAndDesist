const mongoose = require('mongoose');

const ConversationSchema = new mongoose.Schema({
    type: {
        type: String,
        enum: ['dm', 'group'],
        required: true
    },
    name: {
        type: String,
    },
    members: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    }],
    admins: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    }],
    isPrivate: {
        type: Boolean,
        default: true
    },
    lastMessage: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Message'
    },
}, {
    timestamps: true
});

module.exports = mongoose.model('Conversation', ConversationSchema);