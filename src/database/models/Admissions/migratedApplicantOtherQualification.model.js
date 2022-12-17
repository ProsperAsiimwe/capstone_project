'use strict';

const { Model, Deferrable } = require('sequelize');

const MigratedApplicant = require('./migratedApplicantBiodata.model');

module.exports = (sequelize, DataTypes) => {
  class MigratedApplicantOtherQualification extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // Get from model.
    }
  }

  MigratedApplicantOtherQualification.init(
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      migrated_applicant_id: {
        type: DataTypes.BIGINT,
        allowNull: false,
        references: {
          key: 'id',
          model: MigratedApplicant,
          deferrable: Deferrable.INITIALLY_IMMEDIATE,
        },
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
        type: DataTypes.DATEONLY,
        allowNull: true,
      },
      award_end_date: {
        type: DataTypes.DATEONLY,
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
      qualification_attachment: {
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
      modelName: 'MigratedApplicantOtherQualification',
      tableName: 'migrated_applicant_other_qualifications',
      underscored: true,
      timestamps: true,
      schema: 'admissions_mgt',
      createdAt: 'created_at',
      updatedAt: 'updated_at',
    }
  );

  return MigratedApplicantOtherQualification;
};
