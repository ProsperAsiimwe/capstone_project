'use strict';

const { Model, Deferrable } = require('sequelize');
const User = require('../UserAccess/user.model');

module.exports = (sequelize, DataTypes) => {
  class StudentRecordsLog extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // The User who Created this Record
      this.user = this.belongsTo(models.User, {
        as: 'user',
        foreignKey: 'user_id',
      });
    }
  }

  StudentRecordsLog.init(
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      user_id: {
        type: DataTypes.BIGINT,
        allowNull: false,
        references: {
          key: 'id',
          model: User,
          deferrable: Deferrable.INITIALLY_IMMEDIATE,
        },
      },
      permission: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      previous_data: {
        type: DataTypes.JSON,
        allowNull: true,
      },
      current_data: {
        type: DataTypes.JSON,
        allowNull: true,
      },
      operation: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      area_accessed: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      location: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      ip_address: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      user_agent: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      token: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      action_status: {
        type: DataTypes.BOOLEAN,
        allowNull: true,
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
      modelName: 'StudentRecordsLog',
      tableName: 'student_records_logs',
      underscored: true,
      timestamps: true,
      schema: 'app_mgt',
      createdAt: 'created_at',
      updatedAt: 'updated_at',
    }
  );

  return StudentRecordsLog;
};
