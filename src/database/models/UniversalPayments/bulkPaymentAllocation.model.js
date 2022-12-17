'use strict';

const { Model, Deferrable } = require('sequelize');
const User = require('../UserAccess/user.model');

const { BulkPayment } = require('./bulkPayment.model');
const { BulkPaymentStudent } = require('./bulkPaymentStudent.model');
const { MetadataValue } = require('@models/App');

module.exports = (sequelize, DataTypes) => {
  class BulkPaymentAllocation extends Model {
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

  BulkPaymentAllocation.init(
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      bulk_payment_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          key: 'id',
          model: BulkPayment,
          deferrable: Deferrable.INITIALLY_IMMEDIATE,
        },
      },
      bulk_payment_student_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          key: 'id',
          model: BulkPaymentStudent,
          deferrable: Deferrable.INITIALLY_IMMEDIATE,
        },
      },
      academic_year: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          key: 'id',
          model: MetadataValue,
          deferrable: Deferrable.INITIALLY_IMMEDIATE,
        },
      },
      semester_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          key: 'id',
          model: MetadataValue,
          deferrable: Deferrable.INITIALLY_IMMEDIATE,
        },
      },
      amount_allocated: {
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
      modelName: 'BulkPaymentAllocation',
      tableName: 'sponsor_bulk_payment_allocation',
      timestamps: true,
      underscored: true,
      schema: 'universal_payments_mgt',
      createdAt: 'created_at',
      updatedAt: 'updated_at',
      deletedAt: 'deleted_at',
    }
  );

  return BulkPaymentAllocation;
};
