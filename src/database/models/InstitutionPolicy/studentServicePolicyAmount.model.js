'use strict';

const { Model, Deferrable } = require('sequelize');

const MetadataValue = require('../App/metadataValue.model');
const ApplicationFeesPolicy = require('./applicationFeesPolicy.model');

module.exports = (sequelize, DataTypes) => {
  class StudentServicePolicyAmount extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // Model
      this.policy = this.belongsTo(models.StudentServicePolicy, {
        as: 'policy',
        foreignKey: 'policy_id',
      });
      // Model
      this.billingCategory = this.belongsTo(models.MetadataValue, {
        as: 'billingCategory',
        foreignKey: 'billing_category_id',
      });
      // Model
      this.currency = this.belongsTo(models.MetadataValue, {
        as: 'currency',
        foreignKey: 'currency_id',
      });
    }
  }

  StudentServicePolicyAmount.init(
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      policy_id: {
        type: DataTypes.BIGINT,
        allowNull: false,
        references: {
          key: 'id',
          model: ApplicationFeesPolicy,
          deferrable: Deferrable.INITIALLY_IMMEDIATE,
        },
      },
      billing_category_id: {
        type: DataTypes.BIGINT,
        allowNull: false,
        references: {
          key: 'id',
          model: MetadataValue,
          deferrable: Deferrable.INITIALLY_IMMEDIATE,
        },
      },
      currency_id: {
        type: DataTypes.BIGINT,
        allowNull: false,
        references: {
          key: 'id',
          model: MetadataValue,
          deferrable: Deferrable.INITIALLY_IMMEDIATE,
        },
      },
      amount: {
        type: DataTypes.DOUBLE,
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
      modelName: 'StudentServicePolicyAmount',
      tableName: 'student_services_policy_amounts',
      underscored: true,
      timestamps: true,
      schema: 'institution_policy_mgt',
      createdAt: 'created_at',
      updatedAt: 'updated_at',
    }
  );

  return StudentServicePolicyAmount;
};
