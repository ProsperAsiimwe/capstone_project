'use strict';

const { StudentProgramme } = require('@models/StudentRecords');
const { Model, Deferrable } = require('sequelize');

const User = require('../UserAccess/user.model');
const EVotingElectivePosition = require('./electivePosition.model');

module.exports = (sequelize, DataTypes) => {
  class EligibleStudent extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      this.electivePosition = this.belongsTo(models.EVotingElectivePosition, {
        as: 'electivePosition',
        foreignKey: 'elective_position_id',
      });

      this.student = this.belongsTo(models.EVotingStudent, {
        as: 'student',
        foreignKey: 'student_programme_id',
        targetKey: 'id',
      });

      // The User who Created this Record
      this.createdBy = this.belongsTo(models.User, {
        as: 'createdBy',
        foreignKey: 'created_by_id',
      });
    }
  }

  EligibleStudent.init(
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      elective_position_id: {
        type: DataTypes.BIGINT,
        allowNull: false,
        references: {
          key: 'id',
          model: EVotingElectivePosition,
          deferrable: Deferrable.INITIALLY_IMMEDIATE,
        },
      },
      student_programme_id: {
        type: DataTypes.BIGINT,
        allowNull: false,
        references: {
          key: 'id',
          model: StudentProgramme,
          deferrable: Deferrable.INITIALLY_IMMEDIATE,
        },
      },
      created_by_id: {
        type: DataTypes.BIGINT,
        allowNull: false,
        references: {
          key: 'id',
          model: User,
          deferrable: Deferrable.INITIALLY_IMMEDIATE,
        },
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
      modelName: 'EligibleStudent',
      tableName: 'eligible_students',
      underscored: true,
      timestamps: true,
      schema: 'e_voting_mgt',
      createdAt: 'created_at',
      updatedAt: 'updated_at',
      deletedAt: 'deleted_at',
      indexes: [
        {
          unique: true,
          fields: ['elective_position_id', 'student_programme_id'],
          name: 'unique_index',
        },
      ],
    }
  );

  return EligibleStudent;
};
