'use strict';

const { Model, Deferrable } = require('sequelize');
const User = require('./user.model');

const RoleUserRoleGroupApp = require('./roleUserRoleGroupApp.model');
const AppFunctions = require('./appFunction.model');

module.exports = (sequelize, DataTypes) => {
  class RoleAppFunction extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // The User who Created this record
      this.createdBy = this.belongsTo(models.User, { as: 'createdBy' });

      // The User who approved the newly created record
      this.createApprovedBy = this.belongsTo(models.User, {
        as: 'createApprovedBy',
      });
    }
  }

  RoleAppFunction.init(
    {
      app_function_id: {
        type: DataTypes.BIGINT,
        allowNull: false,
        references: {
          key: 'id',
          model: AppFunctions,
          deferrable: Deferrable.INITIALLY_IMMEDIATE,
        },
      },

      role_user_role_group_app_id: {
        type: DataTypes.BIGINT,
        allowNull: false,
        references: {
          key: 'id',
          model: RoleUserRoleGroupApp,
          deferrable: Deferrable.INITIALLY_IMMEDIATE,
        },
      },
      create_approval_date: {
        type: DataTypes.DATE,
        allowNull: true,
      },
      create_approval_status: {
        type: DataTypes.STRING,
        allowNull: false,
        defaultValue: 'PENDING',
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
      create_approved_by_id: {
        type: DataTypes.BIGINT,
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
      modelName: 'RoleAppFunction',
      tableName: 'role_app_functions',
      underscored: true,
      timestamps: true,
      schema: 'user_mgt',
      createdAt: 'created_at',
      updatedAt: 'updated_at',
    }
  );

  return RoleAppFunction;
};
