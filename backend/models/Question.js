const mongoose = require('mongoose');

const questionSchema = new mongoose.Schema({
  subjectId: { type: String, required: true }, // e.g., 'EC-SS'
  topicId: { type: String, required: true },   // e.g., 'laplace-transform'
  year: { type: Number, required: true },
  marks: { type: Number, required: true },
  questionText: { type: String, required: true },
  optionA: { type: String, required: true },
  optionB: { type: String, required: true },
  optionC: { type: String, required: true },
  optionD: { type: String, required: true },
  correctOption: { type: String, enum: ['A', 'B', 'C', 'D'], required: true },
  solutionText: { type: String },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Question', questionSchema);
