'use strict';

const { Model, Deferrable } = require('sequelize');

const RegistrationPolicy = require('./registrationPolicy.model');
const MetadataValue = require('../App/metadataValue.model');

module.exports = (sequelize, DataTypes) => {
  class RegPolicyEntryAcademicYear extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      this.registrationPolicy = this.belongsTo(models.RegistrationPolicy, {
        as: 'registrationPolicy',
        foreignKey: 'registration_policy_id',
      });
      this.entryAcademicYear = this.belongsTo(models.MetadataValue, {
        as: 'entryAcademicYear',
        foreignKey: 'entry_academic_year_id',
      });
    }
  }

  RegPolicyEntryAcademicYear.init(
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      registration_policy_id: {
        type: DataTypes.BIGINT,
        allowNull: false,
        references: {
          key: 'id',
          model: RegistrationPolicy,
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
      modelName: 'RegPolicyEntryAcademicYear',
      tableName: 'policy_entry_academic_years',
      underscored: true,
      timestamps: true,
      schema: 'enrollment_and_registration_mgt',
      createdAt: 'created_at',
      updatedAt: 'updated_at',
    }
  );

  return RegPolicyEntryAcademicYear;
};
