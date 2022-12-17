'use strict';

const { Model, Deferrable } = require('sequelize');

const ProposedMeritAdmission = require('./proposedMeritAdmission.model');

module.exports = (sequelize, DataTypes) => {
  class ProposedMeritAdmissionUaceGrade extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      //
      this.proposedMeritAdmission = this.belongsTo(
        models.ProposedMeritAdmission,
        {
          as: 'proposedMeritAdmission',
          foreignKey: 'proposed_merit_id',
        }
      );
    }
  }

  ProposedMeritAdmissionUaceGrade.init(
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      proposed_merit_id: {
        type: DataTypes.BIGINT,
        allowNull: false,
        references: {
          key: 'id',
          model: ProposedMeritAdmission,
          deferrable: Deferrable.INITIALLY_IMMEDIATE,
        },
      },
      subject_code: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      subject_title: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      grade: {
        type: DataTypes.STRING,
        allowNull: false,
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
      modelName: 'ProposedMeritAdmissionUaceGrade',
      tableName: 'proposed_merit_admission_uace_grades',
      underscored: true,
      timestamps: true,
      schema: 'pujab_mgt',
      createdAt: 'created_at',
      updatedAt: 'updated_at',
    }
  );

  return ProposedMeritAdmissionUaceGrade;
};
