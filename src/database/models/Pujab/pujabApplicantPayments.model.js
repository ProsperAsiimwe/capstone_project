'use strict';

const { Model, Deferrable } = require('sequelize');
const moment = require('moment');
const PujabApplication = require('./pujabApplication.model');

module.exports = (sequelize, DataTypes) => {
  class PujabApplicantPayment extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      this.applicant = this.belongsTo(models.PujabApplication, {
        as: 'applicant',
        foreignKey: 'pujab_application_id',
      });
    }
  }

  PujabApplicantPayment.init(
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      pujab_application_id: {
        type: DataTypes.BIGINT,
        allowNull: false,
        references: {
          key: 'id',
          model: PujabApplication,
          deferrable: Deferrable.INITIALLY_IMMEDIATE,
        },
      },
      ura_prn: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
      },
      system_prn: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
      },
      bank: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      branch: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      banktxnid: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      payment_date: {
        type: DataTypes.DATEONLY,
        get: function () {
          return moment
            .utc(this.getDataValue('payment_date'))
            .format('YYYY.MM.DD');
        },
        allowNull: false,
      },
      amount_billed: {
        type: DataTypes.DOUBLE,
        allowNull: false,
      },
      amount_paid: {
        type: DataTypes.DOUBLE,
        allowNull: false,
      },
      signature: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      narration: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      payment_status: {
        type: DataTypes.STRING,
        defaultValue: 'A',
      },
      payment_status_description: {
        type: DataTypes.STRING,
        defaultValue: 'AVAILABLE',
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
      deleted_at: {
        type: DataTypes.DATE,
        allowNull: true,
      },
    },
    {
      sequelize,
      modelName: 'PujabApplicantPayment',
      tableName: 'pujab_application_payments',
      underscored: true,
      timestamps: true,
      schema: 'pujab_mgt',
      createdAt: 'created_at',
      updatedAt: 'updated_at',
      deletedAt: 'deleted_at',
    }
  );

  return PujabApplicantPayment;
};
