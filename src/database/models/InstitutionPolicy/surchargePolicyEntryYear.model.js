'use strict';

const { Model, Deferrable } = require('sequelize');

const SurchargePolicy = require('./surchargePolicy.model');
const MetadataValue = require('../App/metadataValue.model');

module.exports = (sequelize, DataTypes) => {
  class SurchargePolicyEntryYear extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      this.surchargePolicy = this.belongsTo(models.SurchargePolicy, {
        as: 'surchargePolicy',
        foreignKey: 'surcharge_policy_id',
      });
      this.entryAcademicYear = this.belongsTo(models.MetadataValue, {
        as: 'entryAcademicYear',
        foreignKey: 'entry_academic_year_id',
      });
    }
  }

  SurchargePolicyEntryYear.init(
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      surcharge_policy_id: {
        type: DataTypes.BIGINT,
        allowNull: false,
        references: {
          key: 'id',
          model: SurchargePolicy,
          deferrable: Deferrable.INITIALLY_IMMEDIATE,
        },
      },
      entry_academic_year_id: {
        type: DataTypes.BIGINT,
        allowNull: false,
        references: {
          key: 'id',
          model: MetadataValue,
          deferrable: Deferrable.INITIALLY_IMMEDIATE,
        },
      },
      duration: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },

      // Record Details
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
      modelName: 'SurchargePolicyEntryYear',
      tableName: 'surcharge_policy_entry_years',
      underscored: true,
      timestamps: true,
      schema: 'enrollment_and_registration_mgt',
      createdAt: 'created_at',
      updatedAt: 'updated_at',
    }
  );

  return SurchargePolicyEntryYear;
};
