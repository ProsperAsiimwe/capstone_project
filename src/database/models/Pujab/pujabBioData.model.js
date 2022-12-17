'use strict';

const { Model, Deferrable } = require('sequelize');

const PujabApplication = require('./pujabApplication.model');

module.exports = (sequelize, DataTypes) => {
  class PujabBioData extends Model {
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

  PujabBioData.init(
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
      phone: {
        type: DataTypes.STRING,
        unique: true,
        allowNull: false,
      },
      email: {
        type: DataTypes.STRING,
        unique: true,
        allowNull: false,
      },
      fax_no: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      date_of_birth: {
        type: DataTypes.DATE,
        allowNull: false,
      },
      gender: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      citizenship: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      permanent_address: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
      emergency_contact_address: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
      religion: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      marital_status: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      birth_certificate_attachment: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      home_district: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      county: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      sub_county: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      parish: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      village: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      emis_number: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      district_of_birth: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      disability_details: {
        type: DataTypes.STRING,
        allowNull: true,
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
      modelName: 'PujabBioData',
      tableName: 'pujab_bio_data',
      underscored: true,
      timestamps: true,
      schema: 'pujab_mgt',
      createdAt: 'created_at',
      updatedAt: 'updated_at',
    }
  );

  return PujabBioData;
};
