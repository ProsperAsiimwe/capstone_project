const models = require('@models');
const { sequelizeErrorHandler } = require('@helpers/technicalErrorHelper');
const { QueryTypes } = require('sequelize');

class EmisIntegrationService {
  static async findAllEmisValues(options) {
    try {
      const filter = await models.EmisIntegration.findAll({
        ...options,
      });

      return filter;
    } catch (error) {
      await sequelizeErrorHandler(
        error,
        `emisIntegration.service.js`,
        `findAllEmisValues`,
        `GET`
      );
    }
  }

  //  FIND One findOneEmisValues Object;clear

  static async findOneEmisValues(options) {
    try {
      const filter = await models.EmisIntegration.findOne({
        ...options,
      });

      return filter;
    } catch (error) {
      await sequelizeErrorHandler(
        error,
        `emisIntegration.service.js`,
        `findOneEmisValues`,
        `GET`
      );
    }
  }

  // create emis value
  static async createEmisValues(data) {
    try {
      const newValue = await models.EmisIntegration.create({
        ...data,
      });

      return newValue;
    } catch (error) {
      await sequelizeErrorHandler(
        error,
        `emisIntegration.service.js`,
        `createEmisValues`,
        `POST`
      );
    }
  }

  //  UPDATE EmisValues table;

  static async updateEmisValues(id, data) {
    try {
      const updated = await models.EmisIntegration.update(data, {
        where: { id },
        returning: true,
      });

      return updated;
    } catch (error) {
      await sequelizeErrorHandler(
        error,
        `emisIntegration.service.js`,
        `updateEmisValues`,
        `PUT`
      );
    }
  }

  // get sponsor

  static async getAcmisSponsors(data) {
    try {
      const filtered = await models.sequelize.query(
        `
          select
          sp.id as id,
          sp.sponsor_name,
          case when ei.value is null then false
          else true
          end as is_submitted,
          ei.created_at::date as submitted_at
          from universal_payments_mgt.sponsors  as sp
          left join app_mgt.emis_integration as ei
          on sp.sponsor_name = ei.value

          `,
        {
          type: QueryTypes.SELECT,
        }
      );

      return filtered;
    } catch (error) {
      await sequelizeErrorHandler(
        error,
        `reports.service.js`,
        `studentResults`,
        `GET`
      );
    }
  }

  // campuses

  static async getAcmisMetadata(metadata) {
    try {
      const filtered = await models.sequelize.query(
        `
         select mv.id as id,mv.metadata_value as metadata_value,ei.value,
        case when ei.value is null then false
        else true
        end as is_submitted ,
        ei.created_at::date as submitted_at

        from app_mgt.metadata_values as mv
        left join app_mgt.metadata as mm
        on mv.metadata_id = mm.id
        left join app_mgt.emis_integration as ei
        on mv.metadata_value = ei.value
        where mm.metadata_name = '${metadata}'
          `,
        {
          type: QueryTypes.SELECT,
        }
      );

      return filtered;
    } catch (error) {
      await sequelizeErrorHandler(
        error,
        `reports.service.js`,
        `studentResults`,
        `GET`
      );
    }
  }

  // entry schemes

  static async getAcmisSchemes() {
    try {
      const filtered = await models.sequelize.query(
        `
     select
      ads.id as id,
      ads.scheme_name,
      case when ei.value is null then false
      else true
      end as is_submitted,
      ei.created_at::date as submitted_at

      from admissions_mgt.admission_schemes as ads
      left join app_mgt.emis_integration as ei
      on ads.scheme_name = ei.value
          `,
        {
          type: QueryTypes.SELECT,
        }
      );

      return filtered;
    } catch (error) {
      await sequelizeErrorHandler(
        error,
        `reports.service.js`,
        `studentResults`,
        `GET`
      );
    }
  }

  // programme
  static async getAcmisProgrammes() {
    try {
      const filtered = await models.sequelize.query(
        `
        select
        df.faculty_title as academic_unit_title,
        json_agg(json_build_object(
          'id',ads.id,
          'programme_title',ads.programme_title,
          'programme_code',ads.programme_code,
          'submitted_at',ei.created_at::date,
          'is_submitted',case when ei.value is null then false
          else true
          end 
        )) as programmes

        from programme_mgt.programmes  as ads
        left join programme_mgt.departments as dp
        on ads.department_id = dp.id
        left join programme_mgt.faculties as df
        on df.id = dp.faculty_id
        left join app_mgt.emis_integration as ei
        on ads.programme_title = ei.value
        group by df.faculty_title
        order by  df.faculty_title
          `,
        {
          type: QueryTypes.SELECT,
        }
      );

      return filtered;
    } catch (error) {
      await sequelizeErrorHandler(
        error,
        `reports.service.js`,
        `studentResults`,
        `GET`
      );
    }
  }
}

module.exports = EmisIntegrationService;
