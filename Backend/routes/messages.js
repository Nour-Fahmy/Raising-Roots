const express = require('express');
const router = express.Router();
const { Message } = require('../models/message');
const { authenticateToken } = require('../middleware/auth');
const { User } = require('../models/user');

// POST /api/v1/messages/send - Send a new message
router.post('/send', authenticateToken, async (req, res) => {
    try {
        const { receiverId, content } = req.body;
        const senderId = req.user.userId; // Sender ID from authenticated token

        if (!receiverId || !content) {
            return res.status(400).json({ message: 'Receiver ID and content are required.' });
        }

        // Basic input sanitization (more robust sanitization might be needed depending on context)
        const sanitizedContent = content.trim();

        // Check if receiver exists
        const receiverExists = await User.findById(receiverId);
        if (!receiverExists) {
            return res.status(404).json({ message: 'Receiver not found.' });
        }

        const newMessage = new Message({
            sender: senderId,
            receiver: receiverId,
            content: sanitizedContent
        });

        const savedMessage = await newMessage.save();

        res.status(201).json({
            message: 'Message sent successfully!',
            data: savedMessage
        });
    } catch (err) {
        console.error('Error sending message:', err);
        res.status(500).json({ message: 'Error sending message.', error: err.message });
    }
});

// GET /api/v1/messages/:user1Id/:user2Id - Fetch chat history between two users
router.get('/:user1Id/:user2Id', authenticateToken, async (req, res) => {
    try {
        const { user1Id, user2Id } = req.params;
        const authenticatedUserId = req.user.userId; // User ID from authenticated token

        console.log('Authenticated User ID:', authenticatedUserId);
        console.log('User1 ID from params:', user1Id);
        console.log('User2 ID from params:', user2Id);

        const messages = await Message.find({
            $or: [
                { sender: user1Id, receiver: user2Id },
                { sender: user2Id, receiver: user1Id }
            ]
        })
        .sort({ timestamp: 1 })
        .populate('sender', 'username profilePicture') // Populate sender info
        .populate('receiver', 'username profilePicture'); // Populate receiver info

        res.status(200).json({
            message: 'Chat history fetched successfully!',
            data: messages
        });
    } catch (err) {
        console.error('Error fetching chat history:', err);
        res.status(500).json({ message: `Error fetching chat history: ${process.env.NODE_ENV === 'development' ? err.message : 'Internal server error'}` });
    }
});

module.exports = router;