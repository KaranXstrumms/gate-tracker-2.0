# Question Parser Module

## Parsing Strategy

**Input:** Cleaned text file from PDF extraction  
**Output:** Array of structured question objects

### Strategy Overview

1. **Split by Question Markers**

   - Detects patterns: `1.`, `Q.1`, `Q1.`, `Question 1`
   - Splits text into individual question blocks

2. **Extract Question Text**

   - Everything before first option `(A)` is the question

3. **Extract Options**

   - Regex pattern: `(A) text (B) text (C) text (D) text`
   - Captures text between option markers

4. **Validation**
   - Requires minimum 4 options (A, B, C, D)
   - Requires question text > 10 characters
   - Skips malformed questions with warnings

## Usage

```bash
# Parse questions from extracted text
node pdf/parseQuestions.js pdf/output/gate_2023_extracted.txt

# Specify output JSON file
node pdf/parseQuestions.js pdf/output/extracted.txt pdf/output/questions.json
```

## Sample Input → Output

### Input Text (gate_sample.txt)

```
1. What is the Laplace transform of u(t)?
(A) 1/s
(B) s
(C) 1
(D) 0

2. Thevenin's theorem is applicable to:
(A) Linear circuits only
(B) Non-linear circuits only
(C) Both linear and non-linear
(D) Neither
```

### Output JSON (gate_sample_questions.json)

```json
[
  {
    "questionText": "What is the Laplace transform of u(t)?",
    "optionA": "1/s",
    "optionB": "s",
    "optionC": "1",
    "optionD": "0",
    "_metadata": {
      "index": 1,
      "rawLength": 95
    }
  },
  {
    "questionText": "Thevenin's theorem is applicable to:",
    "optionA": "Linear circuits only",
    "optionB": "Non-linear circuits only",
    "optionC": "Both linear and non-linear",
    "optionD": "Neither",
    "_metadata": {
      "index": 2,
      "rawLength": 142
    }
  }
]
```

## Regex Patterns Used

| Pattern                                    | Purpose           | Example Matches           |
| ------------------------------------------ | ----------------- | ------------------------- |
| `/(?:Q\.?\s*\d+\|Question\s+\d+\|\d+\.)/`  | Question markers  | `1.`, `Q.1`, `Question 1` |
| `/\(([A-D])\)\s*([^(]+?)(?=\([A-D]\)\|$)/` | Option extraction | `(A) text`                |

## Known Limitations

### 1. **Multi-line Questions**

- **Issue:** Questions spanning multiple paragraphs may not parse correctly
- **Workaround:** Manual review and editing of extracted text

### 2. **Nested Parentheses**

- **Issue:** Options containing `(A)` or `(B)` in text may confuse parser
- **Example:** `(A) The value (A) is correct` → May split incorrectly
- **Workaround:** Pre-process text to escape nested parentheses

### 3. **Non-standard Formatting**

- **Issue:** PDFs using `a)`, `A)`, or `[A]` instead of `(A)`
- **Workaround:** Add custom regex patterns for specific PDF sources

### 4. **Image-based Options**

- **Issue:** Options that are images/diagrams cannot be extracted
- **Workaround:** Manual entry or OCR integration (future)

### 5. **Mathematical Notation**

- **Issue:** LaTeX or special symbols may not render correctly
- **Example:** `∫`, `∑`, `√` may appear as garbled text
- **Workaround:** Post-processing to convert to LaTeX strings

### 6. **Solution Text**

- **Current:** Solutions are NOT extracted (ignored)
- **Future:** Add solution extraction in Phase 3

## Validation Rules

Questions are skipped if:

- Less than 4 options found
- Question text < 10 characters
- No option markers `(A)`, `(B)`, `(C)`, `(D)` detected

## Testing

Create a sample text file:

```bash
cat > pdf/samples/test_input.txt << 'EOF'
1. Sample question text here?
(A) First option
(B) Second option
(C) Third option
(D) Fourth option

2. Another question?
(A) Option A
(B) Option B
(C) Option C
(D) Option D
EOF

# Parse it
node pdf/parseQuestions.js pdf/samples/test_input.txt
```

## Next Steps (Phase 3)

1. Add subject/topic mapping
2. Extract year and marks from PDF metadata
3. Add solution extraction
4. Integrate with bulk import API
5. Add manual review/edit interface
