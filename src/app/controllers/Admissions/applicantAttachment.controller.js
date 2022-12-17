const { HttpResponse } = require('@helpers');
const {
  applicantAttachmentService,
  runningAdmissionApplicantService,
} = require('@services/index');
const { isEmpty } = require('lodash');
const model = require('@models');
const multer = require('multer');
const path = require('path');
const {
  checkRunningAdmissionExpiry,
  // checkRunningAdmissionMaximumNumberOfFormsConstraint,
} = require('../Helpers/runningAdmissionApplicantHelper');
const { createAdmissionLog } = require('../Helpers/logsHelper');

const { generateAdmissionFormId } = require('../Helpers/admissionsHelper');
const { appConfig } = require('@root/config');

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, path.join(appConfig.ASSETS_ROOT_DIRECTORY, 'admissions/'));
  },

  // By default, multer removes file extensions so let's add them back
  filename: function (req, file, cb) {
    cb(
      null,
      file.fieldname + `-ADF-` + Date.now() + path.extname(file.originalname)
    );
  },
});

const pdfFilter = (req, file, cb) => {
  // Accept PDFs only
  if (!file.originalname.match(/\.(PDF|pdf)$/)) {
    req.fileValidationError = 'Only PDF files are allowed!';

    return cb(new Error('Only PDF files are allowed!'), false);
  }
  cb(null, true);
};

const upload = multer({
  storage,
  fileFilter: pdfFilter,
}).single('attachment');

const http = new HttpResponse();

class ApplicantAttachmentController {
  /**
   * GET All applicantAttachments.
   *
   * @param {*} req Request
   * @param {*} res Response
   *
   * @returns {JSON} Http Response
   */
  async index(req, res) {
    try {
      const applicantAttachments =
        await applicantAttachmentService.findAllApplicantAttachments({
          ...getApplicantAttachmentAttributes(),
        });

      http.setSuccess(200, 'Applicant Attachments Fetched Successfully', {
        applicantAttachments,
      });

      return http.send(res);
    } catch (error) {
      http.setError(400, 'Unable To Fetch Applicant Attachments', {
        error: { message: error.message },
      });

      return http.send(res);
    }
  }

  /**
   * CREATE New ApplicantAttachment Data.
   *
   * @param {*} req Request body
   * @param {*} res Response
   *
   * @return {JSON} Return JSON Response
   */
  createApplicantAttachment(req, res) {
    upload(req, res, async (err) => {
      try {
        const data = req.body;
        const { id } = req.user;

        const formId =
          data.form_id && data.form_id.includes('APF')
            ? data.form_id
            : await generateAdmissionFormId(data.running_admission_id, id);

        if (err instanceof multer.MulterError) {
          // A Multer error occurred when uploading.

          throw new Error(err);
        } else if (err) {
          // An unknown error occurred when uploading.
          throw new Error(err);
        }

        const { filename } = req.file;

        const allAttachments = [
          {
            ...data,
            attachment: filename,
            running_admission_id: data.running_admission_id,
            section_id: data.section_id,
            form_id: formId,
            applicant_id: id,
          },
        ];

        const runningAdmissionApplicantSection = {
          running_admission_id: data.running_admission_id,
          applicant_id: id,
          form_id: formId,
          formSections: [
            {
              form_section_id: data.section_id,
            },
          ],
        };

        await checkRunningAdmissionExpiry(data.running_admission_id);

        // await checkRunningAdmissionMaximumNumberOfFormsConstraint(
        //   data.running_admission_id,
        //   id
        // );

        const response = await model.sequelize.transaction(
          async (transaction) => {
            const result =
              await applicantAttachmentService.createApplicantAttachment(
                allAttachments,
                transaction
              );

            await runningAdmissionApplicantService.createRunningAdmissionApplicant(
              runningAdmissionApplicantSection,
              transaction
            );

            return result;
          }
        );

        http.setSuccess(201, 'Applicant Attachment created successfully', {
          data: response,
        });

        return http.send(res);
      } catch (error) {
        http.setError(400, 'Unable to create this Applicant Attachment.', {
          error: { message: error.message },
        });

        return http.send(res);
      }
    });
  }

  /**
   * UPDATE Specific ApplicantAttachment Data.
   *
   * @param {*} req Request body
   * @param {*} res Response
   *
   * @return {JSON} Return JSON Response
   */
  updateApplicantAttachment(req, res) {
    upload(req, res, async (err) => {
      try {
        const { filename } = req.file;

        const { id } = req.params;
        const data = req.body;

        if (err instanceof multer.MulterError) {
          // A Multer error occurred when uploading.

          throw new Error(err);
        } else if (err) {
          // An unknown error occurred when uploading.
          throw new Error(err);
        }

        const findForm =
          await applicantAttachmentService.findOneApplicantAttachment({
            where: {
              id,
            },
            raw: true,
          });

        if (isEmpty(findForm))
          http.setError(404, 'Applicant Attachment Data Not Found');

        await checkRunningAdmissionExpiry(findForm.running_admission_id);

        const updateApplicantAttachment =
          await applicantAttachmentService.updateApplicantAttachment(id, {
            attachment: filename,
            attachment_name: data.attachment_name,
          });
        const applicantAttachment = updateApplicantAttachment[1][0];

        http.setSuccess(200, 'Applicant Attachment Updated Successfully', {
          data: applicantAttachment,
        });

        return http.send(res);
      } catch (error) {
        http.setError(400, 'Unable To Update This Applicant Attachment', {
          error: { message: error.message },
        });

        return http.send(res);
      }
    });
  }

  /**
   * Get Specific ApplicantAttachment Data.
   *
   * @param {*} req Request body
   * @param {*} res Response
   *
   * @return {JSON} Return JSON Response
   */
  async fetchApplicantAttachment(req, res) {
    try {
      const { formId } = req.params;
      const applicant = parseInt(req.user.id, 10);
      const data = await applicantAttachmentService.findAllApplicantAttachments(
        {
          where: {
            form_id: formId,
            applicant_id: applicant,
          },
          ...getApplicantAttachmentAttributes(),
        }
      );

      http.setSuccess(200, 'Applicant Attachment fetch successful', {
        data,
      });

      return http.send(res);
    } catch (error) {
      http.setError(400, 'Unable to get this Applicant Attachment', {
        error: { message: error.message },
      });

      return http.send(res);
    }
  }

  /**
   *
   *
   * @param {*} req Request body
   * @param {*} res Response
   *
   * @return {JSON} Return JSON Response
   */
  async fetchApplicantAttachmentByStaff(req, res) {
    try {
      const { formId } = req.params;
      const data = await applicantAttachmentService.findAllApplicantAttachments(
        {
          where: {
            form_id: formId,
          },
          ...getApplicantAttachmentAttributes(),
        }
      );

      http.setSuccess(200, 'Applicant Attachments Fetched Successfully.', {
        data,
      });

      return http.send(res);
    } catch (error) {
      http.setError(400, `Unable To Get This Applicant's Attachment.`, {
        error: { message: error.message },
      });

      return http.send(res);
    }
  }

  /**
   *
   *
   * @param {*} req Request body
   * @param {*} res Response
   *
   * @return {JSON} Return JSON Response
   */
  async downloadApplicantAttachmentByStaff(req, res) {
    try {
      const { attachmentId } = req.params;
      const { id: user, remember_token: rememberToken } = req.user;

      const attachment = await applicantAttachmentService
        .findOneApplicantAttachment({
          where: {
            id: attachmentId,
          },
          ...getApplicantAttachmentAttributes(),
          nest: true,
        })
        .then(function (res) {
          if (res) {
            const result = res.toJSON();

            return result;
          }
        });

      if (!attachment) {
        throw new Error(`Attachment Doesn't Exist.`);
      }

      const file = `${path.join(
        appConfig.ASSETS_ROOT_DIRECTORY,
        `admissions`
      )}/${attachment.attachment}`;

      if (!file) {
        throw new Error(`Applicant's Attachment Doesnot Exist.`);
      }

      res.download(file);

      await model.sequelize.transaction(async (transaction) => {
        await createAdmissionLog(
          {
            user_id: user,
            operation: `DOWNLOAD TEMPLATE`,
            area_accessed: `APPLICANT ATTACHMENTS`,
            current_data: `Downloaded attachment ${attachment.attachment} of id: ${attachment.id} for applicant: ${attachment.applicant.surname} ${attachment.applicant.other_names}.`,
            ip_address: req.connection.remoteAddress,
            user_agent: req.get('user-agent'),
            token: rememberToken,
          },
          transaction
        );
      });
    } catch (error) {
      http.setError(400, `Unable To Get This Applicant's Attachment.`, {
        error: { message: error.message },
      });

      return http.send(res);
    }
  }

  /**
   * Destroy RunningAdmission Data
   *
   * @param {*} req
   * @param {*} res
   *
   * @return {JSON}
   */
  async deleteApplicantAttachment(req, res) {
    try {
      const { id } = req.params;

      await applicantAttachmentService.deleteApplicantAttachment(id);
      http.setSuccess(200, 'Attachment Deleted Successfully');

      return http.send(res);
    } catch (error) {
      http.setError(400, 'Unable To Delete This Attachment', {
        error: { message: error.message },
      });

      return http.send(res);
    }
  }
}

const getApplicantAttachmentAttributes = function () {
  return {
    include: [
      {
        association: 'applicant',
        attributes: {
          exclude: [
            'password',
            'is_default_password',
            'last_password_changed_at',
          ],
        },
      },
    ],
  };
};

module.exports = ApplicantAttachmentController;
