const { HttpResponse } = require('@helpers');
const axios = require('axios').default;
const model = require('@models');

const {
  emisService,
  metadataService,
  metadataValueService,
  sponsorService,
  admissionSchemeService,
  programmeService,
  emisIntegrationService,
} = require('@services/index');
const { isEmpty } = require('lodash');
const envConfig = require('../../../config/app');
const http = new HttpResponse();

process.env.NODE_TLS_REJECT_UNAUTHORIZED = 0;

class EmisSubmitController {
  async submitSponsors(req, res) {
    try {
      if (!req.body.requests) {
        throw new Error(`Invalid request`);
      }

      const baseUrl = envConfig.EMIS_BASE_URL;
      const emisNumber = envConfig.EMIS_NUMBER;

      let response = {};

      await model.sequelize.transaction(async (transaction) => {
        for (const eachObject of req.body.requests) {
          const findSponsor = await sponsorService
            .findOneRecord({
              where: {
                id: eachObject,
                // is_submitted: true,
              },
              attributes: [
                'id',
                'sponsor_name',
                'sponsor_email',
                'sponsor_phone',
              ],
              nest: true,
            })
            .then(function (res) {
              if (res) {
                const result = res.toJSON();

                return result;
              }
            });

          if (!findSponsor) {
            throw new Error(`One of the requests is Invalid.`);
          }

          const result = await axios({
            method: 'post',
            url: `${baseUrl}/school/${emisNumber}/sponsors`,
            data: { name: findSponsor.sponsor_name },
          }).then((res) => res.data);

          response = result;

          if (response.statusCode === 202) {
            const submittedPayload = {
              value: findSponsor.sponsor_name,
              value_details: 'SPONSOR',
              is_submitted: true,
              acmis_id: findSponsor.id,
              created_by_id: req.user.id,
            };
            await emisIntegrationService.createEmisValues(submittedPayload);
          }
        }
      });

      if (response.statusCode === 202) {
        http.setSuccess(202, 'Sponsors Published successfully', {
          response,
        });

        return http.send(res);
      } else {
        http.setError(400, response.message);
        return http.send(res);
      }
    } catch (error) {
      http.setError(400, 'Unable to Fetch Sponsor Data', {
        message: error.message,
      });

      return http.send(res);
    }
  }

  // entry schemes

  async submitEntrySchemes(req, res) {
    try {
      if (!req.body.requests) {
        throw new Error(`Invalid request`);
      }

      const baseUrl = envConfig.EMIS_BASE_URL;
      const emisNumber = envConfig.EMIS_NUMBER;

      let response = {};

      await model.sequelize.transaction(async (transaction) => {
        for (const eachObject of req.body.requests) {
          const findScheme = await admissionSchemeService
            .findOneAdmissionScheme({
              where: {
                id: eachObject,
              },
              attributes: ['id', 'scheme_name', 'scheme_description'],
              nest: true,
            })
            .then(function (res) {
              if (res) {
                const result = res.toJSON();

                return result;
              }
            });

          if (!findScheme) {
            throw new Error(`One of the requests is Invalid.`);
          }

          const result = await axios({
            method: 'post',
            url: `${baseUrl}/school/${emisNumber}/entry_schemes`,
            data: { name: findScheme.scheme_name },
          }).then((res) => res.data);

          response = result;

          if (response.statusCode === 202) {
            const submittedPayload = {
              value: findScheme.scheme_name,
              value_details: 'ENTRY SCHEME',
              is_submitted: true,
              acmis_id: findScheme.id,
              created_by_id: req.user.id,
            };
            await emisIntegrationService.createEmisValues(submittedPayload);
          }
        }
      });

      if (response.statusCode === 202) {
        http.setSuccess(202, 'Entry Schemes Published successfully', {
          response,
        });

        return http.send(res);
      } else {
        http.setError(400, response.message);
        return http.send(res);
      }
    } catch (error) {
      http.setError(400, 'Unable to Fetch Entry Schemes Data', {
        message: error.message,
      });

      return http.send(res);
    }
  }

  // post study level
  async submitStudyLevel(req, res) {
    try {
      if (!req.body.requests) {
        throw new Error(`Invalid request`);
      }

      const baseUrl = envConfig.EMIS_BASE_URL;
      const emisNumber = envConfig.EMIS_NUMBER;

      let response = {};

      await model.sequelize.transaction(async (transaction) => {
        for (const eachObject of req.body.requests) {
          const context = {
            id: eachObject,
            metadata: 'PROGRAMME STUDY LEVELS',
          };
          const findStudyLevel =
            await metadataValueService.findOneMetadataValueByType(context);

          if (!findStudyLevel) {
            throw new Error(`One of the requests is Invalid.`);
          }

          const result = await axios({
            method: 'post',
            url: `${baseUrl}/school/${emisNumber}/study_levels`,
            data: { name: findStudyLevel.metadata_value },
          }).then((res) => res.data);

          response = result;
          if (response.statusCode === 202) {
            const submittedPayload = {
              value: findStudyLevel.metadata_value,
              value_details: 'STUDY LEVEL',
              is_submitted: true,
              acmis_id: findStudyLevel.id,
              created_by_id: req.user.id,
            };
            await emisIntegrationService.createEmisValues(submittedPayload);
          }
        }
      });

      if (response.statusCode === 202) {
        http.setSuccess(202, 'Study Level Published successfully', {
          response,
        });

        return http.send(res);
      } else {
        http.setError(400, response.message);
        return http.send(res);
      }
    } catch (error) {
      http.setError(400, 'Unable to Submit Study Level Data', {
        message: error.message,
      });

      return http.send(res);
    }
  }

  // campus

  async submitCampus(req, res) {
    try {
      if (!req.body.requests) {
        throw new Error(`Invalid request`);
      }

      const baseUrl = envConfig.EMIS_BASE_URL;
      const emisNumber = envConfig.EMIS_NUMBER;

      let response = {};

      await model.sequelize.transaction(async (transaction) => {
        for (const eachObject of req.body.requests) {
          const context = {
            id: eachObject.id,
            metadata: 'CAMPUSES',
          };
          const findCampus =
            await metadataValueService.findOneMetadataValueByType(context);

          if (!findCampus) {
            throw new Error(`One of the requests is Invalid.`);
          }

          const result = await axios({
            method: 'post',
            url: `${baseUrl}/school/${emisNumber}/school_campuses`,
            data: {
              name: findCampus.metadata_value,
              district: eachObject.district,
            },
          }).then((res) => res.data);

          response = result;

          if (response.statusCode === 202) {
            const submittedPayload = {
              value: findCampus.metadata_value,
              value_details: 'CAMPUS',
              value_code: eachObject.district,
              is_submitted: true,
              acmis_id: findCampus.id,
              created_by_id: req.user.id,
            };
            await emisIntegrationService.createEmisValues(submittedPayload);
          }
        }
      });

      if (response.statusCode === 202) {
        http.setSuccess(202, 'Campus Published successfully', {
          response,
        });

        return http.send(res);
      } else {
        http.setError(400, response.message);
        return http.send(res);
      }
    } catch (error) {
      http.setError(400, 'Unable to Submit Campus Data', {
        message: error.message,
      });

      return http.send(res);
    }
  }

  // courses

  async submitProgrammes(req, res) {
    try {
      if (!req.body.requests) {
        throw new Error(`Invalid request`);
      }

      const baseUrl = envConfig.EMIS_BASE_URL;
      const emisNumber = envConfig.EMIS_NUMBER;

      let response = {};

      await model.sequelize.transaction(async (transaction) => {
        for (const eachObject of req.body.requests) {
          const findProgramme = await programmeService
            .findOneProgramme({
              where: {
                id: eachObject,
              },
              attributes: [
                'id',
                'programme_title',
                'programme_code',
                'programme_duration',
              ],
              nest: true,
            })
            .then(function (res) {
              if (res) {
                const result = res.toJSON();

                return result;
              }
            });

          if (!findProgramme) {
            throw new Error(`One of the requests is Invalid.`);
          }

          const result = await axios({
            method: 'post',
            url: `${baseUrl}/school/${emisNumber}/courses`,
            data: {
              courseName: findProgramme.programme_title,
              courseCode: findProgramme.programme_code,
              courseDuration: Number(findProgramme.programme_duration),
            },
          }).then((res) => res.data);

          response = result;

          if (response.statusCode === 202) {
            const submittedPayload = {
              value: findProgramme.programme_title,
              value_details: 'PROGRAMME',
              value_code: findProgramme.programme_code,
              is_submitted: true,
              acmis_id: findProgramme.id,
              created_by_id: req.user.id,
            };
            await emisIntegrationService.createEmisValues(submittedPayload);
          }
        }
      });

      if (response.statusCode === 202) {
        http.setSuccess(202, 'Programme Published successfully', {
          response,
        });

        return http.send(res);
      } else {
        http.setError(400, response.message);
        return http.send(res);
      }
    } catch (error) {
      http.setError(400, 'Unable to Submit Programme Data', {
        message: error.message,
      });

      return http.send(res);
    }
  }

  // student
  async submitStudents(req, res) {
    try {
      if (
        !req.body.intake ||
        !req.body.academicYearId ||
        !req.body.campus ||
        !req.body.programmeId
      ) {
        throw new Error(`Invalid request`);
      }

      const baseUrl = envConfig.EMIS_BASE_URL;
      const emisNumber = envConfig.EMIS_NUMBER;

      const context = req.body;

      const studentData = await emisService.apiStudent(context);

      let response = {};

      if (isEmpty(studentData)) {
        throw new Error(`No student Records`);
      }

      await model.sequelize.transaction(async (transaction) => {
        for (const eachObject of studentData) {
          const studentContext = {
            surname: eachObject.surname,
            givenNames: eachObject.other_names,
            nationality: eachObject.nationality,
            idNumber: eachObject.id_number,
            idType: eachObject.id_type,
            isRefugee: eachObject.is_refugee,
            sex: eachObject.gender,
            registrationNumber: eachObject.registration_number,
            studentNumber: eachObject.student_number,
            phone: eachObject.phone,
            email: eachObject.email,
            dateOfBirth: eachObject.date_of_birth,
            maritalStatus: eachObject.marital_status,
            districtOfBirth: eachObject.home_district,
            courseCode: eachObject.programme_code,
            entryScheme: eachObject.scheme_name,
            studyLevel: eachObject.study_level,
            studyYear: eachObject.entry_study_year,
            yearOfEntry: eachObject.entry_academic_year,
            sponsorship: eachObject.sponsorship,
            sponsor: eachObject.sponsor_name,
            campus: eachObject.campus,
            // unebLevel: eachObject.programme_title,
            // indexNumber: eachObject.programme_title,
            // unebYear: eachObject.programme_title,
            nextOfKinSurname: eachObject.guardian_name,
            nextOfKinGivenNames: eachObject.guardian_name,
            nextOfKinIdNumber: 'Not defined',
            nextOfKinIdType: 'Not Defined',
            nextOfKinNationationality: 'Not Defined',
            isNextOfKinRefugee: false,
            nextOfKinPhone: eachObject.guardian_phone,
            nextOfKinEmail: eachObject.guardian_email,
            nextOfKinRelationship: eachObject.guardian_relationship,
            nextOfkinSex: 'Not Defined',
          };

          console.log(studentContext);
          const result = await axios({
            method: 'post',
            url: `${baseUrl}/school/${emisNumber}/students`,
            data: {
              surname: eachObject.surname,
              givenNames: eachObject.other_names,
              nationality: eachObject.nationality,
              idNumber: eachObject.id_number,
              idType: eachObject.id_type,
              isRefugee: eachObject.is_refugee,
              sex: eachObject.gender,
              registrationNumber: eachObject.registration_number,
              studentNumber: eachObject.student_number,
              phone: eachObject.phone,
              email: eachObject.email,
              dateOfBirth: eachObject.date_of_birth,
              maritalStatus: eachObject.marital_status,
              districtOfBirth: eachObject.home_district,
              courseCode: eachObject.programme_code,
              entryScheme: eachObject.scheme_name,
              studyLevel: eachObject.study_level,
              studyYear: eachObject.entry_study_year,
              yearOfEntry: eachObject.entry_academic_year,
              sponsorship: eachObject.sponsorship,
              sponsor: eachObject.sponsor_name,
              campus: eachObject.campus,
              // unebLevel: eachObject.programme_title,
              // indexNumber: eachObject.programme_title,
              // unebYear: eachObject.programme_title,
              nextOfKinSurname: eachObject.guardian_name,
              nextOfKinGivenNames: eachObject.guardian_name,
              nextOfKinIdNumber: 'Not defined',
              nextOfKinIdType: 'Not Defined',
              nextOfKinNationationality: 'Not Defined',
              isNextOfKinRefugee: false,
              nextOfKinPhone: eachObject.guardian_phone,
              nextOfKinEmail: eachObject.guardian_email,
              nextOfKinRelationship: eachObject.guardian_relationship,
              nextOfkinSex: 'Not Defined',
            },
          }).then((res) => res.data);

          response = result;
        }
      });

      if (response.statusCode === 202) {
        http.setSuccess(202, 'Students Published successfully', {
          response,
        });

        return http.send(res);
      } else {
        http.setError(400, response.message);
        return http.send(res);
      }
    } catch (error) {
      http.setError(400, 'Unable to Submit Student Data', {
        message: error.message,
      });

      return http.send(res);
    }
  }
}

module.exports = EmisSubmitController;
