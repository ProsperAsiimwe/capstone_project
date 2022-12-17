'use strict';

const { Model, Deferrable } = require('sequelize');
const RunningAdmission = require('./runningAdmission.model');
const Applicant = require('./applicant.model');

module.exports = (sequelize, DataTypes) => {
  class ApplicantALevelData extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // Get the subjects Table.
      this.subjects = this.hasMany(models.ApplicantALevelDataSubject, {
        as: 'subjects',
        foreignKey: 'applicant_a_level_data_id',
      });

      // Get the running admission from running admission Table.
      this.runningAdmission = this.belongsTo(models.RunningAdmission, {
        as: 'runningAdmission',
        foreignKey: 'running_admission_id',
      });
      // Get the applicant from applicants Table.
      this.applicant = this.belongsTo(models.Applicant, {
        as: 'applicant',
        foreignKey: 'applicant_id',
      });
    }
  }

  ApplicantALevelData.init(
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      running_admission_id: {
        type: DataTypes.BIGINT,
        allowNull: false,
        references: {
          key: 'id',
          model: RunningAdmission,
          deferrable: Deferrable.INITIALLY_IMMEDIATE,
        },
      },
      applicant_id: {
        type: DataTypes.BIGINT,
        allowNull: false,
        references: {
          key: 'id',
          model: Applicant,
          deferrable: Deferrable.INITIALLY_IMMEDIATE,
        },
      },
      form_id: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      sat_a_level_exams: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: true,
      },
      index_number: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      exam_year: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },
      name: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      school_name: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      pass_slip_attachment: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      summary: {
        type: DataTypes.JSON,
        allowNull: true,
      },
      photo: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      center_no: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      is_manual: {
        type: DataTypes.BOOLEAN,
        allowNull: true,
        defaultValue: false,
      },

      // Extra Record Details
      created_at: {
        type: DataTypes.DATE,
        allowNull: true,
      },
      updated_at: {
        type: DataTypes.DATE,
        allowNull: true,
      },
    },
    {
      sequelize,
      modelName: 'ApplicantALevelData',
      tableName: 'applicant_a_level_data',
      underscored: true,
      timestamps: true,
      schema: 'admissions_mgt',
      createdAt: 'created_at',
      updatedAt: 'updated_at',
    }
  );

  return ApplicantALevelData;
};
