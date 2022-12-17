'use strict';
const { Model, Deferrable } = require('sequelize');
const User = require('./user.model');

const Role = require('./role.model');

module.exports = (sequelize, DataTypes) => {
  class UserRole extends Model {
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

  UserRole.init(
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },

      user_id: {
        type: DataTypes.BIGINT,
        unique: false,
        allowNull: false,
        references: {
          key: 'id',
          model: User,
          deferrable: Deferrable.INITIALLY_IMMEDIATE,
        },
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

      is_main_role: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false,
      },

      role_accepted: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false,
      },

      role_accepted_at: {
        type: DataTypes.DATE,
        allowNull: true,
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
      modelName: 'UserRole',
      tableName: 'user_roles',
      underscored: true,
      timestamps: true,
      schema: 'user_mgt',
      createdAt: 'created_at',
      updatedAt: 'updated_at',
    }
  );

  return UserRole;
};
