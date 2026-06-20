const express = require('express');
const router = express.Router();
const Document = require('../model/Document');
const Chat = require('../model/Chat');
const askGemini = require('../utils/geminiClient');
const protect = require('../middleware/authMiddleware');

// POST /api/chat/:documentId
router.post('/:documentId', protect, async (req, res) => {
  try {
    const { documentId } = req.params;
    const question = req.body?.question;

    if (!question || question.trim().length === 0)
      return res.status(400).json({ message: 'Please provide a question' });

    // verify document belongs to this user
    const document = await Document.findOne({ _id: documentId, userId: req.user.id });
    if (!document) return res.status(404).json({ message: 'Document not found' });

    // send text and question to Gemini
    const answer = await askGemini(document.extractedText, question);

    const chat = new Chat({
      userId: req.user.id,
      documentId,
      question,
      answer
    });

    const savedChat = await chat.save();

    res.status(201).json({
      _id: savedChat._id,
      question: savedChat.question,
      answer: savedChat.answer,
      createdAt: savedChat.createdAt
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET /api/chat/:documentId
router.get('/:documentId', protect, async (req, res) => {
  try {
    // first verify the document belongs to this user
    const document = await Document.findOne({
      _id: req.params.documentId,
      userId: req.user.id
    });
    if (!document) return res.status(404).json({ message: 'Document not found' });

    // then fetch all chats for this document by this user
    const chats = await Chat.find({
      documentId: req.params.documentId,
      userId: req.user.id
    }).sort({ createdAt: 1 });

    res.status(200).json(chats);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;