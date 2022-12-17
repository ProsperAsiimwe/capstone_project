'use strict';

const { Model, Deferrable } = require('sequelize');

const MigratedApplicant = require('./migratedApplicantBiodata.model');

module.exports = (sequelize, DataTypes) => {
  class MigratedApplicantEmploymentRecord extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // Get from model.
    }
  }

  MigratedApplicantEmploymentRecord.init(
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
      employer: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      post_held: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      employment_start_date: {
        type: DataTypes.DATEONLY,
        allowNull: false,
      },
      employment_end_date: {
        type: DataTypes.DATEONLY,
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
      modelName: 'MigratedApplicantEmploymentRecord',
      tableName: 'migrated_applicant_employment_records',
      underscored: true,
      timestamps: true,
      schema: 'admissions_mgt',
      createdAt: 'created_at',
      updatedAt: 'updated_at',
    }
  );

  return MigratedApplicantEmploymentRecord;
};
