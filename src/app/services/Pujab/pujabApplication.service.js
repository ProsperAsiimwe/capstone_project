const models = require('@models');
const {
  sequelizeErrorHandler,
  middlewareSlackBot,
} = require('@helpers/technicalErrorHelper');
const {
  toUpper,
  map,
  filter,
  includes,
  forEach,
  find,
  isEmpty,
  uniqBy,
} = require('lodash');

// This Class is responsible for handling all database interactions for a admission
class ApplicantAdmissionService {
  /**
   * @param  {object} options
   * @returns {Promise}
   * @description returns all faculties or filtered using options param
   */
  static async findAllApplicants(options) {
    try {
      const results = await models.PujabApplication.findAll({
        ...options,
      });

      return results;
    } catch (error) {
      await sequelizeErrorHandler(
        error,
        `pujabApplication.service.js`,
        `findAllApplicants`,
        `GET`
      );
    }
  }

  /**
   * @param  {object} options
   * @returns {Promise}
   * @description returns all faculties or filtered using options param
   */
  static async findAndCountAll(options) {
    try {
      const results = await models.PujabApplication.findAndCountAll({
        ...options,
      });

      return results;
    } catch (error) {
      await sequelizeErrorHandler(
        error,
        `pujabApplication.service.js`,
        `findAndCountAll`,
        `GET`
      );
    }
  }

  /**
   * @param  {object} options
   * @returns {Promise}
   * @description returns all
   */
  static async findAllAdmissionInstitutions(options) {
    try {
      const results = await models.PujabApplicantAdmissionInstitution.findAll({
        ...options,
      });

      return results;
    } catch (error) {
      await sequelizeErrorHandler(
        error,
        `pujabApplication.service.js`,
        `findAllAdmissionInstitutions`,
        `GET`
      );
    }
  }

  /**
   * BULK CREATE APPLICANT PROGRAMME CHOICES
   *
   * @param  {object} options
   * @returns {Promise}
   * @description returns all
   */
  static async createProgrammeChoice(data, transaction, req) {
    try {
      const results = await models.PujabProgrammeChoice.bulkCreate(
        uniqBy(data, 'pujab_admission_institution_programme_id'),
        {
          transaction,
          fields: [
            'id',
            'pujab_application_id',
            'pujab_admission_institution_programme_id',
            'choice_number_name',
            'choice_number',
            'subject_combinations',
          ],
          updateOnDuplicate: [
            'choice_number_name',
            'choice_number',
            'subject_combinations',
          ],
        }
      );

      return results;
    } catch (error) {
      await middlewareSlackBot(req, error);
      await sequelizeErrorHandler(
        error,
        `pujabApplication.service.js`,
        `createProgrammeChoice`,
        `POST`
      );
    }
  }

  /**
   * BULK DELETE APPLICANT PROGRAMME CHOICES
   *
   * @param  {object} options
   * @returns {Promise}
   * @description returns all
   */
  static async deleteProgrammeChoice(id, transaction) {
    try {
      const results = await models.PujabProgrammeChoice.destroy({
        transaction,
        where: {
          id,
        },
      });

      return results;
    } catch (error) {
      await sequelizeErrorHandler(
        error,
        `pujabApplication.service.js`,
        `deleteProgrammeChoice`,
        `POST`
      );
    }
  }

  /**
   * FIND ALL APPLICANT PROGRAMME CHOICES
   *
   * @param  {object} options
   * @returns {Promise}
   * @description returns all
   */
  static async findAllProgrammeChoice(options) {
    try {
      const results = await models.PujabProgrammeChoice.findAll(options);

      return results;
    } catch (error) {
      await sequelizeErrorHandler(
        error,
        `pujabApplication.service.js`,
        `deleteProgrammeChoice`,
        `POST`
      );
    }
  }

  /**
   * @param  {object} options
   * @returns {Promise} any
   * @description returns a single admission object basing on the options
   */
  static async findOneAdmission(options) {
    try {
      const admission = await models.PujabApplication.findOne(options);

      return admission;
    } catch (error) {
      await sequelizeErrorHandler(
        error,
        `pujabApplication.service.js`,
        `findOneAdmission`,
        `GET`
      );
    }
  }

  /**
   * SAVE APPLICATION FORM
   *
   * @param  {object} data
   * @returns {Promise}
   * @description creates a single admission object from data object
   *@
   */
  static async createApplicantAdmission(data, transaction) {
    try {
      const record = await models.PujabApplication.findOrCreate({
        where: {
          pujab_running_admission_id: data.pujab_running_admission_id,
          applicant_id: data.applicant_id,
        },
        defaults: {
          ...data,
        },
        transaction,
      });

      return record;
    } catch (error) {
      await sequelizeErrorHandler(
        error,
        `pujabApplication.service.js`,
        `createApplicantAdmission`,
        `POST`
      );
    }
  }

  /**
   * UPDATE APPLICATION FORM
   *
   * @param  {object} data
   * @returns {Promise}
   * @description creates a single admission object from data object
   *@
   */
  static async updateAdmission(data, condition, transaction) {
    try {
      const record = await models.PujabApplication.update(data, {
        where: condition,
        transaction,
        returning: true,
      });

      return record;
    } catch (error) {
      await sequelizeErrorHandler(
        error,
        `pujabApplication.service.js`,
        `updateAdmission`,
        `POST`
      );
    }
  }

  /**
   * SAVE APPLICATION BIO-DATA
   *
   * @param  {object} data
   * @returns {Promise}
   * @description creates a single admission object from data object
   *@
   */
  static async createBioData(data, transaction, req) {
    try {
      const record = await models.PujabBioData.findOne({
        where: {
          pujab_application_id: data.pujab_application_id,
        },
      }).then((obj) => {
        // update
        if (obj)
          return models.PujabBioData.upsert(
            { id: obj.id, ...data },
            { transaction, return: true, raw: true }
          );

        // insert
        return models.PujabBioData.create(data, {
          transaction,
          return: true,
          raw: true,
        });
      });

      return record;
    } catch (error) {
      await middlewareSlackBot(req, error.message);
      await sequelizeErrorHandler(
        error,
        `pujabApplication.service.js`,
        `createBioData`,
        `POST`
      );
    }
  }

  /**
   * SAVE PREVIOUS UNIVERSITY ADMISSION
   *
   * @param  {object} data
   * @returns {Promise}
   * @description save previous admission
   *@
   */
  static async createPreviousAdmission(data, transaction) {
    try {
      const record = await models.PujabPreviousUniversityAdmission.findOne({
        where: {
          pujab_application_id: data.pujab_application_id,
        },
      }).then((obj) => {
        // update
        if (obj)
          return models.PujabPreviousUniversityAdmission.upsert(
            { id: obj.id, ...data },
            { transaction, return: true, raw: true }
          );

        // insert
        return models.PujabPreviousUniversityAdmission.create(data, {
          transaction,
          return: true,
          raw: true,
        });
      });

      return record;
    } catch (error) {
      await sequelizeErrorHandler(
        error,
        `applicantAdmissionService.service.js`,
        `createPreviousAdmission`,
        `POST`
      );
    }
  }

  /**
   * SAVE DISABILITY
   *
   * @param  {object} data
   * @returns {Promise}
   * @description save previous admission
   *@
   */
  static async createDisability(data, transaction) {
    try {
      const record = await models.PujabDisability.findOne({
        where: {
          pujab_application_id: data.pujab_application_id,
        },
      }).then((obj) => {
        // update
        if (obj)
          return models.PujabDisability.upsert(
            { id: obj.id, ...data },
            { transaction, return: true, raw: true }
          );

        // insert
        return models.PujabDisability.create(data, {
          transaction,
          return: true,
          raw: true,
        });
      });

      return record;
    } catch (error) {
      await sequelizeErrorHandler(
        error,
        `applicantAdmissionService.service.js`,
        `createDisability`,
        `POST`
      );
    }
  }

  /**
   * DESTROY PREVIOUS UNIVERSITY ADMISSION
   *
   * @param  {object} data
   * @returns {Promise}
   * @description Destroy previous admission
   *@
   */
  static async deletePreviousAdmission(condition, transaction) {
    try {
      const record = await models.PujabPreviousUniversityAdmission.destroy({
        where: condition,
        transaction,
      });

      return record;
    } catch (error) {
      await sequelizeErrorHandler(
        error,
        `applicantAdmissionService.service.js`,
        `deletePreviousAdmission`,
        `DELETE`
      );
    }
  }

  /**
   * DESTROY DISABILITY
   *
   * @param  {object} data
   * @returns {Promise}
   * @description Destroy Disability
   *@
   */
  static async deleteDisability(condition, transaction) {
    try {
      const record = await models.PujabDisability.destroy({
        where: condition,
        transaction,
      });

      return record;
    } catch (error) {
      await sequelizeErrorHandler(
        error,
        `applicantAdmissionService.service.js`,
        `deleteDisability`,
        `DELETE`
      );
    }
  }

  /**
   * SAVE APPLICATION PARENTS' INFORMATION
   *
   * @param  {object} data
   * @returns {Promise}
   * @description creates a single admission object from data object
   *@
   */
  static async createParentData(data, category, transaction) {
    try {
      let model;

      if (category === 'fatherInfo') model = 'PujabFatherInfo';
      if (category === 'motherInfo') model = 'PujabMotherInfo';

      const formData = {
        ...data,
        surname: toUpper(data.surname),
        other_names: toUpper(data.other_names),
        address: toUpper(data.address),
        citizenship: toUpper(data.citizenship),
        nationality: toUpper(data.nationality),
        country_of_residence: toUpper(data.country_of_residence),
        district_of_birth: toUpper(data.district_of_birth),
        sub_county: toUpper(data.sub_county),
        village_of_birth: toUpper(data.village_of_birth),
        relationship: toUpper(data.relationship),
      };

      const record = await models[model]
        .findOne({
          where: {
            pujab_application_id: formData.pujab_application_id,
          },
        })
        .then((obj) => {
          // update
          if (obj)
            return models[model].upsert(
              { id: obj.id, ...formData },
              { transaction, return: true, raw: true }
            );

          // insert
          return models[model].create(formData, {
            transaction,
            return: true,
            raw: true,
          });
        });

      return record;
    } catch (error) {
      await sequelizeErrorHandler(
        error,
        `pujabApplication.service.js`,
        `createParentData`,
        `POST`
      );
    }
  }

  /**
   * SAVE APPLICATION FORM
   *
   * @param  {object} data
   * @returns {Promise}
   * @description creates a single admission object from data object
   *@
   */
  static async createResult(data, category, transaction) {
    try {
      let model;

      let subjectModal;

      if (category === 'ordinaryLevel') {
        subjectModal = 'PujabOLevelSubject';
        model = 'PujabOLevelData';
        data.distinctions = filter(data.subjects, (s) =>
          includes(s.grade, 'D')
        ).length;
        data.credits = filter(data.subjects, (s) =>
          includes(s.grade, 'C')
        ).length;
        data.failures = filter(data.subjects, (s) =>
          includes(s.grade, 'F')
        ).length;
        data.passes = filter(data.subjects, (s) =>
          includes(s.grade, 'P')
        ).length;
      }

      if (category === 'advancedLevel') {
        subjectModal = 'PujabALevelSubject';
        model = 'PujabALevelData';
      }

      const formData = {
        ...data,
        school_name: toUpper(data.school_name),
        index_number: toUpper(data.index_number),
        subjects: uniqBy(
          map(data.subjects, (s) => ({
            subject: toUpper(s.subject),
            grade: toUpper(s.grade),
          })),
          'subject'
        ),
      };

      const toDelete = [];
      const toUpdate = [];

      const record = await models[model]
        .findOne({
          where: {
            pujab_application_id: formData.pujab_application_id,
          },
          include: ['subjects'],
        })
        .then((obj) => {
          // update

          if (obj) {
            forEach(obj.subjects, (sub) => {
              const findSubject = find(
                formData.subjects,
                (fsub) => fsub.subject === sub.subject
              );

              if (!findSubject) toDelete.push(sub.id);
              else {
                if (findSubject.grade !== sub.grade) {
                  toUpdate.push({
                    ...findSubject,
                    id: sub.id,
                    [category === 'ordinaryLevel'
                      ? 'pujab_o_level_id'
                      : 'pujab_a_level_id']: obj.id,
                  });
                }
              }
            });

            forEach(formData.subjects, (sub) => {
              const findSubject = find(
                obj.subjects,
                (fsub) => fsub.subject === sub.subject
              );

              if (!findSubject)
                toUpdate.push({
                  ...sub,
                  [category === 'ordinaryLevel'
                    ? 'pujab_o_level_id'
                    : 'pujab_a_level_id']: obj.id,
                });
            });

            return models[model].upsert(
              { id: obj.id, ...formData },
              {
                transaction,
                return: true,
                raw: true,
              }
            );
          }

          // insert
          return models[model].create(formData, {
            transaction,
            include: [
              {
                association: 'subjects',
              },
            ],
            return: true,
            raw: true,
          });
        });

      if (!isEmpty(toDelete)) {
        await models[subjectModal].destroy({
          where: {
            id: toDelete,
          },
          transaction,
        });
      }

      if (!isEmpty(toUpdate)) {
        await models[subjectModal].bulkCreate(toUpdate, {
          transaction,
          fields: [
            'id',
            category === 'ordinaryLevel'
              ? 'pujab_o_level_id'
              : 'pujab_a_level_id',
            'subject',
            'grade',
          ],
          updateOnDuplicate: ['grade'],
        });
      }

      return record;
    } catch (error) {
      await sequelizeErrorHandler(
        error,
        `pujabApplication.service.js`,
        `createResult`,
        `POST`
      );
    }
  }

  /**
   * DELETE  APPLICATION RESULT
   *
   * @param  {object} data
   * @returns {Promise}
   * @description creates a single admission object from data object
   *@
   */
  static async deleteResults(applicantAdmissionId, category, transaction) {
    try {
      let model;

      if (category === 'ordinaryLevel') {
        model = 'PujabOLevelData';
      }

      if (category === 'advancedLevel') {
        model = 'PujabALevelData';
      }

      const record = await models[model].destroy({
        where: {
          pujab_application_id: applicantAdmissionId,
        },
        transaction,
        return: true,
        raw: true,
      });

      return record;
    } catch (error) {
      await sequelizeErrorHandler(
        error,
        `pujabApplication.service.js`,
        `createResult`,
        `POST`
      );
    }
  }

  /**
   *
   * @param {*} data
   * @param {*} transaction
   */
  static async bulkInsertAdmissionInstitutions(data, transaction) {
    try {
      const result = await models.PujabApplicantAdmissionInstitution.bulkCreate(
        data,
        {
          transaction,
          returning: true,
        }
      );

      return result;
    } catch (error) {
      await sequelizeErrorHandler(
        error,
        `pujabApplication.service.js`,
        `bulkInsertAdmissionInstitutions`,
        `POST`
      );
    }
  }

  /**
   *
   * @param {*} data
   * @param {*} transaction
   */
  static async createAdmissionInstitutionProgramme(data, transaction) {
    try {
      const result =
        await models.PujabApplicantAdmissionInstitutionProgramme.bulkCreate(
          data,
          {
            transaction,
            returning: true,
          }
        );

      return result;
    } catch (error) {
      await sequelizeErrorHandler(
        error,
        `pujabApplication.service.js`,
        `createAdmissionInstitutionProgramme`,
        `POST`
      );
    }
  }

  /**
   *
   * @param {*} data
   */
  static async bulkRemoveAdmissionInstitutions(data, transaction) {
    try {
      const deleted = await models.PujabApplicantAdmissionInstitution.destroy({
        where: { id: data },
        transaction,
      });

      return deleted;
    } catch (error) {
      await sequelizeErrorHandler(
        error,
        `pujabApplication.service.js`,
        `bulkRemoveAdmissionInstitutions`,
        `DELETE`
      );
    }
  }

  /**
   * @param {string} id  id of admission object to be deleted
   * @returns {Promise}
   * @description deletes a single admission object
   *@
   */
  static async deleteAdmission(id, transaction) {
    try {
      const deleted = await models.PujabApplication.destroy({
        where: { id },
        transaction,
      });

      return deleted;
    } catch (error) {
      await sequelizeErrorHandler(
        error,
        `pujabApplication.service.js`,
        `deleteAdmission`,
        `DELETE`
      );
    }
  }
}

module.exports = ApplicantAdmissionService;
