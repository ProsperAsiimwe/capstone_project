'use strict';

const { Model, Deferrable } = require('sequelize');
const ApplicantOLevelData = require('./applicantOLevelData.model');
const UnebSubject = require('../ProgrammeManager/unebSubject.model');

module.exports = (sequelize, DataTypes) => {
  class ApplicantALevelDataSubject extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {}
  }

  ApplicantALevelDataSubject.init(
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      applicant_a_level_data_id: {
        type: DataTypes.BIGINT,
        allowNull: false,
        references: {
          key: 'id',
          model: ApplicantOLevelData,
          deferrable: Deferrable.INITIALLY_IMMEDIATE,
        },
      },
      uneb_subject_id: {
        type: DataTypes.BIGINT,
        allowNull: true,
        references: {
          key: 'id',
          model: UnebSubject,
          deferrable: Deferrable.INITIALLY_IMMEDIATE,
        },
      },
      result: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      interpretation: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      code: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      name: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      paper_category: {
        type: DataTypes.STRING,
        allowNull: true,
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
      modelName: 'ApplicantALevelDataSubject',
      tableName: 'applicant_a_level_data_subjects',
      underscored: true,
      timestamps: true,
      schema: 'admissions_mgt',
      createdAt: 'created_at',
      updatedAt: 'updated_at',
    }
  );

  return ApplicantALevelDataSubject;
};
