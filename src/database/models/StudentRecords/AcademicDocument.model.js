'use strict';

const { Model, Deferrable } = require('sequelize');

const User = require('../UserAccess/user.model');
const StudentProgramme = require('./studentProgramme.model');

module.exports = (sequelize, DataTypes) => {
  class AcademicDocument extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // Get Student Programme
      this.studentProgramme = this.belongsTo(models.StudentProgramme, {
        as: 'studentProgramme',
        foreignKey: 'student_programme_id',
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
      this.transcriptPrintedBy = this.belongsTo(models.User, {
        as: 'transcriptPrintedBy',
        foreignKey: 'transcript_printed_by_id',
      });
      this.transcriptLastPrintedBy = this.belongsTo(models.User, {
        as: 'transcriptLastPrintedBy',
        foreignKey: 'transcript_last_printed_by_id',
      });

      this.certificatePrintedBy = this.belongsTo(models.User, {
        as: 'certificatePrintedBy',
        foreignKey: 'certificate_printed_by_id',
      });
      this.certificateLastPrintedBy = this.belongsTo(models.User, {
        as: 'certificateLastPrintedBy',
        foreignKey: 'certificate_last_printed_by_id',
      });
    }
  }

  AcademicDocument.init(
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      student_programme_id: {
        type: DataTypes.BIGINT,
        allowNull: false,
        references: {
          key: 'id',
          model: StudentProgramme,
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
      transcript_date_printed: {
        type: DataTypes.DATE,
        allowNull: true,
      },
      transcript_printed_by_id: {
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
      transcript_last_printed: {
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
      certificate_date_printed: {
        type: DataTypes.DATE,
        allowNull: true,
      },
      certificate_printed_by_id: {
        type: DataTypes.INTEGER,
        allowNull: true,
        references: {
          key: 'id',
          model: User,
          deferrable: Deferrable.INITIALLY_IMMEDIATE,
        },
      },
      certificate_last_printed: {
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

      graduation_congregation_number: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      graduation_year: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      graduation_date: {
        type: DataTypes.DATE,
        allowNull: true,
      },
      entry_type: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      completion_year: {
        type: DataTypes.STRING,
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
      modelName: 'AcademicDocument',
      tableName: 'academic_documents',
      underscored: true,
      timestamps: true,
      schema: 'students_mgt',
      createdAt: 'created_at',
      updatedAt: 'updated_at',
      deletedAt: 'deleted_at',
    }
  );

  return AcademicDocument;
};
