const { HttpResponse } = require('@helpers');
const {
  applicantOLevelDataService,
  runningAdmissionApplicantService,
  applicantService,
} = require('@services/index');
const model = require('@models');
const moment = require('moment');
const {
  checkRunningAdmissionExpiry,
  // checkRunningAdmissionMaximumNumberOfFormsConstraint,
} = require('../Helpers/runningAdmissionApplicantHelper');
const { isEmpty, trim, toUpper } = require('lodash');

const { generateAdmissionFormId } = require('../Helpers/admissionsHelper');
const { createAdmissionLog } = require('../Helpers/logsHelper');

const http = new HttpResponse();

class ApplicantOLevelDataController {
  /**
   * GET All applicantOLevelData.
   *
   * @param {*} req Request
   * @param {*} res Response
   *
   * @returns {JSON} Http Response
   */
  async index(req, res) {
    try {
      const applicantOLevelData =
        await applicantOLevelDataService.findAllApplicantOLevelData();

      http.setSuccess(200, 'Applicant O-Level Data Fetched Successfully', {
        applicantOLevelData,
      });

      return http.send(res);
    } catch (error) {
      http.setError(400, 'Unable To Fetch Applicant O-Level Data', {
        error: { message: error.message },
      });

      return http.send(res);
    }
  }

  /**
   * CREATE New ApplicantOLevelData Data.
   *
   * @param {*} req Request body
   * @param {*} res Response
   *
   * @return {JSON} Return JSON Response
   */
  async createApplicantOLevelData(req, res) {
    try {
      const data = req.body;
      const { id } = req.user;

      const findApplicant = await applicantService.findOneApplicant({
        where: {
          id,
        },
        attributes: ['id', 'surname', 'other_names'],
        raw: true,
      });

      if (!findApplicant) {
        throw new Error(`Applicant Does not Exist.`);
      }

      const formId =
        data.form_id && data.form_id.includes('APF')
          ? data.form_id
          : await generateAdmissionFormId(data.running_admission_id, id);

      let requestPayload = {
        form_id: formId,
        running_admission_id: data.running_admission_id,
        section_id: data.section_id,
        applicant_id: id,
        is_manual: data.is_manual,
      };

      if (data.sat_o_level_exams === false) {
        requestPayload = {
          ...requestPayload,
          sat_o_level_exams: false,
        };
      } else {
        let distinctions;

        let credits;

        let passes;

        let failures = 0;

        if (!isEmpty(data.subjects)) {
          distinctions = data.subjects.filter(
            (subject) => parseInt(subject.interpretation, 10) <= 2
          ).length;
          credits = data.subjects.filter(
            (subject) =>
              parseInt(subject.interpretation, 10) > 2 &&
              parseInt(subject.interpretation, 10) <= 6
          ).length;
          passes = data.subjects.filter(
            (subject) =>
              parseInt(subject.interpretation, 10) > 6 &&
              parseInt(subject.interpretation, 10) <= 8
          ).length;
          failures = data.subjects.filter(
            (subject) =>
              parseInt(subject.interpretation, 10) < 1 &&
              parseInt(subject.interpretation, 10) > 8
          ).length;
        }
        requestPayload = {
          ...requestPayload,
          index_number: data.indexNumber,
          school_name: data.school_name,
          exam_year: data.examYear,
          sat_o_level_exams: true,
          photo: data.photo,
          subjects: data.subjects,
          summary: data.summary,
          center_no: data.centerNo,
          name: data.name,
          distinctions,
          credits,
          passes,
          failures,
        };

        const compareSurname = toUpper(trim(requestPayload.name)).includes(
          toUpper(trim(findApplicant.surname))
        );
        const compareOtherNames = toUpper(trim(requestPayload.name)).includes(
          toUpper(trim(findApplicant.other_names))
        );

        if (compareSurname === true || compareOtherNames === true) {
          const verified = true;

          data.verified = verified;
        } else {
          throw new Error(
            `The names on your account do not match with the names of your O level results.`
          );
        }
      }

      const runningAdmissionApplicantSection = {
        running_admission_id: requestPayload.running_admission_id,
        applicant_id: requestPayload.applicant_id,
        form_id: requestPayload.form_id,
        formSections: [
          {
            form_section_id: requestPayload.section_id,
          },
        ],
      };

      await checkRunningAdmissionExpiry(requestPayload.running_admission_id);

      // await checkRunningAdmissionMaximumNumberOfFormsConstraint(
      //   requestPayload.running_admission_id,
      //   requestPayload.applicant_id
      // );

      const response = await model.sequelize.transaction(
        async (transaction) => {
          const result =
            await applicantOLevelDataService.createApplicantOLevelData(
              requestPayload,
              transaction
            );

          if (result[1] === true) {
            await runningAdmissionApplicantService.createRunningAdmissionApplicant(
              runningAdmissionApplicantSection,
              transaction
            );
          }

          return result[0];
        }
      );

      http.setSuccess(201, 'Applicant O-Level Data created successfully', {
        data: response,
      });

      return http.send(res);
    } catch (error) {
      http.setError(400, 'Unable to create this Applicant O-Level Data.', {
        error: { message: error.message },
      });

      return http.send(res);
    }
  }

  /**
   * Get Specific ApplicantOLevelData Data.
   *
   * @param {*} req Request body
   * @param {*} res Response
   *
   * @return {JSON} Return JSON Response
   */
  async fetchApplicantOLevelData(req, res) {
    try {
      const { formId } = req.params;
      const applicant = parseInt(req.user.id, 10);
      const data = await applicantOLevelDataService.findOneApplicantOLevelData({
        where: {
          form_id: formId,
          applicant_id: applicant,
        },
        ...getApplicantOLevelDataAttributes(),
      });

      http.setSuccess(200, 'Applicant O-Level Data fetch successful', {
        data,
      });

      return http.send(res);
    } catch (error) {
      http.setError(400, 'Unable to get this Applicant O-Level Data', {
        error: { message: error.message },
      });

      return http.send(res);
    }
  }

  /**
   * UPDATE Specific Data.
   *
   * @param {*} req Request body
   * @param {*} res Response
   *
   * @return {JSON} Return JSON Response
   */
  async updateApplicantOLevelData(req, res) {
    try {
      const data = req.body;
      const { o_level_data_id: id } = data;

      if (data.indexNumber) {
        data.index_number = data.indexNumber;
      }

      if (data.centerNo) {
        data.center_no = data.centerNo;
      }

      if (data.examYear) {
        data.exam_year = data.examYear;
      }

      data.updated_at = moment.now();

      const findOLevelData =
        await applicantOLevelDataService.findOneApplicantOLevelData({
          where: {
            id,
          },
          attributes: ['id', 'running_admission_id', 'is_manual'],
          raw: true,
        });

      if (!findOLevelData) {
        throw new Error(`Unable To Find Record.`);
      }

      if (findOLevelData.is_manual !== true) {
        throw new Error(`You Can Only Edit UNEB Results.`);
      }

      if (
        data.running_admission_id &&
        parseInt(data.running_admission_id, 10) !==
          parseInt(findOLevelData.running_admission_id, 10)
      ) {
        throw new Error(
          `The Running Admission Specified Does not Match The One Of Your A-Level Record.`
        );
      }

      await checkRunningAdmissionExpiry(findOLevelData.running_admission_id);

      const unebSubjects = [];

      if (!isEmpty(data.subjects)) {
        const distinctions = data.subjects.filter(
          (subject) => parseInt(subject.interpretation, 10) <= 2
        ).length;

        const credits = data.subjects.filter(
          (subject) =>
            parseInt(subject.interpretation, 10) > 2 &&
            parseInt(subject.interpretation, 10) <= 6
        ).length;

        const passes = data.subjects.filter(
          (subject) =>
            parseInt(subject.interpretation, 10) > 6 &&
            parseInt(subject.interpretation, 10) <= 8
        ).length;

        const failures = data.subjects.filter(
          (subject) =>
            parseInt(subject.interpretation, 10) < 1 &&
            parseInt(subject.interpretation, 10) > 8
        ).length;

        data.distinctions = distinctions;
        data.credits = credits;
        data.passes = passes;
        data.failures = failures;

        data.subjects.forEach((subject) => {
          unebSubjects.push({
            applicant_o_level_data_id: id,
            ...subject,
          });
        });
      }

      const result = await model.sequelize.transaction(async (transaction) => {
        const response =
          await applicantOLevelDataService.updateApplicantOLevelData(
            id,
            data,
            transaction
          );

        const result = response[1][0];

        await handleUpdatingPivots(id, unebSubjects, transaction);

        return result;
      });

      http.setSuccess(200, 'Results Updated Successfully', {
        data: result,
      });

      return http.send(res);
    } catch (error) {
      http.setError(400, 'Unable To Update This Result', {
        error: { message: error.message },
      });

      return http.send(res);
    }
  }

  /**
   * UPDATE Specific Data.
   *
   * @param {*} req Request body
   * @param {*} res Response
   *
   * @return {JSON} Return JSON Response
   */
  async updateApplicantOLevelDataByStaff(req, res) {
    try {
      const data = req.body;
      const { oLevelDataId } = req.params;
      const { id: user, remember_token: rememberToken } = req.user;

      data.updated_at = moment.now();

      const findOLevelData = await applicantOLevelDataService
        .findOneApplicantOLevelData({
          where: {
            id: oLevelDataId,
          },
          ...getApplicantOLevelDataAttributes(),
          nest: true,
        })
        .then((res) => {
          if (res) {
            return res;
          }
        });

      if (!findOLevelData) {
        throw new Error(`Unable To Find Record.`);
      }

      if (findOLevelData.is_manual !== true) {
        throw new Error(`You Can Only Edit UNEB Results.`);
      }

      if (
        data.running_admission_id &&
        parseInt(data.running_admission_id, 10) !==
          parseInt(findOLevelData.running_admission_id, 10)
      ) {
        throw new Error(
          `The Running Admission Specified Does not Match The One Of Your A-Level Record.`
        );
      }

      const unebSubjects = [];

      if (!isEmpty(data.subjects)) {
        const distinctions = data.subjects.filter(
          (subject) => parseInt(subject.interpretation, 10) <= 2
        ).length;

        const credits = data.subjects.filter(
          (subject) =>
            parseInt(subject.interpretation, 10) > 2 &&
            parseInt(subject.interpretation, 10) <= 6
        ).length;

        const passes = data.subjects.filter(
          (subject) =>
            parseInt(subject.interpretation, 10) > 6 &&
            parseInt(subject.interpretation, 10) <= 8
        ).length;

        const failures = data.subjects.filter(
          (subject) =>
            parseInt(subject.interpretation, 10) < 1 &&
            parseInt(subject.interpretation, 10) > 8
        ).length;

        data.distinctions = distinctions;
        data.credits = credits;
        data.passes = passes;
        data.failures = failures;

        data.subjects.forEach((subject) => {
          unebSubjects.push({
            applicant_o_level_data_id: oLevelDataId,
            ...subject,
          });
        });
      }

      const result = await model.sequelize.transaction(async (transaction) => {
        const response =
          await applicantOLevelDataService.updateApplicantOLevelData(
            oLevelDataId,
            data,
            transaction
          );

        await createAdmissionLog(
          {
            user_id: user,
            operation: `UPDATE`,
            area_accessed: `MANAGE APPLICANT O-LEVEL DATA`,
            current_data: `Updated Applicant's o-Level record of id: ${oLevelDataId} for the applicant: id - ${findOLevelData.applicant.id}, Name - ${findOLevelData.applicant.surname} ${findOLevelData.applicant.other_names}.`,
            ip_address: req.connection.remoteAddress,
            user_agent: req.get('user-agent'),
            token: rememberToken,
          },
          transaction
        );

        const result = response[1][0];

        await handleUpdatingPivots(oLevelDataId, unebSubjects, transaction);

        return result;
      });

      http.setSuccess(200, 'Results Updated Successfully', {
        data: result,
      });

      return http.send(res);
    } catch (error) {
      http.setError(400, 'Unable To Update This Result', {
        error: { message: error.message },
      });

      return http.send(res);
    }
  }
}

/**
 *
 * @param {*} applicantOLevelDataId
 * @param {*} unebSubjects
 * @param {*} transaction
 */
const handleUpdatingPivots = async function (
  applicantOLevelDataId,
  unebSubjects,
  transaction
) {
  try {
    if (!isEmpty(unebSubjects)) {
      await deleteOrCreateElements(
        unebSubjects,
        'findAllApplicantOLevelDataSubjects',
        'bulkCreateApplicantOLevelDataSubjects',
        'bulkRemoveApplicantOLevelDataSubjects',
        'updateApplicantOLevelDataSubjects',
        'code',
        applicantOLevelDataId,
        transaction
      );
    }
  } catch (error) {
    throw new Error(error.message);
  }
};

/**
 *
 * @param {*} firstElements
 * @param {*} findAllService
 * @param {*} insertService
 * @param {*} deleteService
 * @param {*} updateService
 * @param {*} firstField
 * @param {*} applicantOLevelDataId
 * @param {*} transaction
 * @returns
 */
const deleteOrCreateElements = async (
  firstElements,
  findAllService,
  insertService,
  deleteService,
  updateService,
  firstField,
  applicantOLevelDataId,
  transaction
) => {
  const elementsToDelete = [];
  const elementsToInsert = [];
  const elementsToUpdate = [];

  const secondElements = await applicantOLevelDataService[findAllService]({
    where: {
      applicant_o_level_data_id: applicantOLevelDataId,
    },
    attributes: ['id', 'applicant_o_level_data_id', firstField],
    raw: true,
  });

  firstElements.forEach((firstElement) => {
    const myElement = secondElements.find(
      (secondElement) =>
        parseInt(firstElement[firstField], 10) ===
          parseInt(secondElement[firstField], 10) &&
        parseInt(firstElement.applicant_o_level_data_id, 10) ===
          parseInt(secondElement.applicant_o_level_data_id, 10)
    );

    if (!myElement) {
      elementsToInsert.push(firstElement);
    } else {
      const locateContextId = secondElements.find(
        (value) =>
          parseInt(value.applicant_o_level_data_id, 10) ===
            parseInt(firstElement.applicant_o_level_data_id, 10) &&
          value[firstField] === firstElement[firstField]
      );

      elementsToUpdate.push({ id: locateContextId.id, ...firstElement });
    }
  });

  secondElements.forEach((secondElement) => {
    const myElement = firstElements.find(
      (firstElement) =>
        parseInt(firstElement[firstField], 10) ===
          parseInt(secondElement[firstField], 10) &&
        parseInt(firstElement.applicant_o_level_data_id, 10) ===
          parseInt(secondElement.applicant_o_level_data_id, 10)
    );

    if (!myElement) elementsToDelete.push(secondElement.id);
  });

  if (!isEmpty(elementsToInsert)) {
    await applicantOLevelDataService[insertService](
      elementsToInsert,
      transaction
    );
  }

  if (!isEmpty(elementsToDelete)) {
    await applicantOLevelDataService[deleteService](
      elementsToDelete,
      transaction
    );
  }

  if (!isEmpty(elementsToUpdate)) {
    for (const item of elementsToUpdate) {
      await applicantOLevelDataService[updateService](
        item.id,
        item,
        transaction
      );
    }
  }

  return { elementsToDelete, elementsToInsert };
};

const getApplicantOLevelDataAttributes = function () {
  return {
    include: [
      {
        association: 'applicant',
        attributes: ['id', 'surname', 'other_names'],
      },
      {
        association: 'runningAdmission',
      },
      {
        association: 'subjects',
      },
    ],
  };
};

module.exports = ApplicantOLevelDataController;
