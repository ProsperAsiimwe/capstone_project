'use strict';

const { Model, Deferrable } = require('sequelize');
const User = require('../UserAccess/user.model');

const uppercaseFirst = (str) => `${str[0].toUpperCase()}${str.substr(1)}`;

module.exports = (sequelize, DataTypes) => {
  class EnrollmentAndRegistrationLog extends Model {
    getRecord(options) {
      if (!this.record_type) return Promise.resolve(null);
      const mixinMethodName = `get${uppercaseFirst(this.record_type)}`;

      return this[mixinMethodName](options);
    }

    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      this.paymentTransaction = this.belongsTo(models.PaymentTransaction, {
        as: 'paymentTransaction',
        foreignKey: 'record_id',
        constraints: false,
      });
      // The User who Created this Record
      this.user = this.belongsTo(models.User, {
        as: 'user',
        foreignKey: 'user_id',
      });
    }
  }

  EnrollmentAndRegistrationLog.init(
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      record_id: {
        type: DataTypes.BIGINT,
        allowNull: true,
      },
      record_type: {
        type: DataTypes.STRING,
        allowNull: true,
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
      permission: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      previous_data: {
        type: DataTypes.JSON,
        allowNull: true,
      },
      current_data: {
        type: DataTypes.JSON,
        allowNull: true,
      },
      operation: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      area_accessed: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      location: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      ip_address: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      user_agent: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      token: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      action_status: {
        type: DataTypes.BOOLEAN,
        allowNull: true,
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
      modelName: 'EnrollmentAndRegistrationLog',
      tableName: 'enrollment_and_registration_logs',
      underscored: true,
      timestamps: true,
      schema: 'app_mgt',
      createdAt: 'created_at',
      updatedAt: 'updated_at',
    }
  );

  EnrollmentAndRegistrationLog.addHook('afterFind', (findRecord) => {
    if (!Array.isArray(findRecord)) findRecord = [findRecord];
    for (const instance of findRecord) {
      if (
        instance.record_type === 'paymentTransaction' &&
        instance.paymentTransaction !== undefined
      ) {
        instance.record_id = instance.paymentTransaction;
      }

      // To prevent mistakes:
      delete instance.paymentTransaction;
      delete instance.dataValues.paymentTransaction;
    }
  });

  return EnrollmentAndRegistrationLog;
};
