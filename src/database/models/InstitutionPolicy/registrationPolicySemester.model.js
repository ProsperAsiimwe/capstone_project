'use strict';

const { Model, Deferrable } = require('sequelize');

const RegistrationPolicy = require('./registrationPolicy.model');
const MetadataValue = require('../App/metadataValue.model');

module.exports = (sequelize, DataTypes) => {
  class RegistrationPolicySemester extends Model {
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
      this.semester = this.belongsTo(models.MetadataValue, {
        as: 'semester',
        foreignKey: 'semester_id',
      });
    }
  }

  RegistrationPolicySemester.init(
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
      semester_id: {
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
      modelName: 'RegistrationPolicySemester',
      tableName: 'registration_policy_semesters',
      underscored: true,
      timestamps: true,
      schema: 'enrollment_and_registration_mgt',
      createdAt: 'created_at',
      updatedAt: 'updated_at',
    }
  );

  return RegistrationPolicySemester;
};
