'use strict';

const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class DepartmentProgramme extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {}
  }

  DepartmentProgramme.init(
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: false,
      },
      faculty_id: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },
      department_code: {
        type: DataTypes.STRING,
        unique: true,
        allowNull: false,
      },
      department_title: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      programmes: {
        type: DataTypes.JSON,
        allowNull: true,
      },
    },
    {
      sequelize,
      modelName: 'DepartmentProgramme',
      tableName: 'department_programmes_view',
      underscored: true,
      timestamps: false,
      schema: 'programme_mgt',
    }
  );

  return DepartmentProgramme;
};
