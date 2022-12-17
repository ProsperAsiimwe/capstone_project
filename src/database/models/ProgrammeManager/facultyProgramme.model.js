'use strict';

const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class FacultyProgramme extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {}
  }

  FacultyProgramme.init(
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: false,
      },
      college_id: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },
      faculty_code: {
        type: DataTypes.STRING,
        unique: true,
        allowNull: false,
      },
      faculty_title: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      departments: {
        type: DataTypes.JSON,
        allowNull: true,
      },
    },
    {
      sequelize,
      modelName: 'FacultyProgramme',
      tableName: 'faculty_programmes_view',
      underscored: true,
      timestamps: false,
      schema: 'programme_mgt',
    }
  );

  return FacultyProgramme;
};
