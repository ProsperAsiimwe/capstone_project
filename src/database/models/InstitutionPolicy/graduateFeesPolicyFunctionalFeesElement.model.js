'use strict';

const { Model, Deferrable } = require('sequelize');

const GraduateFeesPolicy = require('./graduateFeesPolicy.model');
const FeesElement = require('../FeesManager/feesElement.model');

module.exports = (sequelize, DataTypes) => {
  class GraduateFeesPolicyFunctionalFeesElement extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      this.policy = this.belongsTo(models.GraduateFeesPolicy, {
        as: 'policy',
        foreignKey: 'graduate_fees_policy_id',
      });

      this.feesElement = this.belongsTo(models.FeesElement, {
        as: 'feesElement',
        foreignKey: 'functional_fees_element_id',
      });
    }
  }

  GraduateFeesPolicyFunctionalFeesElement.init(
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      graduate_fees_policy_id: {
        type: DataTypes.BIGINT,
        allowNull: false,
        references: {
          key: 'id',
          model: GraduateFeesPolicy,
          deferrable: Deferrable.INITIALLY_IMMEDIATE,
        },
      },
      functional_fees_element_id: {
        type: DataTypes.BIGINT,
        allowNull: false,
        references: {
          key: 'id',
          model: FeesElement,
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
      modelName: 'GraduateFeesPolicyFunctionalFeesElement',
      tableName: 'graduate_fees_policy_functional_fees_elements',
      underscored: true,
      timestamps: true,
      schema: 'institution_policy_mgt',
      createdAt: 'created_at',
      updatedAt: 'updated_at',
      deletedAt: 'deleted_at',
    }
  );

  return GraduateFeesPolicyFunctionalFeesElement;
};
