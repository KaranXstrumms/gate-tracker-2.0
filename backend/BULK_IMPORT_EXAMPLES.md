# Bulk Import API - Examples

## Example Request JSON

```json
{
  "questions": [
    {
      "subjectId": "signals",
      "topicId": "laplace",
      "year": 2023,
      "marks": 2,
      "questionText": "What is the Laplace transform of the unit step function u(t)?",
      "optionA": "1/s",
      "optionB": "s",
      "optionC": "1",
      "optionD": "0",
      "correctOption": "A",
      "solutionText": "The Laplace transform of u(t) is 1/s for Re(s) > 0."
    },
    {
      "subjectId": "networks",
      "topicId": "theorems",
      "year": 2022,
      "marks": 1,
      "questionText": "Thevenin's theorem is applicable to which type of circuits?",
      "optionA": "Linear circuits only",
      "optionB": "Non-linear circuits only",
      "optionC": "Both linear and non-linear",
      "optionD": "Neither",
      "correctOption": "A",
      "solutionText": "Thevenin's theorem applies only to linear circuits."
    },
    {
      "subjectId": "digital",
      "topicId": "basics",
      "year": 2021,
      "marks": 1,
      "questionText": "How many flip-flops are required to construct a MOD-16 counter?",
      "optionA": "2",
      "optionB": "4",
      "optionC": "8",
      "optionD": "16",
      "correctOption": "B",
      "solutionText": "MOD-16 counter requires 4 flip-flops (2^4 = 16 states)."
    }
  ]
}
```

## Example Success Response

```json
{
  "success": true,
  "total": 3,
  "inserted": 2,
  "failed": 1,
  "errors": [
    {
      "index": 1,
      "question": "Thevenin's theorem is applicable to which type...",
      "reason": "Duplicate question detected"
    }
  ]
}
```

## Example Validation Error Response

```json
{
  "success": true,
  "total": 5,
  "inserted": 3,
  "failed": 2,
  "errors": [
    {
      "index": 0,
      "question": "What is the value of...",
      "reason": "\"correctOption\" must be one of [A, B, C, D]"
    },
    {
      "index": 3,
      "question": "N/A",
      "reason": "\"questionText\" is required"
    }
  ]
}
```

## Example Invalid Request Response

```json
{
  "message": "Invalid request: questions must be a non-empty array"
}
```

## Testing with cURL

```bash
curl -X POST http://localhost:5002/api/questions/bulk \
  -H "Content-Type: application/json" \
  -d '{
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
        "correctOption": "A",
        "solutionText": "L{u(t)} = 1/s"
      }
    ]
  }'
```
