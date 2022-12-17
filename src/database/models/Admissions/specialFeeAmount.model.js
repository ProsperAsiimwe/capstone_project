'use strict';

const { Model, Deferrable } = require('sequelize');

const MetadataValue = require('../App/metadataValue.model');
const RunningAdmissionProgrammeSpecialFee = require('./runningAdmissionProgrammeSpecialFee.model');

module.exports = (sequelize, DataTypes) => {
  class SpecialFeeAmount extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // Model
      this.specialFee = this.belongsTo(
        models.RunningAdmissionProgrammeSpecialFee,
        {
          as: 'specialFee',
          foreignKey: 'programme_special_fees_id',
        }
      );
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

  SpecialFeeAmount.init(
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      programme_special_fees_id: {
        type: DataTypes.BIGINT,
        allowNull: false,
        references: {
          key: 'id',
          model: RunningAdmissionProgrammeSpecialFee,
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
      modelName: 'SpecialFeeAmount',
      tableName: 'special_fee_amounts',
      underscored: true,
      timestamps: true,
      schema: 'admissions_mgt',
      createdAt: 'created_at',
      updatedAt: 'updated_at',
    }
  );

  return SpecialFeeAmount;
};
