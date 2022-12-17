'use strict';

const { Model, Deferrable } = require('sequelize');
const PaymentTransaction = require('./paymentTransaction.model');

const uppercaseFirst = (str) => `${str[0].toUpperCase()}${str.substr(1)}`;

module.exports = (sequelize, DataTypes) => {
  class PaymentTransactionAllocation extends Model {
    getRecord(options) {
      if (!this.invoice_type) return Promise.resolve(null);
      const mixinMethodName = `get${uppercaseFirst(this.invoice_type)}`;

      return this[mixinMethodName](options);
    }

    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      //
      this.paymentTransaction = this.belongsTo(models.PaymentTransaction, {
        as: 'paymentTransaction',
        foreignKey: 'transaction_id',
      });
      //
      this.functionalFeesInvoice = this.belongsTo(
        models.EnrollmentFunctionalFeesInvoice,
        {
          as: 'functionalFeesInvoice',
          foreignKey: 'invoice_id',
          constraints: false,
        }
      );
      this.otherFeesInvoice = this.belongsTo(
        models.EnrollmentOtherFeesInvoice,
        {
          as: 'otherFeesInvoice',
          foreignKey: 'invoice_id',
          constraints: false,
        }
      );
      this.tuitionInvoice = this.belongsTo(models.EnrollmentTuitionInvoice, {
        as: 'tuitionInvoice',
        foreignKey: 'invoice_id',
        constraints: false,
      });
      this.manualInvoice = this.belongsTo(models.EnrollmentManualInvoice, {
        as: 'manualInvoice',
        foreignKey: 'invoice_id',
        constraints: false,
      });
      this.graduationInvoice = this.belongsTo(models.GraduationFeesInvoice, {
        as: 'graduationInvoice',
        foreignKey: 'invoice_id',
        constraints: false,
      });
    }
  }

  PaymentTransactionAllocation.init(
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      transaction_id: {
        type: DataTypes.BIGINT,
        allowNull: false,
        references: {
          key: 'id',
          model: PaymentTransaction,
          deferrable: Deferrable.INITIALLY_IMMEDIATE,
        },
      },
      invoice_id: {
        type: DataTypes.BIGINT,
        allowNull: true,
      },
      invoice_type: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      amount: {
        type: DataTypes.DOUBLE,
        allowNull: false,
      },

      //
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
      modelName: 'PaymentTransactionAllocation',
      tableName: 'payment_transaction_allocations',
      underscored: true,
      timestamps: true,
      schema: 'enrollment_and_registration_mgt',
      createdAt: 'created_at',
      updatedAt: 'updated_at',
    }
  );

  PaymentTransactionAllocation.addHook('afterFind', (findResult) => {
    if (!Array.isArray(findResult)) findResult = [findResult];
    for (const instance of findResult) {
      if (
        instance.invoice_type === 'tuitionInvoice' &&
        instance.tuitionInvoice !== undefined
      ) {
        instance.invoice_id = instance.tuitionInvoice;
      } else if (
        instance.invoice_type === 'functionalFeesInvoice' &&
        instance.functionalFeesInvoice !== undefined
      ) {
        instance.invoice_id = instance.functionalFeesInvoice;
      } else if (
        instance.invoice_type === 'otherFeesInvoice' &&
        instance.otherFeesInvoice !== undefined
      ) {
        instance.invoice_id = instance.otherFeesInvoice;
      } else if (
        instance.invoice_type === 'manualInvoice' &&
        instance.manualInvoice !== undefined
      ) {
        instance.invoice_id = instance.manualInvoice;
      } else if (
        instance.invoice_type === 'graduationInvoice' &&
        instance.graduationInvoice !== undefined
      ) {
        instance.invoice_id = instance.graduationInvoice;
      }
      // To prevent mistakes:
      delete instance.tuitionInvoice;
      delete instance.dataValues.tuitionInvoice;
      delete instance.functionalFeesInvoice;
      delete instance.dataValues.functionalFeesInvoice;
      delete instance.otherFeesInvoice;
      delete instance.dataValues.otherFeesInvoice;
      delete instance.manualInvoice;
      delete instance.dataValues.manualInvoice;
      delete instance.graduationInvoice;
      delete instance.dataValues.graduationInvoice;
    }
  });

  return PaymentTransactionAllocation;
};
