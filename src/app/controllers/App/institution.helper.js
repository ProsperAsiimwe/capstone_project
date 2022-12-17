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

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, path.join(appConfig.ASSETS_ROOT_DIRECTORY, 'logo'));
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
}).single('institution_logo');

module.exports = multerMiddleware;
