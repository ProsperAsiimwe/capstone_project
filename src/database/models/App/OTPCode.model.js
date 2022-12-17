'use strict';

const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class OTPCode extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // GET All meta Data Values
    }
  }

  OTPCode.init(
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      username: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      otp_code: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      request_origin: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      purpose: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      expires_at: {
        type: DataTypes.DATE,
        allowNull: false,
      },
      is_used: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false,
      },
      used_at: {
        type: DataTypes.DATE,
        allowNull: true,
        defaultValue: null,
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
      modelName: 'OTPCode',
      tableName: 'otp_codes',
      underscored: true,
      timestamps: true,
      schema: 'app_mgt',
      createdAt: 'created_at',
      updatedAt: 'updated_at',
    }
  );

  return OTPCode;
};
