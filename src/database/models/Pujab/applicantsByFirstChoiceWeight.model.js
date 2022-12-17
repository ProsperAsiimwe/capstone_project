'use strict';

const { Model, Deferrable } = require('sequelize');

const ApplicantsByFirstChoice = require('./applicantsByFirstChoice.model');

module.exports = (sequelize, DataTypes) => {
  class ApplicantsByFirstChoiceWeight extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      //
      this.applicantsByFirstChoice = this.belongsTo(
        models.ApplicantsByFirstChoice,
        {
          as: 'applicantsByFirstChoice',
          foreignKey: 'applicants_by_first_id',
        }
      );
    }
  }

  ApplicantsByFirstChoiceWeight.init(
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      applicants_by_first_id: {
        type: DataTypes.BIGINT,
        allowNull: false,
        references: {
          key: 'id',
          model: ApplicantsByFirstChoice,
          deferrable: Deferrable.INITIALLY_IMMEDIATE,
        },
      },
      choice_code: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      choice_title: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      weight: {
        type: DataTypes.DOUBLE,
        allowNull: true,
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
      modelName: 'ApplicantsByFirstChoiceWeight',
      tableName: 'applicants_by_first_choice_weights',
      underscored: true,
      timestamps: true,
      schema: 'pujab_mgt',
      createdAt: 'created_at',
      updatedAt: 'updated_at',
    }
  );

  return ApplicantsByFirstChoiceWeight;
};
