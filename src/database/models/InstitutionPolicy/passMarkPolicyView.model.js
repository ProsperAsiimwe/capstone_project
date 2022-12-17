'use strict';

const { MetadataValue } = require('@models/App');
const User = require('../UserAccess/user.model');
const { Model, Deferrable } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class PassMarkPolicyView extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {}
  }

  PassMarkPolicyView.init(
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      programme_study_level_id: {
        type: DataTypes.BIGINT,
        allowNull: false,
        references: {
          key: 'id',
          model: MetadataValue,
          deferrable: Deferrable.INITIALLY_IMMEDIATE,
        },
      },
      study_level: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      pass_mark: {
        type: DataTypes.DOUBLE,
        allowNull: false,
      },
      all_entry_academic_years: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
      },

      created_by: {
        type: DataTypes.STRING,
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
      academic_years: {
        type: DataTypes.JSON,
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
    },
    {
      sequelize,
      modelName: 'PassMarkPolicyView',
      tableName: 'pass_mark_policy_view',
      underscored: true,
      timestamps: true,
      schema: 'institution_policy_mgt',
      createdAt: 'created_at',
      updatedAt: 'updated_at',
      deletedAt: 'deleted_at',
    }
  );

  return PassMarkPolicyView;
};
