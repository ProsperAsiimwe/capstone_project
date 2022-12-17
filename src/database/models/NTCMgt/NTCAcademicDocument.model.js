'use strict';

const { Model, Deferrable } = require('sequelize');

const User = require('../UserAccess/user.model');
const NTCStudent = require('./NTCStudent.model');

module.exports = (sequelize, DataTypes) => {
  class NTCAcademicDocument extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // Get Student Programme
      this.studentProgramme = this.belongsTo(models.NTCStudent, {
        as: 'student',
        foreignKey: 'ntc_student_id',
      });

      // The User who Created this Record
      this.transcriptCreatedBy = this.belongsTo(models.User, {
        as: 'transcriptCreatedBy',
        foreignKey: 'transcript_created_by_id',
      });

      // The User who Created this Record
      this.certificateCreatedBy = this.belongsTo(models.User, {
        as: 'certificateCreatedBy',
        foreignKey: 'certificate_created_by_id',
      });

      // The User who Last Updated this Record
      this.transcriptGeneratedBy = this.belongsTo(models.User, {
        as: 'transcriptGeneratedBy',
        foreignKey: 'transcript_generated_by_id',
      });
      this.transcriptLastPrintedBy = this.belongsTo(models.User, {
        as: 'transcriptLastPrintedBy',
        foreignKey: 'transcript_last_printed_by_id',
      });

      this.certificateGeneratedBy = this.belongsTo(models.User, {
        as: 'certificateGeneratedBy',
        foreignKey: 'certificate_generated_by_id',
      });
      this.certificateLastPrintedBy = this.belongsTo(models.User, {
        as: 'certificateLastPrintedBy',
        foreignKey: 'certificate_last_printed_by_id',
      });
    }
  }

  NTCAcademicDocument.init(
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      ntc_student_id: {
        type: DataTypes.BIGINT,
        allowNull: false,
        references: {
          key: 'id',
          model: NTCStudent,
          deferrable: Deferrable.INITIALLY_IMMEDIATE,
        },
      },
      transcript_name: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      transcript_id: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      transcript_serial_number: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      transcript_generated_on: {
        type: DataTypes.DATE,
        allowNull: true,
      },
      transcript_generated_by_id: {
        type: DataTypes.INTEGER,
        allowNull: true,
        references: {
          key: 'id',
          model: User,
          deferrable: Deferrable.INITIALLY_IMMEDIATE,
        },
      },
      transcript_print_count: {
        type: DataTypes.INTEGER,
        allowNull: true,
        defaultValue: 0,
      },
      transcript_last_printed_on: {
        type: DataTypes.DATE,
        allowNull: true,
      },
      transcript_last_printed_by_id: {
        type: DataTypes.INTEGER,
        allowNull: true,
        references: {
          key: 'id',
          model: User,
          deferrable: Deferrable.INITIALLY_IMMEDIATE,
        },
      },
      certificate_name: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      certificate_id: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      certificate_serial_number: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      certificate_generated_on: {
        type: DataTypes.DATE,
        allowNull: true,
      },
      certificate_generated_by_id: {
        type: DataTypes.INTEGER,
        allowNull: true,
        references: {
          key: 'id',
          model: User,
          deferrable: Deferrable.INITIALLY_IMMEDIATE,
        },
      },
      certificate_last_printed_on: {
        type: DataTypes.DATE,
        allowNull: true,
      },
      certificate_last_printed_by_id: {
        type: DataTypes.INTEGER,
        allowNull: true,
        references: {
          key: 'id',
          model: User,
          deferrable: Deferrable.INITIALLY_IMMEDIATE,
        },
      },
      certificate_print_count: {
        type: DataTypes.INTEGER,
        allowNull: true,
        defaultValue: 0,
      },
      class_name: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      entry_year: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      completion_year: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      graduation_date: {
        type: DataTypes.DATE,
        allowNull: true,
      },

      // Record Details
      created_at: {
        type: DataTypes.DATE,
        allowNull: true,
      },
      updated_at: {
        type: DataTypes.DATE,
        allowNull: true,
      },

      transcript_created_by_id: {
        type: DataTypes.INTEGER,
        allowNull: true,
        references: {
          key: 'id',
          model: User,
          deferrable: Deferrable.INITIALLY_IMMEDIATE,
        },
      },
      certificate_created_by_id: {
        type: DataTypes.INTEGER,
        allowNull: true,
        references: {
          key: 'id',
          model: User,
          deferrable: Deferrable.INITIALLY_IMMEDIATE,
        },
      },
    },
    {
      sequelize,
      modelName: 'NTCAcademicDocument',
      tableName: 'ntc_academic_documents',
      underscored: true,
      timestamps: true,
      schema: 'ntc_mgt',
      createdAt: 'created_at',
      updatedAt: 'updated_at',
      deletedAt: 'deleted_at',
    }
  );

  return NTCAcademicDocument;
};
