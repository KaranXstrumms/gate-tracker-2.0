const fs = require('fs');

/**
 * Finalize parsed questions by adding required metadata
 * @param {Array} parsedQuestions - Array of parsed question objects
 * @param {object} config - Configuration for metadata
 * @returns {Array} - Array of finalized questions ready for bulk import
 */
function finalizeQuestions(parsedQuestions, config = {}) {
  const {
    subjectId = 'unknown',
    topicId = 'unknown',
    year = new Date().getFullYear(),
    marks = 1,
    correctOption = null,
    solutionText = ''
  } = config;
  
  return parsedQuestions.map((question, index) => {
    // Remove metadata field if present
    const { _metadata, ...cleanQuestion } = question;
    
    return {
      subjectId,
      topicId,
      year,
      marks,
      ...cleanQuestion,
      correctOption: correctOption || '', // Empty for manual entry later
      solutionText: solutionText || ''
    };
  });
}

/**
 * Create bulk import payload
 * @param {Array} finalizedQuestions - Array of finalized questions
 * @returns {object} - Bulk import API payload
 */
function createBulkPayload(finalizedQuestions) {
  return {
    questions: finalizedQuestions
  };
}

/**
 * Load parsed questions from JSON file
 * @param {string} filePath - Path to parsed questions JSON
 * @returns {Array} - Parsed questions
 */
function loadParsedQuestions(filePath) {
  const content = fs.readFileSync(filePath, 'utf8');
  return JSON.parse(content);
}

/**
 * Save finalized questions to JSON file
 * @param {object} payload - Bulk import payload
 * @param {string} outputPath - Output file path
 */
function saveBulkPayload(payload, outputPath) {
  const json = JSON.stringify(payload, null, 2);
  fs.writeFileSync(outputPath, json, 'utf8');
  console.log(`✅ Saved bulk payload to: ${outputPath}`);
}

/**
 * Interactive CLI to gather metadata
 */
async function promptForMetadata() {
  const readline = require('readline').createInterface({
    input: process.stdin,
    output: process.stdout
  });
  
  const question = (prompt) => new Promise((resolve) => {
    readline.question(prompt, resolve);
  });
  
  console.log('\n📋 Enter metadata for questions:\n');
  
  const subjectId = await question('Subject ID (e.g., signals, networks): ');
  const topicId = await question('Topic ID (e.g., laplace, theorems): ');
  const year = await question('Year (default: current year): ') || new Date().getFullYear();
  const marks = await question('Marks (1 or 2, default: 1): ') || '1';
  
  readline.close();
  
  return {
    subjectId: subjectId.trim() || 'unknown',
    topicId: topicId.trim() || 'unknown',
    year: parseInt(year),
    marks: parseInt(marks)
  };
}

// CLI Usage
if (require.main === module) {
  const args = process.argv.slice(2);
  
  if (args.length === 0) {
    console.log('Usage: node finalizeQuestions.js <parsed-questions.json> [output.json] [--interactive]');
    console.log('\nExamples:');
    console.log('  # Interactive mode (prompts for metadata)');
    console.log('  node finalizeQuestions.js questions.json --interactive');
    console.log('\n  # With inline metadata');
    console.log('  node finalizeQuestions.js questions.json output.json --subject=signals --topic=laplace --year=2023');
    process.exit(1);
  }
  
  const inputPath = args[0];
  const outputPath = args[1] || inputPath.replace('.json', '_bulk.json');
  const isInteractive = args.includes('--interactive');
  
  if (!fs.existsSync(inputPath)) {
    console.error(`❌ Error: File not found: ${inputPath}`);
    process.exit(1);
  }
  
  console.log(`📝 Loading parsed questions from: ${inputPath}`);
  const parsedQuestions = loadParsedQuestions(inputPath);
  console.log(`   Found ${parsedQuestions.length} questions`);
  
  // Parse command-line arguments for metadata
  const getArg = (name) => {
    const arg = args.find(a => a.startsWith(`--${name}=`));
    return arg ? arg.split('=')[1] : null;
  };
  
  if (isInteractive) {
    // Interactive mode
    promptForMetadata().then(config => {
      const finalized = finalizeQuestions(parsedQuestions, config);
      const payload = createBulkPayload(finalized);
      
      console.log(`\n📊 Summary:`);
      console.log(`   Subject: ${config.subjectId}`);
      console.log(`   Topic: ${config.topicId}`);
      console.log(`   Year: ${config.year}`);
      console.log(`   Marks: ${config.marks}`);
      console.log(`   Questions: ${finalized.length}`);
      
      saveBulkPayload(payload, outputPath);
      
      console.log(`\n✅ Ready for bulk import!`);
      console.log(`\n💡 Next steps:`);
      console.log(`   1. Review the output file: ${outputPath}`);
      console.log(`   2. Add correctOption for each question (A/B/C/D)`);
      console.log(`   3. Add solutionText if available`);
      console.log(`   4. Send to API: curl -X POST http://localhost:5002/api/questions/bulk -H "Content-Type: application/json" -d @${outputPath}`);
    });
  } else {
    // Non-interactive mode with command-line args
    const config = {
      subjectId: getArg('subject') || 'unknown',
      topicId: getArg('topic') || 'unknown',
      year: parseInt(getArg('year')) || new Date().getFullYear(),
      marks: parseInt(getArg('marks')) || 1
    };
    
    const finalized = finalizeQuestions(parsedQuestions, config);
    const payload = createBulkPayload(finalized);
    
    console.log(`\n📊 Summary:`);
    console.log(`   Subject: ${config.subjectId}`);
    console.log(`   Topic: ${config.topicId}`);
    console.log(`   Year: ${config.year}`);
    console.log(`   Marks: ${config.marks}`);
    console.log(`   Questions: ${finalized.length}`);
    
    saveBulkPayload(payload, outputPath);
    
    console.log(`\n✅ Ready for bulk import!`);
    console.log(`\n💡 Next steps:`);
    console.log(`   1. Review the output file: ${outputPath}`);
    console.log(`   2. Add correctOption for each question (A/B/C/D)`);
    console.log(`   3. Add solutionText if available`);
    console.log(`   4. Send to API: curl -X POST http://localhost:5002/api/questions/bulk -H "Content-Type: application/json" -d @${outputPath}`);
  }
}

module.exports = { 
  finalizeQuestions, 
  createBulkPayload,
  loadParsedQuestions
};
