const Joi = require('joi');

const questionSchema = Joi.object({
  subjectId: Joi.string().required(),
  topicId: Joi.string().required(),
  year: Joi.number().integer().min(1990).max(2030).required(),
  marks: Joi.number().valid(1, 2).required(),
  questionText: Joi.string().min(10).required(),
  optionA: Joi.string().required(),
  optionB: Joi.string().required(),
  optionC: Joi.string().required(),
  optionD: Joi.string().required(),
  correctOption: Joi.string().valid('A', 'B', 'C', 'D').required(),
  solutionText: Joi.string().allow('').optional()
});

module.exports = { questionSchema };
