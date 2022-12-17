'use strict';

const { Model, Deferrable } = require('sequelize');

const MigratedApplicant = require('./migratedApplicantBiodata.model');

module.exports = (sequelize, DataTypes) => {
  class MigratedApplicantRefereeDetail extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // Get from model.
    }
  }

  MigratedApplicantRefereeDetail.init(
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
      referee_name: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      referee_email: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      referee_phone: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      referee_address: {
        type: DataTypes.STRING,
        allowNull: false,
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
      modelName: 'MigratedApplicantRefereeDetail',
      tableName: 'migrated_applicant_referee_details',
      underscored: true,
      timestamps: true,
      schema: 'admissions_mgt',
      createdAt: 'created_at',
      updatedAt: 'updated_at',
    }
  );

  return MigratedApplicantRefereeDetail;
};
