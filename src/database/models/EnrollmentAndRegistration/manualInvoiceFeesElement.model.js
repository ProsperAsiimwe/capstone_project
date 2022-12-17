'use strict';

const { Model, Deferrable } = require('sequelize');

const EnrollmentManualInvoice = require('./enrollmentManualInvoice.model');
const FeesElement = require('../FeesManager/feesElement.model');

module.exports = (sequelize, DataTypes) => {
  class ManualInvoiceFeesElement extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // invoice
      this.invoice = this.belongsTo(models.EnrollmentManualInvoice, {
        as: 'invoice',
        foreignKey: 'manual_invoice_id',
      });
      // fees element
      this.feesElement = this.belongsTo(models.FeesElement, {
        as: 'feesElement',
        foreignKey: 'fees_element_id',
      });
    }
  }

  ManualInvoiceFeesElement.init(
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      manual_invoice_id: {
        type: DataTypes.BIGINT,
        allowNull: false,
        references: {
          key: 'id',
          model: EnrollmentManualInvoice,
          deferrable: Deferrable.INITIALLY_IMMEDIATE,
        },
      },
      fees_element_id: {
        type: DataTypes.BIGINT,
        allowNull: false,
        references: {
          key: 'id',
          model: FeesElement,
          deferrable: Deferrable.INITIALLY_IMMEDIATE,
        },
      },
      fees_element_description: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      quantity: {
        type: DataTypes.DOUBLE,
        allowNull: false,
      },
      unit_amount: {
        type: DataTypes.DOUBLE,
        allowNull: false,
      },
      amount: {
        type: DataTypes.DOUBLE,
        allowNull: false,
      },
      currency: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      amount_paid: {
        type: DataTypes.DOUBLE,
        allowNull: true,
      },
      cleared: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
        allowNull: true,
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
      modelName: 'ManualInvoiceFeesElement',
      tableName: 'manual_invoice_fees_elements',
      underscored: true,
      timestamps: true,
      schema: 'enrollment_and_registration_mgt',
      createdAt: 'created_at',
      updatedAt: 'updated_at',
    }
  );

  return ManualInvoiceFeesElement;
};
