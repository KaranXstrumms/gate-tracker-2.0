const fs = require('fs');
const path = require('path');
const pdfjsLib = require('pdfjs-dist/legacy/build/pdf.js');

// CLI Usage
if (require.main === module) {
  const args = process.argv.slice(2);
  
  if (args.length === 0) {
    console.log('Usage: node extractText.js <path-to-pdf>');
    console.log('Example: node extractText.js samples/gate_2023.pdf');
    process.exit(1);
  }
  
  const pdfPath = args[0];
  
  if (!fs.existsSync(pdfPath)) {
    console.error(`❌ Error: File not found: ${pdfPath}`);
    process.exit(1);
  }
  
  console.log(`📄 Extracting text from: ${pdfPath}`);
  
  // Read PDF file
  const dataBuffer = new Uint8Array(fs.readFileSync(pdfPath));
  
  // Load PDF document
  const loadingTask = pdfjsLib.getDocument({ data: dataBuffer });
  
  loadingTask.promise
    .then(async (pdfDocument) => {
      const numPages = pdfDocument.numPages;
      console.log(`📊 Pages: ${numPages}`);
      
      let fullText = '';
      
      // Extract text from each page
      for (let pageNum = 1; pageNum <= numPages; pageNum++) {
        const page = await pdfDocument.getPage(pageNum);
        const textContent = await page.getTextContent();
        const pageText = textContent.items.map(item => item.str).join(' ');
        fullText += pageText + '\n\n';
      }
      
      console.log(`📝 Text Length: ${fullText.length} characters`);
      
      // Save to output directory
      const pdfBasename = path.basename(pdfPath, '.pdf');
      const outputDir = path.join(__dirname, 'output');
      const outputPath = path.join(outputDir, `${pdfBasename}.txt`);
      
      // Create output directory if it doesn't exist
      if (!fs.existsSync(outputDir)) {
        fs.mkdirSync(outputDir, { recursive: true });
      }
      
      // Write extracted text
      fs.writeFileSync(outputPath, fullText.trim(), 'utf8');
      
      console.log(`✅ Text saved to: ${outputPath}`);
      console.log(`\n✅ Extraction complete!`);
    })
    .catch(err => {
      console.error(`❌ Extraction failed: ${err.message}`);
      process.exit(1);
    });
}

module.exports = { pdfjsLib };

// pdfjs-dist based extractor (stable, verified)
