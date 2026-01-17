# Question Finalizer Module

## Purpose

Transform parsed questions into final JSON format compatible with the bulk import API.

## Input → Output Flow

### Input (Parsed Questions)

```json
[
  {
    "questionText": "What is the Laplace transform of u(t)?",
    "optionA": "1/s",
    "optionB": "s",
    "optionC": "1",
    "optionD": "0",
    "_metadata": { "index": 1 }
  }
]
```

### Output (Bulk API Format)

```json
{
  "questions": [
    {
      "subjectId": "signals",
      "topicId": "laplace",
      "year": 2023,
      "marks": 2,
      "questionText": "What is the Laplace transform of u(t)?",
      "optionA": "1/s",
      "optionB": "s",
      "optionC": "1",
      "optionD": "0",
      "correctOption": "",
      "solutionText": ""
    }
  ]
}
```

## Usage

### Interactive Mode (Recommended)

```bash
node pdf/finalizeQuestions.js pdf/output/questions.json --interactive
```

Prompts for:

- Subject ID
- Topic ID
- Year
- Marks

### Command-Line Mode

```bash
node pdf/finalizeQuestions.js questions.json output.json \
  --subject=signals \
  --topic=laplace \
  --year=2023 \
  --marks=2
```

### Programmatic Usage

```javascript
const { finalizeQuestions, createBulkPayload } = require('./pdf/finalizeQuestions');

const parsed = [
  { questionText: "...", optionA: "...", ... }
];

const config = {
  subjectId: 'signals',
  topicId: 'laplace',
  year: 2023,
  marks: 2
};

const finalized = finalizeQuestions(parsed, config);
const payload = createBulkPayload(finalized);

// payload is ready for POST /api/questions/bulk
```

## Sending to Bulk Import API

### Using cURL

```bash
curl -X POST http://localhost:5002/api/questions/bulk \
  -H "Content-Type: application/json" \
  -d @output_bulk.json
```

### Using Postman

1. Method: POST
2. URL: `http://localhost:5002/api/questions/bulk`
3. Headers: `Content-Type: application/json`
4. Body: Raw JSON (paste file contents)

### Using Node.js

```javascript
const fs = require("fs");
const fetch = require("node-fetch");

const payload = JSON.parse(fs.readFileSync("output_bulk.json", "utf8"));

fetch("http://localhost:5002/api/questions/bulk", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify(payload),
})
  .then((res) => res.json())
  .then((data) => console.log("Import result:", data));
```

## Filling correctOption & solutionText

### Option 1: Manual Editing

1. Open the output JSON file
2. For each question, add:
   ```json
   "correctOption": "A",
   "solutionText": "Explanation here..."
   ```

### Option 2: Separate Answer Key File

Create `answers.json`:

```json
{
  "1": { "correct": "A", "solution": "..." },
  "2": { "correct": "B", "solution": "..." }
}
```

Then merge programmatically (future enhancement).

### Option 3: Admin UI (Future)

Build a review interface where admin can:

- Preview each question
- Select correct option
- Add solution text
- Approve for import

## Complete Pipeline Example

```bash
# Step 1: Extract text from PDF
node pdf/extractText.js samples/gate_2023.pdf

# Step 2: Parse questions
node pdf/parseQuestions.js output/gate_2023_extracted.txt

# Step 3: Finalize with metadata
node pdf/finalizeQuestions.js output/gate_2023_extracted_questions.json \
  --subject=signals --topic=laplace --year=2023 --marks=2

# Step 4: Manually edit correctOption in the output file

# Step 5: Import to database
curl -X POST http://localhost:5002/api/questions/bulk \
  -H "Content-Type: application/json" \
  -d @output/gate_2023_extracted_questions_bulk.json
```

## Metadata Fields

| Field           | Required | Default      | Description                          |
| --------------- | -------- | ------------ | ------------------------------------ |
| `subjectId`     | Yes      | 'unknown'    | Subject identifier (e.g., 'signals') |
| `topicId`       | Yes      | 'unknown'    | Topic identifier (e.g., 'laplace')   |
| `year`          | Yes      | Current year | Question year                        |
| `marks`         | Yes      | 1            | Question marks (1 or 2)              |
| `correctOption` | Yes\*    | ''           | Correct answer (A/B/C/D)             |
| `solutionText`  | No       | ''           | Solution explanation                 |

\*Required by API but can be empty initially for manual filling.

## Validation

The output JSON is validated against the bulk API schema when imported. Ensure:

- All required fields present
- `correctOption` is one of: A, B, C, D (or empty)
- `year` is between 1990-2030
- `marks` is 1 or 2

## Next Steps (Phase 3)

1. Build admin review UI
2. Add answer key parser
3. Auto-detect subject/topic from PDF metadata
4. Add batch processing for multiple PDFs
5. Integrate with frontend upload
