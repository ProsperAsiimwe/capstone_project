'use strict';

const { Model, Deferrable } = require('sequelize');
const PujabALevelSubject = require('./pujabALevelSubject.model');
const PujabOLevelSubject = require('./pujabOLevelSubject.model');

const PujabApplicant = require('./pujabApplicant.model');
const PujabRunningAdmission = require('./pujabRunningAdmission.model');

module.exports = (sequelize, DataTypes) => {
  class PujabApplicationReportView extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      //
      this.applicant = this.belongsTo(models.PujabApplicant, {
        as: 'applicant',
        foreignKey: 'applicant_id',
      });

      this.pujabRunningAdmission = this.belongsTo(
        models.PujabRunningAdmission,
        {
          as: 'pujabRunningAdmission',
          foreignKey: 'pujab_running_admission_id',
        }
      );

      this.bioData = this.hasOne(models.PujabBioData, {
        as: 'bioData',
        foreignKey: 'pujab_application_id',
      });

      this.fatherInfo = this.hasOne(models.PujabFatherInfo, {
        as: 'fatherInfo',
        foreignKey: 'pujab_application_id',
      });

      this.motherInfo = this.hasOne(models.PujabMotherInfo, {
        as: 'motherInfo',
        foreignKey: 'pujab_application_id',
      });

      this.oSubjects = this.hasMany(models.PujabOLevelSubject, {
        as: 'oSubjects',
        foreignKey: 'pujab_o_level_id',
        sourceKey: 'o_level_id',
      });

      this.aSubjects = this.hasMany(models.PujabALevelSubject, {
        as: 'aSubjects',
        foreignKey: 'pujab_a_level_id',
        sourceKey: 'a_level_id',
      });

      this.advancedLevel = this.hasOne(models.PujabALevelData, {
        as: 'advancedLevel',
        foreignKey: 'pujab_application_id',
      });

      this.programmeChoices = this.hasMany(models.PujabProgrammeChoiceView, {
        as: 'programmeChoices',
        foreignKey: 'pujab_application_id',
      });
    }
  }

  PujabApplicationReportView.init(
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      applicant_id: {
        type: DataTypes.BIGINT,
        allowNull: false,
        references: {
          key: 'id',
          model: PujabApplicant,
          deferrable: Deferrable.INITIALLY_IMMEDIATE,
        },
      },
      pujab_running_admission_id: {
        type: DataTypes.BIGINT,
        allowNull: false,
        references: {
          key: 'id',
          model: PujabRunningAdmission,
          deferrable: Deferrable.INITIALLY_IMMEDIATE,
        },
      },
      o_level_id: {
        type: DataTypes.BIGINT,
        allowNull: true,
        references: {
          key: 'id',
          model: PujabOLevelSubject,
          deferrable: Deferrable.INITIALLY_IMMEDIATE,
        },
      },
      a_level_id: {
        type: DataTypes.BIGINT,
        allowNull: true,
        references: {
          key: 'id',
          model: PujabALevelSubject,
          deferrable: Deferrable.INITIALLY_IMMEDIATE,
        },
      },
      academic_year_id: {
        type: DataTypes.BIGINT,
        allowNull: false,
      },
      application_status: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      payment_date: {
        type: DataTypes.DATE,
        allowNull: true,
      },
      application_fee: {
        type: DataTypes.INTEGER,
      },
      surname: {
        type: DataTypes.DATE,
      },
      other_names: {
        type: DataTypes.DATE,
      },
      citizenship: {
        type: DataTypes.STRING,
      },
      home_district: {
        type: DataTypes.TEXT,
      },
      application_start_date: {
        type: DataTypes.DATE,
        allowNull: false,
      },
      application_completion_date: {
        type: DataTypes.DATE,
        allowNull: true,
      },
      form_id: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      payment_status: {
        type: DataTypes.STRING,
        allowNull: true,
        defaultValue: 'PENDING',
      },
      amount_billed: {
        type: DataTypes.DOUBLE,
        allowNull: true,
        defaultValue: 0,
      },
      amount_paid: {
        type: DataTypes.DOUBLE,
        allowNull: true,
        defaultValue: 0,
      },
      currency: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      prn: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      gender: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      phone: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      has_disability: {
        type: DataTypes.STRING,
        defaultValue: null,
        allowNull: true,
      },
      has_previous_admission: {
        type: DataTypes.STRING,
        defaultValue: null,
        allowNull: true,
      },
      o_level_result: {
        type: DataTypes.STRING,
        defaultValue: null,
        allowNull: true,
      },
      a_level_result: {
        type: DataTypes.STRING,
        defaultValue: null,
        allowNull: true,
      },
      o_school_name: {
        type: DataTypes.STRING,
      },
      o_index_number: {
        type: DataTypes.STRING,
      },
      o_exam_year: {
        type: DataTypes.STRING,
      },
      o_distinctions: {
        type: DataTypes.STRING,
      },
      o_credits: {
        type: DataTypes.STRING,
      },
      o_passes: {
        type: DataTypes.STRING,
      },
      a_school_name: {
        type: DataTypes.STRING,
      },
      a_index_number: {
        type: DataTypes.STRING,
      },
      a_exam_year: {
        type: DataTypes.STRING,
      },
      institution_name: {
        type: DataTypes.STRING,
      },
      student_number: {
        type: DataTypes.STRING,
      },
      registration_number: {
        type: DataTypes.STRING,
      },
      programme: {
        type: DataTypes.STRING,
      },
      sponsor: {
        type: DataTypes.STRING,
      },
      disability_details: {
        type: DataTypes.STRING,
      },

      // Record Details
      created_at: {
        type: DataTypes.DATE,
      },
      updated_at: {
        type: DataTypes.DATE,
      },
    },
    {
      sequelize,
      modelName: 'PujabApplicationReportView',
      tableName: 'pujab_application_report_view',
      underscored: true,
      timestamps: true,
      schema: 'pujab_mgt',
      createdAt: 'created_at',
      updatedAt: 'updated_at',
    }
  );

  return PujabApplicationReportView;
};
