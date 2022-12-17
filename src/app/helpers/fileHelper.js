const PDFDocument = require('pdfkit');
const fs = require('fs');

const pdfFilter = function (req, file, cb) {
  // Accept images only
  if (!file.originalname.match(/\.(PDF|pdf)$/)) {
    req.fileValidationError = 'Only PDF files are allowed!';

    return cb(new Error('Only PDF files are allowed!'), false);
  }
  cb(null, true);
};

/**
 *
 * @param {*} data
 * @param {*} headerName
 * @param {*} outputFileName
 * @param {*} logoPath
 */
const createPdfDocument = (data, headerName, outputFileName, logoPath) => {
  // Create a document
  const doc = new PDFDocument();

  // Pipe its output somewhere, like to a file or HTTP response
  // See below for browser usage
  doc.pipe(fs.createWriteStream(`${outputFileName}`));

  // Add an image, constrain it to a given size, and center it vertically and horizontally
  doc.image(`${logoPath}`, {
    fit: [250, 300],
    align: 'center',
    valign: 'center',
  });

  // Embed a font, set the font size, and render some text
  doc
    .font('fonts/PalatinoBold.ttf')
    .fontSize(25)
    .text(`${headerName}`, 100, 100);

  // Apply some transforms and render an SVG path with the 'even-odd' fill rule
  doc
    .scale(0.6)
    .translate(470, -380)
    .path('M 250,75 L 323,301 131,161 369,161 177,301 z')
    .fill('red', 'even-odd')
    .restore();

  data.pages.forEach((page) => {
    doc
      .addPage()
      .font('fonts/PalatinoBold.ttf')
      .fontSize(25)
      .text(`${page.title} \n\n ${page.content}`, 100, 100);
  });

  // Finalize PDF file
  doc.end();
};

module.exports = { pdfFilter, createPdfDocument };
