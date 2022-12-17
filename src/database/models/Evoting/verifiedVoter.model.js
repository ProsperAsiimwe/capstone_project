'use strict';

const { Model, Deferrable } = require('sequelize');

const User = require('../UserAccess/user.model');
const EligibleStudent = require('./eligibleStudent.model');

module.exports = (sequelize, DataTypes) => {
  class VerifiedVoter extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      this.eligibleStudent = this.belongsTo(models.EVotingElectivePosition, {
        as: 'eligibleStudent',
        foreignKey: 'eligible_student_id',
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

  VerifiedVoter.init(
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      eligible_student_id: {
        type: DataTypes.BIGINT,
        allowNull: false,
        references: {
          key: 'id',
          model: EligibleStudent,
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
      modelName: 'VerifiedVoter',
      tableName: 'verified_voters',
      underscored: true,
      timestamps: true,
      schema: 'e_voting_mgt',
      createdAt: 'created_at',
      updatedAt: 'updated_at',
      deletedAt: 'deleted_at',
    }
  );

  return VerifiedVoter;
};
