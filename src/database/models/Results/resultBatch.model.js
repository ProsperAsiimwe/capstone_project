'use strict';

const { Model, Deferrable } = require('sequelize');
const User = require('../UserAccess/user.model');
const Result = require('./result.model');

module.exports = (sequelize, DataTypes) => {
  class ResultBatch extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      //
      this.result = this.belongsTo(models.Result, {
        as: 'result',
        foreignKey: 'result_id',
      });
      // The User who approved the Deletion to this Record
      this.uploader = this.belongsTo(models.User, {
        as: 'uploader',
        foreignKey: 'uploaded_by_id',
      });
    }
  }

  ResultBatch.init(
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      result_id: {
        type: DataTypes.BIGINT,
        allowNull: true,
        references: {
          key: 'id',
          model: Result,
          deferrable: Deferrable.INITIALLY_IMMEDIATE,
        },
      },
      uploaded_by_id: {
        type: DataTypes.BIGINT,
        allowNull: true,
        references: {
          key: 'id',
          model: User,
          deferrable: Deferrable.INITIALLY_IMMEDIATE,
        },
      },
      batch_number: {
        type: DataTypes.STRING,
        allowNull: false,
      },

      // Record Details.
      created_at: {
        type: DataTypes.DATE,
        allowNull: true,
      },
      updated_at: {
        type: DataTypes.DATE,
        allowNull: true,
      },
      create_approved_by_id: {
        type: DataTypes.BIGINT,
        allowNull: true,
        references: {
          key: 'id',
          model: User,
          deferrable: Deferrable.INITIALLY_IMMEDIATE,
        },
      },
      create_approval_date: {
        type: DataTypes.DATE,
        allowNull: true,
      },
      create_approval_status: {
        type: DataTypes.STRING,
        defaultValue: 'PENDING',
      },

      last_update_approved_by_id: {
        type: DataTypes.BIGINT,
        allowNull: true,
        references: {
          key: 'id',
          model: User,
          deferrable: Deferrable.INITIALLY_IMMEDIATE,
        },
      },

      last_updated_by_id: {
        type: DataTypes.BIGINT,
        allowNull: true,
        references: {
          key: 'id',
          model: User,
          deferrable: Deferrable.INITIALLY_IMMEDIATE,
        },
      },
      last_update_approval_date: {
        type: DataTypes.DATE,
        allowNull: true,
      },
      last_update_approval_status: {
        type: DataTypes.STRING,
        defaultValue: 'PENDING',
      },

      delete_approved_by_id: {
        type: DataTypes.BIGINT,
        allowNull: true,
        references: {
          key: 'id',
          model: User,
          deferrable: Deferrable.INITIALLY_IMMEDIATE,
        },
      },

      deleted_by_id: {
        type: DataTypes.BIGINT,
        allowNull: true,
        references: {
          key: 'id',
          model: User,
          deferrable: Deferrable.INITIALLY_IMMEDIATE,
        },
      },
      delete_approval_date: {
        type: DataTypes.DATE,
        allowNull: true,
      },
      delete_approval_status: {
        type: DataTypes.STRING,
        defaultValue: 'PENDING',
      },
    },

    {
      sequelize,
      modelName: 'ResultBatch',
      tableName: 'result_batches',
      timestamps: true,
      underscored: true,
      schema: 'results_mgt',
      createdAt: 'created_at',
      updatedAt: 'updated_at',
    }
  );

  return ResultBatch;
};
