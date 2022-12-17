'use strict';

const { Model, Deferrable } = require('sequelize');

const MetadataValue = require('../App/metadataValue.model');
const { Student, StudentProgramme } = require('@models/StudentRecords');
const {
  Programme,
  Department,
  Faculty,
  College,
} = require('@models/ProgrammeManager');

module.exports = (sequelize, DataTypes) => {
  class EVotingStudent extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {}
  }

  EVotingStudent.init(
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: false,
        references: {
          key: 'id',
          model: StudentProgramme,
          deferrable: Deferrable.INITIALLY_IMMEDIATE,
        },
      },
      student_id: {
        type: DataTypes.BIGINT,
        allowNull: false,
        references: {
          key: 'id',
          model: Student,
          deferrable: Deferrable.INITIALLY_IMMEDIATE,
        },
      },
      programme_id: {
        type: DataTypes.BIGINT,
        allowNull: false,
        references: {
          key: 'id',
          model: Programme,
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
      email: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
      },
      phone: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      student_number: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      registration_number: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      programme_code: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      programme_title: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      department_id: {
        type: DataTypes.INTEGER,
        allowNull: true,
        references: {
          key: 'id',
          model: Department,
          deferrable: Deferrable.INITIALLY_IMMEDIATE,
        },
      },
      department_title: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      faculty_id: {
        type: DataTypes.INTEGER,
        allowNull: true,
        references: {
          key: 'id',
          model: Faculty,
          deferrable: Deferrable.INITIALLY_IMMEDIATE,
        },
      },
      faculty_title: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      college_id: {
        type: DataTypes.INTEGER,
        allowNull: true,
        references: {
          key: 'id',
          model: College,
          deferrable: Deferrable.INITIALLY_IMMEDIATE,
        },
      },
      college_title: {
        type: DataTypes.STRING,
        allowNull: true,
      },

      hall_of_attachment_id: {
        type: DataTypes.INTEGER,
        allowNull: true,
        references: {
          key: 'id',
          model: MetadataValue,
          deferrable: Deferrable.INITIALLY_IMMEDIATE,
        },
      },
      hall_of_residence_id: {
        type: DataTypes.INTEGER,
        allowNull: true,
        references: {
          key: 'id',
          model: MetadataValue,
          deferrable: Deferrable.INITIALLY_IMMEDIATE,
        },
      },
      entry_academic_year_id: {
        type: DataTypes.INTEGER,
        allowNull: true,
        references: {
          key: 'id',
          model: MetadataValue,
          deferrable: Deferrable.INITIALLY_IMMEDIATE,
        },
      },
      student_academic_status_id: {
        type: DataTypes.INTEGER,
        allowNull: true,
        references: {
          key: 'id',
          model: MetadataValue,
          deferrable: Deferrable.INITIALLY_IMMEDIATE,
        },
      },
      programme_type_id: {
        type: DataTypes.INTEGER,
        allowNull: true,
        references: {
          key: 'id',
          model: MetadataValue,
          deferrable: Deferrable.INITIALLY_IMMEDIATE,
        },
      },
      programme_type: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      student_academic_status: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      hall_of_attachment: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      hall_of_residence: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      campus_id: {
        type: DataTypes.INTEGER,
        allowNull: true,
        references: {
          key: 'id',
          model: MetadataValue,
          deferrable: Deferrable.INITIALLY_IMMEDIATE,
        },
      },
      intake_id: {
        type: DataTypes.INTEGER,
        allowNull: true,
        references: {
          key: 'id',
          model: MetadataValue,
          deferrable: Deferrable.INITIALLY_IMMEDIATE,
        },
      },
      intake: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      campus: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      current_study_year_id: {
        type: DataTypes.DOUBLE,
        defaultValue: 0,
        references: {
          key: 'id',
          model: MetadataValue,
          deferrable: Deferrable.INITIALLY_IMMEDIATE,
        },
      },
      current_study_year: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      entry_study_year_id: {
        type: DataTypes.DOUBLE,
        defaultValue: 0,
        references: {
          key: 'id',
          model: MetadataValue,
          deferrable: Deferrable.INITIALLY_IMMEDIATE,
        },
      },
      entry_study_year: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      residence_status: {
        type: DataTypes.STRING,
        defaultValue: 0,
      },
      entry_academic_year: {
        type: DataTypes.STRING,
        defaultValue: 0,
      },
    },
    {
      sequelize,
      modelName: 'EVotingStudent',
      tableName: 'voting_student_programme_views',
      underscored: true,
      timestamps: false,
      schema: 'e_voting_mgt',
    }
  );

  return EVotingStudent;
};
