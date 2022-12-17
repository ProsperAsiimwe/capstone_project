'use strict';

const { Model, Deferrable } = require('sequelize');

const User = require('../UserAccess/user.model');

module.exports = (sequelize, DataTypes) => {
  class DeletedSRMStudentLog extends Model {
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
    }
  }

  DeletedSRMStudentLog.init(
    {
      id: {
        type: DataTypes.BIGINT,
        primaryKey: true,
        autoIncrement: true,
      },
      student_name: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      programme_name: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      deleted_student_applicant_records: {
        type: DataTypes.JSON,
        allowNull: true,
      },
      deleted_student_approval_records: {
        type: DataTypes.JSON,
        allowNull: true,
      },
      deleted_student_programme_records: {
        type: DataTypes.JSON,
        allowNull: false,
      },
      deleted_student_records: {
        type: DataTypes.JSON,
        allowNull: false,
      },
      ip_address: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      user_agent: {
        type: DataTypes.JSON,
        allowNull: false,
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
      modelName: 'DeletedSRMStudentLog',
      tableName: 'deleted_srm_students_logs',
      underscored: true,
      timestamps: true,
      schema: 'students_mgt',
      createdAt: 'created_at',
      updatedAt: 'updated_at',
    }
  );

  return DeletedSRMStudentLog;
};
