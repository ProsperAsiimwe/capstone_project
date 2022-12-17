'use strict';

const { Model, Deferrable } = require('sequelize');

const GraduationFeesInvoice = require('./graduationFeesInvoice.model');
const FeesElement = require('../FeesManager/feesElement.model');

module.exports = (sequelize, DataTypes) => {
  class GraduationFeesInvoiceElement extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // invoice
      this.invoice = this.belongsTo(models.GraduationFeesInvoice, {
        as: 'invoice',
        foreignKey: 'graduation_fee_invoice_id',
      });
      // fees element
      this.feesElement = this.belongsTo(models.FeesElement, {
        as: 'feesElement',
        foreignKey: 'fees_element_id',
      });
    }
  }

  GraduationFeesInvoiceElement.init(
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      graduation_fee_invoice_id: {
        type: DataTypes.BIGINT,
        allowNull: false,
        references: {
          key: 'id',
          model: GraduationFeesInvoice,
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
      currency: {
        type: DataTypes.STRING,
        allowNull: false,
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
      modelName: 'GraduationFeesInvoiceElement',
      tableName: 'graduation_fee_invoice_elements',
      underscored: true,
      timestamps: true,
      schema: 'results_mgt',
      createdAt: 'created_at',
      updatedAt: 'updated_at',
    }
  );

  return GraduationFeesInvoiceElement;
};
