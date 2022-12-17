'use strict';

const { MetadataValue } = require('@models/App');
const { Faculty } = require('@models/ProgrammeManager');
const { Model, Deferrable } = require('sequelize');

const User = require('../UserAccess/user.model');

module.exports = (sequelize, DataTypes) => {
  class NTCStudent extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // The User who Created this Record
      this.createdBy = this.belongsTo(models.User, {
        as: 'createdBy',
        foreignKey: 'created_by_id',
      });

      this.deletedBy = this.belongsTo(models.User, { as: 'deletedBy' });

      this.currentStudyYear = this.belongsTo(models.MetadataValue, {
        as: 'currentStudyYear',
        foreignKey: 'current_study_year_id',
      });

      this.academicDocument = this.hasOne(models.NTCAcademicDocument, {
        as: 'academicDocument',
        foreignKey: 'ntc_student_id',
      });

      this.typeOfEntry = this.belongsTo(models.MetadataValue, {
        as: 'typeOfEntry',
        foreignKey: 'type_of_entry_id',
      });

      this.faculty = this.belongsTo(models.Faculty, {
        as: 'faculty',
        foreignKey: 'faculty_id',
      });
    }
  }

  NTCStudent.init(
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      name: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      registration_number: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      student_number: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      sex: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      nationality: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      email: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      phone: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      programme_code: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      programme_title: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      date_of_birth: {
        type: DataTypes.DATE,
        allowNull: true,
      },
      subjects: {
        type: DataTypes.JSON,
        allowNull: false,
      },
      year_of_entry: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      year_of_completion: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },
      current_study_year_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          key: 'id',
          model: MetadataValue,
          deferrable: Deferrable.INITIALLY_IMMEDIATE,
        },
      },
      type_of_entry_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          key: 'id',
          model: MetadataValue,
          deferrable: Deferrable.INITIALLY_IMMEDIATE,
        },
      },
      faculty_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          key: 'id',
          model: Faculty,
          deferrable: Deferrable.INITIALLY_IMMEDIATE,
        },
      },

      // Record Details
      created_by_id: {
        type: DataTypes.INTEGER,
        allowNull: true,
        references: {
          key: 'id',
          model: User,
          deferrable: Deferrable.INITIALLY_IMMEDIATE,
        },
      },
      deleted_by_id: {
        type: DataTypes.INTEGER,
        allowNull: true,
        references: {
          key: 'id',
          model: User,
          deferrable: Deferrable.INITIALLY_IMMEDIATE,
        },
      },
      last_edited_by: {
        type: DataTypes.INTEGER,
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
      deleted_at: {
        type: DataTypes.DATE,
        allowNull: true,
      },
    },
    {
      sequelize,
      modelName: 'NTCStudent',
      tableName: 'ntc_students',
      underscored: true,
      timestamps: true,
      schema: 'ntc_mgt',
      createdAt: 'created_at',
      updatedAt: 'updated_at',
      deletedAt: 'deleted_at',
    }
  );

  return NTCStudent;
};
