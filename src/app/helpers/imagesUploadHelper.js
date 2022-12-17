const { trim } = require('lodash');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { appConfig } = require('../../config');
const axios = require('axios');

const avatarMaxSize = 9000000;

const imageFilter = function (req, file, cb) {
  // Accept images only
  if (!file.originalname.match(/\.(jpg|JPG|jpeg|JPEG|png|PNG)$/)) {
    req.fileValidationError = 'Only image (JPG, JPEG, PNG) files are allowed!';

    return cb(new Error('Only image files are allowed!'), false);
  }
  cb(null, true);
};

const studentAvatarDestination = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, path.join(appConfig.STUDENTS_PHOTO_DIRECTORY));
  },

  filename: function (req, file, cb) {
    cb(null, trim(req.params.studentNumber) + path.extname(file.originalname));
  },
});

const uploadStudentAvatarMiddleware = multer({
  storage: studentAvatarDestination,
  // file size in bytes
  limits: { fileSize: avatarMaxSize },
  fileFilter: imageFilter,
}).single('avatar');

/**
 *
 * @param {*} file
 */
const sendStudentAvatarsToRemoteServer = async function (file) {
  try {
    const url = `${path.join(appConfig.STUDENTS_PHOTO_DIRECTORY)}`;

    const formData = {
      file: {
        value: fs.createReadStream(file.filepath),
        options: {
          filename: file.filename,
        },
      },
    };

    const upload = await axios({
      method: 'post',
      url: url,
      data: formData,
      headers: { 'Content-Type': 'multipart/form-data' },
    })
      .then(function (response) {
        // handle success
        // console.log(response);
      })
      .catch(function (error) {
        // handle error
        throw new Error(error);
        // console.log(response);
      });

    return upload;
  } catch (error) {
    throw new Error(error.message);
  }
};

module.exports = {
  sendStudentAvatarsToRemoteServer,
  uploadStudentAvatarMiddleware,
};
