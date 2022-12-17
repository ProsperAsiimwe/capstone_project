'use strict';

const { Model, Deferrable } = require('sequelize');
const ApplicantALevelData = require('./applicantALevelData.model');
const UnebSubject = require('../ProgrammeManager/unebSubject.model');

module.exports = (sequelize, DataTypes) => {
  class ALevelPrincipalSubject extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {}
  }

  ALevelPrincipalSubject.init(
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
          model: ApplicantALevelData,
          deferrable: Deferrable.INITIALLY_IMMEDIATE,
        },
      },
      uneb_subject_id: {
        type: DataTypes.BIGINT,
        allowNull: false,
        references: {
          key: 'id',
          model: UnebSubject,
          deferrable: Deferrable.INITIALLY_IMMEDIATE,
        },
      },
      grade_obtained: {
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
      modelName: 'ALevelPrincipalSubject',
      tableName: 'applicant_a_level_data_principal_subjects',
      underscored: true,
      timestamps: true,
      schema: 'admissions_mgt',
      createdAt: 'created_at',
      updatedAt: 'updated_at',
    }
  );

  return ALevelPrincipalSubject;
};
