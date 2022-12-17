'use strict';

const { Model, Deferrable } = require('sequelize');

const ProposedMeritAdmission = require('./proposedMeritAdmission.model');

module.exports = (sequelize, DataTypes) => {
  class ProposedMeritAdmissionChoice extends Model {
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

  ProposedMeritAdmissionChoice.init(
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
      modelName: 'ProposedMeritAdmissionChoice',
      tableName: 'proposed_merit_admission_choices',
      underscored: true,
      timestamps: true,
      schema: 'pujab_mgt',
      createdAt: 'created_at',
      updatedAt: 'updated_at',
    }
  );

  return ProposedMeritAdmissionChoice;
};
