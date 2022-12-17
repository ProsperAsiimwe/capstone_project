'use strict';

const { Model, Deferrable } = require('sequelize');

const User = require('./user.model');

module.exports = (sequelize, DataTypes) => {
  class UserRoleGroup extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // Get the apps from apps Table.
      this.apps = this.belongsToMany(models.Application, {
        through: models.UserRoleGroupApp,
        as: 'apps',
        foreignKey: 'user_role_group_id',
        otherKey: 'app_id',
      });

      // Use this to save data to UserRoleGroupApp table.
      this.userRoleGroupApps = this.hasMany(models.UserRoleGroupApp, {
        as: 'userRoleGroupApps',
        foreignKey: 'user_role_group_id',
      });

      // Get the admins from users Table.
      this.admins = this.belongsToMany(models.User, {
        through: models.UserRoleGroupAdmin,
        as: 'admins',
        foreignKey: 'user_role_group_id',
        otherKey: 'user_id',
      });

      // Use this to save data to UserRoleGroupAdmin table.
      this.userRoleGroupAdmins = this.hasMany(models.UserRoleGroupAdmin, {
        as: 'userRoleGroupAdmins',
        foreignKey: 'user_role_group_id',
      });

      // Use this to save data to UserRoleGroupAdmin table.
      this.roles = this.hasMany(models.Role, {
        as: 'roles',
      });

      // The User who Created this record
      this.createdBy = this.belongsTo(models.User, { as: 'createdBy' });

      // The User who approved the newly created record
      this.createApprovedBy = this.belongsTo(models.User, {
        as: 'createApprovedBy',
      });
    }
  }

  UserRoleGroup.init(
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      role_group_title: {
        type: DataTypes.STRING,
        unique: true,
        allowNull: false,
      },
      role_group_description: {
        type: DataTypes.STRING,
        allowNull: false,
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
      modelName: 'UserRoleGroup',
      tableName: 'user_role_groups',
      underscored: true,
      timestamps: true,
      schema: 'user_mgt',
      createdAt: 'created_at',
      updatedAt: 'updated_at',
    }
  );

  return UserRoleGroup;
};
