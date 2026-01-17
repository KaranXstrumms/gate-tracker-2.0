const fs = require('fs');

/**
 * Parse extracted text into structured question objects
 * @param {string} text - Cleaned text from PDF extraction
 * @returns {Array} - Array of question objects
 */
function parseQuestions(text) {
  const questions = [];
  
  // Strategy: Split text by question markers (Q1, Q2, etc. or numbered patterns)
  // Common GATE patterns: "1.", "Q.1", "Question 1", etc.
  
  // Split by question numbers (handles: "1.", "Q.1", "Q1.", "Question 1")
  const questionBlocks = splitIntoBlocks(text);
  
  for (let i = 0; i < questionBlocks.length; i++) {
    const block = questionBlocks[i];
    const parsed = parseQuestionBlock(block, i + 1);
    
    if (parsed) {
      questions.push(parsed);
    }
  }
  
  return questions;
}

/**
 * Split text into individual question blocks
 * @param {string} text - Full text
 * @returns {Array} - Array of text blocks
 */
function splitIntoBlocks(text) {
  // Pattern matches: "1.", "Q.1", "Q1.", "Question 1", etc.
  const questionPattern = /(?:^|\n)(?:Q\.?\s*\d+|Question\s+\d+|\d+\.)\s*/gim;
  
  // Split by question markers
  const parts = text.split(questionPattern);
  
  // Remove empty first element if text starts with question marker
  if (parts[0].trim() === '') {
    parts.shift();
  }
  
  return parts.filter(block => block.trim().length > 0);
}

/**
 * Parse a single question block into structured object
 * @param {string} block - Text block for one question
 * @param {number} index - Question index (for debugging)
 * @returns {object|null} - Parsed question object or null if invalid
 */
function parseQuestionBlock(block, index) {
  try {
    // Extract question text (everything before first option)
    const optionPattern = /\(([A-D])\)/g;
    const firstOptionMatch = block.match(/\([A-D]\)/);
    
    if (!firstOptionMatch) {
      console.warn(`⚠️  Question ${index}: No options found, skipping`);
      return null;
    }
    
    const firstOptionIndex = block.indexOf(firstOptionMatch[0]);
    const questionText = block.substring(0, firstOptionIndex).trim();
    
    if (questionText.length < 10) {
      console.warn(`⚠️  Question ${index}: Question text too short, skipping`);
      return null;
    }
    
    // Extract options
    const options = extractOptions(block);
    
    if (Object.keys(options).length < 4) {
      console.warn(`⚠️  Question ${index}: Less than 4 options found, skipping`);
      return null;
    }
    
    return {
      questionText,
      optionA: options.A || '',
      optionB: options.B || '',
      optionC: options.C || '',
      optionD: options.D || '',
      _metadata: {
        index,
        rawLength: block.length
      }
    };
    
  } catch (error) {
    console.error(`❌ Error parsing question ${index}:`, error.message);
    return null;
  }
}

/**
 * Extract options from question block
 * @param {string} block - Question block text
 * @returns {object} - Object with A, B, C, D keys
 */
function extractOptions(block) {
  const options = {};
  
  // Pattern: (A) text (B) text (C) text (D) text
  const optionMatches = [...block.matchAll(/\(([A-D])\)\s*([^(]+?)(?=\([A-D]\)|$)/gs)];
  
  for (const match of optionMatches) {
    const letter = match[1];
    const text = match[2].trim();
    options[letter] = text;
  }
  
  return options;
}

/**
 * Parse questions from a text file
 * @param {string} filePath - Path to extracted text file
 * @returns {Array} - Array of question objects
 */
function parseQuestionsFromFile(filePath) {
  const text = fs.readFileSync(filePath, 'utf8');
  return parseQuestions(text);
}

/**
 * Save parsed questions to JSON file
 * @param {Array} questions - Array of question objects
 * @param {string} outputPath - Output JSON file path
 */
function saveQuestionsToJSON(questions, outputPath) {
  const json = JSON.stringify(questions, null, 2);
  fs.writeFileSync(outputPath, json, 'utf8');
  console.log(`✅ Saved ${questions.length} questions to: ${outputPath}`);
}

// CLI Usage
if (require.main === module) {
  const args = process.argv.slice(2);
  
  if (args.length === 0) {
    console.log('Usage: node parseQuestions.js <path-to-text-file> [output-json]');
    console.log('Example: node parseQuestions.js output/gate_2023_extracted.txt output/questions.json');
    process.exit(1);
  }
  
  const textPath = args[0];
  const outputPath = args[1] || textPath.replace('.txt', '_questions.json');
  
  if (!fs.existsSync(textPath)) {
    console.error(`❌ Error: File not found: ${textPath}`);
    process.exit(1);
  }
  
  console.log(`📝 Parsing questions from: ${textPath}`);
  
  const questions = parseQuestionsFromFile(textPath);
  
  console.log(`\n📊 Parsing Results:`);
  console.log(`   Total questions parsed: ${questions.length}`);
  
  if (questions.length > 0) {
    console.log(`\n📄 Sample Question:`);
    console.log(`   Question: ${questions[0].questionText.substring(0, 80)}...`);
    console.log(`   Option A: ${questions[0].optionA.substring(0, 50)}...`);
    
    saveQuestionsToJSON(questions, outputPath);
    console.log(`\n✅ Parsing complete!`);
  } else {
    console.warn(`\n⚠️  No questions were successfully parsed.`);
    console.log(`   Check the input text format and try again.`);
  }
}

module.exports = { 
  parseQuestions, 
  parseQuestionsFromFile,
  parseQuestionBlock,
  extractOptions
};
