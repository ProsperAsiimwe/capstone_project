'use strict';

const { Model, Deferrable } = require('sequelize');

const PujabApplication = require('./pujabApplication.model');

module.exports = (sequelize, DataTypes) => {
  class PujabMotherInfo extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      //
      this.pujabApplication = this.belongsTo(models.PujabApplication, {
        as: 'pujabApplication',
        foreignKey: 'pujab_application_id',
      });
    }
  }

  PujabMotherInfo.init(
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      pujab_application_id: {
        type: DataTypes.BIGINT,
        allowNull: false,
        references: {
          key: 'id',
          model: PujabApplication,
          deferrable: Deferrable.INITIALLY_IMMEDIATE,
        },
      },
      surname: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      other_names: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      telephone_number: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      date_of_birth: {
        type: DataTypes.DATE,
        allowNull: false,
      },
      citizenship: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      address: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      nationality: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      country_of_residence: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      district_of_birth: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      sub_county: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      village_of_birth: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      relationship: {
        type: DataTypes.STRING,
        allowNull: false,
      },

      // Extra Record Details
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
      modelName: 'PujabMotherInfo',
      tableName: 'pujab_mother_info',
      underscored: true,
      timestamps: true,
      schema: 'pujab_mgt',
      createdAt: 'created_at',
      updatedAt: 'updated_at',
    }
  );

  return PujabMotherInfo;
};
