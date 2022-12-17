const PDFGenerator = require('pdfkit');
const fs = require('fs');
const path = require('path');
const { appConfig } = require('@root/config');

// instantiate the library
const pdfGenerator = new PDFGenerator({
  size: 'A4',
  layout: 'portrait',
});

pdfGenerator
  .fontSize(19)
  .lineGap(1)
  .font(path.join('public/fonts/Times-New-Roman/times-new-roman.ttf'));

const generateCertificate = (student) => {
  // pipe to a writable stream which would save the result into the same directory
  const certificateImage = path.join(
    appConfig.ASSETS_ROOT_DIRECTORY,
    'documents/templates/certificate.png'
  );

  // const documentName =
  pdfGenerator.pipe(
    fs.createWriteStream(
      path.join(
        appConfig.ASSETS_ROOT_DIRECTORY,
        'documents/certificates/certificate.pdf'
      )
    )
  );

  // const documentName =

  pdfGenerator
    .image(certificateImage, 0, 0, {
      width: pdfGenerator.page.width,
      height: pdfGenerator.page.height,
    })
    .moveDown(4.5)
    .text('This is to certify that', {
      bold: true,
      align: 'center',
    })
    .moveDown()
    .fontSize(23)
    .font(path.join('public/fonts/Arial/Arial-Black.ttf'))
    .text('AMONG ESTHER', {
      align: 'center',
    })
    .moveDown(0.5)
    .image(path.join('public/images/qrCode.png'), 100, 120, {
      align: 'right',
      fit: [80, 80],
    })
    .image(path.join('public/images/avatar.png'), 452, 122, {
      align: 'right',
      fit: [77, 77],
    })
    .fill('#021c27')
    .font(path.join('public/fonts/Times-New-Roman/times-new-roman.ttf'))
    .fontSize(19)
    .text('having fulfilled all the requirements', {
      align: 'center',
    })
    .text('for the award of the', {
      align: 'center',
    })
    .moveDown(1)
    .font(path.join('public/fonts/Times-New-Roman/times-new-roman-bold.ttf'))
    .fontSize(19)
    .text('DEGREE', {
      align: 'center',
    })
    .moveDown(1)
    .text('OF', {
      align: 'center',
    })
    .moveDown(1)
    .text('BACHELOR OF ARTS IN ECONOMICS', {
      align: 'center',
    })
    .moveDown(1)
    .text('(Second Class Honours - Upper Division)', {
      align: 'center',
    })
    .moveDown(1)
    .font(path.join('public/fonts/Times-New-Roman/times-new-roman.ttf'))
    .fontSize(19)
    .text('was admitted to the degree', {
      align: 'center',
    })
    .text('at the 19th Kyambogo University Congregation', {
      align: 'center',
    })
    .text('held on', {
      align: 'center',
    })
    .moveDown(1)
    .text('19th December, 2019', {
      align: 'center',
    });

  // write out file
  pdfGenerator.end();
};

module.exports = generateCertificate;
