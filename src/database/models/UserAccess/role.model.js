'use strict';

const { Model, Deferrable } = require('sequelize');
const UserRoleGroup = require('./userRoleGroup.model');
const SecurityProfile = require('./securityProfile.model');
const User = require('./user.model');

module.exports = (sequelize, DataTypes) => {
  class Role extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // Get all role Apps
      this.apps = this.belongsToMany(models.Application, {
        through: models.RoleUserRoleGroupApp,
        as: 'apps',
        foreignKey: 'role_id',
        otherKey: 'role_group_app_id',
      });
      // model
      this.boundLevels = this.hasMany(models.RoleBoundLevel, {
        as: 'boundLevels',
        foreignKey: 'role_id',
      });

      // The role group this role belongs to
      this.userRoleGroup = this.belongsTo(models.UserRoleGroup, {
        as: 'userRoleGroup',
        foreignKey: 'user_role_group_id',
      });
      // The User who Created this Role
      this.securityProfile = this.belongsTo(models.SecurityProfile, {
        as: 'securityProfile',
        foreignKey: 'security_profile_id',
      });

      // users
      this.users = this.belongsToMany(models.User, {
        through: models.UserRole,
        as: 'users',
        foreignKey: 'role_id',
        otherKey: 'user_id',
      });

      // The User who Created this record
      this.createdBy = this.belongsTo(models.User, { as: 'createdBy' });

      // The User who approved the newly created record
      this.createApprovedBy = this.belongsTo(models.User, {
        as: 'createApprovedBy',
      });
    }
  }

  Role.init(
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },

      user_role_group_id: {
        type: DataTypes.BIGINT,
        unique: false,
        allowNull: false,
        references: {
          key: 'id',
          model: UserRoleGroup,
          deferrable: Deferrable.INITIALLY_IMMEDIATE,
        },
      },

      security_profile_id: {
        type: DataTypes.BIGINT,
        unique: false,
        allowNull: false,
        references: {
          key: 'id',
          model: SecurityProfile,
          deferrable: Deferrable.INITIALLY_IMMEDIATE,
        },
      },

      role_code: {
        type: DataTypes.STRING,
        unique: true,
        allowNull: false,
      },

      role_title: {
        type: DataTypes.STRING,
        unique: true,
        allowNull: false,
      },

      role_description: {
        type: DataTypes.TEXT,
        allowNull: true,
      },

      max_number_users: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },

      is_active: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false,
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
      modelName: 'Role',
      tableName: 'roles',
      underscored: true,
      timestamps: true,
      schema: 'user_mgt',
      createdAt: 'created_at',
      updatedAt: 'updated_at',
    }
  );

  return Role;
};
