const { HttpResponse } = require('@helpers');
const {
  hallAllocationPolicyService,
  metadataValueService,
} = require('@services/index');
const { createInstitutionPolicyLog } = require('../Helpers/logsHelper');
const {
  getMetadataValueName,
} = require('@controllers/Helpers/programmeHelper');
const moment = require('moment');
const model = require('@models');

const http = new HttpResponse();

class HallAllocationPolicyController {
  /**
   * GET All records.
   *
   * @param {*} req Request
   * @param {*} res Response
   *
   * @returns {JSON} Http Response
   */
  async index(req, res) {
    try {
      const records = await hallAllocationPolicyService.findAllRecords({
        include: [
          {
            association: 'hall',
            attributes: ['id', 'metadata_value'],
          },
          {
            association: 'degreeCategory',
            attributes: ['id', 'metadata_value'],
          },
        ],
      });

      http.setSuccess(
        200,
        'All Hall Allocation Policy Records Fetched Successfully',
        {
          data: records,
        }
      );

      return http.send(res);
    } catch (error) {
      http.setError(400, 'Unable To Fetch All Hall Allocation Policy Records', {
        error: { message: error.message },
      });

      return http.send(res);
    }
  }

  /**
   * CREATE New Record.
   *
   * @param {*} req Request body
   * @param {*} res Response
   *
   * @return {JSON} Return JSON Response
   */
  async createRecord(req, res) {
    try {
      const data = req.body;
      const { id: user, remember_token: rememberToken } = req.user;

      data.created_by_id = user;

      const metadataValues = await metadataValueService.findAllMetadataValues({
        include: {
          association: 'metadata',
          attributes: ['id', 'metadata_name'],
        },
        attributes: ['id', 'metadata_value'],
      });

      const hallValue = getMetadataValueName(
        metadataValues,
        data.hall_id,
        'HALLS'
      );

      const degreeCategoryValue = getMetadataValueName(
        metadataValues,
        data.degree_category_id,
        'DEGREE CATEGORIES'
      );

      const result = await model.sequelize.transaction(async (transaction) => {
        const result = await hallAllocationPolicyService.createRecord(
          data,
          transaction
        );

        if (result[1] === true) {
          await createInstitutionPolicyLog(
            {
              user_id: user,
              operation: `CREATE`,
              area_accessed: `HALL ALLOCATION POLICIES`,
              current_data: `Created a hall allocation policy for hall: ${hallValue}, degree category: ${degreeCategoryValue} with value(s): ${
                data.is_for_male_students
                  ? `Male students: ${data.is_for_male_students}`
                  : ``
              }, ${
                data.is_for_female_students
                  ? `Female students: ${data.is_for_female_students}`
                  : ``
              }.`,
              ip_address: req.connection.remoteAddress,
              user_agent: req.get('user-agent'),
              token: rememberToken,
            },
            transaction
          );
        }

        return result[0];
      });

      http.setSuccess(200, 'Hall Allocation Policy Created successfully', {
        data: result,
      });

      return http.send(res);
    } catch (error) {
      http.setError(400, 'Unable Create This Hall Allocation Policy Record', {
        error: { message: error.message },
      });

      return http.send(res);
    }
  }

  /**
   * UPDATE Specific Record.
   *
   * @param {*} req Request body
   * @param {*} res Response
   *
   * @return {JSON} Return JSON Response
   */
  async updateRecord(req, res) {
    try {
      const { id } = req.params;
      const { id: user, remember_token: rememberToken } = req.user;
      const data = req.body;

      data.last_updated_by_id = user;
      data.updated_at = moment.now();

      let hallValue = null;

      let degreeCategoryValue = null;

      const findPolicy = await hallAllocationPolicyService
        .findOneRecord({
          where: { id },
          include: [
            {
              association: 'hall',
              attributes: ['id', 'metadata_value'],
            },
            {
              association: 'degreeCategory',
              attributes: ['id', 'metadata_value'],
            },
          ],
          nest: true,
        })
        .then((res) => {
          if (res) {
            return res.toJSON();
          }
        });

      if (!findPolicy) {
        throw new Error(`Unable To Find Policy.`);
      }

      const metadataValues = await metadataValueService.findAllMetadataValues({
        include: {
          association: 'metadata',
          attributes: ['id', 'metadata_name'],
        },
        attributes: ['id', 'metadata_value'],
      });

      if (data.hall_id) {
        hallValue = getMetadataValueName(metadataValues, data.hall_id, 'HALLS');
      }

      if (data.degree_category_id) {
        degreeCategoryValue = getMetadataValueName(
          metadataValues,
          data.degree_category_id,
          'DEGREE CATEGORIES'
        );
      }

      const result = await model.sequelize.transaction(async (transaction) => {
        const updateRecord = await hallAllocationPolicyService.updateRecord(
          id,
          data,
          transaction
        );

        await createInstitutionPolicyLog(
          {
            user_id: user,
            operation: `UPDATE`,
            area_accessed: `HALL ALLOCATION POLICIES`,
            current_data: `Updated the hall allocation policy record of id: ${
              findPolicy.id
            } with data:- ${data.hall_id ? `Hall: ${hallValue}` : ``} ${
              data.degree_category_id
                ? `Degree category: ${degreeCategoryValue}`
                : ``
            }, ${
              data.is_for_male_students
                ? `Male students: ${data.is_for_male_students}`
                : ``
            },  ${
              data.is_for_female_students
                ? `Female students: ${data.is_for_female_students}`
                : ``
            }`,
            previous_data: `id: ${findPolicy.id}, Hall: ${findPolicy.hall.metadata_value}, Degree category: ${findPolicy.degreeCategory.metadata_value}, Males?: ${findPolicy.is_for_male_students}, Females?:${findPolicy.is_for_female_students}`,
            ip_address: req.connection.remoteAddress,
            user_agent: req.get('user-agent'),
            token: rememberToken,
          },
          transaction
        );

        return updateRecord[1][0];
      });

      http.setSuccess(
        200,
        'Hall Allocation Policy Record Updated Successfully',
        {
          data: result,
        }
      );

      return http.send(res);
    } catch (error) {
      http.setError(
        400,
        'Unable To Update This Hall Allocation Policy Record',
        {
          error: { message: error.message },
        }
      );

      return http.send(res);
    }
  }

  /**
   * Destroy Record Data
   *
   * @param {*} req
   * @param {*} res
   *
   * @return {JSON}
   */
  async deleteRecord(req, res) {
    try {
      const { id } = req.params;
      const { id: user, remember_token: rememberToken } = req.user;

      const findPolicy = await hallAllocationPolicyService
        .findOneRecord({
          where: { id },
          include: [
            {
              association: 'hall',
              attributes: ['id', 'metadata_value'],
            },
            {
              association: 'degreeCategory',
              attributes: ['id', 'metadata_value'],
            },
          ],
          nest: true,
        })
        .then((res) => {
          if (res) {
            return res.toJSON();
          }
        });

      if (!findPolicy) {
        throw new Error(`Unable To Find Policy.`);
      }

      await model.sequelize.transaction(async (transaction) => {
        await createInstitutionPolicyLog(
          {
            user_id: user,
            operation: `DELETE`,
            area_accessed: `HALL ALLOCATION POLICIES`,
            current_data: `Deleted the hall allocation policy record of id: ${findPolicy.id}.`,
            previous_data: `id: ${findPolicy.id}, Hall: ${findPolicy.hall.metadata_value}, Degree category: ${findPolicy.degreeCategory.metadata_value}, Males?: ${findPolicy.is_for_male_students}, Females?:${findPolicy.is_for_female_students}`,
            ip_address: req.connection.remoteAddress,
            user_agent: req.get('user-agent'),
            token: rememberToken,
          },
          transaction
        );

        await hallAllocationPolicyService.deleteRecord(id, transaction);
      });

      http.setSuccess(
        200,
        'Hall Allocation Policy Record Deleted Successfully'
      );

      return http.send(res);
    } catch (error) {
      http.setError(400, 'Cannot delete this Hall Allocation Policy.', {
        error: { message: error.message },
      });

      return http.send(res);
    }
  }
}

module.exports = HallAllocationPolicyController;
