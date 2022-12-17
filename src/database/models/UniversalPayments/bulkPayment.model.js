'use strict';

const { Model, Deferrable } = require('sequelize');
const User = require('../UserAccess/user.model');
const moment = require('moment');
const Sponsor = require('./sponsor.model');

module.exports = (sequelize, DataTypes) => {
  class BulkPayment extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // The User who Created this Record
      this.createdBy = this.belongsTo(models.User, {
        as: 'createdBy',
        foreignKey: 'created_by_id',
      });

      // The User who Last Updated this Record
      this.lastUpdatedBy = this.belongsTo(models.User, {
        as: 'lastUpdatedBy',
        foreignKey: 'last_updated_by_id',
      });

      // The User who Deleted this Record
      this.deletedBy = this.belongsTo(models.User, {
        as: 'deletedBy',
        foreignKey: 'deleted_by_id',
      });
    }
  }

  BulkPayment.init(
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      uuid: {
        type: DataTypes.STRING,
        unique: true,
        allowNull: false,
      },
      sponsor: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      sponsor_id: {
        type: DataTypes.INTEGER,
        allowNull: true,
        references: {
          key: 'id',
          model: Sponsor,
          deferrable: Deferrable.INITIALLY_IMMEDIATE,
        },
      },
      sponsor_description: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      amount_paid: {
        type: DataTypes.DOUBLE,
        allowNull: false,
      },
      allocated_amount: {
        type: DataTypes.DOUBLE,
        allowNull: true,
      },
      unallocated_amount: {
        type: DataTypes.DOUBLE,
        allowNull: true,
      },
      payment_date: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      payment_bank: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      payment_bank_code: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      payment_bank_branch: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      payment_mode: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      payment_mobile_no: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      narration: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      transaction_code: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      currency: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      payment_forwarded: {
        type: DataTypes.BOOLEAN,
        allowNull: true,
        defaultValue: false,
      },
      forwarded_on: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      email_sent: {
        type: DataTypes.BOOLEAN,
        allowNull: true,
        defaultValue: false,
      },
      email_sent_on: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      payment_acknowledged: {
        type: DataTypes.BOOLEAN,
        allowNull: true,
        defaultValue: false,
      },
      acknowledge_prn: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      acknowledged_on: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      acknowledged_by: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      system_prn: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      search_code: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      expiry_date: {
        type: DataTypes.DATEONLY,
        get: function () {
          return moment
            .utc(this.getDataValue('expiry_date'))
            .format('YYYY.MM.DD');
        },
        allowNull: true,
      },
      // approved: {
      //   type: DataTypes.BOOLEAN,
      //   allowNull: true,
      //   defaultValue: false,
      // },
      // approved_by: {
      //   type: DataTypes.STRING,
      //   allowNull: true,
      // },
      // approval_date: {
      //   type: DataTypes.DATEONLY,
      //   get: function () {
      //     return moment
      //       .utc(this.getDataValue('approval_date'))
      //       .format('YYYY.MM.DD');
      //   },
      //   allowNull: true,
      // },

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
      created_by_id: {
        type: DataTypes.INTEGER,
        allowNull: true,
        references: {
          key: 'id',
          model: User,
          deferrable: Deferrable.INITIALLY_IMMEDIATE,
        },
      },
      last_updated_by_id: {
        type: DataTypes.INTEGER,
        allowNull: true,
        references: {
          key: 'id',
          model: User,
          deferrable: Deferrable.INITIALLY_IMMEDIATE,
        },
      },
      deleted_by_id: {
        type: DataTypes.INTEGER,
        allowNull: true,
        references: {
          key: 'id',
          model: User,
          deferrable: Deferrable.INITIALLY_IMMEDIATE,
        },
      },
    },

    {
      sequelize,
      modelName: 'BulkPayment',
      tableName: 'bulk_payments',
      timestamps: true,
      underscored: true,
      schema: 'universal_payments_mgt',
      createdAt: 'created_at',
      updatedAt: 'updated_at',
      deletedAt: 'deleted_at',
    }
  );

  return BulkPayment;
};
