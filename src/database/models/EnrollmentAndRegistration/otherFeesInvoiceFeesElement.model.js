'use strict';

const { Model, Deferrable } = require('sequelize');

const EnrollmentOtherFeesInvoice = require('./enrollmentOtherFeesInvoice.model');
const FeesElement = require('../FeesManager/feesElement.model');

module.exports = (sequelize, DataTypes) => {
  class OtherFeesInvoiceFeesElement extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // invoice
      this.invoice = this.belongsTo(models.EnrollmentOtherFeesInvoice, {
        as: 'invoice',
        foreignKey: 'other_fees_invoice_id',
      });
      // fees element
      this.feesElement = this.belongsTo(models.FeesElement, {
        as: 'feesElement',
        foreignKey: 'fees_element_id',
      });
    }
  }

  OtherFeesInvoiceFeesElement.init(
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      other_fees_invoice_id: {
        type: DataTypes.BIGINT,
        allowNull: false,
        references: {
          key: 'id',
          model: EnrollmentOtherFeesInvoice,
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
      fees_element_code: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      fees_element_name: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      fees_element_category: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      currency: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      amount: {
        type: DataTypes.DOUBLE,
        allowNull: false,
      },
      new_amount: {
        type: DataTypes.DOUBLE,
        allowNull: true,
      },
      discounted_amount: {
        type: DataTypes.DOUBLE,
        allowNull: true,
      },
      percentage_discount: {
        type: DataTypes.DOUBLE,
        allowNull: true,
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
      modelName: 'OtherFeesInvoiceFeesElement',
      tableName: 'other_fees_invoice_fees_elements',
      underscored: true,
      timestamps: true,
      schema: 'enrollment_and_registration_mgt',
      createdAt: 'created_at',
      updatedAt: 'updated_at',
    }
  );

  return OtherFeesInvoiceFeesElement;
};
