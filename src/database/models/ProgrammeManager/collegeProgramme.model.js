'use strict';

const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class CollegeProgramme extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {}
  }

  CollegeProgramme.init(
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: false,
      },
      college_code: {
        type: DataTypes.STRING,
        unique: true,
        allowNull: false,
      },
      college_title: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      faculties: {
        type: DataTypes.JSON,
        allowNull: false,
      },
    },
    {
      sequelize,
      modelName: 'CollegeProgramme',
      tableName: 'college_programmes_view',
      underscored: true,
      timestamps: false,
      schema: 'programme_mgt',
    }
  );

  return CollegeProgramme;
};
