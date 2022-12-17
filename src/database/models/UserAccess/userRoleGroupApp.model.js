'use strict';

const { Model, Deferrable } = require('sequelize');

const Application = require('./app.model');
const User = require('./user.model');
const UserRoleGroup = require('./userRoleGroup.model');

module.exports = (sequelize, DataTypes) => {
  class UserRoleGroupApp extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      this.app = this.belongsTo(models.Application, {
        as: 'app',
        foreignKey: 'app_id',
      });
      // The User who Created this record
      this.createdBy = this.belongsTo(models.User, { as: 'createdBy' });

      // The User who approved the newly created record
      this.createApprovedBy = this.belongsTo(models.User, {
        as: 'createApprovedBy',
      });
    }
  }

  UserRoleGroupApp.init(
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
      app_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          key: 'id',
          model: Application,
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
      modelName: 'UserRoleGroupApp',
      tableName: 'user_role_group_apps',
      underscored: true,
      timestamps: true,
      schema: 'user_mgt',
      createdAt: 'created_at',
      updatedAt: 'updated_at',
    }
  );

  return UserRoleGroupApp;
};
