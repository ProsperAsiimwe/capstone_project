/* eslint-disable camelcase */
const model = require('@models');

const { HttpResponse } = require('@helpers');
const moment = require('moment');
const {
  resultService,
  twoFactorAuthService,
  userService,
} = require('@services/index');
const { trim } = require('lodash');
const http = new HttpResponse();

const UserAgent = require('user-agents');
const { activityLog, findLocalIpAddress } = require('../Helpers/logsHelper');
const userAgent = new UserAgent();
const iPv4 = findLocalIpAddress();

class ManageStudentResultController {
  async deactivatedStudentResults(req, res) {
    try {
      const { id: userOtp, remember_token: rememberToken } = req.user;

      const data = req.body;

      const user = req.user.id;

      if (!data.operation || !data.requests || !data.otp) {
        throw new Error(`Invalid Request`);
      }

      const find2FA = await twoFactorAuthService.findOneTwoFactorAuth({
        where: {
          otp: trim(data.otp),
          user_id: userOtp,
          remember_token: rememberToken,
          operation: trim(data.operation),
        },
        raw: true,
      });

      if (find2FA) {
        data.deactivated_by_id = user;
        data.deactivated_at = moment.now();

        const approvedResults = [];

        await model.sequelize.transaction(async (transaction) => {
          for (const eachObject of data.requests) {
            let options = {};

            if (
              (eachObject.is_deactivated && !eachObject.deactivation_reason) ||
              (!eachObject.is_deactivated && eachObject.deactivation_reason) ||
              (eachObject.is_deactivated === false &&
                eachObject.deactivation_reason)
            ) {
              throw new Error(
                `Please Provide Reason or Status For Deactivation of Result(S)`
              );
            } else if (eachObject.is_deactivated) {
              options = {
                id: eachObject.id,
                is_deactivated: false,
              };

              eachObject.deactivated_by_id = user;
            } else {
              options = {
                id: eachObject.id,
              };
            }

            const findStudentResult = await resultService
              .findOneResult({
                where: {
                  ...options,
                },
                include: [
                  {
                    association: 'studentProgramme',
                    attributes: [
                      'id',
                      'registration_number',
                      'student_number',
                      'programme_id',
                    ],
                  },
                ],
                nest: true,
              })
              .then(function (res) {
                if (res) {
                  const result = res.toJSON();

                  return result;
                }
              });

            // userRoleProgramme

            if (!findStudentResult) {
              throw new Error(
                `One of the requests you are trying to Update is not valid.`
              );
            }

            const userBoundLevel = await userService.findUserRoleBoundLevel({
              user_id: user,
              role_id: req.body.role_id,
              bound_level: 'PROGRAMMES',
            });

            if (!userBoundLevel) {
              throw new Error(`Access Domain Not Defined`);
            } else if (userBoundLevel.has_access_to_all === false) {
              const userRoleProgramme = await userService.userRoleProgramme({
                user_id: user,
                role_id: req.body.role_id,
                programme_id: findStudentResult.studentProgramme.programme_id,
              });

              if (!userRoleProgramme) {
                throw new Error(
                  `Access to Student Record Denied(PROGRAMME Permission Denied)`
                );
              }
            }

            /* else if (!userBoundLevel) {
              throw new Error(`Access Domain Not Defined`);
            }
            */
            const updateDAta = (({
              academic_year_id,
              campus_id,
              intake_id,
              semester_id,
              is_audited_course,
              study_year_id,
              deactivation_reason,
              is_deactivated,
            }) => ({
              academic_year_id,
              campus_id,
              intake_id,
              semester_id,
              is_audited_course,
              study_year_id,
              deactivation_reason,
              is_deactivated,
            }))(eachObject);

            const studentResult = (({
              academic_year_id,
              campus_id,
              intake_id,
              semester_id,
              is_audited_course,
              study_year_id,
              deactivation_reason,
              is_deactivated,
            }) => ({
              academic_year_id,
              campus_id,
              intake_id,
              semester_id,
              is_audited_course,
              study_year_id,
              deactivation_reason,
              is_deactivated,
            }))(findStudentResult);

            let notMatched = 0;

            const currentDAta = {};

            const previousDAta = {};

            Object.keys(updateDAta).forEach((key) => {
              if (updateDAta[key]) {
                if (studentResult[key] !== updateDAta[key]) {
                  const previousKey = key;

                  notMatched = notMatched + 1;
                  previousDAta[previousKey] = studentResult[key];
                  currentDAta[previousKey] = updateDAta[key];
                } else {
                  notMatched = notMatched + 0;
                }
              }
            });

            if (notMatched === 0) {
              throw new Error(`Invalid Update Request(No Data Changes)`);
            }
            const updateResult = await resultService.updateResult(
              findStudentResult.id,
              {
                lastUpdatedById: user,
                ...updateDAta,
              },
              transaction
            );

            await activityLog(
              'createResultLog',
              user,
              'UPDATE',
              `UPDATE STUDENT RESULT (${eachObject.id}) FOR ${findStudentResult.studentProgramme.student_number}`,
              currentDAta,
              previousDAta,
              null,
              null,
              `iPv4-${iPv4}, hostIp-${req.ip}`,
              userAgent.data,
              data.otp,
              transaction
            );

            const result = updateResult[1][0];

            approvedResults.push(result);
          }
        });

        http.setSuccess(200, `Result(s) Updated successfully`, {
          approvedResults,
        });

        return http.send(res);
      } else {
        throw new Error(`Please provide a valid OTP code`);
      }
    } catch (error) {
      http.setError(400, `Unable To Update Result(s)`, {
        error: { message: error.message },
      });

      return http.send(res);
    }
  }
}

module.exports = ManageStudentResultController;
