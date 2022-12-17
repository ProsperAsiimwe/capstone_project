'use strict';

const { Model, Deferrable } = require('sequelize');

const UserRoleGroup = require('./userRoleGroup.model');
const User = require('./user.model');

module.exports = (sequelize, DataTypes) => {
  class UserRoleGroupAdmin extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // The User who Created this record
    }
  }

  UserRoleGroupAdmin.init(
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      user_role_group_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          key: 'id',
          model: UserRoleGroup,
          deferrable: Deferrable.INITIALLY_IMMEDIATE,
        },
      },
      user_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          key: 'id',
          model: User,
          deferrable: Deferrable.INITIALLY_IMMEDIATE,
        },
      },
      admin_type: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      //
      created_at: {
        type: DataTypes.DATE,
        allowNull: true,
      },
      updated_at: {
        type: DataTypes.DATE,
        allowNull: true,
      },
      deleted_at: {
        type: DataTypes.DATE,
        allowNull: true,
      },
      deleted_by_id: {
        type: DataTypes.INTEGER,
        allowNull: true,
        references: {
          key: 'id',
          model: User,
          deferrable: Deferrable.INITIALLY_IMMEDIATE,
        },
      },
    },
    {
      sequelize,
      modelName: 'UserRoleGroupAdmin',
      tableName: 'role_group_admin',
      underscored: true,
      timestamps: true,
      schema: 'user_mgt',
      createdAt: 'created_at',
      updatedAt: 'updated_at',
      deletedAt: 'deleted_at',
    }
  );

  return UserRoleGroupAdmin;
};
