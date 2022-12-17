'use strict';

const { Model, Deferrable } = require('sequelize');

const PaymentReference = require('./paymentReference.model');
const EnrollmentManualInvoice = require('./enrollmentManualInvoice.model');

module.exports = (sequelize, DataTypes) => {
  class PaymentReferenceManualInvoice extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      this.paymentReference = this.belongsTo(models.PaymentReference, {
        as: 'paymentReference',
        foreignKey: 'payment_reference_id',
      });
      this.manualInvoice = this.belongsTo(models.EnrollmentManualInvoice, {
        as: 'manualInvoice',
        foreignKey: 'manual_invoice_id',
      });
    }
  }

  PaymentReferenceManualInvoice.init(
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      payment_reference_id: {
        type: DataTypes.BIGINT,
        allowNull: false,
        references: {
          key: 'id',
          model: PaymentReference,
          deferrable: Deferrable.INITIALLY_IMMEDIATE,
        },
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
      amount: {
        type: DataTypes.DOUBLE,
        allowNull: false,
        defaultValue: 0.0,
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
      modelName: 'PaymentReferenceManualInvoice',
      tableName: 'payment_reference_manual_invoices',
      underscored: true,
      timestamps: true,
      schema: 'enrollment_and_registration_mgt',
      createdAt: 'created_at',
      updatedAt: 'updated_at',
    }
  );

  return PaymentReferenceManualInvoice;
};
