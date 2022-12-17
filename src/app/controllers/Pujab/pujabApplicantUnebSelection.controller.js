const { pujabApplicantUnebSelectionService } = require('@services/index');
const model = require('@models');
const { HttpResponse } = require('@helpers');
const { now, toUpper, trim, isEmpty, chunk } = require('lodash');
const http = new HttpResponse();
const formidable = require('formidable');
const XLSX = require('xlsx');
const excelJs = require('exceljs');
const fs = require('fs');
const {
  validateSheetColumns,
} = require('@controllers/Helpers/uploadValidator');
const {
  applicantByFirstChoice,
  proposedMeritAdmission,
} = require('./pujabTemplateColumns');

class PujabApplicantUnebSelectionController {
  /**
   *
   * @param {*} req
   * @param {*} res
   */
  async findAllApplicantsByFirstChoice(req, res) {
    try {
      const applicants =
        await pujabApplicantUnebSelectionService.findAllApplicantsByFirstChoice(
          {
            ...getAllAttributes(),
          }
        );

      http.setSuccess(200, 'Applicants fetched successfully', {
        data: applicants,
      });

      return http.send(res);
    } catch (error) {
      http.setError(400, 'Unable to fetch applicants', {
        error: { message: error.message },
      });

      return http.send(res);
    }
  }

  /**
   *
   * @param {*} req
   * @param {*} res
   * @returns
   */
  async findoneApplicantByFirstChoice(req, res) {
    try {
      const { id } = req.params;
      const applicant =
        await pujabApplicantUnebSelectionService.findoneApplicantByFirstChoice({
          where: { id },
          ...getAllAttributes(),
        });

      http.setSuccess(200, 'Applicant fetched successfully', {
        data: applicant,
      });

      return http.send(res);
    } catch (error) {
      http.setError(400, 'Unable to get this Applicant.', {
        error: { error: error.message },
      });

      return http.send(res);
    }
  }

  /**
   *
   * @param {*} req
   * @param {*} res
   */
  async findAllProposedMeritAdmissions(req, res) {
    try {
      const applicants =
        await pujabApplicantUnebSelectionService.findAllProposedMeritAdmissions(
          {
            ...getAllAttributes(),
          }
        );

      http.setSuccess(200, 'Merit Admissions fetched successfully', {
        data: applicants,
      });

      return http.send(res);
    } catch (error) {
      http.setError(400, 'Unable to fetch Merit Admissions', {
        error: { message: error.message },
      });

      return http.send(res);
    }
  }

  /**
   *
   * @param {*} req
   * @param {*} res
   */
  async findOneProposedMeritAdmission(req, res) {
    try {
      const { id } = req.params;
      const applicants =
        await pujabApplicantUnebSelectionService.findOneProposedMeritAdmission({
          where: { id },
          ...getAllAttributes(),
        });

      http.setSuccess(200, 'Merit Admission fetched successfully', {
        data: applicants,
      });

      return http.send(res);
    } catch (error) {
      http.setError(400, 'Unable to fetch Merit Admission', {
        error: { message: error.message },
      });

      return http.send(res);
    }
  }

  /**
   *
   * @param {*} req
   * @param {*} res
   */
  async downloadApplicantsByFirstChoiceTemplate(req, res) {
    try {
      const { user } = req;
      const workbook = new excelJs.Workbook();
      const rootSheet = workbook.addWorksheet(
        'PUJAB APPLICANTS BY FIRST CHOICE'
      );

      rootSheet.properties.defaultColWidth = applicantByFirstChoice.length;
      rootSheet.columns = applicantByFirstChoice;

      const uploadPath = `${process.cwd()}/src/assets/documents/templates`;

      if (!fs.existsSync(uploadPath)) {
        fs.mkdirSync(uploadPath, { recursive: true }, (err) => {
          throw new Error(err.message);
        });
      }

      const template = `${uploadPath}/download-pujab-applicants-by-first-choice-template-${
        user.surname
      }-${user.other_names}-${user.id}-${now()}.xlsm`;

      await workbook.xlsx.writeFile(template);
      await res.download(
        template,
        'PUJAB-APPLICANTS-BY-FIRST-CHOICE-TEMPLATE.xlsx',
        (error) => {
          if (error) {
            throw new Error(error.message);
          }
        }
      );
    } catch (error) {
      http.setError(400, 'Unable To Download This Template.', {
        error: { message: error.message },
      });

      return http.send(res);
    }
  }

  /**
   *
   * @param {*} req
   * @param {*} res
   */
  async downloadProposedMeritAdmissionTemplate(req, res) {
    try {
      const { user } = req;
      const workbook = new excelJs.Workbook();
      const rootSheet = workbook.addWorksheet('PUJAB PROPOSED MERIT ADMISSION');

      rootSheet.properties.defaultColWidth = proposedMeritAdmission.length;
      rootSheet.columns = proposedMeritAdmission;

      const uploadPath = `${process.cwd()}/src/assets/documents/templates`;

      if (!fs.existsSync(uploadPath)) {
        fs.mkdirSync(uploadPath, { recursive: true }, (err) => {
          throw new Error(err.message);
        });
      }

      const template = `${uploadPath}/download-pujab-proposed-merit-admission-template-${
        user.surname
      }-${user.other_names}-${user.id}-${now()}.xlsm`;

      await workbook.xlsx.writeFile(template);
      await res.download(
        template,
        'PUJAB-PROPOSED-MERIT-ADMISSION.xlsx',
        (error) => {
          if (error) {
            throw new Error(error.message);
          }
        }
      );
    } catch (error) {
      http.setError(400, 'Unable To Download This Template.', {
        error: { message: error.message },
      });

      return http.send(res);
    }
  }

  /**
   *
   * @param {*} req
   * @param {*} res
   */
  uploadApplicantsByFirstChoiceTemplate(req, res) {
    try {
      const data = req.body;
      const user = req.user.id;
      const form = new formidable.IncomingForm();
      const uploads = [];

      data.created_by_id = user;

      form.parse(req, async (err, fields, files) => {
        if (err) {
          http.setError(400, 'Unable To Upload Records.', {
            error: { err },
          });

          return http.send(res);
        }

        const file = files[Object.keys(files)[0]];

        if (!file) {
          http.setError(400, 'Please Select A File To Upload.');

          return http.send(res);
        }

        const workbook = XLSX.readFile(file.filepath, { cellDates: true });
        const myTemplate = workbook.SheetNames[0];
        const uploadedRecords = XLSX.utils.sheet_to_json(
          workbook.Sheets[myTemplate]
        );

        if (isEmpty(uploadedRecords)) {
          http.setError(400, 'Cannot upload an empty template.');

          return http.send(res);
        }

        const handleUACEGrades = (
          sbj1,
          sbj1Grade,
          sbj2,
          sbj2Grade,
          sbj3,
          sbj3Grade,
          sbj4,
          sbj4Grade,
          sbj5,
          sbj5Grade
        ) => {
          try {
            const uaceGrades = [];

            uaceGrades.push(
              {
                subject_code: sbj1,
                grade: sbj1Grade,
              },
              {
                subject_code: sbj2,
                grade: sbj2Grade,
              },
              {
                subject_code: sbj3,
                grade: sbj3Grade,
              },
              {
                subject_code: sbj4,
                grade: sbj4Grade,
              },
              {
                subject_code: sbj5,
                grade: sbj5Grade,
              }
            );

            if (!isEmpty(uaceGrades)) {
              return uaceGrades;
            } else {
              throw new Error('Some A-Level Subjects & Grades Missing.');
            }
          } catch (error) {
            throw new Error(error.message);
          }
        };

        const handleChoices = (
          choice1,
          choice1Weight,
          choice2,
          choice2Weight,
          choice3,
          choice3Weight,
          choice4,
          choice4Weight,
          choice5,
          choice5Weight,
          choice6,
          choice6Weight
        ) => {
          try {
            const choices = [];

            if (choice1) {
              choices.push({
                choice_code: choice1,
                weight: !isEmpty(choice1Weight) ? choice1Weight : null,
              });
            }

            if (choice2) {
              choices.push({
                choice_code: choice2,
                weight: !isEmpty(choice2Weight) ? choice2Weight : null,
              });
            }

            if (choice3) {
              choices.push({
                choice_code: choice3,
                weight: !isEmpty(choice3Weight) ? choice3Weight : null,
              });
            }

            if (choice4) {
              choices.push({
                choice_code: choice4,
                weight: !isEmpty(choice4Weight) ? choice4Weight : null,
              });
            }

            if (choice5) {
              choices.push({
                choice_code: choice5,
                weight: !isEmpty(choice5Weight) ? choice5Weight : null,
              });
            }

            if (choice6) {
              choices.push({
                choice_code: choice6,
                weight: !isEmpty(choice6Weight) ? choice6Weight : null,
              });
            }

            if (!isEmpty(choices)) {
              return choices;
            } else {
              throw new Error('Applicant choices & Weights Missing.');
            }
          } catch (error) {
            throw new Error(error.message);
          }
        };

        try {
          const upload = await model.sequelize.transaction(
            async (transaction) => {
              const chunks = chunk(uploadedRecords, 100);

              for (const chunk of chunks) {
                for (const record of chunk) {
                  if (!record['INDEX NUMBER']) {
                    throw new Error(
                      `One Of The Records Provided Has No Index Number.`
                    );
                  }
                  const errName = toUpper(
                    trim(record['INDEX NUMBER'])
                  ).toString();

                  validateSheetColumns(
                    record,
                    [
                      'INDEX NUMBER',
                      'NAME',
                      'GENDER',
                      'UACE YEAR',
                      'UACE SUBJECT 1',
                      'UACE SUBJECT 1 GRADE',
                      'UACE SUBJECT 2',
                      'UACE SUBJECT 2 GRADE',
                      'UACE SUBJECT 3',
                      'UACE SUBJECT 3 GRADE',
                      'UACE SUBJECT 4',
                      'UACE SUBJECT 4 GRADE',
                      'UACE SUBJECT 5',
                      'UACE SUBJECT 5 GRADE',
                      'DISTRICT CODE',
                      'DISTRICT',
                      'FIRST CHOICE PROGRAMME TITLE',
                      'ADMITTED INSTITUTION',
                      'UCE WEIGHT',
                    ],
                    errName
                  );

                  data.index_number = trim(record['INDEX NUMBER']).toString();
                  data.name = record.NAME;
                  data.gender = toUpper(trim(record.GENDER));
                  data.uace_year = trim(record['UACE YEAR']).toString();
                  data.district_code = toUpper(trim(record['DISTRICT CODE']));
                  data.district = toUpper(trim(record.DISTRICT));
                  data.first_choice_prog = toUpper(
                    trim(record['FIRST CHOICE PROGRAMME TITLE'])
                  );
                  data.uce_weight = record['UCE WEIGHT'];

                  data.uaceGrades = handleUACEGrades(
                    toUpper(trim(record['UACE SUBJECT 1'])),
                    toUpper(trim(record['UACE SUBJECT 1 GRADE'])),
                    toUpper(trim(record['UACE SUBJECT 2'])),
                    toUpper(trim(record['UACE SUBJECT 2 GRADE'])),
                    toUpper(trim(record['UACE SUBJECT 3'])),
                    toUpper(trim(record['UACE SUBJECT 3 GRADE'])),
                    toUpper(trim(record['UACE SUBJECT 4'])),
                    toUpper(trim(record['UACE SUBJECT 4 GRADE'])),
                    toUpper(trim(record['UACE SUBJECT 5'])),
                    toUpper(trim(record['UACE SUBJECT 5 GRADE']))
                  );

                  data.choices = handleChoices(
                    toUpper(trim(record['CHOICE 1'])),
                    toUpper(trim(record['CHOICE 1 WEIGHT'])),
                    toUpper(trim(record['CHOICE 2'])),
                    toUpper(trim(record['CHOICE 2 WEIGHT'])),
                    toUpper(trim(record['CHOICE 3'])),
                    toUpper(trim(record['CHOICE 3 WEIGHT'])),
                    toUpper(trim(record['CHOICE 4'])),
                    toUpper(trim(record['CHOICE 4 WEIGHT'])),
                    toUpper(trim(record['CHOICE 5'])),
                    toUpper(trim(record['CHOICE 5 WEIGHT'])),
                    toUpper(trim(record['CHOICE 6'])),
                    toUpper(trim(record['CHOICE 6 WEIGHT']))
                  );

                  const upload =
                    await pujabApplicantUnebSelectionService.uploadApplicantsByFirstChoice(
                      data,
                      transaction
                    );

                  uploads.push(upload);
                }
              }
            }
          );

          http.setSuccess(200, 'All Records Uploaded Successfully.', {
            data: upload,
          });

          return http.send(res);
        } catch (error) {
          http.setError(400, 'Unable To Upload Records.', {
            error: { message: error.message },
          });

          return http.send(res);
        }
      });
    } catch (error) {
      http.setError(400, 'Unable To Upload This Template.', {
        error: { message: error.message },
      });

      return http.send(res);
    }
  }

  /**
   *
   * @param {*} req
   * @param {*} res
   */
  uploadProposedMeritAdmissionTemplate(req, res) {
    try {
      const data = req.body;
      const user = req.user.id;
      const form = new formidable.IncomingForm();
      const uploads = [];

      data.created_by_id = user;

      form.parse(req, async (err, fields, files) => {
        if (err) {
          http.setError(400, 'Unable To Upload Records.', {
            error: { err },
          });

          return http.send(res);
        }

        const file = files[Object.keys(files)[0]];

        if (!file) {
          http.setError(400, 'Please Select A File To Upload.');

          return http.send(res);
        }

        const workbook = XLSX.readFile(file.filepath, { cellDates: true });
        const myTemplate = workbook.SheetNames[0];
        const uploadedRecords = XLSX.utils.sheet_to_json(
          workbook.Sheets[myTemplate]
        );

        if (isEmpty(uploadedRecords)) {
          http.setError(400, 'Cannot upload an empty template.');

          return http.send(res);
        }

        const handleUACEGrades = (
          sbj1,
          sbj1Grade,
          sbj2,
          sbj2Grade,
          sbj3,
          sbj3Grade,
          sbj4,
          sbj4Grade,
          sbj5,
          sbj5Grade
        ) => {
          try {
            const uaceGrades = [];

            uaceGrades.push(
              {
                subject_code: sbj1,
                grade: sbj1Grade,
              },
              {
                subject_code: sbj2,
                grade: sbj2Grade,
              },
              {
                subject_code: sbj3,
                grade: sbj3Grade,
              },
              {
                subject_code: sbj4,
                grade: sbj4Grade,
              },
              {
                subject_code: sbj5,
                grade: sbj5Grade,
              }
            );

            if (!isEmpty(uaceGrades)) {
              return uaceGrades;
            } else {
              throw new Error('Some A-Level Subjects & Grades Missing.');
            }
          } catch (error) {
            throw new Error(error.message);
          }
        };

        const handleChoices = (
          choice1,
          choice1Weight,
          choice2,
          choice2Weight,
          choice3,
          choice3Weight,
          choice4,
          choice4Weight,
          choice5,
          choice5Weight,
          choice6,
          choice6Weight
        ) => {
          try {
            const choices = [];

            if (choice1) {
              choices.push({
                choice_code: choice1,
                weight: !isEmpty(choice1Weight) ? choice1Weight : null,
              });
            }

            if (choice2) {
              choices.push({
                choice_code: choice2,
                weight: !isEmpty(choice2Weight) ? choice2Weight : null,
              });
            }

            if (choice3) {
              choices.push({
                choice_code: choice3,
                weight: !isEmpty(choice3Weight) ? choice3Weight : null,
              });
            }

            if (choice4) {
              choices.push({
                choice_code: choice4,
                weight: !isEmpty(choice4Weight) ? choice4Weight : null,
              });
            }

            if (choice5) {
              choices.push({
                choice_code: choice5,
                weight: !isEmpty(choice5Weight) ? choice5Weight : null,
              });
            }

            if (choice6) {
              choices.push({
                choice_code: choice6,
                weight: !isEmpty(choice6Weight) ? choice6Weight : null,
              });
            }

            if (!isEmpty(choices)) {
              return choices;
            } else {
              throw new Error('Applicant choices & Weights Missing.');
            }
          } catch (error) {
            throw new Error(error.message);
          }
        };

        try {
          await model.sequelize.transaction(async (transaction) => {
            for (const record of uploadedRecords) {
              if (!record['INDEX NUMBER']) {
                throw new Error(
                  `One Of The Records Provided Has No Index Number.`
                );
              }
              const errName = toUpper(trim(record['INDEX NUMBER'])).toString();

              validateSheetColumns(
                record,
                [
                  'INDEX NUMBER',
                  'NAME',
                  'GENDER',
                  'UACE YEAR',
                  'UACE SUBJECT 1',
                  'UACE SUBJECT 1 GRADE',
                  'UACE SUBJECT 2',
                  'UACE SUBJECT 2 GRADE',
                  'UACE SUBJECT 3',
                  'UACE SUBJECT 3 GRADE',
                  'UACE SUBJECT 4',
                  'UACE SUBJECT 4 GRADE',
                  'UACE SUBJECT 5',
                  'UACE SUBJECT 5 GRADE',
                  'DISTRICT CODE',
                  'DISTRICT',
                  'ADMITTED PROGRAMME CODE',
                  'ADMITTED PROGRAMME TITLE',
                  'ADMITTED INSTITUTION',
                  'UCE WEIGHT',
                  'FINAL WEIGHT',
                ],
                errName
              );

              data.index_number = record['INDEX NUMBER'];
              data.name = trim(record.NAME);
              data.gender = toUpper(trim(record.GENDER));
              data.uace_year = record['UACE YEAR'];
              data.district_code = record['DISTRICT CODE'];
              data.district = toUpper(trim(record.DISTRICT));
              data.admitted_programme_code = toUpper(
                trim(record['ADMITTED PROGRAMME CODE'])
              );
              data.admitted_programme_title = toUpper(
                trim(record['ADMITTED PROGRAMME TITLE'])
              );
              data.admitted_institution = toUpper(
                trim(record['ADMITTED INSTITUTION'])
              );
              data.first_choice_prog = toUpper(
                trim(record['FIRST CHOICE PROGRAMME TITLE'])
              );
              data.uce_weight = record['UCE WEIGHT'];
              data.final_weight = record['FINAL WEIGHT'];

              data.uaceGrades = handleUACEGrades(
                toUpper(trim(record['UACE SUBJECT 1'])),
                toUpper(trim(record['UACE SUBJECT 1 GRADE'])),
                toUpper(trim(record['UACE SUBJECT 2'])),
                toUpper(trim(record['UACE SUBJECT 2 GRADE'])),
                toUpper(trim(record['UACE SUBJECT 3'])),
                toUpper(trim(record['UACE SUBJECT 3 GRADE'])),
                toUpper(trim(record['UACE SUBJECT 4'])),
                toUpper(trim(record['UACE SUBJECT 4 GRADE'])),
                toUpper(trim(record['UACE SUBJECT 5'])),
                toUpper(trim(record['UACE SUBJECT 5 GRADE']))
              );

              data.choices = handleChoices(
                toUpper(trim(record['CHOICE 1'])),
                toUpper(trim(record['CHOICE 1 WEIGHT'])),
                toUpper(trim(record['CHOICE 2'])),
                toUpper(trim(record['CHOICE 2 WEIGHT'])),
                toUpper(trim(record['CHOICE 3'])),
                toUpper(trim(record['CHOICE 3 WEIGHT'])),
                toUpper(trim(record['CHOICE 4'])),
                toUpper(trim(record['CHOICE 4 WEIGHT'])),
                toUpper(trim(record['CHOICE 5'])),
                toUpper(trim(record['CHOICE 5 WEIGHT'])),
                toUpper(trim(record['CHOICE 6'])),
                toUpper(trim(record['CHOICE 6 WEIGHT']))
              );

              const upload =
                await pujabApplicantUnebSelectionService.uploadProposedMeritAdmission(
                  data,
                  transaction
                );

              uploads.push(upload);
            }
          });
          http.setSuccess(200, 'All Records Uploaded Successfully.', {
            data: uploads,
          });

          return http.send(res);
        } catch (error) {
          http.setError(400, 'Unable To Upload Records.', {
            error: { message: error.message },
          });

          return http.send(res);
        }
      });
    } catch (error) {
      http.setError(400, 'Unable To Upload This Template.', {
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
  async updateApplicantsByFirstChoice(req, res) {
    try {
      const { id } = req.params;
      const data = req.body;
      const user = req.user.id;

      data.last_updated_by_id = user;

      if (data.first_choice_prog) {
        data.first_choice_prog = toUpper(trim(data.first_choice_prog));
      }

      const result = await model.sequelize.transaction(async (transaction) => {
        const admission =
          await pujabApplicantUnebSelectionService.updateApplicantsByFirstChoice(
            id,
            data,
            transaction
          );
        const response = admission[1][0];

        return response;
      });

      http.setSuccess(200, 'Applicants By First Choice Updated Successfully', {
        data: result,
      });

      return http.send(res);
    } catch (error) {
      http.setError(400, 'Unable To Update Applicants By First Choice.', {
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
  async updateProposedMeritAdmission(req, res) {
    try {
      const { id } = req.params;
      const data = req.body;
      const user = req.user.id;

      data.last_updated_by_id = user;

      if (data.admitted_programme_code) {
        data.admitted_programme_code = toUpper(
          trim(data.admitted_programme_code)
        );
      }

      if (data.admitted_programme_title) {
        data.admitted_programme_title = toUpper(
          trim(data.admitted_programme_title)
        );
      }

      const result = await model.sequelize.transaction(async (transaction) => {
        const admission =
          await pujabApplicantUnebSelectionService.updateProposedMeritAdmission(
            id,
            data,
            transaction
          );
        const response = admission[1][0];

        return response;
      });

      http.setSuccess(200, 'Applicants By First Choice Updated Successfully', {
        data: result,
      });

      return http.send(res);
    } catch (error) {
      http.setError(400, 'Unable To Update Applicants By First Choice.', {
        error: { message: error.message },
      });

      return http.send(res);
    }
  }
}

const getAllAttributes = () => ({
  include: [
    {
      association: 'uaceGrades',
    },
    {
      association: 'choices',
    },
  ],
});

module.exports = PujabApplicantUnebSelectionController;
