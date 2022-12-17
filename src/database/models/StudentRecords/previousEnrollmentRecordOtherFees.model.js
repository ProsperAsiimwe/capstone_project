'use strict';

const { Model, Deferrable } = require('sequelize');
const moment = require('moment');
const PreviousEnrollmentRecord = require('./previousEnrollmentRecord.model');

module.exports = (sequelize, DataTypes) => {
  class PreviousEnrollmentRecordOtherFees extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */

    static associate(models) {
      //
      this.previousRecord = this.belongsTo(models.PreviousEnrollmentRecord, {
        as: 'previousRecord',
        foreignKey: 'migrated_record_id',
      });
    }
  }

  PreviousEnrollmentRecordOtherFees.init(
    {
      id: {
        type: DataTypes.BIGINT,
        primaryKey: true,
        autoIncrement: true,
      },
      migrated_record_id: {
        type: DataTypes.BIGINT,
        allowNull: false,
        references: {
          key: 'id',
          model: PreviousEnrollmentRecord,
          deferrable: Deferrable.INITIALLY_IMMEDIATE,
        },
      },
      other_invoice_no: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
      },
      other_amount: {
        type: DataTypes.DOUBLE,
        allowNull: false,
      },
      other_credit: {
        type: DataTypes.DOUBLE,
        allowNull: false,
      },
      other_paid: {
        type: DataTypes.DOUBLE,
        allowNull: false,
      },
      other_balance_due: {
        type: DataTypes.DOUBLE,
        allowNull: false,
      },
      other_fees_narration: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      total_bill: {
        type: DataTypes.DOUBLE,
        allowNull: true,
      },
      total_credit: {
        type: DataTypes.DOUBLE,
        allowNull: true,
      },
      total_paid: {
        type: DataTypes.DOUBLE,
        allowNull: true,
      },
      total_due: {
        type: DataTypes.DOUBLE,
        allowNull: true,
      },
      is_billed: {
        type: DataTypes.BOOLEAN,
        allowNull: true,
        defaultValue: false,
      },

      // Record Details
      created_at: {
        type: DataTypes.DATE,
        allowNull: true,
        defaultValue: moment.now(),
      },
      updated_at: {
        type: DataTypes.DATE,
        allowNull: true,
      },
    },
    {
      sequelize,
      modelName: 'PreviousEnrollmentRecordOtherFees',
      tableName: 'migrated_enrollment_record_other_fees',
      underscored: true,
      timestamps: true,
      schema: 'students_data',
      createdAt: 'created_at',
      updatedAt: 'updated_at',
    }
  );

  return PreviousEnrollmentRecordOtherFees;
};
