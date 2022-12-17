/* eslint-disable indent */
const bcrypt = require('bcrypt');
const { isEmpty, isObject } = require('lodash');
const moment = require('moment');
const {
  userService,
  userRoleService,
  metadataValueService,
  OTPCodeService,
  userRoleGroupService,
  roleService,
} = require('@services/index');
const {
  HttpResponse,
  createToken,
  sendMail,
  sendSms,
  createEmailVerificationToken,
  decodeToken,
} = require('@helpers');
const models = require('@models');
const { appConfig } = require('../../../config');
const EventEmitter = require('events');
const { Op } = require('sequelize');
const {
  getMetadataValueId,
  getMetadataValueIdForFacultiesOrSchools,
} = require('@controllers/Helpers/programmeHelper');
const {
  formatPhoneNumber,
  formatEmail,
} = require('@helpers/SMSandEMAILHelper');

EventEmitter.captureRejections = true;

const http = new HttpResponse();
const eventEmitter = new EventEmitter();

class UserController {
  /**
   * Login User with Either phone or Email and Password
   *
   * @param {function} req Http Request Body
   * @param {function} res Http Response
   *
   * @return {JSON} Return Json Response
   */
  async login(req, res) {
    try {
      const { username } = req.body;
      const { password } = req.body;
      const findUser = await userService.findByEmailOrPhone(username);

      if (isEmpty(findUser)) {
        http.setError(400, 'Invalid username provided.');

        return http.send(res);
      }

      if (findUser.is_active !== true) {
        throw new Error(
          `Your Account Has Been Deactivated. Please Contact Your Group Administrator.`
        );
      }

      const comparePassword = await bcrypt.compare(password, findUser.password);

      if (comparePassword) {
        const token = await createToken({
          id: findUser.id,
          email: findUser.email,
        });
        const tokenResponse = {
          token_type: 'Bearer',
          token,
        };

        await userService.updateUser(findUser.id, {
          last_login: moment(new Date()).format(),
          remember_token: token,
        });

        http.setSuccess(200, 'Login successful', {
          access_token: tokenResponse,
        });
      } else {
        http.setError(400, 'Wrong username or password.');
      }

      return http.send(res);
    } catch (error) {
      http.setError(400, 'Unable to authenticate you', {
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
  async sendForgotPasswordOTP(req, res) {
    try {
      const data = req.body;
      const requestOrigin = 'STAFF PORTAL';
      const purpose = 'FORGOT-PASSWORD';
      const expiresAt = moment()
        .add(appConfig.PASSWORD_EXPIRES_IN, 'minutes')
        .utc(true);
      const findUser = await userService.findByEmailOrPhone(data.username);

      if (isEmpty(findUser)) {
        http.setError(400, 'Username Provided Does not Exist.');

        return http.send(res);
      }

      const findValidOTP = await OTPCodeService.getOTPCode({
        where: {
          username: data.username,
          is_used: false,
          request_origin: requestOrigin,
          purpose,
          expires_at: {
            [Op.gte]: moment.now(),
          },
        },
        raw: true,
      });

      let randomPassword = Math.floor(
        100000 + Math.random() * 900000
      ).toString();

      if (!findValidOTP) {
        await models.sequelize.transaction(async (transaction) => {
          // Save generated OTP to password reset codes table;
          await OTPCodeService.createOTPCode(
            {
              username: data.username,
              otp_code: randomPassword,
              request_origin: requestOrigin,
              purpose,
              expires_at: expiresAt,
              is_used: false,
            },
            transaction
          );
        });
      } else {
        randomPassword = findValidOTP.otp_code;
      }

      const emailSubject = `${requestOrigin} RESET PASSWORD.`;

      const smsText = `\nReset Code: ${randomPassword}, \nExpires in: ${appConfig.PASSWORD_EXPIRES_IN} Mins\n\n`;

      eventEmitter.on('emailStaffEvent', async () => {
        await sendMail(findUser.email, emailSubject, {
          app: 'STAFF PORTAL',
          token: randomPassword,
          email: findUser.email,
          name: findUser.surname,
          url: appConfig.STAFF_PORTAL_URL,
          validFor: `${appConfig.PASSWORD_EXPIRES_IN} Mins`,
        }).catch((err) => {
          throw new Error(err.message);
        });
      });

      eventEmitter.on('sendStaffTwilioSMSEvent', async () => {
        await sendSms(findUser.phone, smsText).catch((err) => {
          throw new Error(err.message);
        });
      });
      eventEmitter.emit('emailStaffEvent');
      eventEmitter.emit('sendStaffTwilioSMSEvent');

      const response =
        data.staff_origin === 'support'
          ? {
              random_password: randomPassword,
            }
          : {};

      http.setSuccess(
        200,
        `Your OTP has been sent to your email ${formatEmail(
          findUser.email
        )} and Phone  ${formatPhoneNumber(findUser.phone)}.`,
        response
      );

      eventEmitter.removeAllListeners();

      return http.send(res);
    } catch (error) {
      http.setError(400, 'Unable To Generate One Time Password.', {
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
  async verifyForgotPasswordOTP(req, res) {
    try {
      const data = req.body;

      const requestOrigin = 'STAFF PORTAL';
      const purpose = 'FORGOT-PASSWORD';

      const findRequest = await OTPCodeService.getOTPCode({
        where: {
          username: data.username,
          otp_code: data.otp,
          is_used: false,
          request_origin: requestOrigin,
          purpose,
          expires_at: {
            [Op.gte]: moment.now(),
          },
        },
        raw: true,
      });

      if (!findRequest) {
        throw new Error('Invalid OTP Provided!');
      }
      if (data.new_password !== data.confirm_password) {
        throw new Error(`Your Passwords Does not Match.`);
      }

      const userByEmailOrPhone = await userService.findByEmailOrPhone(
        data.username
      );

      if (isEmpty(userByEmailOrPhone)) {
        http.setError(400, 'Username Provided Does not Exist.');

        return http.send(res);
      }

      const saltRounds = parseInt(appConfig.PASSWORD_SALT_ROUNDS, 10);
      const salt = await bcrypt.genSalt(saltRounds);

      data.password = await bcrypt.hashSync(data.new_password, salt);

      const result = await models.sequelize.transaction(async (transaction) => {
        await OTPCodeService.updateOTPCode(
          data.username,
          {
            is_used: true,
            used_at: moment.now(),
          },
          transaction
        );

        // Change password on user table
        const response = await userService.updateUserWithTransaction(
          userByEmailOrPhone.id,
          {
            password: data.password,
            is_default_password: false,
            last_password_changed_at: moment.now(),
          },
          transaction
        );

        return response;
      });

      http.setSuccess(200, 'Password Changed Successfully.', {
        data: result,
      });

      return http.send(res);
    } catch (error) {
      http.setError(400, 'Unable To Change Password.', {
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
  async changePassword(req, res) {
    try {
      const data = req.body;
      const { id } = req.user;
      const { password } = req.user;
      const comparePassword = await bcrypt.compare(data.old_password, password);

      if (!comparePassword) throw new Error('Invalid Old Password provided!');
      else if (data.new_password !== data.confirm_password) {
        throw new Error('Your passwords do not Match!');
      }

      const saltRounds = parseInt(appConfig.PASSWORD_SALT_ROUNDS, 10);
      const salt = await bcrypt.genSalt(saltRounds);
      const changedPassword = await bcrypt.hashSync(data.new_password, salt);
      const updateUser = await userService.updateUser(id, {
        password: changedPassword,
        last_password_changed_at: moment.now(),
      });

      http.setSuccess(
        200,
        'Password Changed Successfully effective in the next login.',
        {
          data: updateUser,
        }
      );

      return http.send(res);
    } catch (error) {
      http.setError(400, 'Unable To Change Password.', {
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
  async changeDefaultPassword(req, res) {
    try {
      const data = req.body;
      const { id } = req.user;
      const { password } = req.user;

      if (data.new_password !== data.confirm_password) {
        throw new Error('Your passwords do not Match!');
      }

      const comparePassword = await bcrypt.compare(data.new_password, password);

      if (comparePassword) {
        throw new Error('Your new password cannot be the same as the old one!');
      }

      const saltRounds = parseInt(appConfig.PASSWORD_SALT_ROUNDS, 10);
      const salt = await bcrypt.genSalt(saltRounds);
      const changedPassword = await bcrypt.hashSync(data.new_password, salt);
      const updateUser = await userService.updateUser(id, {
        password: changedPassword,
        is_default_password: false,
        last_password_changed_at: moment.now(),
      });

      http.setSuccess(200, 'Password Changed Successfully.', {
        data: updateUser,
      });

      return http.send(res);
    } catch (error) {
      http.setError(400, 'Unable To Change Password.', {
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
  async getAuthUserProfile(req, res) {
    try {
      const { id } = req.user;
      const user = await userService.findOneUser({
        where: { id },
        include: [
          {
            association: 'userDetails',
            include: [
              {
                association: 'salutation',
                attributes: ['id', 'metadata_value'],
              },
            ],
          },
          { association: models.User.roles, include: ['apps'] },
          'roleGroups',
        ],
        attributes: { exclude: ['remember_token'] },
      });

      http.setSuccess(200, 'Profile fetched successfully', { user });
      if (isEmpty(user)) http.setError(404, 'User Data Not Found.');

      return http.send(res);
    } catch (error) {
      http.setError(400, 'Unable to get this User.', {
        error: { error: error.message },
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
  async getAuthUserSearch(req, res) {
    try {
      const { email } = req.body;
      const user = await userService.findOneUser({
        where: { email },
        attributes: { exclude: ['remember_token', 'has_temporary_access'] },
      });

      http.setSuccess(200, 'User fetched successfully', { user });
      if (isEmpty(user)) http.setError(404, 'User Data Not Found.');

      return http.send(res);
    } catch (error) {
      http.setError(400, 'Unable to get this User.', {
        error: { error: error.message },
      });

      return http.send(res);
    }
  }

  /**
   * fetch Auth User departments
   * @param {*} req
   * @param {*} res
   * @returns JSON
   */
  async getMyDepartments(req, res) {
    try {
      const { id } = req.user;
      const result = await userService.fetchAllDepartmentsHeadedByUser({
        where: { headed_by_id: id },
        ...getDepartmentAttributes(),
      });

      http.setSuccess(200, 'User Departments Fetched Successfully', {
        data: result,
      });

      return http.send(res);
    } catch (error) {
      http.setError(400, 'Unable Fetch User Departments.', {
        error: { message: error.message },
      });

      return http.send(res);
    }
  }

  /**
   * CREATE New User Data.
   *
   * @param {*} req Request body
   * @param {*} res Response
   *
   * @return {JSON} Return JSON Response
   */

  async createUser(req, res) {
    try {
      const data = req.body;
      const user = req.user.id;
      const randomPassword = Math.floor(
        100000 + Math.random() * 900000
      ).toString();
      const findUserByEmailOrPhone = await userService.invalidPhoneAndEmail(
        data
      );

      if (
        findUserByEmailOrPhone &&
        findUserByEmailOrPhone.email === data.email
      ) {
        throw new Error(
          `A User account already exists for email: ${findUserByEmailOrPhone.email}`
        );
      }
      if (
        findUserByEmailOrPhone &&
        findUserByEmailOrPhone.phone === data.phone
      ) {
        throw new Error(
          `A User account already exists for phone: ${findUserByEmailOrPhone.phone}.`
        );
      }

      const saltRounds = parseInt(appConfig.PASSWORD_SALT_ROUNDS, 10);
      const salt = await bcrypt.genSalt(saltRounds);

      data.password = await bcrypt.hashSync(randomPassword, salt);
      data.userDetails = {
        role_group_id: data.role_group_id,
        salutation_id: data.salutation_id,
        campus_id: data.campus_id,
        report_to_user_id: data.report_to_user_id,
      };

      const allRoles = await userRoleService.findAllRoles({
        attributes: ['id', 'role_title'],
        raw: true,
      });
      const boundLevels = await handleBoundLevels(data, user, allRoles);

      data.userRoles = boundLevels.userRoles;
      data.userRoleBoundValues = boundLevels.userRoleBoundValues;
      data.boundCampuses = boundLevels.boundCampuses;
      data.boundProgrammes = boundLevels.boundProgrammes;
      data.boundColleges = boundLevels.boundColleges;
      data.boundFaculties = boundLevels.boundFaculties;
      data.boundDepartments = boundLevels.boundDepartments;

      const response = await models.sequelize.transaction(
        async (transaction) => {
          const result = await userService.createUser(data, transaction);

          return result;
        }
      );

      if (response) {
        const userDetails = response.dataValues;
        const creator = req.user.surname + ' ' + req.user.other_names;
        const rolesGivenToUser = [];
        const emailSubject = `STAFF PORTAL ACCOUNT DETAILS.`;

        userDetails.userRoles.forEach((eachRole) => {
          const findRole = allRoles.find(
            (role) => parseInt(role.id, 10) === parseInt(eachRole.role_id, 10)
          );

          rolesGivenToUser.push(findRole.role_title);
        });

        const token = createEmailVerificationToken({
          surname: userDetails.surname,
          other_names: userDetails.other_names,
          email: userDetails.email,
          email_verified: userDetails.email_verified,
        });

        const verificationLink = `${appConfig.STAFF_PORTAL_URL}/email/verification/${token}`;

        const smsText = `Dear ${userDetails.surname} ${
          userDetails.other_names
        }, 
        Your Account has been created With Username: ${
          userDetails.email
        }, One Time Password: ${randomPassword} And Roles: 
        ${rolesGivenToUser.join(', ')}.\n
         Check your email for verification link.`;

        eventEmitter.on('createUserEmailEvent', async () => {
          await sendMail(
            userDetails.email,
            emailSubject,
            {
              user: userDetails,
              randomPassword,
              verificationLink,
              creator,
              url: appConfig.STAFF_PORTAL_URL,
              rolesGivenToUser,
            },
            'welcomeStaff'
          ).catch((err) => {
            throw new Error(err.message);
          });
        });

        eventEmitter.on('createUserSMSEvent', async () => {
          await sendSms(userDetails.phone, smsText).catch((err) => {
            throw new Error(err.message);
          });
        });

        eventEmitter.emit('createUserEmailEvent');
        eventEmitter.emit('createUserSMSEvent');
      }

      http.setSuccess(
        200,
        `User created and Verification Link sent to ${formatEmail(data.email)}`,
        {
          data: response,
        }
      );

      eventEmitter.removeAllListeners();

      return http.send(res);
    } catch (error) {
      http.setError(400, 'Unable to create this User.', {
        error: error.message,
      });

      return http.send(res);
    }
  }

  /**
   * VERIFY USER EMAIL
   *
   * @param {*} req
   * @param {*} res
   */
  async verifyRoleByEmail(req, res) {
    const { token } = req.params;

    try {
      const decodedToken = await decodeToken(token);

      if (!isObject(decodedToken)) {
        throw new Error('Invalid Token provided.');
      }
      const { id } = decodedToken;

      const userRole = await userRoleService.findOneUserRole({
        where: {
          id,
        },
        attributes: [
          'id',
          'user_id',
          'role_id',
          'role_accepted',
          'role_accepted_at',
        ],
        raw: true,
      });

      if (!userRole)
        throw new Error(`The Role You Are Trying To Approve Doesn't Exist.`);

      if (userRole.role_accepted === true)
        throw new Error(`This Role Has Already Been Accepted.`);

      await userRoleService
        .updateUserRole(id, {
          role_accepted: true,
          role_accepted_at: moment.now(),
        })
        .then((res) => res[1]);

      http.setSuccess(200, 'You Have Accepted A Role Successfully.');

      return http.send(res);
    } catch (error) {
      http.setError(400, error.message);

      return http.send(res);
    }
  }

  // index function to show users
  /**
   *
   * @param {*} req
   * @param {*} res
   */
  async index(req, res) {
    try {
      const users = await userService.findAllUsers();

      http.setSuccess(200, 'Users fetch successful', {
        users,
      });

      return http.send(res);
    } catch (error) {
      http.setError(400, 'Unable to fetch users', {
        error: { message: error.message },
      });

      return http.send(res);
    }
  }

  /**
   *
   * @param {*} req
   * @param {*} res
   * find users and their roles
   *
   *
   */
  async findUserRoleAppFunctions(req, res) {
    try {
      const { id } = req.user;
      const context = parseInt(id, 10);
      const result = await userService.findUserRoleAppFunctions(context);

      const filtered = result.find((row) => row.user_id === req.user.id);
      const userRoles = filtered ? filtered.roles : [];

      http.setSuccess(200, 'User Role App functions fetch successful', {
        userRoles,
      });

      return http.send(res);
    } catch (error) {
      http.setError(400, 'Unable to fetch user roles and role app functions', {
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
  async updateUser(req, res) {
    try {
      const { userId } = req.params;
      const data = req.body;
      const authUserId = req.user.id;

      if (data.surname) {
        data.surname = data.surname.toUpperCase().trim();
      }

      if (data.other_names) {
        data.other_names = data.other_names.toUpperCase().trim();
      }

      const userDetails = await userService.findUserDetails({
        where: {
          user_id: userId,
        },
        raw: true,
      });

      if (!userDetails) {
        throw new Error(`Unable To Find User's Group Details.`);
      }

      const groupAdmin = await userRoleGroupService.findOneUserRoleGroupAdmin({
        where: {
          user_role_group_id: userDetails.role_group_id,
          user_id: authUserId,
          deleted_at: null,
        },
        raw: true,
      });

      if (!groupAdmin) {
        throw new Error(
          `You Are Not An Administrator Of The Role Group To Which This User Belongs.`
        );
      }

      // Handle updating user details
      const userDetailsData = {
        salutation_id: data.salutation_id,
        campus_id: data.campus_id,
        report_to_user_id: data.report_to_user_id,
      };

      const updateUser = await models.sequelize.transaction(
        async (transaction) => {
          const response = await userService.updateUserWithTransaction(
            userId,
            data,
            transaction
          );

          if (data.is_active && data.is_active === false) {
            if (!data.narration) {
              throw new Error(
                `Please provide a reason for deactivating this user.`
              );
            }

            const metadataValues =
              await metadataValueService.findAllMetadataValues({
                include: {
                  association: 'metadata',
                  attributes: ['id', 'metadata_name'],
                },
                attributes: ['id', 'metadata_value'],
              });

            const findBlockedAccountStatusId = getMetadataValueId(
              metadataValues,
              'BLOCKED',
              'USER ACCOUNT STATUSES'
            );

            const findUserAccountStatuses =
              await userService.findAllUserAccountStatuses({
                where: {
                  user_id: userId,
                },
                raw: true,
              });

            if (!isEmpty(findUserAccountStatuses)) {
              for (const item of findUserAccountStatuses) {
                await userService.updateUserAccountStatus(
                  item.id,
                  {
                    is_current_status: false,
                  },
                  transaction
                );
              }
            }

            await userService.createUserAccountStatus(
              {
                user_id: userId,
                account_status_id: findBlockedAccountStatusId,
                narration: data.narration,
                is_current_status: true,
                created_by_id: authUserId,
              },
              transaction
            );
          }

          await userService.updateUserDetails(
            userDetails.id,
            userDetailsData,
            transaction
          );

          return response;
        }
      );

      http.setSuccess(200, 'User Updated Successfully', {
        user: updateUser,
      });

      return http.send(res);
    } catch (error) {
      http.setError(400, 'Unable To Update This User.', {
        error: {
          message: error.message,
        },
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
  async activateUser(req, res) {
    try {
      const authUserId = req.user.id;
      const data = req.body;

      data.is_active = true;

      const updates = [];

      const metadataValues = await metadataValueService.findAllMetadataValues({
        include: {
          association: 'metadata',
          attributes: ['id', 'metadata_name'],
        },
        attributes: ['id', 'metadata_value'],
      });

      const findBlockedAccountStatusId = getMetadataValueId(
        metadataValues,
        'ACTIVE',
        'USER ACCOUNT STATUSES'
      );

      const updateUser = await models.sequelize.transaction(
        async (transaction) => {
          for (const userId of data.users) {
            const userDetails = await userService
              .findUserDetails({
                where: {
                  user_id: userId,
                },
                include: [
                  {
                    association: 'user',
                    attributes: ['id', 'surname', 'other_names'],
                  },
                ],
                nest: true,
              })
              .then((res) => {
                if (res) {
                  return res.toJSON();
                }
              });

            if (!userDetails) {
              throw new Error(`Unable To Find User's Group Details.`);
            }

            const groupAdmin =
              await userRoleGroupService.findOneUserRoleGroupAdmin({
                where: {
                  user_role_group_id: userDetails.role_group_id,
                  user_id: authUserId,
                  deleted_at: null,
                },
                raw: true,
              });

            if (!groupAdmin) {
              throw new Error(
                `You Are Not An Administrator Of The Role Group To Which This ${userDetails.user.surname} ${userDetails.user.other_names} Belongs.`
              );
            }

            const response = await userService.updateUserWithTransaction(
              userId,
              data,
              transaction
            );

            const findUserAccountStatuses =
              await userService.findAllUserAccountStatuses({
                where: {
                  user_id: userId,
                },
                raw: true,
              });

            if (!isEmpty(findUserAccountStatuses)) {
              for (const item of findUserAccountStatuses) {
                await userService.updateUserAccountStatus(
                  item.id,
                  {
                    is_current_status: false,
                  },
                  transaction
                );
              }
            }

            await userService.createUserAccountStatus(
              {
                user_id: userId,
                account_status_id: findBlockedAccountStatusId,
                narration: data.narration,
                is_current_status: true,
                created_by_id: authUserId,
              },
              transaction
            );

            updates.push(response);
          }
        }
      );

      http.setSuccess(200, 'User(s) Activated Successfully', {
        user: updateUser,
      });

      return http.send(res);
    } catch (error) {
      http.setError(400, 'Unable To Activate User(s).', {
        error: {
          message: error.message,
        },
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
  async deActivateUser(req, res) {
    try {
      const authUserId = req.user.id;
      const data = req.body;

      data.is_active = false;

      const updates = [];

      const metadataValues = await metadataValueService.findAllMetadataValues({
        include: {
          association: 'metadata',
          attributes: ['id', 'metadata_name'],
        },
        attributes: ['id', 'metadata_value'],
      });

      const findBlockedAccountStatusId = getMetadataValueId(
        metadataValues,
        'BLOCKED',
        'USER ACCOUNT STATUSES'
      );

      const updateUser = await models.sequelize.transaction(
        async (transaction) => {
          for (const userId of data.users) {
            const userDetails = await userService
              .findUserDetails({
                where: {
                  user_id: userId,
                },
                include: [
                  {
                    association: 'user',
                    attributes: ['id', 'surname', 'other_names'],
                  },
                ],
                nest: true,
              })
              .then((res) => {
                if (res) {
                  return res.toJSON();
                }
              });

            if (!userDetails) {
              throw new Error(`Unable To Find User's Group Details.`);
            }

            const groupAdmin =
              await userRoleGroupService.findOneUserRoleGroupAdmin({
                where: {
                  user_role_group_id: userDetails.role_group_id,
                  user_id: authUserId,
                  deleted_at: null,
                },
                raw: true,
              });

            if (!groupAdmin) {
              throw new Error(
                `You Are Not An Administrator Of The Role Group To Which This ${userDetails.user.surname} ${userDetails.user.other_names} Belongs.`
              );
            }

            const response = await userService.updateUserWithTransaction(
              userId,
              data,
              transaction
            );

            const findUserAccountStatuses =
              await userService.findAllUserAccountStatuses({
                where: {
                  user_id: userId,
                },
                raw: true,
              });

            if (!isEmpty(findUserAccountStatuses)) {
              for (const item of findUserAccountStatuses) {
                await userService.updateUserAccountStatus(
                  item.id,
                  {
                    is_current_status: false,
                  },
                  transaction
                );
              }
            }

            await userService.createUserAccountStatus(
              {
                user_id: userId,
                account_status_id: findBlockedAccountStatusId,
                narration: data.narration,
                is_current_status: true,
                created_by_id: authUserId,
              },
              transaction
            );

            updates.push(response);
          }
        }
      );

      http.setSuccess(200, 'User(s) De-activated Successfully', {
        user: updateUser,
      });

      return http.send(res);
    } catch (error) {
      http.setError(400, 'Unable To Deactivate User(s).', {
        error: {
          message: error.message,
        },
      });

      return http.send(res);
    }
  }

  /**
   * Destroy
   *
   * @param {*} req
   * @param {*} res
   *
   * @return {JSON}
   */
  async removeRolesFromUser(req, res) {
    try {
      const data = req.body;
      const { userId } = req.params;
      const userRoles = [];

      const userRoleBoundValues =
        await userRoleService.findAllUserRoleBoundValues({
          where: {
            user_id: userId,
          },
          include: [
            {
              association: 'roleBoundLevel',
              attributes: ['id', 'role_id', 'bound_level_id'],
            },
          ],
          raw: true,
          nest: true,
        });

      if (!isEmpty(data.roles)) {
        data.roles.forEach((role) => {
          userRoles.push({
            role_id: role,
            user_id: userId,
          });
        });
      }

      await models.sequelize.transaction(async (transaction) => {
        if (!isEmpty(userRoles)) {
          for (const eachRole of userRoles) {
            // Remove userRoleBoundValues
            if (!isEmpty(userRoleBoundValues)) {
              const checkRoles = userRoleBoundValues.filter(
                (role) =>
                  parseInt(role.roleBoundLevel.role_id, 10) ===
                  parseInt(eachRole.role_id, 10)
              );

              if (!isEmpty(checkRoles)) {
                for (const eachRole of checkRoles) {
                  await userRoleService.removeUserRoleBoundValues({
                    where: {
                      id: eachRole.id,
                    },
                    transaction,
                  });
                }
              }
            }

            // Remove boundCampuses
            await userRoleService.removeBoundCampuses({
              where: {
                user_id: eachRole.user_id,
                role_id: eachRole.role_id,
              },
              transaction,
            });

            // Remove boundProgrammes
            await userRoleService.removeBoundProgrammes({
              where: {
                user_id: eachRole.user_id,
                role_id: eachRole.role_id,
              },
              transaction,
            });

            // Remove boundColleges
            await userRoleService.removeBoundColleges({
              where: {
                user_id: eachRole.user_id,
                role_id: eachRole.role_id,
              },
              transaction,
            });

            // Remove boundFaculties
            await userRoleService.removeBoundFaculties({
              where: {
                user_id: eachRole.user_id,
                role_id: eachRole.role_id,
              },
              transaction,
            });

            // Remove boundDepartments
            await userRoleService.removeBoundDepartments({
              where: {
                user_id: eachRole.user_id,
                role_id: eachRole.role_id,
              },
              transaction,
            });

            await roleService.removeRoleFromUser(
              eachRole.role_id,
              eachRole.user_id,
              transaction
            );
          }
        }
      });

      http.setSuccess(200, 'Roles Removed From User Successfully');

      return http.send(res);
    } catch (error) {
      http.setError(400, 'Unable To Remove Roles From User.', {
        error: {
          message: error.message,
        },
      });

      return http.send(res);
    }
  }

  // get all method
  async getAll(req, res) {
    try {
      const users = await userService.findAllUsers();

      http.setSuccess(200, 'Users', { users });

      return http.send(res);
    } catch (error) {
      http.setError(400, 'Unable to get fetch Users.', {
        error: { error: error.message },
      });

      return http.send(res);
    }
  }

  async getOne(req, res) {
    try {
      const { id } = req.params;
      const user = await userService.findOneUser({ where: { id } });

      http.setSuccess(200, 'User fetch successful', { user });
      if (isEmpty(user)) http.setError(404, 'User Data Not Found.');

      return http.send(res);
    } catch (error) {
      http.setError(400, 'Unable to get this User.', {
        error: { error: error.message },
      });

      return http.send(res);
    }
  }

  /**
   * Destroy User token
   *
   * @param {Object} req Http Request Body
   * @param {Object} res Http Response
   *
   * @returns {JSON} Return Json Response
   */
  async logout(req, res) {
    const { id } = req.user;

    try {
      await userService.updateUser(id, { remember_token: null });
      http.setSuccess(200, 'You have been logged out');

      return http.send(res);
    } catch (error) {
      http.setError(400, 'Unable to log you out.', { error: error.message });

      return http.send(res);
    }
  }
}

/**
 *
 * @param {*} data
 * @param {*} user
 * @param {*} allRoles
 * @returns
 */
const handleBoundLevels = async function (data, user, allRoles) {
  const userRoles = [];
  const userRoleBoundValues = [];
  const boundCampuses = [];
  const boundProgrammes = [];
  const boundColleges = [];
  const boundFaculties = [];
  const boundDepartments = [];

  const metadataValues = await metadataValueService.findAllMetadataValues({
    include: ['metadata'],
  });

  if (!isEmpty(data.roles)) {
    const findMainRole = data.roles.filter(
      (role) => role.is_main_role === true
    );

    if (isEmpty(findMainRole)) {
      throw new Error(
        'You need to define at least one main role for this user.'
      );
    }

    if (findMainRole.length > 1) {
      throw new Error('You can only define one main role for this user.');
    }

    // Handle Bound Campuses
    for (const eachRole of data.roles) {
      const findRole = allRoles.filter(
        (role) => parseInt(role.id, 10) === parseInt(eachRole.role_id, 10)
      );

      if (isEmpty(findRole)) {
        throw new Error(`You Have Chosen A Role That Doesn't Exist.`);
      }

      if (eachRole.access_all_campuses === true) {
        if (!isEmpty(eachRole.campuses)) {
          eachRole.campuses = [];
        }

        const findCampusesBoundLevelId = getMetadataValueId(
          metadataValues,
          'CAMPUSES',
          'ACCESS DOMAINS'
        );

        const findRoleBoundLevel = await userRoleService.findOneRoleBoundLevel({
          where: {
            role_id: eachRole.role_id,
            bound_level_id: findCampusesBoundLevelId,
          },
          raw: true,
          attributes: ['id', 'role_id', 'bound_level_id'],
        });

        if (!findRoleBoundLevel) {
          throw new Error(
            `The Role: ${findRole[0].role_title} You Have Provided Wasn't Given A Bound Level Of CAMPUSES.`
          );
        }

        userRoleBoundValues.push({
          role_bound_level_id: findRoleBoundLevel.id,
          has_access_to_all: true,
          created_by_id: user,
        });
      } else {
        if (isEmpty(eachRole.campuses)) {
          throw new Error(
            `Please Provide A List Of CAMPUSES To Bind This User To For The Role: ${findRole[0].role_title}.`
          );
        }

        eachRole.campuses.forEach((campus) => {
          boundCampuses.push({
            role_id: eachRole.role_id,
            campus_id: campus,
            created_by_id: user,
          });
        });
      }

      // Handle Bound Programmes
      if (eachRole.access_all_programmes === true) {
        if (!isEmpty(eachRole.programmes)) {
          eachRole.programmes = [];
        }

        const findProgrammeBoundLevelId = getMetadataValueId(
          metadataValues,
          'PROGRAMMES',
          'ACCESS DOMAINS'
        );

        const findRoleBoundLevel = await userRoleService.findOneRoleBoundLevel({
          where: {
            role_id: eachRole.role_id,
            bound_level_id: findProgrammeBoundLevelId,
          },
          raw: true,
          attributes: ['id', 'role_id', 'bound_level_id'],
        });

        if (!findRoleBoundLevel) {
          throw new Error(
            `The Role: ${findRole[0].role_title} You Have Provided Wasn't Given A Bound Level Of PROGRAMMES.`
          );
        }

        userRoleBoundValues.push({
          role_bound_level_id: findRoleBoundLevel.id,
          has_access_to_all: true,
          created_by_id: user,
        });
      } else {
        if (isEmpty(eachRole.programmes)) {
          throw new Error(
            `Please Provide A List Of PROGRAMMES To Bind This User To For The Role: ${findRole[0].role_title}.`
          );
        }

        eachRole.programmes.forEach((programme) => {
          boundProgrammes.push({
            role_id: eachRole.role_id,
            programme_id: programme,
            created_by_id: user,
          });
        });
      }

      // Handle Bound Colleges
      if (eachRole.access_all_colleges) {
        if (eachRole.access_all_colleges === true) {
          if (!isEmpty(eachRole.colleges)) {
            eachRole.colleges = [];
          }

          const findCollegeBoundLevelId = getMetadataValueId(
            metadataValues,
            'COLLEGES',
            'ACCESS DOMAINS'
          );

          const findRoleBoundLevel =
            await userRoleService.findOneRoleBoundLevel({
              where: {
                role_id: eachRole.role_id,
                bound_level_id: findCollegeBoundLevelId,
              },
              raw: true,
              attributes: ['id', 'role_id', 'bound_level_id'],
            });

          if (!findRoleBoundLevel) {
            throw new Error(
              `The Role: ${findRole[0].role_title} You Have Provided Wasn't Given A Bound Level Of COLLEGES.`
            );
          }

          userRoleBoundValues.push({
            role_bound_level_id: findRoleBoundLevel.id,
            has_access_to_all: true,
            created_by_id: user,
          });
        } else {
          if (isEmpty(eachRole.colleges)) {
            throw new Error(
              `Please Provide A List Of COLLEGES To Bind This User To For The Role: ${findRole[0].role_title}.`
            );
          }

          eachRole.colleges.forEach((college) => {
            boundColleges.push({
              role_id: eachRole.role_id,
              college_id: college,
              created_by_id: user,
            });
          });
        }
      }

      // Handle Bound Faculties
      if (eachRole.access_all_faculties) {
        if (eachRole.access_all_faculties === true) {
          if (!isEmpty(eachRole.faculties)) {
            eachRole.faculties = [];
          }

          const findFacultyBoundLevelId =
            getMetadataValueIdForFacultiesOrSchools(
              metadataValues,
              'FACULTIES',
              'SCHOOLS',
              'ACCESS DOMAINS'
            );

          const findRoleBoundLevel =
            await userRoleService.findOneRoleBoundLevel({
              where: {
                role_id: eachRole.role_id,
                bound_level_id: findFacultyBoundLevelId,
              },
              raw: true,
              attributes: ['id', 'role_id', 'bound_level_id'],
            });

          if (!findRoleBoundLevel) {
            throw new Error(
              `The Role: ${findRole[0].role_title} You Have Provided Wasn't Given A Bound Level Of FACULTIES/SCHOOLS.`
            );
          }

          userRoleBoundValues.push({
            role_bound_level_id: findRoleBoundLevel.id,
            has_access_to_all: true,
            created_by_id: user,
          });
        } else {
          if (isEmpty(eachRole.faculties)) {
            throw new Error(
              `Please Provide A List Of FACULTIES/SCHOOLS To Bind This User To For The Role: ${findRole[0].role_title}.`
            );
          }

          eachRole.faculties.forEach((faculty) => {
            boundFaculties.push({
              role_id: eachRole.role_id,
              faculty_id: faculty,
              created_by_id: user,
            });
          });
        }
      }

      // Handle Bound Departments
      if (eachRole.access_all_departments) {
        if (eachRole.access_all_departments === true) {
          if (!isEmpty(eachRole.departments)) {
            eachRole.departments = [];
          }

          const findDepartmentBoundLevelId = getMetadataValueId(
            metadataValues,
            'DEPARTMENTS',
            'ACCESS DOMAINS'
          );

          const findRoleBoundLevel =
            await userRoleService.findOneRoleBoundLevel({
              where: {
                role_id: eachRole.role_id,
                bound_level_id: findDepartmentBoundLevelId,
              },
              raw: true,
              attributes: ['id', 'role_id', 'bound_level_id'],
            });

          if (!findRoleBoundLevel) {
            throw new Error(
              `The Role: ${findRole[0].role_title} You Have Provided Wasn't Given A Bound Level Of DEPARTMENTS.`
            );
          }

          userRoleBoundValues.push({
            role_bound_level_id: findRoleBoundLevel.id,
            has_access_to_all: true,
            created_by_id: user,
          });
        } else {
          if (isEmpty(eachRole.departments)) {
            throw new Error(
              `Please Provide A List Of DEPARTMENTS To Bind This User To For The Role: ${findRole[0].role_title}.`
            );
          }

          eachRole.departments.forEach((department) => {
            boundDepartments.push({
              role_id: eachRole.role_id,
              department_id: department,
              created_by_id: user,
            });
          });
        }
      }

      userRoles.push({
        role_id: eachRole.role_id,
        is_main_role: eachRole.is_main_role,
        created_by_id: user,
      });
    }
  }

  return {
    userRoles: userRoles,
    userRoleBoundValues: userRoleBoundValues,
    boundCampuses: boundCampuses,
    boundProgrammes: boundProgrammes,
    boundColleges: boundColleges,
    boundFaculties: boundFaculties,
    boundDepartments: boundDepartments,
  };
};

const getDepartmentAttributes = function () {
  return {
    attributes: {
      exclude: [
        'updated_at',
        'createdById',
        'createApprovedById',
        'lastUpdatedById',
        'lastUpdateApprovedById',
        'deletedById',
        'deleteApprovedById',
        'deleteApprovedById',
        'delete_approval_status',
        'delete_approval_date',
        'delete_approved_by_id',
        'last_update_approval_status',
        'last_update_approval_date',
        'last_update_approved_by_id',
        'last_updated_by_id',
        'create_approval_status',
        'create_approval_date',
        'create_approved_by_id',
      ],
    },
  };
};

module.exports = UserController;
