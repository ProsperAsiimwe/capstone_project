const { HttpResponse } = require('@helpers');
const {
  applicantALevelDataService,
  runningAdmissionApplicantService,
  applicantService,
} = require('@services/index');
const model = require('@models');
const moment = require('moment');
const { isEmpty, trim, toUpper } = require('lodash');
const {
  checkRunningAdmissionExpiry,
} = require('../Helpers/runningAdmissionApplicantHelper');
const { createAdmissionLog } = require('../Helpers/logsHelper');

const { generateAdmissionFormId } = require('../Helpers/admissionsHelper');

const http = new HttpResponse();

class ApplicantALevelDataController {
  /**
   * GET All applicantALevelData.
   *
   * @param {*} req Request
   * @param {*} res Response
   *
   * @returns {JSON} Http Response
   */
  async index(req, res) {
    try {
      const applicantALevelData =
        await applicantALevelDataService.findAllApplicantALevelData({
          ...getApplicantALevelDataAttributes(),
        });

      http.setSuccess(200, 'Applicant A-Level Data Fetched Successfully', {
        applicantALevelData,
      });

      return http.send(res);
    } catch (error) {
      http.setError(400, 'Unable To Fetch Applicant A-Level Data', {
        error: { message: error.message },
      });

      return http.send(res);
    }
  }

  /**
   * CREATE New ApplicantALevelData Data.
   *
   * @param {*} req Request body
   * @param {*} res Response
   *
   * @return {JSON} Return JSON Response
   */
  async createApplicantALevelData(req, res) {
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

      if (data.sat_a_level_exams === false) {
        requestPayload = {
          ...requestPayload,
          sat_a_level_exams: false,
          subjects: [],
        };
      } else {
        requestPayload = {
          ...requestPayload,
          index_number: data.indexNumber,
          school_name: data.school_name,
          exam_year: data.examYear,
          sat_a_level_exams: true,
          photo: data.photo,
          subjects: data.subjects,
          summary: data.summary,
          center_no: data.centerNo,
          name: data.name,
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
            `The names on your account do not match with the names of your A level results.`
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
            await applicantALevelDataService.createApplicantALevelData(
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

      http.setSuccess(201, 'A-Level Result saved successfully', {
        data: response,
      });

      return http.send(res);
    } catch (error) {
      http.setError(400, 'Unable to Save your A-Level Result.', {
        error: { message: error.message },
      });

      return http.send(res);
    }
  }

  /**
   * Get Specific ApplicantALevelData Data.
   *
   * @param {*} req Request body
   * @param {*} res Response
   *
   * @return {JSON} Return JSON Response
   */
  async fetchApplicantALevelData(req, res) {
    try {
      const { formId } = req.params;
      const applicant = parseInt(req.user.id, 10);
      const data = await applicantALevelDataService.findOneApplicantALevelData({
        where: {
          form_id: formId,
          applicant_id: applicant,
        },
        ...getApplicantALevelDataAttributes(),
      });

      http.setSuccess(200, 'A-Level Result fetched successful', {
        data,
      });

      return http.send(res);
    } catch (error) {
      http.setError(400, 'Unable to get this A-Level Result', {
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
  async updateApplicantALevelData(req, res) {
    try {
      const data = req.body;
      const { a_level_data_id: id } = data;

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

      const findALevelData =
        await applicantALevelDataService.findOneApplicantALevelData({
          where: {
            id,
          },
          attributes: ['id', 'running_admission_id', 'is_manual'],
          raw: true,
        });

      if (!findALevelData) {
        throw new Error(`Unable To Find Record.`);
      }

      if (findALevelData.is_manual !== true) {
        throw new Error(`You Can Only Edit Manual Results.`);
      }

      if (
        data.running_admission_id &&
        parseInt(data.running_admission_id, 10) !==
          parseInt(findALevelData.running_admission_id, 10)
      ) {
        throw new Error(
          `The Running Admission Specified Does not Match The One Of Your A-Level Record.`
        );
      }

      await checkRunningAdmissionExpiry(findALevelData.running_admission_id);

      const unebSubjects = [];

      if (!isEmpty(data.subjects)) {
        data.subjects.forEach((subject) => {
          unebSubjects.push({
            applicant_a_level_data_id: id,
            ...subject,
          });
        });
      }

      const result = await model.sequelize.transaction(async (transaction) => {
        const response =
          await applicantALevelDataService.updateApplicantALevelData(
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
  async updateApplicantALevelDataByStaff(req, res) {
    try {
      const data = req.body;
      const { aLevelDataId } = req.params;
      const { id: user, remember_token: rememberToken } = req.user;

      data.updated_at = moment.now();

      const findALevelData = await applicantALevelDataService
        .findOneApplicantALevelData({
          where: {
            id: aLevelDataId,
          },
          ...getApplicantALevelDataAttributes(),
          nest: true,
        })
        .then((res) => {
          if (res) {
            return res.toJSON();
          }
        });

      if (!findALevelData) {
        throw new Error(`Unable To Find Record.`);
      }

      if (findALevelData.is_manual !== true) {
        throw new Error(`You Can Only Edit Manual Results.`);
      }

      if (
        data.running_admission_id &&
        parseInt(data.running_admission_id, 10) !==
          parseInt(findALevelData.running_admission_id, 10)
      ) {
        throw new Error(
          `The Running Admission Specified Does not Match The One Of The Applicant's A-Level Record.`
        );
      }

      const unebSubjects = [];

      if (!isEmpty(data.subjects)) {
        data.subjects.forEach((subject) => {
          unebSubjects.push({
            applicant_a_level_data_id: aLevelDataId,
            ...subject,
          });
        });
      }

      const result = await model.sequelize.transaction(async (transaction) => {
        const response =
          await applicantALevelDataService.updateApplicantALevelData(
            aLevelDataId,
            data,
            transaction
          );

        await createAdmissionLog(
          {
            user_id: user,
            operation: `UPDATE`,
            area_accessed: `MANAGE APPLICANT A-LEVEL DATA`,
            current_data: `Updated Applicant's A-Level record of id: ${aLevelDataId} for the applicant: id - ${findALevelData.applicant.id}, Name - ${findALevelData.applicant.surname} ${findALevelData.applicant.other_names}.`,
            ip_address: req.connection.remoteAddress,
            user_agent: req.get('user-agent'),
            token: rememberToken,
          },
          transaction
        );

        const result = response[1][0];

        await handleUpdatingPivots(aLevelDataId, unebSubjects, transaction);

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
 * @param {*} applicantALevelDataId
 * @param {*} unebSubjects
 * @param {*} transaction
 */
const handleUpdatingPivots = async function (
  applicantALevelDataId,
  unebSubjects,
  transaction
) {
  try {
    if (!isEmpty(unebSubjects)) {
      await deleteOrCreateElements(
        unebSubjects,
        'findAllApplicantALevelDataSubjects',
        'bulkCreateApplicantALevelDataSubjects',
        'bulkRemoveApplicantALevelDataSubjects',
        'updateApplicantALevelDataSubjects',
        'code',
        applicantALevelDataId,
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
 * @param {*} applicantALevelDataId
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
  applicantALevelDataId,
  transaction
) => {
  const elementsToDelete = [];
  const elementsToInsert = [];
  const elementsToUpdate = [];

  const secondElements = await applicantALevelDataService[findAllService]({
    where: {
      applicant_a_level_data_id: applicantALevelDataId,
    },
    attributes: ['id', 'applicant_a_level_data_id', firstField],
    raw: true,
  });

  firstElements.forEach((firstElement) => {
    const myElement = secondElements.find(
      (secondElement) =>
        parseInt(firstElement[firstField], 10) ===
          parseInt(secondElement[firstField], 10) &&
        parseInt(firstElement.applicant_a_level_data_id, 10) ===
          parseInt(secondElement.applicant_a_level_data_id, 10)
    );

    if (!myElement) {
      elementsToInsert.push(firstElement);
    } else {
      const locateContextId = secondElements.find(
        (value) =>
          parseInt(value.applicant_a_level_data_id, 10) ===
            parseInt(firstElement.applicant_a_level_data_id, 10) &&
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
        parseInt(firstElement.applicant_a_level_data_id, 10) ===
          parseInt(secondElement.applicant_a_level_data_id, 10)
    );

    if (!myElement) elementsToDelete.push(secondElement.id);
  });

  if (!isEmpty(elementsToInsert)) {
    await applicantALevelDataService[insertService](
      elementsToInsert,
      transaction
    );
  }

  if (!isEmpty(elementsToDelete)) {
    await applicantALevelDataService[deleteService](
      elementsToDelete,
      transaction
    );
  }

  if (!isEmpty(elementsToUpdate)) {
    for (const item of elementsToUpdate) {
      await applicantALevelDataService[updateService](
        item.id,
        item,
        transaction
      );
    }
  }

  return { elementsToDelete, elementsToInsert };
};

const getApplicantALevelDataAttributes = function () {
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

module.exports = ApplicantALevelDataController;
