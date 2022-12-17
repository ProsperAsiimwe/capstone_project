'use strict';

const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class EventView extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate() {}
  }

  EventView.init(
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      event_id: {
        type: DataTypes.BIGINT,
        allowNull: false,
      },
      event: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      academic_year_id: {
        type: DataTypes.BIGINT,
        allowNull: true,
      },
      academic_year: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      semester_id: {
        type: DataTypes.BIGINT,
        allowNull: true,
      },
      semester: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      event_type: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      description: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      start_date: {
        type: DataTypes.DATE,
        allowNull: false,
      },
      end_date: {
        type: DataTypes.DATE,
        allowNull: false,
      },
      intakes: {
        type: DataTypes.ARRAY(DataTypes.JSON),
        allowNull: true,
      },
      entry_academic_years: {
        type: DataTypes.ARRAY(DataTypes.JSON),
        allowNull: true,
      },
      campuses: {
        type: DataTypes.ARRAY(DataTypes.JSON),
        allowNull: true,
      },
    },
    {
      sequelize,
      modelName: 'EventView',
      tableName: 'events_view',
      underscored: true,
      timestamps: false,
      schema: 'events_mgt',
      freezeTableName: true,
    }
  );

  return EventView;
};
