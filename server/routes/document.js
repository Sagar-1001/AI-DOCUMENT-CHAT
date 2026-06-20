const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const Document = require('../model/Document');
const extractTextFromPDF = require('../utils/pdfExtractor');
const protect = require('../middleware/authMiddleware');

const storage = multer.diskStorage({
  destination: function (req, file, cb) { cb(null, 'uploads/'); },
  filename: function (req, file, cb) { cb(null, Date.now() + '-' + file.originalname); }
});

const fileFilter = (req, file, cb) => {
  if (file.mimetype === 'application/pdf') cb(null, true);
  else cb(new Error('Only PDF files are allowed'), false);
};

const upload = multer({ storage, fileFilter });


router.post('/upload', protect, upload.single('pdf'), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ message: 'Please upload a PDF file' });

    const filePath = path.join(__dirname, '..', 'uploads', req.file.filename);
    const extractedText = await extractTextFromPDF(filePath);

    if (!extractedText || extractedText.trim().length === 0)
      return res.status(400).json({ message: 'Could not extract text from PDF' });

    const document = new Document({
      userId: req.user.id,      // ← ties document to logged-in user
      filename: req.file.filename,
      originalName: req.file.originalname,
      extractedText
    });

    const savedDocument = await document.save();
    fs.unlinkSync(filePath);   // ← deletes file from disk after saving to DB

    res.status(201).json({
      message: 'PDF uploaded successfully',
      document: {
        _id: savedDocument._id,
        originalName: savedDocument.originalName,
        createdAt: savedDocument.createdAt
      }
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.get('/', protect, async (req, res) => {
  try {
    const documents = await Document.find({ userId: req.user.id })
      .select('-extractedText')
      .sort({ createdAt: -1 });
    res.status(200).json(documents);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});


router.delete('/:id', protect, async (req, res) => {
  try {
    const document = await Document.findOneAndDelete({
      _id: req.params.id,
      userId: req.user.id     
    });
    if (!document) return res.status(404).json({ message: 'Document not found' });
    res.status(200).json({ message: 'Document deleted successfully' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;