'use strict';

const { Model, Deferrable } = require('sequelize');
const User = require('./user.model');

module.exports = (sequelize, DataTypes) => {
  class SecurityProfile extends Model {
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

  SecurityProfile.init(
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },

      security_profile_name: {
        type: DataTypes.STRING,
        allowNull: false,
      },

      password_change_frequency_days: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },

      min_password_length: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },

      session_timeout_mins: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },

      has_two_factor_authentication: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false,
      },

      min_no_password_digits: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },

      min_no_special_characters: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },

      min_no_uppercase_characters: {
        type: DataTypes.INTEGER,
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
      modelName: 'SecurityProfile',
      tableName: 'security_profiles',
      underscored: true,
      timestamps: true,
      schema: 'user_mgt',
      createdAt: 'created_at',
      updatedAt: 'updated_at',
    }
  );

  return SecurityProfile;
};
