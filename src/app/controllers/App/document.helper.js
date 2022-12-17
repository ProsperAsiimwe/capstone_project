const multer = require('multer');
const path = require('path');
const { appConfig } = require('@root/config');

const imageFilter = function (req, file, cb) {
  // Accept images only
  if (!file.originalname.match(/\.(jpg|JPG|jpeg|JPEG|png|PNG)$/)) {
    req.fileValidationError = 'Only image (JPG, JPEG, PNG) files are allowed!';

    return cb(new Error('Only image files are allowed!'), false);
  }
  cb(null, true);
};

let filePath = 'documents/templates/MUK';

if (appConfig.TAX_HEAD_CODE === 'FMUK01') {
  filePath = 'documents/templates/MAK';
} else if (appConfig.TAX_HEAD_CODE === 'FKYU03') {
  filePath = 'documents/templates/KYU';
} else if (appConfig.TAX_HEAD_CODE === 'FGUL06') {
  filePath = 'documents/templates/GUL';
}

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, path.join(appConfig.ASSETS_ROOT_DIRECTORY, filePath));
  },

  // By default, multer removes file extensions so let's add them back
  filename: function (req, file, cb) {
    cb(
      null,
      file.fieldname + `-ADF-` + Date.now() + path.extname(file.originalname)
    );
  },
});

const multerMiddleware = multer({
  storage,
  fileFilter: imageFilter,
}).single('signature');

module.exports = multerMiddleware;
