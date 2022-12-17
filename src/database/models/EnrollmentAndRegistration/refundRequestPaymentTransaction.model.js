'use strict';

const { Model, Deferrable } = require('sequelize');

const RefundRequest = require('./refundRequest.model');
const PaymentTransaction = require('./paymentTransaction.model');

module.exports = (sequelize, DataTypes) => {
  class RefundRequestPaymentTransaction extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // refundRequest
      this.refundRequest = this.belongsTo(models.RefundRequest, {
        as: 'refundRequest',
        foreignKey: 'refund_request_id',
      });
      // paymentTransaction
      this.paymentTransaction = this.belongsTo(models.PaymentTransaction, {
        as: 'paymentTransaction',
        foreignKey: 'payment_transaction_id',
      });
    }
  }

  RefundRequestPaymentTransaction.init(
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      refund_request_id: {
        type: DataTypes.BIGINT,
        allowNull: false,
        references: {
          key: 'id',
          model: RefundRequest,
          deferrable: Deferrable.INITIALLY_IMMEDIATE,
        },
      },
      payment_transaction_id: {
        type: DataTypes.BIGINT,
        allowNull: false,
        references: {
          key: 'id',
          model: PaymentTransaction,
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
      modelName: 'RefundRequestPaymentTransaction',
      tableName: 'refund_request_payment_transactions',
      underscored: true,
      timestamps: true,
      schema: 'enrollment_and_registration_mgt',
      createdAt: 'created_at',
      updatedAt: 'updated_at',
    }
  );

  return RefundRequestPaymentTransaction;
};
