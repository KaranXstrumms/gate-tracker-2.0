const fs = require('fs');

/**
 * Suggest correct options using rule-based heuristics
 * SAFETY: Never automatically sets correctOption, only provides suggestions
 * @param {Array} questions - Array of finalized questions
 * @returns {Array} - Questions with suggestedCorrectOption and confidenceScore
 */
function suggestCorrectOptions(questions) {
  return questions.map((question, index) => {
    const suggestion = analyzeQuestion(question);
    
    return {
      ...question,
      _adminOnly: {
        suggestedCorrectOption: suggestion.option,
        confidenceScore: suggestion.confidence,
        reasoning: suggestion.reasoning,
        requiresManualReview: suggestion.confidence < 0.6
      }
    };
  });
}

/**
 * Analyze a question and suggest the correct option
 * @param {object} question - Question object
 * @returns {object} - { option, confidence, reasoning }
 */
function analyzeQuestion(question) {
  const { questionText, optionA, optionB, optionC, optionD } = question;
  const options = { A: optionA, B: optionB, C: optionC, D: optionD };
  
  // Apply multiple heuristics
  const heuristics = [
    checkDefinitionMatch(questionText, options),
    checkNumericMatch(questionText, options),
    checkFormulaMatch(questionText, options),
    checkKeywordDensity(questionText, options),
    checkNegationPatterns(questionText, options)
  ];
  
  // Find highest confidence suggestion
  const bestMatch = heuristics.reduce((best, current) => {
    return current.confidence > best.confidence ? current : best;
  }, { option: null, confidence: 0.0, reasoning: 'No strong match found' });
  
  return bestMatch;
}

/**
 * Heuristic 1: Definition matching
 * Checks if question asks for a definition and matches keywords
 */
function checkDefinitionMatch(questionText, options) {
  const definitionPatterns = [
    /what is (the )?(.+)\?/i,
    /define (.+)/i,
    /(.+) is defined as/i,
    /(.+) refers to/i
  ];
  
  for (const pattern of definitionPatterns) {
    const match = questionText.match(pattern);
    if (match) {
      const term = match[2] || match[1];
      
      // Known definitions database (expandable)
      const definitions = {
        'laplace transform': /1\/s|transform of u\(t\)/i,
        'thevenin': /linear|equivalent|voltage source/i,
        'norton': /current source|parallel/i,
        'nyquist': /twice|sampling|frequency/i,
        'fourier': /frequency domain|spectrum/i
      };
      
      const termLower = term.toLowerCase().trim();
      for (const [key, pattern] of Object.entries(definitions)) {
        if (termLower.includes(key)) {
          // Check which option matches the definition
          for (const [opt, text] of Object.entries(options)) {
            if (pattern.test(text)) {
              return {
                option: opt,
                confidence: 0.75,
                reasoning: `Definition match for "${key}"`
              };
            }
          }
        }
      }
    }
  }
  
  return { option: null, confidence: 0.0, reasoning: 'No definition match' };
}

/**
 * Heuristic 2: Numeric matching
 * Checks if question expects a numeric answer
 */
function checkNumericMatch(questionText, options) {
  const numericPatterns = [
    /how many/i,
    /what is the value/i,
    /calculate/i,
    /find the number/i
  ];
  
  if (!numericPatterns.some(p => p.test(questionText))) {
    return { option: null, confidence: 0.0, reasoning: 'Not a numeric question' };
  }
  
  // Extract numbers from options
  const optionNumbers = {};
  for (const [opt, text] of Object.entries(options)) {
    const numbers = text.match(/\d+/g);
    if (numbers) {
      optionNumbers[opt] = numbers.map(n => parseInt(n));
    }
  }
  
  // Check for common patterns (e.g., powers of 2 for flip-flops)
  if (questionText.toLowerCase().includes('flip-flop') && questionText.toLowerCase().includes('mod')) {
    const modMatch = questionText.match(/mod[- ]?(\d+)/i);
    if (modMatch) {
      const modValue = parseInt(modMatch[1]);
      const requiredFlipFlops = Math.ceil(Math.log2(modValue));
      
      for (const [opt, numbers] of Object.entries(optionNumbers)) {
        if (numbers.includes(requiredFlipFlops)) {
          return {
            option: opt,
            confidence: 0.85,
            reasoning: `MOD-${modValue} requires ${requiredFlipFlops} flip-flops (2^${requiredFlipFlops} = ${Math.pow(2, requiredFlipFlops)})`
          };
        }
      }
    }
  }
  
  return { option: null, confidence: 0.0, reasoning: 'No numeric pattern match' };
}

/**
 * Heuristic 3: Formula matching
 * Checks for known formulas and equations
 */
function checkFormulaMatch(questionText, options) {
  const formulas = {
    'laplace.*u\\(t\\)': { pattern: /1\/s/i, confidence: 0.8 },
    'sampling.*theorem': { pattern: /twice|2.*highest/i, confidence: 0.75 },
    'ohm.*law': { pattern: /V.*I.*R|voltage.*current.*resistance/i, confidence: 0.7 }
  };
  
  for (const [questionPattern, { pattern, confidence }] of Object.entries(formulas)) {
    if (new RegExp(questionPattern, 'i').test(questionText)) {
      for (const [opt, text] of Object.entries(options)) {
        if (pattern.test(text)) {
          return {
            option: opt,
            confidence,
            reasoning: `Formula match for pattern: ${questionPattern}`
          };
        }
      }
    }
  }
  
  return { option: null, confidence: 0.0, reasoning: 'No formula match' };
}

/**
 * Heuristic 4: Keyword density
 * Checks which option has most keywords from question
 */
function checkKeywordDensity(questionText, options) {
  const keywords = questionText
    .toLowerCase()
    .replace(/[^\w\s]/g, '')
    .split(/\s+/)
    .filter(word => word.length > 3); // Only words > 3 chars
  
  const scores = {};
  for (const [opt, text] of Object.entries(options)) {
    const optionLower = text.toLowerCase();
    const matches = keywords.filter(kw => optionLower.includes(kw)).length;
    scores[opt] = matches;
  }
  
  const maxScore = Math.max(...Object.values(scores));
  if (maxScore >= 2) {
    const bestOption = Object.keys(scores).find(opt => scores[opt] === maxScore);
    return {
      option: bestOption,
      confidence: Math.min(0.5 + (maxScore * 0.1), 0.7), // Cap at 0.7
      reasoning: `Keyword density: ${maxScore} matches`
    };
  }
  
  return { option: null, confidence: 0.0, reasoning: 'Low keyword density' };
}

/**
 * Heuristic 5: Negation patterns
 * Detects "NOT", "EXCEPT", "FALSE" questions
 */
function checkNegationPatterns(questionText, options) {
  const negationPatterns = /\b(not|except|false|incorrect|never)\b/i;
  
  if (negationPatterns.test(questionText)) {
    // For negation questions, look for the outlier option
    // This is low confidence and requires manual review
    return {
      option: null,
      confidence: 0.3,
      reasoning: 'Negation question detected - requires manual review'
    };
  }
  
  return { option: null, confidence: 0.0, reasoning: 'No negation pattern' };
}

/**
 * Load questions from JSON file
 */
function loadQuestions(filePath) {
  const content = fs.readFileSync(filePath, 'utf8');
  const data = JSON.parse(content);
  return data.questions || data; // Handle both bulk format and array
}

/**
 * Save suggestions to JSON file
 */
function saveSuggestions(questions, outputPath) {
  const output = {
    questions,
    _metadata: {
      generatedAt: new Date().toISOString(),
      totalQuestions: questions.length,
      highConfidence: questions.filter(q => q._adminOnly.confidenceScore >= 0.6).length,
      lowConfidence: questions.filter(q => q._adminOnly.confidenceScore < 0.6).length,
      warning: 'suggestedCorrectOption is for admin review only. Never use directly without verification.'
    }
  };
  
  fs.writeFileSync(outputPath, JSON.stringify(output, null, 2), 'utf8');
  console.log(`✅ Saved suggestions to: ${outputPath}`);
}

// CLI Usage
if (require.main === module) {
  const args = process.argv.slice(2);
  
  if (args.length === 0) {
    console.log('Usage: node suggestCorrectOption.js <questions.json> [output.json]');
    console.log('\nExample:');
    console.log('  node suggestCorrectOption.js output/questions_bulk.json output/questions_suggested.json');
    process.exit(1);
  }
  
  const inputPath = args[0];
  const outputPath = args[1] || inputPath.replace('.json', '_suggested.json');
  
  if (!fs.existsSync(inputPath)) {
    console.error(`❌ Error: File not found: ${inputPath}`);
    process.exit(1);
  }
  
  console.log(`🔍 Analyzing questions from: ${inputPath}`);
  const questions = loadQuestions(inputPath);
  console.log(`   Found ${questions.length} questions`);
  
  const withSuggestions = suggestCorrectOptions(questions);
  
  // Statistics
  const stats = {
    total: withSuggestions.length,
    suggested: withSuggestions.filter(q => q._adminOnly.suggestedCorrectOption).length,
    highConfidence: withSuggestions.filter(q => q._adminOnly.confidenceScore >= 0.6).length,
    lowConfidence: withSuggestions.filter(q => q._adminOnly.confidenceScore < 0.6).length,
    noSuggestion: withSuggestions.filter(q => !q._adminOnly.suggestedCorrectOption).length
  };
  
  console.log(`\n📊 Analysis Results:`);
  console.log(`   Total questions: ${stats.total}`);
  console.log(`   With suggestions: ${stats.suggested}`);
  console.log(`   High confidence (≥0.6): ${stats.highConfidence}`);
  console.log(`   Low confidence (<0.6): ${stats.lowConfidence}`);
  console.log(`   No suggestion: ${stats.noSuggestion}`);
  
  saveSuggestions(withSuggestions, outputPath);
  
  console.log(`\n⚠️  SAFETY REMINDER:`);
  console.log(`   - Suggestions are HINTS only`);
  console.log(`   - ALL answers must be manually reviewed`);
  console.log(`   - Low confidence (<0.6) requires extra scrutiny`);
  console.log(`   - Remove _adminOnly field before bulk import`);
}

module.exports = { suggestCorrectOptions, analyzeQuestion };
