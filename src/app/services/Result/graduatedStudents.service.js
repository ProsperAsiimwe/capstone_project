const models = require('@models');
const { QueryTypes } = require('sequelize');
const { sequelizeErrorHandler } = require('@helpers/technicalErrorHelper');
const { orderBy } = require('lodash');

class GraduatedStudentsService {
  static async graduatedStudents(data) {
    try {
      const filtered = await models.sequelize.query(
        `select * from results_mgt.graduated_students_list(${data.campus_id},${data.intake_id},
          ${data.programme_id},${data.academic_year_id}) 
          `,
        {
          type: QueryTypes.SELECT,
        }
      );

      return orderBy(filtered, ['surname', 'other_names'], 'asc');
    } catch (error) {
      // const err = errorFunction.errorFunction(error);

      // throw new Error(err.message);

      await sequelizeErrorHandler(
        error,
        `graduatedStudents.service.js`,
        `graduatedStudents`,
        `GET`
      );
    }
  }
}

module.exports = GraduatedStudentsService;
