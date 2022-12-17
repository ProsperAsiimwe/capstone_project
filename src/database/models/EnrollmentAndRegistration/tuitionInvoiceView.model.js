'use strict';

const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class TuitionInvoiceView extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {}
  }

  TuitionInvoiceView.init(
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      surname: {
        type: DataTypes.STRING,
      },
      other_names: {
        type: DataTypes.STRING,
      },
      programme_code: {
        type: DataTypes.STRING,
      },
      programme_title: {
        type: DataTypes.STRING,
      },
      student_number: {
        type: DataTypes.STRING,
      },
      registration_number: {
        type: DataTypes.STRING,
      },
      invoice_type: {
        type: DataTypes.STRING,
      },
      invoice_status: {
        type: DataTypes.STRING,
      },
      currency: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      description: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      due_date: {
        type: DataTypes.DATE,
        allowNull: true,
      },
      invoice_number: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      invoice_amount: {
        type: DataTypes.DOUBLE,
      },
      amount_paid: {
        type: DataTypes.DOUBLE,
      },
      amount_due: {
        type: DataTypes.DOUBLE,
      },
      credit_note: {
        type: DataTypes.DOUBLE,
      },
      debit_note: {
        type: DataTypes.DOUBLE,
      },
      percentage_completion: {
        type: DataTypes.INTEGER,
      },
      exempted_amount: {
        type: DataTypes.DOUBLE,
      },
      exempted_percentage: {
        type: DataTypes.DOUBLE,
      },
      exemption_comments: {
        type: DataTypes.STRING,
      },
      de_allocated_amount: {
        type: DataTypes.DOUBLE,
      },
      de_allocation_comments: {
        type: DataTypes.STRING,
      },

      // Record Details
      created_at: {
        type: DataTypes.DATE,
      },
      updated_at: {
        type: DataTypes.DATE,
      },
    },
    {
      sequelize,
      modelName: 'TuitionInvoiceView',
      tableName: 'tuition_invoices_view',
      underscored: true,
      timestamps: true,
      schema: 'enrollment_and_registration_mgt',
      createdAt: 'created_at',
      updatedAt: 'updated_at',
    }
  );

  return TuitionInvoiceView;
};
