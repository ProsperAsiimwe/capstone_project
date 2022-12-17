'use strict';

const { Model, Deferrable } = require('sequelize');
const { Student } = require('./students.model');
const User = require('../UserAccess/user.model');

module.exports = (sequelize, DataTypes) => {
  class StudentMgtActivityLog extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // Get from model.
      this.staffUser = this.belongsTo(models.User, {
        as: 'staffUser',
        foreignKey: 'staff_id',
      });
      this.studentAccount = this.belongsTo(models.Student, {
        as: 'studentAccount',
        foreignKey: 'student_id',
      });
    }
  }

  StudentMgtActivityLog.init(
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      activity_name: {
        type: DataTypes.STRING,
        allowNull: true,
        values: ['UPDATE', 'READ', 'DELETE', 'CREATE'],
      },
      activity_description: {
        type: DataTypes.TEXT,
        allowNull: false,
      },
      table_name: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      old_properties: {
        type: DataTypes.JSON,
        allowNull: true,
      },
      new_properties: {
        type: DataTypes.JSON,
        allowNull: false,
      },
      ip_address: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      roles: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      permissions: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      origin: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      user_agent: {
        type: DataTypes.JSON,
        allowNull: false,
      },
      staff_id: {
        type: DataTypes.INTEGER,
        allowNull: true,
        references: {
          key: 'id',
          model: User,
          deferrable: Deferrable.INITIALLY_IMMEDIATE,
        },
      },
      student_id: {
        type: DataTypes.INTEGER,
        allowNull: true,
        references: {
          key: 'id',
          model: Student,
          deferrable: Deferrable.INITIALLY_IMMEDIATE,
        },
      },
      // Extra Record Details
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
      modelName: 'StudentMgtActivityLog',
      tableName: 'students_mgt_activity_logs',
      underscored: true,
      timestamps: true,
      schema: 'students_mgt',
      createdAt: 'created_at',
      updatedAt: 'updated_at',
    }
  );

  return StudentMgtActivityLog;
};
