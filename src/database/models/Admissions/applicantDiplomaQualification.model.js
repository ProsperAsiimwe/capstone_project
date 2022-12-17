'use strict';

const { Model, Deferrable } = require('sequelize');

const RunningAdmission = require('./runningAdmission.model');
const Applicant = require('./applicant.model');

module.exports = (sequelize, DataTypes) => {
  class ApplicantDiplomaQualification extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
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

  ApplicantDiplomaQualification.init(
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
      institution_name: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      award_obtained: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      award_start_date: {
        type: DataTypes.DATE,
        allowNull: true,
      },
      award_end_date: {
        type: DataTypes.DATE,
        allowNull: true,
      },
      awarding_body: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      award_type: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      award_duration: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      award_classification: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      grade_obtained: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      interpretation: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },
      qualification_attachment: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      does_not_have_qualification: {
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
      modelName: 'ApplicantDiplomaQualification',
      tableName: 'applicant_diploma_qualifications',
      underscored: true,
      timestamps: true,
      schema: 'admissions_mgt',
      createdAt: 'created_at',
      updatedAt: 'updated_at',
    }
  );

  return ApplicantDiplomaQualification;
};
