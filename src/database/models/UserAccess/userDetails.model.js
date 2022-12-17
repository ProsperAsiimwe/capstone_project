'use strict';

const { Model, Deferrable } = require('sequelize');
const User = require('./user.model');
const MetadataValue = require('../App/metadataValue.model');
const UserRoleGroup = require('./userRoleGroup.model');

module.exports = (sequelize, DataTypes) => {
  class UserDetails extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      this.user = this.belongsTo(models.User, {
        as: 'user',
        foreignKey: 'user_id',
      });

      this.group = this.belongsTo(models.UserRoleGroup, {
        as: 'group',
        foreignKey: 'role_group_id',
      });

      this.campus = this.belongsTo(models.MetadataValue, {
        as: 'campus',
        foreignKey: 'campus_id',
      });

      this.reportTo = this.belongsTo(models.User, {
        as: 'reportTo',
        foreignKey: 'report_to_user_id',
      });

      this.salutation = this.belongsTo(models.MetadataValue, {
        as: 'salutation',
        foreignKey: 'salutation_id',
      });
    }
  }

  UserDetails.init(
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      user_id: {
        type: DataTypes.BIGINT,
        unique: true,
        allowNull: false,
        references: {
          key: 'id',
          model: User,
          deferrable: Deferrable.INITIALLY_IMMEDIATE,
        },
      },
      role_group_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          key: 'id',
          model: UserRoleGroup,
          deferrable: Deferrable.INITIALLY_IMMEDIATE,
        },
      },

      campus_id: {
        type: DataTypes.BIGINT,
        unique: false,
        allowNull: false,
        references: {
          key: 'id',
          model: MetadataValue,
          deferrable: Deferrable.INITIALLY_IMMEDIATE,
        },
      },

      report_to_user_id: {
        type: DataTypes.BIGINT,
        unique: false,
        allowNull: true,
        references: {
          key: 'id',
          model: User,
          deferrable: Deferrable.INITIALLY_IMMEDIATE,
        },
      },

      salutation_id: {
        type: DataTypes.BIGINT,
        unique: false,
        allowNull: false,
        references: {
          key: 'id',
          model: MetadataValue,
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
      modelName: 'UserDetails',
      tableName: 'user_details',
      underscored: true,
      timestamps: true,
      schema: 'user_mgt',
      createdAt: 'created_at',
      updatedAt: 'updated_at',
    }
  );

  return UserDetails;
};
