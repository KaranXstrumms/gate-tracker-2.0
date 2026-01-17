# CorrectOption Suggestion Module

## ⚠️ SAFETY FIRST

**CRITICAL RULES:**

1. **NEVER** automatically sets `correctOption`
2. Suggestions are **HINTS ONLY** - require manual review
3. Confidence < 0.6 = **MANDATORY** manual review
4. `_adminOnly` field must be **REMOVED** before bulk import
5. This module is **ADMIN-ONLY** - never exposed to students

## Purpose

Provide intelligent suggestions for correct answers using rule-based heuristics to speed up manual review process.

## Heuristics Used

### 1. Definition Matching (Confidence: 0.75)

Matches known definitions from a knowledge base.

**Example:**

- Question: "What is the Laplace transform of u(t)?"
- Known: Laplace transform of u(t) = 1/s
- Suggests option containing "1/s"

### 2. Numeric Matching (Confidence: 0.85)

Applies mathematical rules for numeric questions.

**Example:**

- Question: "How many flip-flops for MOD-16 counter?"
- Rule: MOD-N requires log₂(N) flip-flops
- Calculates: log₂(16) = 4
- Suggests option "4"

### 3. Formula Matching (Confidence: 0.7-0.8)

Recognizes standard formulas and equations.

**Example:**

- Question: "Nyquist sampling theorem states..."
- Formula: Sampling frequency ≥ 2 × highest frequency
- Suggests option with "twice" or "2 × highest"

### 4. Keyword Density (Confidence: 0.5-0.7)

Counts keyword overlap between question and options.

**Example:**

- Question: "Linear circuit analysis using Thevenin theorem"
- Option A: "Linear circuits only" (3 matches)
- Option B: "Non-linear circuits" (1 match)
- Suggests Option A

### 5. Negation Detection (Confidence: 0.3)

Flags questions with NOT/EXCEPT/FALSE for manual review.

**Example:**

- Question: "Which is NOT true about..."
- Flags for manual review (low confidence)

## Usage

```bash
node pdf/suggestCorrectOption.js questions_bulk.json questions_suggested.json
```

## Input Format

```json
{
  "questions": [
    {
      "questionText": "What is the Laplace transform of u(t)?",
      "optionA": "1/s",
      "optionB": "s",
      "optionC": "1",
      "optionD": "0",
      "correctOption": ""
    }
  ]
}
```

## Output Format

```json
{
  "questions": [
    {
      "questionText": "What is the Laplace transform of u(t)?",
      "optionA": "1/s",
      "optionB": "s",
      "optionC": "1",
      "optionD": "0",
      "correctOption": "",
      "_adminOnly": {
        "suggestedCorrectOption": "A",
        "confidenceScore": 0.75,
        "reasoning": "Definition match for 'laplace transform'",
        "requiresManualReview": false
      }
    }
  ],
  "_metadata": {
    "generatedAt": "2026-01-17T03:00:00Z",
    "totalQuestions": 10,
    "highConfidence": 6,
    "lowConfidence": 4
  }
}
```

## Confidence Levels

| Score    | Meaning   | Action Required                     |
| -------- | --------- | ----------------------------------- |
| 0.8-1.0  | Very High | Review, likely correct              |
| 0.6-0.79 | High      | Review carefully                    |
| 0.4-0.59 | Medium    | **Manual review required**          |
| 0.0-0.39 | Low       | **Ignore suggestion, manual entry** |

## Manual Review Workflow

1. **Run suggestion script:**

   ```bash
   node pdf/suggestCorrectOption.js input.json output.json
   ```

2. **Review output file:**

   - Check `_adminOnly.confidenceScore`
   - Read `_adminOnly.reasoning`
   - Verify suggestion against question

3. **For each question:**

   - If confidence ≥ 0.6: Verify and copy to `correctOption`
   - If confidence < 0.6: Manually determine correct answer
   - Add `solutionText` if available

4. **Clean before import:**

   - Remove all `_adminOnly` fields
   - Ensure all `correctOption` fields are filled
   - Validate JSON structure

5. **Import to database:**
   ```bash
   curl -X POST http://localhost:5002/api/questions/bulk \
     -H "Content-Type: application/json" \
     -d @cleaned_questions.json
   ```

## Extending Heuristics

### Adding New Definitions

Edit `checkDefinitionMatch()`:

```javascript
const definitions = {
  your_term: /pattern to match/i,
  kirchhoff: /current|voltage|law/i,
  // Add more...
};
```

### Adding New Formulas

Edit `checkFormulaMatch()`:

```javascript
const formulas = {
  your_pattern: { pattern: /formula/i, confidence: 0.8 },
  // Add more...
};
```

## Limitations

1. **No AI/ML** - Pure rule-based, limited coverage
2. **Context-blind** - Cannot understand complex reasoning
3. **Subject-specific** - Works best for ECE fundamentals
4. **English-only** - No multi-language support
5. **No image analysis** - Text-only questions

## Safety Guarantees

✅ Never modifies `correctOption` field  
✅ All suggestions in separate `_adminOnly` field  
✅ Confidence scores always provided  
✅ Low-confidence flagged for review  
✅ Metadata includes warnings  
✅ No database writes  
✅ No API calls

## Future Enhancements (v1.2+)

- [ ] ML-based suggestion (TensorFlow.js)
- [ ] Answer key file parsing
- [ ] Admin review UI
- [ ] Batch processing
- [ ] Confidence calibration
- [ ] Subject-specific models
