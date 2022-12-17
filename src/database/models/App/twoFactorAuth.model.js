'use strict';

const { Model, Deferrable } = require('sequelize');
const User = require('../UserAccess/user.model');

module.exports = (sequelize, DataTypes) => {
  class TwoFactorAuth extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // The User who Created this Record
      this.user = this.belongsTo(models.User, {
        as: 'user',
        foreignKey: 'user_id',
      });
    }
  }

  TwoFactorAuth.init(
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      user_id: {
        type: DataTypes.BIGINT,
        allowNull: false,
        references: {
          key: 'id',
          model: User,
          deferrable: Deferrable.INITIALLY_IMMEDIATE,
        },
      },
      operation: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      area_accessed: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      ip_address: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      user_agent: {
        type: DataTypes.JSON,
        allowNull: false,
      },
      otp: {
        type: DataTypes.STRING,
        unique: true,
        allowNull: false,
      },
      expires_at: {
        type: DataTypes.DATE,
        allowNull: false,
      },
      is_used: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
        allowNull: true,
      },
      expiry_date: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      remember_token: {
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
    },
    {
      sequelize,
      modelName: 'TwoFactorAuth',
      tableName: 'two_factor_auth',
      underscored: true,
      timestamps: true,
      schema: 'app_mgt',
      createdAt: 'created_at',
      updatedAt: 'updated_at',
    }
  );

  return TwoFactorAuth;
};
