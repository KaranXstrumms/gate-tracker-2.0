# PDF Text Extraction Module

## Installation

```bash
cd backend
npm install pdf-parse
```

## Folder Structure

```
backend/
├── pdf/
│   ├── extractText.js       # Main extraction script
│   ├── samples/              # Sample PDF files (add your PDFs here)
│   └── output/               # Extracted text files
├── models/
├── validators/
└── server.js
```

## Usage

### Command Line

```bash
# Basic usage (saves to <filename>_extracted.txt)
node pdf/extractText.js path/to/gate_paper.pdf

# Specify output file
node pdf/extractText.js path/to/gate_paper.pdf output/extracted.txt
```

### Programmatic Usage

```javascript
const { extractTextFromPDF } = require("./pdf/extractText");

async function processGatePDF() {
  const result = await extractTextFromPDF("samples/gate_2023_ece.pdf");

  if (result.success) {
    console.log("Pages:", result.metadata.pages);
    console.log("Cleaned Text:", result.cleanedText);
  } else {
    console.error("Error:", result.error);
  }
}

processGatePDF();
```

## Why pdf-parse?

**Chosen Library:** `pdf-parse`

**Reasons:**

1. **Lightweight** - No external dependencies (pure Node.js)
2. **Simple API** - Single function call to extract text
3. **Buffer Support** - Works with file buffers (useful for uploads)
4. **Metadata** - Provides page count, PDF version, etc.
5. **Widely Used** - 500k+ weekly downloads, well-maintained

**Alternatives Considered:**

- `pdfjs-dist` - More powerful but heavier, overkill for text extraction
- `pdf2json` - Good for structure but complex for simple text needs
- `pdfreader` - Lower-level, requires more code

## Text Cleaning Features

The script automatically removes:

- Page numbers (e.g., "Page 1", "1 of 10")
- Common headers/footers (e.g., "GATE 2024 ECE")
- URLs and website links
- Excessive whitespace
- Leading/trailing spaces

## Output Files

For each PDF, two files are generated:

1. `<filename>_extracted.txt` - Cleaned text (recommended)
2. `<filename>_raw.txt` - Raw text (for debugging)

## Example Output

```
Input: gate_2023_ece.pdf (50 pages)

Output:
✅ Text saved to: gate_2023_ece_extracted.txt
✅ Text saved to: gate_2023_ece_raw.txt

Metadata:
   Pages: 50
   PDF Version: 1.4
   Raw Text Length: 125000 characters
   Cleaned Text Length: 118000 characters
```

## Testing

1. Place a GATE PDF in `backend/pdf/samples/`
2. Run extraction:
   ```bash
   node pdf/extractText.js samples/gate_2023.pdf
   ```
3. Check output in the same directory

## Next Steps (Phase 3)

After text extraction works:

1. Parse questions from cleaned text (regex patterns)
2. Structure into JSON format
3. Validate against schema
4. Bulk insert into MongoDB
