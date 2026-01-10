require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const Question = require('./models/Question');

const app = express();

// Configuration
const DEFAULT_PORT = parseInt(process.env.PORT || '5001');
const MONGO_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/gate_tracker';

// Middleware
app.use(cors());
app.use(express.json());

// Database Connection
const connectDB = async () => {
  try {
    console.log('⏳ Attempting to connect to MongoDB...');
    // Mask URI for safety in logs
    const maskedUri = MONGO_URI.replace(/:\/\/([^:@]+):([^:@]+)@/, '://***:***@');
    console.log(`   URI: ${maskedUri}`);

    await mongoose.connect(MONGO_URI);
    console.log('✅ MongoDB connected successfully');
  } catch (err) {
    console.error('❌ MongoDB Connection Error:', err.message);
    // Continue running to allow server restart/debugging, or exit:
    // process.exit(1); 
  }
};

// Routes
app.get('/api', (req, res) => {
  res.json({ message: 'GATE Tracker API is running' });
});

// GET /api/questions - Fetch all questions
app.get('/api/questions', async (req, res) => {
  try {
    const questions = await Question.find().sort({ createdAt: -1 });
    res.json(questions || []);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching questions', error: error.message });
  }
});

// POST /api/questions - Add a new question
app.post('/api/questions', async (req, res) => {
  try {
    const { 
      subjectId, topicId, year, marks, 
      questionText, optionA, optionB, optionC, optionD, 
      correctOption, solutionText 
    } = req.body;

    if (!subjectId || !topicId || !questionText || !correctOption) {
      return res.status(400).json({ message: 'Missing required fields' });
    }

    const newQuestion = new Question({
      subjectId, topicId, year, marks,
      questionText, optionA, optionB, optionC, optionD,
      correctOption, solutionText
    });

    const savedQuestion = await newQuestion.save();
    res.status(201).json(savedQuestion);
  } catch (error) {
    res.status(500).json({ message: 'Error saving question', error: error.message });
  }
});

// DELETE /api/questions/:id - Delete a question
app.delete('/api/questions/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const deletedQuestion = await Question.findByIdAndDelete(id);
    
    if (!deletedQuestion) {
      return res.status(404).json({ message: 'Question not found' });
    }
    
    res.json({ message: 'Question deleted successfully', id });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting question', error: error.message });
  }
});

// Global Error Handler
app.use((err, req, res, next) => {
  console.error('Unhandled Error:', err.stack);
  res.status(500).json({ message: 'Internal Server Error', error: err.message });
});

// Server Startup with Port Fallback
const startServer = (port) => {
  const server = app.listen(port, () => {
    console.log(`🚀 Server running on http://localhost:${port}`);
    connectDB();
  });

  server.on('error', (err) => {
    if (err.code === 'EADDRINUSE') {
      console.warn(`⚠️  Port ${port} is in use. Trying port ${port + 1}...`);
      startServer(port + 1);
    } else {
      console.error('❌ Server Error:', err);
    }
  });
};

// Initialize
startServer(DEFAULT_PORT);