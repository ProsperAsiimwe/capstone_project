'use strict';

const { Model, Deferrable } = require('sequelize');

const UserRoleGroupApp = require('./userRoleGroupApp.model');
const Role = require('./role.model');
const User = require('./user.model');

module.exports = (sequelize, DataTypes) => {
  class RoleUserRoleGroupApp extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // Get the app functions from the role app functions Table.
      this.appFunctions = this.belongsToMany(models.AppFunction, {
        through: models.RoleAppFunction,
        as: 'appFunctions',
        foreignKey: 'role_user_role_group_app_id',
        otherKey: 'app_function_id',
      });

      // Use this to save data to RoleAppFunction table.
      this.app_functions = this.hasMany(models.RoleAppFunction, {
        as: 'app_functions',
        foreignKey: 'role_user_role_group_app_id',
      });

      // the role that this relationship belongs to
      this.role = this.belongsTo(models.Role, {
        as: 'role',
        foreignKey: 'role_id',
      });

      // the user role group app that this relationship belongs to
      this.groupApp = this.belongsTo(models.UserRoleGroupApp, {
        as: 'groupApp',
        foreignKey: 'role_group_app_id',
      });

      // The User who Created this record
      this.createdBy = this.belongsTo(models.User, { as: 'createdBy' });

      // The User who approved the newly created record
      this.createApprovedBy = this.belongsTo(models.User, {
        as: 'createApprovedBy',
      });
    }
  }

  RoleUserRoleGroupApp.init(
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      role_id: {
        type: DataTypes.BIGINT,
        unique: false,
        allowNull: false,
        references: {
          key: 'id',
          model: Role,
          deferrable: Deferrable.INITIALLY_IMMEDIATE,
        },
      },
      role_group_app_id: {
        type: DataTypes.BIGINT,
        unique: false,
        allowNull: false,
        references: {
          key: 'app_id',
          model: UserRoleGroupApp,
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
      modelName: 'RoleUserRoleGroupApp',
      tableName: 'role_user_role_group_apps',
      underscored: true,
      timestamps: true,
      schema: 'user_mgt',
      createdAt: 'created_at',
      updatedAt: 'updated_at',
    }
  );

  return RoleUserRoleGroupApp;
};
